import type { ApiEntry } from "../types";

const DATA_KEY = "api-explorer:data:v1";
export const FAVORITES_KEY = "api-explorer:favorites:v1";
export const THEME_KEY = "api-explorer:theme";

const TTL_MS = 24 * 60 * 60 * 1000;

interface CachedData {
  entries: ApiEntry[];
  timestamp: number;
}

export function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded / private mode — the app works without persistence.
  }
}

export function loadRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveRaw(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export interface DataCacheHit {
  entries: ApiEntry[];
  timestamp: number;
  /** Within the 24h TTL. Expired caches are still returned as offline fallback. */
  fresh: boolean;
}

export function loadDataCache(): DataCacheHit | null {
  const cached = loadJson<CachedData>(DATA_KEY);
  if (!cached || !Array.isArray(cached.entries) || cached.entries.length === 0) {
    return null;
  }
  return {
    entries: cached.entries,
    timestamp: cached.timestamp,
    fresh: Date.now() - cached.timestamp < TTL_MS,
  };
}

export function saveDataCache(entries: ApiEntry[]): void {
  saveJson(DATA_KEY, { entries, timestamp: Date.now() } satisfies CachedData);
}
