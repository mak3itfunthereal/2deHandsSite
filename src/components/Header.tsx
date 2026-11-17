import { useEffect, useMemo, useRef, useState } from "react";
import type { LocationPreference, Page, UserProfile } from "../types";
import { userFullName, userInitials } from "../utils/marketplace";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { LocationControls } from "./LocationControls";

export const categoryNavigation = [
  {
    name: "All categories",
    sections: [
      { title: "Group 1", items: ["Category 1", "Category 2", "Category 3"] },
      { title: "Group 2", items: ["Category 4", "Category 5", "Category 6"] },
      { title: "Group 3", items: ["Category 7", "Category 8"] },
    ],
  },
  {
    name: "Category 1",
    sections: [
      { title: "Selection 1", items: ["Product 1", "Product 2", "Product 3"] },
      { title: "Selection 2", items: ["Subcategory 1", "Subcategory 2"] },
    ],
  },
  {
    name: "Category 2",
    sections: [
      { title: "Selection 1", items: ["Product 4", "Product 5", "Product 6"] },
      { title: "Selection 2", items: ["Subcategory 1", "Subcategory 2"] },
    ],
  },
  {
    name: "Category 3",
    sections: [
      { title: "Selection 1", items: ["Product 7", "Product 8"] },
      { title: "Selection 2", items: ["Subcategory 1", "Subcategory 2"] },
    ],
  },
  {
    name: "Category 4",
    sections: [
      { title: "Selection 1", items: ["Product 1", "Product 2"] },
      { title: "Selection 2", items: ["Subcategory 1", "Subcategory 2"] },
    ],
  },
];

