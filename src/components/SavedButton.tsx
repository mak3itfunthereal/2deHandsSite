import { Icon } from "./Icon";

/**
 * Heart button in the header with the number of saved ads (work item 510).
 * The badge is hidden when nothing is saved.
 */
export function SavedButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      className="icon-btn badge-wrap saved-btn"
      onClick={onClick}
      aria-label={`Saved listings (${count})`}
      title="Saved listings"
    >
      <Icon name="heart" />
      {count > 0 && <i aria-hidden="true">{count > 99 ? "99+" : count}</i>}
    </button>
  );
}
