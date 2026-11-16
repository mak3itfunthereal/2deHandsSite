import type { Page } from "../../types";
import { Icon } from "../../components/Icon";

export function SellBannerSection({ setPage }: { setPage: (page: Page) => void }) {
  return (
    <section className="sell-banner" id="verkopen">
      <div>
        <span className="eyebrow eyebrow-light">Ruimte in huis, geld op zak</span>
        <h2>Verkopen in 3 simpele stappen</h2>
      </div>
      <ol>
        <li>
          <i>1</i> Maak een foto
        </li>
        <li>
          <i>2</i> Kies je prijs
        </li>
        <li>
          <i>3</i> Geef het door
        </li>
      </ol>
      <button className="sell-link" onClick={() => setPage("sell")} type="button">
        Plaats advertentie <Icon name="arrow" size={18} />
      </button>
    </section>
  );
}
