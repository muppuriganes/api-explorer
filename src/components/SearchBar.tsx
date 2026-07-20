import { useEffect, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTypewriter } from "../hooks/useTypewriter";
import type { ApiDataStatus } from "../hooks/useApis";

const COMMAND = "$ find api --for";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement>;
  status: ApiDataStatus;
  stale: boolean;
  /** Warm boot (data from cache) plays a fast abbreviated typewriter. */
  fromCache: boolean;
  entryCount: number;
}

export function SearchBar({
  value,
  onChange,
  inputRef,
  status,
  stale,
  fromCache,
  entryCount,
}: SearchBarProps) {
  const { typed, done } = useTypewriter(COMMAND, fromCache ? 12 : 35, true);
  const [focused, setFocused] = useState(false);
  const [bootLineVisible, setBootLineVisible] = useState(true);

  useEffect(() => {
    if (status !== "ready" || stale) {
      // Keep the line up while loading, and permanently when serving stale
      // cache — on small screens this is the only stale indicator.
      setBootLineVisible(true);
      return;
    }
    const timer = setTimeout(() => setBootLineVisible(false), 2600);
    return () => clearTimeout(timer);
  }, [status, stale]);

  return (
    <div className="rounded-lg border border-edge bg-surface px-4 py-3">
      <label className="flex items-baseline gap-2 font-mono text-sm sm:text-base">
        <span className="shrink-0 whitespace-pre text-acc">{typed}</span>
        {done ? (
          <span className="relative flex min-w-0 flex-1 items-baseline">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder='Search APIs, e.g. "weather", "pokemon"...'
              aria-label="Search APIs"
              className="w-full min-w-0 bg-transparent text-ink outline-none [caret-color:var(--accent)] placeholder:text-mut/60 focus-visible:outline-none"
            />
            {!focused && value === "" && (
              <span className="caret absolute left-0 top-1/2 -translate-y-1/2" aria-hidden="true" />
            )}
          </span>
        ) : (
          <span className="caret" aria-hidden="true" />
        )}
      </label>

      {/* Terminal boot / status lines (height reserved to avoid layout shift) */}
      <div className="mt-1.5 h-5 overflow-hidden font-mono text-xs" aria-live="polite">
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.p
              key="fetching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-mut"
            >
              <span className="text-acc">&gt;</span> fetching public-apis registry
              <span className="skeleton-cursor ml-1 inline-block h-3 w-2 align-middle" />
            </motion.p>
          )}
          {status === "ready" && bootLineVisible && (
            <motion.p
              key="parsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-mut"
            >
              <span className="text-acc">&gt;</span> parsed{" "}
              {entryCount.toLocaleString("en-US")} endpoints{" "}
              <span className="text-ok">✓</span>
              {stale && (
                <span className="ml-2 text-warn">
                  ⚠ network unreachable — serving cached registry
                </span>
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
