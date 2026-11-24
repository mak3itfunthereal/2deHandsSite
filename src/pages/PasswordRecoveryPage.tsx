import { useState } from "react";
import { rawApiClient } from "../api";
import { ApiError } from "../api/client";
import type { Page } from "../types";

export default function PasswordRecoveryPage({
  token,
  reset,
  onResetComplete,
  setPage,
}: {
  token: string | null;
  reset: boolean;
  onResetComplete: () => void;
  setPage: (page: Page) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (reset && !token) {
      setError("The reset link is missing its token. Request a new link.");
      return;
    }
    if (reset && password !== confirmation) {
      setError("The new passwords do not match.");
      return;
    }
    setPending(true);
    try {
      if (reset && token) {
        await rawApiClient.resetPassword(token, password);
        onResetComplete();
        setPassword("");
        setConfirmation("");
        setSuccess("Password reset successfully. You can now log in.");
      } else {
        await rawApiClient.forgotPassword(email.trim());
        setSuccess("If an account exists for that email, a reset link has been sent.");
      }
    } catch (err) {
      setError(reset && err instanceof ApiError && err.status === 400
        ? "The link is invalid, expired or already used, or the password is too short."
        : "The request could not be completed. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <span className="login-mark">b</span>
        <h1>{reset ? "Reset password" : "Forgot password"}</h1>
        {!success && (
          <form onSubmit={submit}>
            {reset ? (
              <>
                <label>New password
                  <input type="password" required minLength={8} autoComplete="new-password"
                    value={password} onChange={(event) => setPassword(event.target.value)} />
                </label>
                <label>Confirm new password
                  <input type="password" required minLength={8} autoComplete="new-password"
                    value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
                </label>
              </>
            ) : (
              <label>Email address
                <input type="email" required autoComplete="email" value={email}
                  onChange={(event) => setEmail(event.target.value)} />
              </label>
            )}
            {error && <p role="alert">{error}</p>}
            <button type="submit" className="primary" disabled={pending}>
              {pending ? "Please wait..." : reset ? "Reset password" : "Send reset link"}
            </button>
          </form>
        )}
        {success && <p role="status">{success}</p>}
        <p className="register-link">
          <button onClick={() => setPage("login")}>Back to login</button>
          {reset && !success && <>{" · "}<button onClick={() => setPage("forgot-password")}>Request a new link</button></>}
        </p>
      </div>
    </main>
  );
}
