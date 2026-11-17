import { useState } from "react";
import type { LocationPreference } from "../types";
import { distanceBetween, locations } from "../utils/marketplace";
import { Icon } from "./Icon";

export function LocationControls({
  location,
  onChange,
  onDone,
}: {
  location: LocationPreference;
  onChange: (location: LocationPreference) => void;
  onDone?: () => void;
}) {
  const [query, setQuery] = useState(
    location.postcode === "GPS" ? location.city : `${location.postcode} ${location.city}`,
  );
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const findLocation = async () => {
    if (query.trim().length < 2) {
      setError("Enter at least two characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const endpoint = new URL("https://api.pdok.nl/bzk/locatieserver/search/v3_1/free");
      endpoint.searchParams.set("q", query.trim());
      endpoint.searchParams.set("rows", "1");
      endpoint.searchParams.set(
        "fq",
        `type:${/^\d/.test(query.trim()) ? "postcode" : "woonplaats"}`,
      );
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Location search failed");
      const data = (await response.json()) as {
        response?: {
          docs?: Array<{
            woonplaatsnaam?: string;
            gemeentenaam?: string;
            postcode?: string;
            weergavenaam?: string;
            centroide_ll?: string;
          }>;
        };
      };
      const result = data.response?.docs?.[0];
      const coordinates = result?.centroide_ll?.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
      if (!result || !coordinates) {
        setError("No city or postcode found.");
        return;
      }
      const city =
        result.woonplaatsnaam ||
        result.gemeentenaam ||
        result.weergavenaam?.split(",")[0] ||
        query.trim();
      onChange({
        city,
        postcode: result.postcode || query.trim().toUpperCase(),
        radius: location.radius,
        lon: Number(coordinates[1]),
        lat: Number(coordinates[2]),
      });
      setQuery(`${result.postcode ? `${result.postcode} ` : ""}${city}`);
      onDone?.();
    } catch {
      setError("Could not find the location. Try again.");
    } finally {
      setLoading(false);
    }
  };
  const useCurrentLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Your browser does not support location services.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordinates = { lat: coords.latitude, lon: coords.longitude };
        const nearest = locations.reduce((best, candidate) =>
          distanceBetween(coordinates, candidate) < distanceBetween(coordinates, best)
            ? candidate
            : best,
        );
        onChange({
          city: nearest.city,
          postcode: "GPS",
          radius: location.radius,
          lat: coordinates.lat,
          lon: coordinates.lon,
        });
        setQuery(`Current location · ${nearest.city}`);
        setLocating(false);
        onDone?.();
      },
      (geolocationError) => {
        setLocating(false);
        setError(
          geolocationError.code === geolocationError.PERMISSION_DENIED
            ? "Location access was denied. Allow location access in your browser."
            : "Your current location could not be determined.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 },
    );
  };
  return (
    <div className="location-controls">
      <label>
        City or postcode
        <form
          className="location-search-field"
          onSubmit={(event) => {
            event.preventDefault();
            void findLocation();
          }}
        >
          <Icon name="search" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. 1000 or City 1"
            aria-label="Enter a city or postcode"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
        {error && <small className="location-error">{error}</small>}
      </label>
      <button
        type="button"
        className="current-location-button"
        onClick={useCurrentLocation}
        disabled={locating}
      >
        <Icon name="pin" size={18} />
        {locating ? "Finding current location…" : "Use my current location"}
      </button>
      <label>
        Maximum distance
        <select
          value={location.radius}
          onChange={(event) => onChange({ ...location, radius: Number(event.target.value) })}
        >
          {[5, 10, 25, 50, 100].map((radius) => (
            <option value={radius} key={radius}>
              {radius} km
            </option>
          ))}
        </select>
      </label>
      <div className="radius-preview">
        <span>
          <Icon name="pin" size={18} />
        </span>
        <div>
          <b>{location.city}</b>
          <small>Only listings within {location.radius} km are shown</small>
        </div>
      </div>
    </div>
  );
}
