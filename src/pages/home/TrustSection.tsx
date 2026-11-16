import { Icon } from "../../components/Icon";

export function TrustSection() {
  return (
    <section className="trust-banner" id="veilig-kopen">
      <div className="trust-visual">
        <span className="shield-ring">
          <Icon name="check" size={40} />
        </span>
      </div>
      <div className="trust-copy">
        <span className="eyebrow">Zorgeloos handelen</span>
        <h2>Betaal veilig. Wij houden je aankoop beschermd.</h2>
        <p>Je geld wordt pas vrijgegeven als je bestelling goed is aangekomen.</p>
        <a className="text-button" href="#veilig-kopen">
          Zo werkt kopersbescherming <Icon name="arrow" size={17} />
        </a>
      </div>
      <ul>
        <li>
          <Icon name="check" size={18} /> Veilig betalen
        </li>
        <li>
          <Icon name="check" size={18} /> 24/7 fraudedetectie
        </li>
        <li>
          <Icon name="check" size={18} /> Hulp bij problemen
        </li>
      </ul>
    </section>
  );
}
