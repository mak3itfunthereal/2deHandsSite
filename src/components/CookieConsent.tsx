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
            <span className="eyebrow">Jouw privacy</span>
            <h2 id="cookie-title">Mogen we je ervaring persoonlijk maken?</h2>
          </div>
        </div>
        <p>
          Met je toestemming gebruiken we cookies voor persoonlijke aanbevelingen en vragen we je
          browserlocatie om alleen advertenties bij jou in de buurt te tonen.
        </p>
        {details && (
          <div className="cookie-options">
            <label>
              <span>
                <b>Noodzakelijke cookies</b>
                <small>Inloggen, veiligheid en basisfuncties</small>
              </span>
              <input type="checkbox" checked disabled />
            </label>
            <label>
              <span>
                <b>Persoonlijke aanbevelingen</b>
                <small>Producten gebaseerd op favorieten en gebruik</small>
              </span>
              <input
                type="checkbox"
                checked={personalization}
                onChange={(event) => setPersonalization(event.target.checked)}
              />
            </label>
            <label>
              <span>
                <b>Locatie gebruiken</b>
                <small>Vraag eenmalig je locatie en onthoud je zoekgebied</small>
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
            {details ? "Verberg voorkeuren" : "Voorkeuren instellen"}
          </button>
          <div>
            <button
              className="secondary"
              onClick={() => onSave({ personalization: false, location: false })}
            >
              Alleen noodzakelijk
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
              {details ? "Keuzes opslaan" : "Alles accepteren"}
            </button>
          </div>
        </div>
        <small className="cookie-note">
          Je kunt je voorkeuren later altijd aanpassen via Instellingen → Privacy.
        </small>
      </section>
    </div>
  );
}
