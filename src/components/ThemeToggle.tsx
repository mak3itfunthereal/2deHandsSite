import { Icon } from "./Icon";

/**
 * Sun/moon button that switches between light and dark mode.
 * The chosen theme is saved in localStorage by App.tsx.
 */
export function ThemeToggle({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className="icon-btn theme"
      onClick={() => setDark(!dark)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      title={dark ? "Light mode" : "Dark mode"}
    >
      <Icon name={dark ? "sun" : "moon"} />
    </button>
  );
}
