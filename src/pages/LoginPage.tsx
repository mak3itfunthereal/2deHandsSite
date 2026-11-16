import { useState } from "react";
import type { Page } from "../types";

export default function LoginPage({
  onLogin,
  setPage,
}: {
  onLogin: () => void;
  setPage: (page: Page) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <main className="login-page">
      <div className="login-card">
        <span className="login-mark">b</span>
        <span className="eyebrow">Welkom terug</span>
        <h1>Log in bij Bidzaar</h1>
        <p>Ga verder met kopen, verkopen en berichten.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onLogin();
          }}
        >
          <label>
            E-mailadres
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@voorbeeld.nl"
            />
          </label>
          <label>
            Wachtwoord
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimaal 8 tekens"
            />
          </label>
          <button type="button" className="forgot">
            Wachtwoord vergeten?
          </button>
          <button className="primary" type="submit">
            Inloggen
          </button>
        </form>
        <div className="login-divider">
          <span>of</span>
        </div>
        <button className="secondary social-login" onClick={onLogin}>
          Doorgaan met Google
        </button>
        <p className="register-link">
          Nog geen account? <button onClick={() => setPage("register")}>Registreren</button>
        </p>
      </div>
    </main>
  );
}
