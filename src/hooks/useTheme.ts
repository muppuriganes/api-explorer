import { useCallback, useEffect, useState } from "react";
import { THEME_KEY, saveRaw } from "../lib/cache";

export type Theme = "dark" | "light";

/** index.html bootstraps data-theme before paint; this hook keeps it in sync. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveRaw(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
}
