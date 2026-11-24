import { Icon } from "./Icon";

interface FooterLink {
  label: string;
  href: string;
}

const FOOTER_SECTIONS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Bidzaar",
    links: [
      { label: "Home", href: "#/" },
      { label: "Discover listings", href: "#/search" },
      { label: "Post listing", href: "#/sell" },
      { label: "About us", href: "#/" },
      { label: "Sustainability", href: "#/" },
    ],
  },
  {
    title: "Buying & selling",
    links: [
      { label: "Browse products", href: "#/search" },
      { label: "Buyer Protection", href: "#/search" },
      { label: "Sell an item", href: "#/sell" },
      { label: "My listings", href: "#/my-ads" },
      { label: "Safety tips", href: "#/settings" },
    ],
  },
  {
    title: "Help & Account",
    links: [
      { label: "My profile", href: "#/account" },
      { label: "Messages", href: "#/chat" },
      { label: "Settings", href: "#/settings" },
      { label: "Terms & Privacy", href: "#/settings" },
      { label: "Help center", href: "#/settings" },
    ],
  },
];

export function Footer() {
  return (
    <footer>
      <div className="shell footer-grid">
        <div>
          <div className="footer-logo">
            <a href="#/" style={{ textDecoration: "none", color: "inherit", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>b</span>bidzaar
            </a>
          </div>
          <p>Give good items a new story.</p>
          <div className="newsletter">
            <input placeholder="Your email address" aria-label="Your email address" />
            <button aria-label="Subscribe to newsletter">
              <Icon name="send" />
            </button>
          </div>
        </div>
        {FOOTER_SECTIONS.map((col) => (
          <div key={col.title}>
            <b>{col.title}</b>
            {col.links.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-bottom shell">
        <span>© {new Date().getFullYear()} Bidzaar</span>
        <a
          href="/health"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "inherit" }}
          title="Server Health & Site Status"
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              display: "inline-block",
            }}
          />
          System Status: Healthy
        </a>
        <span>Netherlands · English</span>
        <span>Conscious second-hand</span>
      </div>
    </footer>
  );
}
