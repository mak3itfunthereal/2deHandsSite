export function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button className="logo" onClick={onClick} aria-label="Bidzaar home">
      <span>b</span>bidzaar
    </button>
  );
}
