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
        <span className="eyebrow">New to Bidzaar</span>
        <h1>Create your account</h1>
        <p>Enter your details. Your name and initials will appear on your profile.</p>
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
              First name
              <input
                required
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                placeholder="First name"
              />
            </label>
            <label>
              Last name
              <input
                required
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                placeholder="Last name"
              />
            </label>
          </div>
          <label>
            Email address
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="name@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="At least 8 characters"
            />
          </label>
          <button className="primary" type="submit">
            Create account
          </button>
        </form>
        <p className="register-link">
          Already have an account? <button onClick={() => setPage("login")}>Log in</button>
        </p>
      </div>
    </main>
  );
}