export function Header({
  page,
  setPage,
  dark,
  setDark,
  loggedIn,
  onLogout,
  location,
  onLocationChange,
  user,
  searchQuery = "",
  onSearch,
  onCategorySelect,
}: {
  page: Page;
  setPage: (p: Page) => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  loggedIn: boolean;
  onLogout: () => void;
  location: LocationPreference;
  onLocationChange: (location: LocationPreference) => void;
  user: UserProfile;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  onCategorySelect?: (category: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = window.localStorage.getItem("bidzaar-recent-searches");
      return stored ? JSON.parse(stored) : ["Product 1", "Product 2"];
    } catch {
      return ["Product 1", "Product 2"];
    }
  });
  const headerRef = useRef<HTMLElement>(null);

  const saveSearchTerm = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((x) => x.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
      try {
        window.localStorage.setItem("bidzaar-recent-searches", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const next = prev.filter((x) => x !== term);
      try {
        window.localStorage.setItem("bidzaar-recent-searches", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      window.localStorage.removeItem("bidzaar-recent-searches");
    } catch {}
  };

  useEffect(() => {
    setInputQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (headerRef.current && !headerRef.current.contains(target)) {
        setLocationOpen(false);
        setOpen(false);
        setNotifications(false);
        setShowSuggestions(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLocationOpen(false);
        setOpen(false);
        setNotifications(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const suggestions = useMemo(() => {
    if (!inputQuery.trim()) return [];
    const q = inputQuery.toLowerCase().trim();
    const popular = [
      "Product 1",
      "Product 2",
      "Product 3",
      "Product 4",
      "Product 5",
    ];
    const catMatches = categoryNavigation.flatMap((c) =>
      c.sections.flatMap((s) => s.items).filter((item) => item.toLowerCase().includes(q)),
    );
    const combined = Array.from(
      new Set([
        ...popular.filter((p) => p.toLowerCase().includes(q)),
        ...catMatches,
      ]),
    );
    return combined.slice(0, 5);
  }, [inputQuery]);

  const handleSelectSuggestion = (term: string) => {
    saveSearchTerm(term);
    setInputQuery(term);
    setShowSuggestions(false);
    if (onSearch) onSearch(term);
    else setPage("search");
  };

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      saveSearchTerm(inputQuery);
    }
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(inputQuery);
    } else {
      setPage("search");
    }
  };
  return (
    <header ref={headerRef}>
      <div className="header-main shell">
        <button
          className="mobile-menu icon-btn"
          aria-label="Menu"
          onClick={() => setPage("search")}
        >
          <Icon name="menu" />
        </button>
        <Logo onClick={() => setPage("home")} />
        <div style={{ position: "relative", flex: 1, maxWidth: "520px" }}>
          <form className="header-search" style={{ maxWidth: "100%" }} onSubmit={handleSubmitSearch}>
            <Icon name="search" />
            <input
              aria-label="Search"
              placeholder="What are you looking for?"
              value={inputQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setInputQuery(e.target.value);
                setShowSuggestions(true);
              }}
            />
            <button type="submit">Search</button>
          </form>

          {showSuggestions && (inputQuery.trim() ? suggestions.length > 0 : recentSearches.length > 0) && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "12px",
                boxShadow: "var(--shadow)",
                zIndex: 85,
                padding: "8px 0",
                overflow: "hidden",
              }}
            >
              {!inputQuery.trim() ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 16px 8px",
                      fontSize: "12px",
                      color: "var(--muted)",
                      fontWeight: 600,
                    }}
                  >
                    <span>Recent searches</span>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      style={{
                        border: 0,
                        background: "transparent",
                        color: "var(--muted)",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      Clear all
                    </button>
                  </div>
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      onClick={() => handleSelectSuggestion(term)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 16px",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "var(--ink)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--primary-soft)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Icon name="search" size={14} />
                        <span>{term}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => removeRecentSearch(e, term)}
                        style={{
                          border: 0,
                          background: "transparent",
                          color: "var(--muted)",
                          fontSize: "16px",
                          cursor: "pointer",
                          padding: "0 4px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                suggestions.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectSuggestion(term)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      padding: "9px 16px",
                      border: 0,
                      background: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "var(--ink)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--primary-soft)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <Icon name="search" size={15} />
                    <span>{term}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <button className="location" onClick={() => setLocationOpen(!locationOpen)}>
          <Icon name="pin" size={18} />
          <span>
            {location.city} · {location.radius} km
          </span>
        </button>
        {locationOpen && (
          <div className="location-popover">
            <div className="location-popover-title">
              <div>
                <b>Search area</b>
                <small>Choose where you want to see listings</small>
              </div>
              <button className="icon-btn" onClick={() => setLocationOpen(false)}>
                <Icon name="close" size={18} />
              </button>
            </div>
            <LocationControls
              location={location}
              onChange={onLocationChange}
              onDone={() => setLocationOpen(false)}
            />
          </div>
        )}
        <nav className="actions">
          <button
            className="icon-btn theme"
            onClick={() => setDark(!dark)}
            aria-label="Toggle theme"
          >
            <Icon name={dark ? "sun" : "moon"} />
          </button>
          <button className="icon-btn" aria-label="Favorites" onClick={() => setPage("account")}>
            <Icon name="heart" />
          </button>
          <button
            className="icon-btn badge-wrap"
            onClick={() => setPage("chat")}
            aria-label="Messages"
          >
            <Icon name="message" />
            <i>2</i>
          </button>
          <button
            className="icon-btn badge-wrap"
            aria-label="Notifications"
            onClick={() => setNotifications(!notifications)}
          >
            <Icon name="bell" />
            <i>3</i>
          </button>
          {loggedIn ? (
            <button className="profile-btn" onClick={() => setOpen(!open)}>
              <span className="avatar" aria-label={`Profile photo of ${userFullName(user)}`}>
                {userInitials(user)}
              </span>
              <span className="profile-name">{userFullName(user)}</span>
              <Icon name="chevron" size={15} />
            </button>
          ) : (
            <button className="secondary login-header" onClick={() => setPage("login")}>
              Log in
            </button>
          )}
          {loggedIn && open && (
            <div className="profile-menu">
              <div className="profile-menu-identity">
                <span className="avatar">{userInitials(user)}</span>
                <span>
                  <b>{userFullName(user)}</b>
                  <small>{user.email}</small>
                </span>
              </div>
              <button onClick={() => setPage("account")}>My profile</button>
              <button onClick={() => setPage("my-ads")}>My listings</button>
              <button onClick={() => setPage("settings")}>Settings</button>
              <hr />
              <button onClick={onLogout}>Log out</button>
            </div>
          )}
          {notifications && (
            <div className="notification-menu">
              <div>
                <b>Notifications</b>
                <button onClick={() => setNotifications(false)}>
                  <Icon name="close" size={17} />
                </button>
              </div>
              <button onClick={() => setPage("chat")}>
                <span className="notification-icon">
                  <Icon name="message" size={18} />
                </span>
                <span>
                  <b>New message from Seller 1</b>
                  <small>“The item is still available.” · 2 min</small>
                </span>
              </button>
              <button onClick={() => setPage("detail")}>
                <span className="notification-icon">
                  <Icon name="heart" size={18} />
                </span>
                <span>
                  <b>Price reduced</b>
                  <small>Product 1 is now €125 · 1 hour</small>
                </span>
              </button>
              <button onClick={() => setPage("account")}>
                <span className="notification-icon">
                  <Icon name="package" size={18} />
                </span>
                <span>
                  <b>Your package is on its way</b>
                  <small>Expected tomorrow between 10:00–12:00</small>
                </span>
              </button>
            </div>
          )}
          <button className="primary sell-btn" onClick={() => setPage("sell")}>
            <Icon name="plus" />
            Post a listing
          </button>
        </nav>
        <div className="mobile-actions">
          <button className="icon-btn" onClick={() => setPage("search")}           aria-label="Search">
            <Icon name="search" />
          </button>
          <button
            className="icon-btn badge-wrap"
            onClick={() => setNotifications(!notifications)}
            aria-label="Notifications"
          >
            <Icon name="bell" />
            <i>3</i>
          </button>
        </div>
      </div>
      <div className="category-bar">
        <div className="shell">
          {categoryNavigation.map((category, index) => (
            <div className="category-nav-item" key={category.name}>
              <button
                className={index === 0 ? "strong" : ""}
                onClick={() => {
                  if (onCategorySelect && category.name !== "All categories") {
                    onCategorySelect(category.name);
                  }
                  setPage("search");
                }}
                aria-haspopup="true"
              >
                {index === 0 && <Icon name="menu" size={16} />}
                {category.name}
                <Icon name="chevron" size={12} />
              </button>
              <div className="category-mega-menu">
                <div className="mega-menu-heading">
                  <div>
                    <span>Discover</span>
                    <h3>{category.name}</h3>
                  </div>
                  <button onClick={() => setPage("search")}>
                    View all <Icon name="chevron" size={14} />
                  </button>
                </div>
                <div className="mega-menu-columns">
                  {category.sections.map((section) => (
                    <div key={section.title}>
                      <h4>{section.title}</h4>
                      {section.items.map((item) => (
                        <button
                          onClick={() => {
                            if (onSearch) onSearch(item);
                            else setPage("search");
                          }}
                          key={item}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
