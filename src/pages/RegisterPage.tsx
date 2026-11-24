import { useState } from "react";
import { rawApiClient } from "../api";
import { ApiError } from "../api/client";
import type { Page } from "../types";

export default function RegisterPage({
  onRegistered,
  setPage,
}: {
  onRegistered: () => void;
  setPage: (page: Page) => void;
}) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await rawApiClient.register(form.username.trim(), form.email.trim(), form.password);
      onRegistered();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 409
        ? "An account with that email already exists."
        : err instanceof ApiError && err.status === 400
          ? "Please check your account details and try again."
          : "Unable to create your account. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card register-card">
        <span className="login-mark">{form.username.charAt(0).toUpperCase() || "b"}</span>
        <span className="eyebrow">New to Bidzaar</span>
        <h1>Create your account</h1>
        <p>Your username will appear on your profile.</p>
        <form onSubmit={submit}>
          <label>
            Username
            <input required autoComplete="username" value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })} />
          </label>
          <label>
            Email address
            <input type="email" required autoComplete="email" value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="name@example.com" />
          </label>
          <label>
            Password
            <input type="password" required minLength={8} autoComplete="new-password"
              value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="At least 8 characters" />
          </label>
          {error && <p role="alert">{error}</p>}
          <button className="primary" type="submit" disabled={pending}>
            {pending ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="register-link">
          Already have an account? <button onClick={() => setPage("login")}>Log in</button>
        </p>
      </div>
    </main>
  );
}
