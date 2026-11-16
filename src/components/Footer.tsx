import { Icon } from "./Icon";

export function Footer() {
  return (
    <footer>
      <div className="shell footer-grid">
        <div>
          <div className="footer-logo">
            <span>b</span>bidzaar
          </div>
          <p>Geef goede spullen een volgend verhaal.</p>
          <div className="newsletter">
            <input placeholder="Je e-mailadres" />
            <button>
              <Icon name="send" />
            </button>
          </div>
        </div>
        {[
          ["Bidzaar", "Over ons", "Duurzaamheid", "Vacatures", "Pers"],
          [
            "Kopen & verkopen",
            "Hoe werkt het?",
            "Kopersbescherming",
            "Veiligheidstips",
            "Zakelijk",
          ],
          ["Hulp", "Helpcentrum", "Contact", "Voorwaarden", "Privacy"],
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
        <span>Nederland · Nederlands</span>
        <span>Bewust tweedehands</span>
      </div>
    </footer>
  );
}
