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
        <span className="eyebrow">Trade with confidence</span>
        <h2>Pay safely. We protect your purchase.</h2>
        <p>Your money is only released once your order has arrived safely.</p>
        <a className="text-button" href="#/search">
          How Buyer Protection works <Icon name="arrow" size={17} />
        </a>
      </div>
      <ul>
        <li>
          <Icon name="check" size={18} /> Safe payments
        </li>
        <li>
          <Icon name="check" size={18} /> 24/7 fraud detection
        </li>
        <li>
          <Icon name="check" size={18} /> Help when you need it
        </li>
      </ul>
    </section>
  );
}
