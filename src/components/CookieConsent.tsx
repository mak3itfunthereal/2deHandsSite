import { useState } from "react";
import type { ConsentPreferences } from "../types";
import { Icon } from "./Icon";

export function CookieConsent({ onSave }: { onSave: (preferences: ConsentPreferences) => void }) {
  const [details, setDetails] = useState(false);
  const [personalization, setPersonalization] = useState(true);
  const [locationPermission, setLocationPermission] = useState(true);
  return (
    <div className="cookie-backdrop" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
      <section className="cookie-card">
        <div className="cookie-heading">
          <span>
            <Icon name="shield" size={24} />
          </span>
          <div>
            <span className="eyebrow">Your privacy</span>
            <h2 id="cookie-title">Can we personalize your experience?</h2>
          </div>
        </div>
        <p>
          With your permission, we use cookies for personalized recommendations and your browser
          location to show listings near you.
        </p>
        {details && (
          <div className="cookie-options">
            <label>
              <span>
                <b>Essential cookies</b>
                <small>Sign-in, security, and basic features</small>
              </span>
              <input type="checkbox" checked disabled />
            </label>
            <label>
              <span>
                <b>Personalized recommendations</b>
                <small>Products based on your favorites and activity</small>
              </span>
              <input
                type="checkbox"
                checked={personalization}
                onChange={(event) => setPersonalization(event.target.checked)}
              />
            </label>
            <label>
              <span>
                <b>Use location</b>
                <small>Request your location once and remember your search area</small>
              </span>
              <input
                type="checkbox"
                checked={locationPermission}
                onChange={(event) => setLocationPermission(event.target.checked)}
              />
            </label>
          </div>
        )}
        <div className="cookie-actions">
          <button className="text-button" onClick={() => setDetails(!details)}>
            {details ? "Hide preferences" : "Set preferences"}
          </button>
          <div>
            <button
              className="secondary"
              onClick={() => onSave({ personalization: false, location: false })}
            >
              Essential only
            </button>
            <button
              className="primary"
              onClick={() =>
                onSave(
                  details
                    ? { personalization, location: locationPermission }
                    : { personalization: true, location: true },
                )
              }
            >
              {details ? "Save choices" : "Accept all"}
            </button>
          </div>
        </div>
        <small className="cookie-note">
          You can change your preferences anytime in Settings → Privacy.
        </small>
      </section>
    </div>
  );
}
