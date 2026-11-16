import { Icon } from "./Icon";

export function RowTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="row-title">
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      <button>
        Bekijk alles <Icon name="chevron" size={16} />
      </button>
    </div>
  );
}
