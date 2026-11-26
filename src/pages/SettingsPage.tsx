import { useEffect, useState } from "react";
import type { LocationPreference, Page, UserProfile } from "../types";
import { userInitials } from "../utils/marketplace";
import { Icon } from "../components/ui";

export default function SettingsPage({
  setPage,
  user,
  onUserChange,
  location,
  onLocationChange,
  dark,
  setDark,
  onLogout,
  onDeleteAccount,
  onManageCookiePreferences,
}: {
  setPage: (p: Page) => void;
  user: UserProfile;
  onUserChange: (user: UserProfile) => void;
  location?: LocationPreference;
  onLocationChange?: (location: LocationPreference) => void;
  dark?: boolean;
  setDark?: (v: boolean) => void;
  onLogout?: () => void;
  onDeleteAccount?: (reason?: string) => Promise<void>;
  onManageCookiePreferences?: () => void;
}) {
  const [section, setSection] = useState<
    "Profile" | "Notifications" | "Privacy & security" | "Payments" | "Display & region"
  >("Profile");

  const [saved, setSaved] = useState(false);
  const [profileDraft, setProfileDraft] = useState<UserProfile>(user);
  const [cityDraft, setCityDraft] = useState(location?.city || "City 1");
  const [bioDraft, setBioDraft] = useState("Active member of the platform.");

  // Notifications
  const [push, setPush] = useState(true);
  const [mail, setMail] = useState(true);
  const [sound, setSound] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  // Privacy & security
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [historyCleared, setHistoryCleared] = useState(false);

  // Payments
  const [iban, setIban] = useState("NL91 ABNA 0417 1643 00");
  const [accountHolder, setAccountHolder] = useState(
    `${user.firstName} ${user.lastName}`.trim(),
  );
  const [paymentMethod, setPaymentMethod] = useState("iDEAL");
  const [autoPayout, setAutoPayout] = useState(true);

  // Display & Region
  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("EUR (€)");
  const [distanceUnit, setDistanceUnit] = useState("Kilometers (km)");

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [confirmDeleteChecked, setConfirmDeleteChecked] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    setProfileDraft(user);
    setAccountHolder(`${user.firstName} ${user.lastName}`.trim());
  }, [user]);

  useEffect(() => {
    if (location?.city) {
      setCityDraft(location.city);
    }
  }, [location?.city]);

  const sections: Array<"Profile" | "Notifications" | "Privacy & security" | "Payments" | "Display & region"> = [
    "Profile",
    "Notifications",
    "Privacy & security",
    "Payments",
    "Display & region",
  ];

  const handleAvatarUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setProfileDraft((prev) => ({ ...prev, avatar: url }));
      }
    };
    input.click();
  };

  const handleRemoveAvatar = () => {
    setProfileDraft((prev) => ({ ...prev, avatar: undefined }));
  };

  const handleClearHistory = () => {
    window.localStorage.removeItem("bidzaar-recent-searches");
    setHistoryCleared(true);
    setTimeout(() => setHistoryCleared(false), 3000);
  };

  const handleDeleteAccount = async () => {
    if (!onDeleteAccount || deletingAccount) return;
    setDeletingAccount(true);
    setDeleteError("");
    try {
      await onDeleteAccount(deleteReason);
      setShowDeleteModal(false);
      setConfirmDeleteChecked(false);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Account deletion failed.");
    } finally {
      setDeletingAccount(false);
    }
  };

  const save = () => {
    onUserChange(profileDraft);
    if (location && onLocationChange && cityDraft !== location.city) {
      onLocationChange({ ...location, city: cityDraft });
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  return (
    <main className="shell standalone-page">
      <div className="page-back">
        <button onClick={() => setPage("account")}>← Back to my profile</button>
      </div>

      <div className="standalone-heading compact">
        <div>
          <span className="eyebrow">My account</span>
          <h1>Settings</h1>
          <p>Manage your details, security, notifications, and payment methods.</p>
        </div>
      </div>

      <div className="settings-layout">
        <nav className="settings-nav">
          {sections.map((item) => (
            <button
              className={section === item ? "active" : ""}
              onClick={() => setSection(item)}
              key={item}
              type="button"
            >
              <span>{item}</span>
              <Icon name="chevron" size={15} />
            </button>
          ))}
          {onLogout && (
            <>
              <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: "8px 0" }} />
              <button
                onClick={onLogout}
                type="button"
                style={{ color: "var(--muted)", minHeight: "40px" }}
              >
                <span>Log out</span>
              </button>
            </>
          )}
        </nav>

        <section className="settings-panel">
          <div className="settings-panel-head">
            <h2>{section}</h2>
            <p>
              {section === "Profile" &&
                "Manage your public profile, contact details, and profile photo."}
              {section === "Notifications" &&
                "Choose how and when you receive updates about your listings and chats."}
              {section === "Privacy & security" &&
                "Protect your account with a password, two-factor authentication, and privacy options."}
              {section === "Payments" &&
                "Manage your bank account for payouts and your default payment method."}
              {section === "Display & region" &&
                "Adjust the platform's appearance, theme, language, and units of measurement."}
            </p>
          </div>

          {/* TAB: PROFILE */}
          {section === "Profile" && (
            <div className="settings-form">
              <p>Profile edits here are a local preview and are not saved to your account.</p>
              <div className="avatar-setting">
                {profileDraft.avatar ? (
                  <img
                    src={profileDraft.avatar}
                    alt={userInitials(profileDraft)}
                    className="avatar-preview-img"
                  />
                ) : (
                  <span className="profile-avatar-large">{userInitials(profileDraft)}</span>
                )}
                <div className="avatar-actions">
                  <button className="secondary" type="button" onClick={handleAvatarUpload}>
                    <Icon name="camera" size={16} /> Upload photo
                  </button>
                  {profileDraft.avatar && (
                    <button
                      className="secondary"
                      type="button"
                      onClick={handleRemoveAvatar}
                      style={{ color: "#dc2626" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="form-grid">
                <label>
                  First name
                  <input
                    value={profileDraft.firstName}
                    onChange={(event) =>
                      setProfileDraft({ ...profileDraft, firstName: event.target.value })
                    }
                    placeholder="First name"
                  />
                </label>
                <label>
                  Last name
                  <input
                    value={profileDraft.lastName}
                    onChange={(event) =>
                      setProfileDraft({ ...profileDraft, lastName: event.target.value })
                    }
                    placeholder="Last name"
                  />
                </label>
              </div>

              <label>
                Email address
                <input
                  value={profileDraft.email}
                  onChange={(event) =>
                    setProfileDraft({ ...profileDraft, email: event.target.value })
                  }
                  type="email"
                  placeholder="name@example.com"
                />
              </label>

              <div className="form-grid">
                <label>
                  Phone number
                  <input
                    value={profileDraft.phone || ""}
                    onChange={(event) =>
                      setProfileDraft({ ...profileDraft, phone: event.target.value })
                    }
                    placeholder="06-12345678"
                  />
                </label>
                <label>
                  City / Region
                  <input
                    value={cityDraft}
                    onChange={(event) => setCityDraft(event.target.value)}
                    placeholder="City 1"
                  />
                </label>
              </div>

              <label>
                Bio / About you
                <textarea
                  rows={4}
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  placeholder="Tell us about yourself, your reliability, or what you're looking for..."
                />
              </label>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {section === "Notifications" && (
            <div className="preference-list">
              <label>
                <span className="pref-text">
                  <b>Push notifications</b>
                  <small>Get real-time updates for new messages, offers, and orders</small>
                </span>
                <input
                  type="checkbox"
                  checked={push}
                  onChange={(e) => setPush(e.target.checked)}
                />
              </label>

              <label>
                <span className="pref-text">
                  <b>Email notifications</b>
                  <small>Price drops on favorite items and saved searches</small>
                </span>
                <input
                  type="checkbox"
                  checked={mail}
                  onChange={(e) => setMail(e.target.checked)}
                />
              </label>

              <label>
                <span className="pref-text">
                  <b>Notification sound</b>
                  <small>Play a subtle sound for incoming chat messages</small>
                </span>
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                />
              </label>

              <label>
                <span className="pref-text">
                  <b>Weekly newsletter & tips</b>
                  <small>Get weekly picks and tips to sell faster</small>
                </span>
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                />
              </label>
            </div>
          )}

          {/* TAB: PRIVACY & SECURITY */}
          {section === "Privacy & security" && (
            <div>
              <div className="preference-list">
                <label>
                  <span className="pref-text">
                    <b>Two-factor authentication (2FA)</b>
                    <small>Two-factor authentication is not available yet.</small>
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="badge badge-muted">Unavailable</span>
                  </div>
                </label>

                <label>
                  <span className="pref-text">
                    <b>Show phone number on listings</b>
                    <small>Only verified buyers can contact you by phone</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={phoneVisible}
                    onChange={(e) => setPhoneVisible(e.target.checked)}
                  />
                </label>
              </div>

              <h3 className="settings-section-title">Change password</h3>
              <div className="sub-card">
                <p>Request a password reset link to change your password.</p>
                <button className="secondary" type="button" onClick={() => setPage("forgot-password")}>
                  Request reset link
                </button>
              </div>

              <h3 className="settings-section-title">Data & privacy</h3>
              <div className="sub-card">
                {onManageCookiePreferences && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                    <div>
                      <b style={{ fontSize: "14px" }}>Cookie preferences</b>
                      <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "13px" }}>
                        Choose whether to allow personalized recommendations and location use.
                      </p>
                    </div>
                    <button
                      className="secondary"
                      type="button"
                      onClick={onManageCookiePreferences}
                    >
                      Manage preferences
                    </button>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <b style={{ fontSize: "14px" }}>Clear search history</b>
                    <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "13px" }}>
                      Remove searches saved in this browser.
                    </p>
                  </div>
                  <button className="secondary" type="button" onClick={handleClearHistory}>
                    {historyCleared ? "Cleared ✓" : "Clear history"}
                  </button>
                </div>
              </div>

              <h3 className="settings-section-title">Close account</h3>
              <div className="account-close-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <b style={{ fontSize: "14px", display: "block" }}>Close account</b>
                    <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "13px" }}>
                      Permanently delete your account and personal data.
                    </p>
                  </div>
                  {onDeleteAccount && (
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      style={{ color: "#dc2626", borderColor: "var(--line)" }}
                    >
                      Close account...
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PAYMENTS */}
          {section === "Payments" && (
            <div className="settings-form">
              <h3 className="settings-section-title" style={{ marginTop: 0 }}>
                Payouts from sales
              </h3>
              <div className="form-grid">
                <label>
                  IBAN bank account number
                  <input
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="NL00 BANK 0000 0000 00"
                  />
                </label>
                <label>
                  Account holder name
                  <input
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Name as shown on bank account"
                  />
                </label>
              </div>

              <div className="preference-list">
                <label>
                  <span className="pref-text">
                    <b>Automatic payout</b>
                    <small>
                      Receive your sale proceeds automatically within 24 hours after buyer confirmation
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={autoPayout}
                    onChange={(e) => setAutoPayout(e.target.checked)}
                  />
                </label>
              </div>

              <h3 className="settings-section-title">Default payment method (buying)</h3>
              <label>
                Preferred method for Buyer Protection
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid var(--line)",
                    background: "var(--canvas)",
                    color: "var(--ink)",
                  }}
                >
                  <option value="iDEAL">iDEAL</option>
                  <option value="Creditcard">Credit card (Visa / Mastercard)</option>
                  <option value="Bancontact">Bancontact</option>
                  <option value="ApplePay">Apple Pay</option>
                </select>
              </label>

              <div className="sub-card">
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <Icon name="shield" size={24} />
                  <div>
                    <b style={{ fontSize: "14px" }}>Secure payment with Buyer Protection</b>
                    <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "13px" }}>
                      Payments are processed by our regulated payment partner. Your bank details are
                      never shared with other buyers or sellers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DISPLAY & REGION */}
          {section === "Display & region" && (
            <div className="settings-form">
              <div>
                <b style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>Theme</b>
                <div className="theme-selector">
                  <button
                    className={`theme-card ${!dark ? "active" : ""}`}
                    onClick={() => setDark?.(false)}
                    type="button"
                  >
                    <Icon name="sun" size={24} />
                    <span>Light</span>
                  </button>
                  <button
                    className={`theme-card ${dark ? "active" : ""}`}
                    onClick={() => setDark?.(true)}
                    type="button"
                  >
                    <Icon name="moon" size={24} />
                    <span>Dark</span>
                  </button>
                  <button
                    className="theme-card"
                    onClick={() => {
                      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                      setDark?.(prefersDark);
                    }}
                    type="button"
                  >
                    <Icon name="menu" size={24} />
                    <span>System</span>
                  </button>
                </div>
              </div>

              <div className="form-grid">
                <label>
                  Language
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid var(--line)",
                      background: "var(--canvas)",
                      color: "var(--ink)",
                    }}
                  >
                    <option value="Dutch">Dutch (NL)</option>
                    <option value="English">English (EN)</option>
                    <option value="Deutsch">German (DE)</option>
                  </select>
                </label>

                <label>
                  Currency
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid var(--line)",
                      background: "var(--canvas)",
                      color: "var(--ink)",
                    }}
                  >
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="GBP (£)">GBP (£)</option>
                  </select>
                </label>
              </div>

              <label>
                Distance unit
                <select
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid var(--line)",
                    background: "var(--canvas)",
                    color: "var(--ink)",
                  }}
                >
                  <option value="Kilometers (km)">Kilometers (km)</option>
                  <option value="Miles (mi)">Miles (mi)</option>
                </select>
              </label>
            </div>
          )}

          {/* SAVE BAR */}
          <div className="settings-save">
            {saved && (
              <span>
                <Icon name="check" size={17} /> Local changes applied; account details are not saved to the server.
              </span>
            )}
            <button className="primary" onClick={save} type="button">
              Save changes
            </button>
          </div>
        </section>
      </div>

      {/* CLOSE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!deletingAccount) setShowDeleteModal(false);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => {
                setShowDeleteModal(false);
                setConfirmDeleteChecked(false);
                setDeleteError("");
              }}
              disabled={deletingAccount}
              type="button"
            >
              <Icon name="close" />
            </button>
            <span className="eyebrow">Close account</span>
            <h2 id="delete-account-title">Are you sure you want to close your account?</h2>
            <p style={{ margin: "10px 0 16px", color: "var(--muted)", fontSize: "14px", lineHeight: 1.5 }}>
              We're sorry to see you go. If you close your account:
            </p>
            <ul
              style={{
                margin: "0 0 18px 18px",
                padding: 0,
                fontSize: "13px",
                color: "var(--muted)",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <li>All your active listings will be taken offline immediately.</li>
              <li>Buyers and sellers will no longer be able to send you new messages.</li>
              <li>Your personal data will be permanently deleted in accordance with GDPR.</li>
            </ul>
            <div style={{ margin: "16px 0" }}>
              <label
                style={{
                  fontSize: "13px",
                  color: "var(--ink)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontWeight: 600,
                }}
              >
                <span>Reason for leaving (optional):</span>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    fontSize: "13px",
                  }}
                >
                  <option value="">Choose a reason...</option>
                  <option value="I sold everything">I sold everything</option>
                  <option value="I no longer use the platform">I no longer use the platform</option>
                  <option value="I have another account">I have another account</option>
                  <option value="Privacy reasons">Privacy reasons</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                margin: "18px 0",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={confirmDeleteChecked}
                onChange={(e) => setConfirmDeleteChecked(e.target.checked)}
                style={{ marginTop: "3px" }}
              />
              <span style={{ fontSize: "13px", color: "var(--ink)", lineHeight: 1.4 }}>
                I understand that all my listings and messages will be permanently deleted.
              </span>
            </label>
            {deleteError && (
              <p role="alert" style={{ color: "#dc2626", fontSize: "13px", margin: "12px 0" }}>
                {deleteError}
              </p>
            )}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <button
                className="secondary"
                type="button"
                disabled={deletingAccount}
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmDeleteChecked(false);
                  setDeleteError("");
                }}
              >
                Keep account
              </button>
              <button
                className="btn-danger"
                type="button"
                disabled={!confirmDeleteChecked || deletingAccount}
                style={{
                  opacity: confirmDeleteChecked && !deletingAccount ? 1 : 0.45,
                  cursor: confirmDeleteChecked && !deletingAccount ? "pointer" : "not-allowed",
                }}
                onClick={handleDeleteAccount}
              >
                {deletingAccount ? "Deleting account…" : "Close account permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
