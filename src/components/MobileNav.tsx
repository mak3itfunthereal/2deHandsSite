import type { Page, UserProfile } from "../types";
import { userInitials } from "../utils/marketplace";
import { Icon } from "./Icon";

export function MobileNav({
  page,
  setPage,
  loggedIn,
  user,
}: {
  page: Page;
  setPage: (p: Page) => void;
  loggedIn: boolean;
  user: UserProfile;
}) {
  return (
    <nav className="mobile-nav">
      <button className={page === "home" ? "active" : ""} onClick={() => setPage("home")}>
        <Icon name="home" />
        <span>Home</span>
      </button>
      <button className={page === "search" ? "active" : ""} onClick={() => setPage("search")}>
        <Icon name="search" />
        <span>Zoeken</span>
      </button>
      <button className="sell-tab" onClick={() => setPage("sell")}>
        <i>
          <Icon name="plus" size={27} />
        </i>
        <span>Verkopen</span>
      </button>
      <button className={page === "chat" ? "active" : ""} onClick={() => setPage("chat")}>
        <Icon name="message" />
        <span>Berichten</span>
      </button>
      <button
        className={page === "account" ? "active" : ""}
        onClick={() => setPage(loggedIn ? "account" : "login")}
      >
        {loggedIn ? (
          <span className="mobile-profile-avatar">{userInitials(user)}</span>
        ) : (
          <Icon name="user" />
        )}
        <span>{loggedIn ? user.firstName : "Inloggen"}</span>
      </button>
    </nav>
  );
}
