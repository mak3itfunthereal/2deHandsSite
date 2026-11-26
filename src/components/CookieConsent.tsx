import { useState } from "react";
import type { ConsentPreferences } from "../types";
import { Icon } from "./Icon";

function loadConsentPreferences(): ConsentPreferences {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem("bidzaar-consent") || "null");
    if (
      typeof stored === "object" &&
      stored !== null &&
      "personalization" in stored &&
      typeof stored.personalization === "boolean" &&
      "location" in stored &&
      typeof stored.location === "boolean"
    ) {
      return { personalization: stored.personalization, location: stored.location };
    }
  } catch {
    // Invalid saved preferences fall back to the initial choices.
  }
  return { personalization: true, location: true };
}

export function CookieConsent({ onSave }: { onSave: (preferences: ConsentPreferences) => void }) {
  const [details, setDetails] = useState(false);
  const [preferences, setPreferences] = useState(loadConsentPreferences);
  const { personalization, location: locationPermission } = preferences;
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
                onChange={(event) =>
                  setPreferences((current) => ({ ...current, personalization: event.target.checked }))
                }
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
                onChange={(event) =>
                  setPreferences((current) => ({ ...current, location: event.target.checked }))
                }
              />
            </label>
          </div>
        )}
        <div className="cookie-actions">
          <button className="text-button" type="button" onClick={() => setDetails(!details)}>
            {details ? "Hide preferences" : "Set preferences"}
          </button>
          <div>
            <button
              className="secondary"
              type="button"
              onClick={() => onSave({ personalization: false, location: false })}
            >
              Essential only
            </button>
            <button
              className="primary"
              type="button"
              onClick={() =>
                onSave(details ? preferences : { personalization: true, location: true })
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
