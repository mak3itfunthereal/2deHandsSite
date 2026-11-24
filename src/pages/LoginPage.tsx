import { useState } from "react";
import { ApiError } from "../api/client";
import type { Page } from "../types";

export default function LoginPage({
  onLogin,
  setPage,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  setPage: (page: Page) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError && (err.status === 400 || err.status === 401 || err.status === 403)
        ? "Login failed. Check your credentials and account status."
        : "Unable to log in. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <span className="login-mark">b</span>
        <span className="eyebrow">Welcome back</span>
        <h1>Log in to Bidzaar</h1>
        <p>Continue buying, selling, and messaging.</p>
        <form onSubmit={submit}>
          <label>
            Email address
            <input type="email" required autoComplete="email" value={email}
              onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
          </label>
          <label>
            Password
            <input type="password" required autoComplete="current-password" value={password}
              onChange={(event) => setPassword(event.target.value)} placeholder="Your password" />
          </label>
          <button type="button" className="forgot" onClick={() => setPage("forgot-password")}>
            Forgot password?
          </button>
          {error && <p role="alert">{error}</p>}
          <button className="primary" type="submit" disabled={pending}>
            {pending ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="register-link">
          No account yet? <button onClick={() => setPage("register")}>Sign up</button>
        </p>
      </div>
    </main>
  );
}
