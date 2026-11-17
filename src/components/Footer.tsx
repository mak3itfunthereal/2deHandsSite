import { Icon } from "./Icon";

export function Footer() {
  return (
    <footer>
      <div className="shell footer-grid">
        <div>
          <div className="footer-logo">
            <span>b</span>bidzaar
          </div>
          <p>Give good items a new story.</p>
          <div className="newsletter">
            <input placeholder="Your email address" />
            <button>
              <Icon name="send" />
            </button>
          </div>
        </div>
        {[
          ["Bidzaar", "About us", "Sustainability", "Careers", "Press"],
          [
            "Buying & selling",
            "How it works",
            "Buyer Protection",
            "Safety tips",
            "Business",
          ],
          ["Help", "Help center", "Contact", "Terms", "Privacy"],
        ].map((col) => (
          <div key={col[0]}>
            <b>{col[0]}</b>
            {col.slice(1).map((x) => (
              <a key={x} href="#">
                {x}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-bottom shell">
        <span>© {new Date().getFullYear()} Bidzaar</span>
        <span>Netherlands · English</span>
        <span>Conscious second-hand</span>
      </div>
    </footer>
  );
}
