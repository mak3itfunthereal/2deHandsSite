import type { LocationPreference } from "../types";
import { products } from "./mockData";

export function distanceBetween(
  origin: Pick<LocationPreference, "lat" | "lon">,
  destination: { lat: number; lon: number },
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371;
  const latitudeDistance = toRadians(destination.lat - origin.lat);
  const longitudeDistance = toRadians(destination.lon - origin.lon);
  const a =
    Math.sin(latitudeDistance / 2) ** 2 +
    Math.cos(toRadians(origin.lat)) *
      Math.cos(toRadians(destination.lat)) *
      Math.sin(longitudeDistance / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function productsNear(location: LocationPreference) {
  return products
    .map((product) => ({ ...product, calculatedDistance: distanceBetween(location, product) }))
    .filter((product) => product.calculatedDistance <= location.radius)
    .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
}
