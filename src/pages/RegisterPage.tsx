import { useState } from "react";
import type { Page, UserProfile } from "../types";

export default function RegisterPage({
  onRegister,
  setPage,
}: {
  onRegister: (user: UserProfile) => void;
  setPage: (page: Page) => void;
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  return (
    <main className="login-page">
      <div className="login-card register-card">
        <span className="login-mark">
          {form.firstName || form.lastName
            ? `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase()
            : "b"}
        </span>
        <span className="eyebrow">Nieuw bij Bidzaar</span>
        <h1>Maak je account</h1>
        <p>Vul je eigen gegevens in. Deze naam en initialen verschijnen bij je profiel.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onRegister({
              firstName: form.firstName.trim(),
              lastName: form.lastName.trim(),
              email: form.email.trim(),
            });
          }}
        >
          <div className="form-grid">
            <label>
              Voornaam
              <input
                required
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                placeholder="Voornaam"
              />
            </label>
            <label>
              Achternaam
              <input
                required
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                placeholder="Achternaam"
              />
            </label>
          </div>
          <label>
            E-mailadres
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="naam@voorbeeld.nl"
            />
          </label>
          <label>
            Wachtwoord
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Minimaal 8 tekens"
            />
          </label>
          <button className="primary" type="submit">
            Account aanmaken
          </button>
        </form>
        <p className="register-link">
          Heb je al een account? <button onClick={() => setPage("login")}>Inloggen</button>
        </p>
      </div>
    </main>
  );
}
