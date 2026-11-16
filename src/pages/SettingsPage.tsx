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
}: {
  setPage: (p: Page) => void;
  user: UserProfile;
  onUserChange: (user: UserProfile) => void;
  location?: LocationPreference;
  onLocationChange?: (location: LocationPreference) => void;
  dark?: boolean;
  setDark?: (v: boolean) => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}) {
  const [section, setSection] = useState<
    "Profiel" | "Meldingen" | "Privacy & beveiliging" | "Betalen" | "Weergave & regio"
  >("Profiel");

  const [saved, setSaved] = useState(false);
  const [profileDraft, setProfileDraft] = useState<UserProfile>(user);
  const [cityDraft, setCityDraft] = useState(location?.city || "Plaats 1");
  const [bioDraft, setBioDraft] = useState("Actief lid op het platform.");

  // Notifications
  const [push, setPush] = useState(true);
  const [mail, setMail] = useState(true);
  const [sound, setSound] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  // Privacy & security
  const [twoFactor, setTwoFactor] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [historyCleared, setHistoryCleared] = useState(false);

  // Payments
  const [iban, setIban] = useState("NL91 ABNA 0417 1643 00");
  const [accountHolder, setAccountHolder] = useState(
    `${user.firstName} ${user.lastName}`.trim(),
  );
  const [paymentMethod, setPaymentMethod] = useState("iDEAL");
  const [autoPayout, setAutoPayout] = useState(true);

  // Display & Region
  const [language, setLanguage] = useState("Nederlands");
  const [currency, setCurrency] = useState("EUR (€)");
  const [distanceUnit, setDistanceUnit] = useState("Kilometers (km)");

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [confirmDeleteChecked, setConfirmDeleteChecked] = useState(false);

  useEffect(() => {
    setProfileDraft(user);
    setAccountHolder(`${user.firstName} ${user.lastName}`.trim());
  }, [user]);

  useEffect(() => {
    if (location?.city) {
      setCityDraft(location.city);
    }
  }, [location?.city]);

  const sections: Array<"Profiel" | "Meldingen" | "Privacy & beveiliging" | "Betalen" | "Weergave & regio"> = [
    "Profiel",
    "Meldingen",
    "Privacy & beveiliging",
    "Betalen",
    "Weergave & regio",
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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordStatus("Vul eerst je huidige wachtwoord in.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus("Nieuw wachtwoord moet minimaal 8 tekens bevatten.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus("Nieuwe wachtwoorden komen niet overeen.");
      return;
    }
    setPasswordStatus("Wachtwoord succesvol gewijzigd!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordStatus(null), 3500);
  };

  const handleClearHistory = () => {
    setHistoryCleared(true);
    setTimeout(() => setHistoryCleared(false), 3000);
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
        <button onClick={() => setPage("account")}>← Terug naar mijn profiel</button>
      </div>

      <div className="standalone-heading compact">
        <div>
          <span className="eyebrow">Mijn account</span>
          <h1>Instellingen</h1>
          <p>Beheer je gegevens, beveiliging, meldingen en betaalmethoden.</p>
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
                <span>Uitloggen</span>
              </button>
            </>
          )}
        </nav>

        <section className="settings-panel">
          <div className="settings-panel-head">
            <h2>{section}</h2>
            <p>
              {section === "Profiel" &&
                "Beheer je openbare profiel, contactgegevens en profielfoto."}
              {section === "Meldingen" &&
                "Bepaal hoe en wanneer je updates ontvangt over je advertenties en chats."}
              {section === "Privacy & beveiliging" &&
                "Bescherm je account met wachtwoord, tweestapsverificatie en privacy-opties."}
              {section === "Betalen" &&
                "Beheer je bankrekening voor uitbetalingen en je standaard betaalmethode."}
              {section === "Weergave & regio" &&
                "Pas de weergave, thema, taal en maateenheden van het platform aan."}
            </p>
          </div>

          {/* TAB: PROFIEL */}
          {section === "Profiel" && (
            <div className="settings-form">
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
                    <Icon name="camera" size={16} /> Foto uploaden
                  </button>
                  {profileDraft.avatar && (
                    <button
                      className="secondary"
                      type="button"
                      onClick={handleRemoveAvatar}
                      style={{ color: "#dc2626" }}
                    >
                      Verwijderen
                    </button>
                  )}
                </div>
              </div>

              <div className="form-grid">
                <label>
                  Voornaam
                  <input
                    value={profileDraft.firstName}
                    onChange={(event) =>
                      setProfileDraft({ ...profileDraft, firstName: event.target.value })
                    }
                    placeholder="Voornaam"
                  />
                </label>
                <label>
                  Achternaam
                  <input
                    value={profileDraft.lastName}
                    onChange={(event) =>
                      setProfileDraft({ ...profileDraft, lastName: event.target.value })
                    }
                    placeholder="Achternaam"
                  />
                </label>
              </div>

              <label>
                E-mailadres
                <input
                  value={profileDraft.email}
                  onChange={(event) =>
                    setProfileDraft({ ...profileDraft, email: event.target.value })
                  }
                  type="email"
                  placeholder="naam@voorbeeld.nl"
                />
              </label>

              <div className="form-grid">
                <label>
                  Telefoonnummer
                  <input
                    value={profileDraft.phone || ""}
                    onChange={(event) =>
                      setProfileDraft({ ...profileDraft, phone: event.target.value })
                    }
                    placeholder="06-12345678"
                  />
                </label>
                <label>
                  Woonplaats / Regio
                  <input
                    value={cityDraft}
                    onChange={(event) => setCityDraft(event.target.value)}
                    placeholder="Plaats 1"
                  />
                </label>
              </div>

              <label>
                Bio / Over jezelf
                <textarea
                  rows={4}
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  placeholder="Vertel iets over jezelf, je betrouwbaarheid of wat je zoekt..."
                />
              </label>
            </div>
          )}

          {/* TAB: MELDINGEN */}
          {section === "Meldingen" && (
            <div className="preference-list">
              <label>
                <span className="pref-text">
                  <b>Pushmeldingen</b>
                  <small>Ontvang realtime updates voor nieuwe berichten, biedingen en orders</small>
                </span>
                <input
                  type="checkbox"
                  checked={push}
                  onChange={(e) => setPush(e.target.checked)}
                />
              </label>

              <label>
                <span className="pref-text">
                  <b>E-mailmeldingen</b>
                  <small>Prijsverlagingen van favoriete artikelen en opgeslagen zoekopdrachten</small>
                </span>
                <input
                  type="checkbox"
                  checked={mail}
                  onChange={(e) => setMail(e.target.checked)}
                />
              </label>

              <label>
                <span className="pref-text">
                  <b>Notificatiegeluid</b>
                  <small>Speel een subtiel geluid af bij binnenkomende chatberichten</small>
                </span>
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                />
              </label>

              <label>
                <span className="pref-text">
                  <b>Wekelijkse nieuwsbrief & tips</b>
                  <small>Ontvang wekelijkse selecties en tips om sneller te verkopen</small>
                </span>
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                />
              </label>
            </div>
          )}

          {/* TAB: PRIVACY & BEVEILIGING */}
          {section === "Privacy & beveiliging" && (
            <div>
              <div className="preference-list">
                <label>
                  <span className="pref-text">
                    <b>Twee-staps-verificatie (2FA)</b>
                    <small>Beveilig je account extra met een sms- of authenticator-code</small>
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className={`badge ${twoFactor ? "badge-success" : "badge-muted"}`}>
                      {twoFactor ? "Actief" : "Inactief"}
                    </span>
                    <input
                      type="checkbox"
                      checked={twoFactor}
                      onChange={(e) => setTwoFactor(e.target.checked)}
                    />
                  </div>
                </label>

                <label>
                  <span className="pref-text">
                    <b>Telefoonnummer tonen bij advertenties</b>
                    <small>Alleen geverifieerde kopers kunnen telefonisch contact met je opnemen</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={phoneVisible}
                    onChange={(e) => setPhoneVisible(e.target.checked)}
                  />
                </label>
              </div>

              <h3 className="settings-section-title">Wachtwoord wijzigen</h3>
              <form onSubmit={handlePasswordSubmit} className="sub-card">
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>Huidig wachtwoord</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      border: "1px solid var(--line)",
                      background: "var(--surface)",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      color: "var(--ink)",
                    }}
                  />
                </label>
                <div className="form-grid">
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Nieuw wachtwoord</span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimaal 8 tekens"
                      style={{
                        border: "1px solid var(--line)",
                        background: "var(--surface)",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        color: "var(--ink)",
                      }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Bevestig nieuw wachtwoord</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Herhaal nieuw wachtwoord"
                      style={{
                        border: "1px solid var(--line)",
                        background: "var(--surface)",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        color: "var(--ink)",
                      }}
                    />
                  </label>
                </div>
                {passwordStatus && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: passwordStatus.includes("succesvol") ? "#16a34a" : "#dc2626",
                      margin: "4px 0",
                    }}
                  >
                    {passwordStatus}
                  </p>
                )}
                <div>
                  <button className="secondary" type="submit">
                    Wachtwoord bijwerken
                  </button>
                </div>
              </form>

              <h3 className="settings-section-title">Gegevens & privacy</h3>
              <div className="sub-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <b style={{ fontSize: "14px" }}>Zoekgeschiedenis en cookies wissen</b>
                    <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "13px" }}>
                      Verwijder al je lokaal opgeslagen zoekopdrachten en cache.
                    </p>
                  </div>
                  <button className="secondary" type="button" onClick={handleClearHistory}>
                    {historyCleared ? "Gewist ✓" : "Geschiedenis wissen"}
                  </button>
                </div>
              </div>

              <h3 className="settings-section-title">Account beëindigen</h3>
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
                    <b style={{ fontSize: "14px", display: "block" }}>Account opzeggen</b>
                    <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "13px" }}>
                      Sluit je account en verwijder je persoonsgegevens volgens de privacywetgeving (AVG).
                    </p>
                  </div>
                  {onDeleteAccount && (
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      style={{ color: "#dc2626", borderColor: "var(--line)" }}
                    >
                      Account sluiten...
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: BETALEN */}
          {section === "Betalen" && (
            <div className="settings-form">
              <h3 className="settings-section-title" style={{ marginTop: 0 }}>
                Uitbetalingen van verkopen
              </h3>
              <div className="form-grid">
                <label>
                  IBAN Rekeningnummer
                  <input
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="NL00 BANK 0000 0000 00"
                  />
                </label>
                <label>
                  Naam rekeninghouder
                  <input
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Naam zoals op bankrekening"
                  />
                </label>
              </div>

              <div className="preference-list">
                <label>
                  <span className="pref-text">
                    <b>Automatische uitbetaling</b>
                    <small>
                      Ontvang je verkoopopbrengst automatisch binnen 24 uur na bevestiging door de koper
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={autoPayout}
                    onChange={(e) => setAutoPayout(e.target.checked)}
                  />
                </label>
              </div>

              <h3 className="settings-section-title">Standaard betaalmethode (Kopen)</h3>
              <label>
                Voorkeursmethode voor Kopersbescherming
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
                  <option value="Creditcard">Creditcard (Visa / Mastercard)</option>
                  <option value="Bancontact">Bancontact</option>
                  <option value="ApplePay">Apple Pay</option>
                </select>
              </label>

              <div className="sub-card">
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <Icon name="shield" size={24} />
                  <div>
                    <b style={{ fontSize: "14px" }}>Veilige betaling via Kopersbescherming</b>
                    <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "13px" }}>
                      Betalingen verlopen via onze gereguleerde betaalpartner. Jouw bankgegevens worden
                      nooit gedeeld met andere kopers of verkopers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WEERGAVE & REGIO */}
          {section === "Weergave & regio" && (
            <div className="settings-form">
              <div>
                <b style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>Thema</b>
                <div className="theme-selector">
                  <button
                    className={`theme-card ${!dark ? "active" : ""}`}
                    onClick={() => setDark?.(false)}
                    type="button"
                  >
                    <Icon name="sun" size={24} />
                    <span>Licht</span>
                  </button>
                  <button
                    className={`theme-card ${dark ? "active" : ""}`}
                    onClick={() => setDark?.(true)}
                    type="button"
                  >
                    <Icon name="moon" size={24} />
                    <span>Donker</span>
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
                    <span>Systeem</span>
                  </button>
                </div>
              </div>

              <div className="form-grid">
                <label>
                  Taal
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
                    <option value="Nederlands">Nederlands (NL)</option>
                    <option value="English">English (EN)</option>
                    <option value="Deutsch">Deutsch (DE)</option>
                  </select>
                </label>

                <label>
                  Valuta
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
                Afstandseenheid
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
                  <option value="Mijlen (mi)">Mijlen (mi)</option>
                </select>
              </label>
            </div>
          )}

          {/* OPSLAAN BALK */}
          <div className="settings-save">
            {saved && (
              <span>
                <Icon name="check" size={17} /> Wijzigingen succesvol opgeslagen!
              </span>
            )}
            <button className="primary" onClick={save} type="button">
              Wijzigingen opslaan
            </button>
          </div>
        </section>
      </div>

      {/* BEVESTIGINGSMODAL ACCOUNT OPZEGGEN */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => {
                setShowDeleteModal(false);
                setConfirmDeleteChecked(false);
              }}
              type="button"
            >
              <Icon name="close" />
            </button>
            <span className="eyebrow">Account opzeggen</span>
            <h2>Weet je zeker dat je je account wilt sluiten?</h2>
            <p style={{ margin: "10px 0 16px", color: "var(--muted)", fontSize: "14px", lineHeight: 1.5 }}>
              Wat jammer dat je weggaat. Als je je account sluit:
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
              <li>Worden al je actieve advertenties direct offline gehaald.</li>
              <li>Kunnen kopers en verkopers je geen nieuwe berichten sturen.</li>
              <li>Worden je persoonsgegevens definitief gewist volgens de AVG.</li>
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
                <span>Reden van vertrek (optioneel):</span>
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
                  <option value="">Kies een reden...</option>
                  <option value="Ik heb alles verkocht">Ik heb alles verkocht</option>
                  <option value="Ik gebruik het platform niet meer">Ik gebruik het platform niet meer</option>
                  <option value="Ik heb een ander account">Ik heb een ander account</option>
                  <option value="Privacyredenen">Privacyredenen</option>
                  <option value="Anders">Anders</option>
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
                Ik begrijp dat al mijn advertenties en berichten definitief worden verwijderd.
              </span>
            </label>
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
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmDeleteChecked(false);
                }}
              >
                Account behouden
              </button>
              <button
                className="btn-danger"
                type="button"
                disabled={!confirmDeleteChecked}
                style={{
                  opacity: confirmDeleteChecked ? 1 : 0.45,
                  cursor: confirmDeleteChecked ? "pointer" : "not-allowed",
                }}
                onClick={() => {
                  setShowDeleteModal(false);
                  onDeleteAccount?.();
                }}
              >
                Definitief opzeggen
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
