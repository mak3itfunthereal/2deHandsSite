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
        <span className="eyebrow">Welcome back</span>
        <h1>Log in to Bidzaar</h1>
        <p>Continue buying, selling, and messaging.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onLogin();
          }}
        >
          <label>
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </label>
          <button type="button" className="forgot">
            Forgot password?
          </button>
          <button className="primary" type="submit">
            Log in
          </button>
        </form>
        <div className="login-divider">
          <span>or</span>
        </div>
        <button className="secondary social-login" onClick={onLogin}>
          Continue with Google
        </button>
        <p className="register-link">
          No account yet? <button onClick={() => setPage("register")}>Sign up</button>
        </p>
      </div>
    </main>
  );
}
