import { useEffect, useState } from "react";

/**
 * Types `text` out character by character. When disabled (or under
 * prefers-reduced-motion) the full text renders immediately.
 */
export function useTypewriter(text: string, charMs: number, enabled: boolean) {
  const [count, setCount] = useState(enabled ? 0 : text.length);

  useEffect(() => {
    if (!enabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const interval = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(interval);
          return c;
        }
        return c + 1;
      });
    }, charMs);
    return () => clearInterval(interval);
  }, [text, charMs, enabled]);

  return { typed: text.slice(0, count), done: count >= text.length };
}
