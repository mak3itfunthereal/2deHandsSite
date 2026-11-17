import type { Page } from "../../types";
import { Icon } from "../../components/Icon";

export function SellBannerSection({ setPage }: { setPage: (page: Page) => void }) {
  return (
    <section className="sell-banner" id="verkopen">
      <div>
        <span className="eyebrow eyebrow-light">Make room, make money</span>
        <h2>Sell in 3 easy steps</h2>
      </div>
      <ol>
        <li>
          <i>1</i> Take a photo
        </li>
        <li>
          <i>2</i> Set your price
        </li>
        <li>
          <i>3</i> Pass it on
        </li>
      </ol>
      <button className="sell-link" onClick={() => setPage("sell")} type="button">
        Post a listing <Icon name="arrow" size={18} />
      </button>
    </section>
  );
}
