import { useCallback, useEffect, useRef, useState } from "react";
import { loadDataCache, saveDataCache } from "../lib/cache";
import { parseReadme } from "../lib/parser";
import type { ApiEntry } from "../types";

const README_URL =
  "https://raw.githubusercontent.com/public-apis/public-apis/master/README.md";

export type ApiDataStatus = "loading" | "ready" | "error";

export interface ApiData {
  status: ApiDataStatus;
  entries: ApiEntry[];
  /** Serving cached data because the network fetch failed. */
  stale: boolean;
  /** Initial data came from localStorage (warm boot — abbreviated animations). */
  fromCache: boolean;
  /** A forced refresh is in flight while old data stays on screen. */
  refreshing: boolean;
  refresh: () => void;
}

export function useApis(): ApiData {
  const [status, setStatus] = useState<ApiDataStatus>("loading");
  const [entries, setEntries] = useState<ApiEntry[]>([]);
  const [stale, setStale] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const inFlight = useRef(false);

  const load = useCallback(async (force: boolean) => {
    if (inFlight.current) return;
    inFlight.current = true;

    if (!force) {
      const cached = loadDataCache();
      if (cached?.fresh) {
        setEntries(cached.entries);
        setFromCache(true);
        setStale(false);
        setStatus("ready");
        inFlight.current = false;
        return;
      }
    } else {
      setRefreshing(true);
    }

    try {
      const res = await fetch(README_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const parsed = parseReadme(await res.text());
      if (parsed.length === 0) throw new Error("parsed zero entries");
      saveDataCache(parsed);
      setEntries(parsed);
      setFromCache(false);
      setStale(false);
      setStatus("ready");
    } catch {
      const cached = loadDataCache();
      if (cached) {
        setEntries(cached.entries);
        setFromCache(true);
        setStale(true);
        setStatus("ready");
      } else {
        setStatus("error");
      }
    } finally {
      setRefreshing(false);
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  const refresh = useCallback(() => {
    setStatus((s) => (s === "error" ? "loading" : s));
    void load(true);
  }, [load]);

  return { status, entries, stale, fromCache, refreshing, refresh };
}
