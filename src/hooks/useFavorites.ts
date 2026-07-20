import { useCallback, useState } from "react";
import { FAVORITES_KEY, loadJson, saveJson } from "../lib/cache";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(loadJson<string[]>(FAVORITES_KEY) ?? []),
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveJson(FAVORITES_KEY, [...next]);
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}
