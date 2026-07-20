import { Star, X, Zap } from "lucide-react";
import { Chip } from "./Chip";
import type { AuthFilter, SortMode, TriFilter } from "../types";

export const AUTH_OPTIONS: { value: AuthFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "none", label: "None" },
  { value: "apiKey", label: "API Key" },
  { value: "OAuth", label: "OAuth" },
  { value: "other", label: "Other" },
];

export const TRI_OPTIONS: { value: TriFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unknown", label: "Unknown" },
];

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "az", label: "A → Z" },
  { value: "category", label: "Category" },
  { value: "easiest", label: "Easiest first" },
];

interface FilterBarProps {
  auth: AuthFilter;
  onAuthChange: (v: AuthFilter) => void;
  cors: TriFilter;
  onCorsChange: (v: TriFilter) => void;
  https: TriFilter;
  onHttpsChange: (v: TriFilter) => void;
  zeroFriction: boolean;
  onToggleZeroFriction: () => void;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  favoritesCount: number;
  sort: SortMode;
  onSortChange: (v: SortMode) => void;
  activeCount: number;
  onClearAll: () => void;
}

export function FilterBar(props: FilterBarProps) {
  const {
    auth,
    onAuthChange,
    cors,
    onCorsChange,
    https,
    onHttpsChange,
    zeroFriction,
    onToggleZeroFriction,
    favoritesOnly,
    onToggleFavoritesOnly,
    favoritesCount,
    sort,
    onSortChange,
    activeCount,
    onClearAll,
  } = props;

  const selectCls =
    "rounded-md border border-edge bg-surface px-2 py-1.5 font-mono text-xs text-ink outline-none focus-visible:border-acc";

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs + preset + sort */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-md border border-edge font-mono text-xs">
          <button
            type="button"
            onClick={() => favoritesOnly && onToggleFavoritesOnly()}
            aria-pressed={!favoritesOnly}
            className={`px-3 py-1.5 transition-colors ${
              !favoritesOnly ? "bg-acc/10 text-acc" : "text-mut hover:text-ink"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => !favoritesOnly && onToggleFavoritesOnly()}
            aria-pressed={favoritesOnly}
            className={`inline-flex items-center gap-1.5 border-l border-edge px-3 py-1.5 transition-colors ${
              favoritesOnly ? "bg-warn/10 text-warn" : "text-mut hover:text-ink"
            }`}
          >
            <Star size={12} className={favoritesOnly ? "fill-warn" : undefined} />
            Favorites
            <span className="tabular-nums opacity-70">{favoritesCount}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleZeroFriction}
          aria-pressed={zeroFriction}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-xs transition-colors ${
            zeroFriction
              ? "border-warn bg-warn/10 text-warn shadow-[0_0_12px_color-mix(in_srgb,var(--warn)_30%,transparent)]"
              : "border-edge text-mut hover:border-warn/60 hover:text-warn"
          }`}
          title="No auth + CORS yes + HTTPS yes"
        >
          <Zap size={12} />
          Zero-friction
        </button>

        <div className="ml-auto flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 font-mono text-xs text-mut transition-colors hover:text-bad"
            >
              <X size={12} />
              Active filters
              <span className="rounded bg-surface2 px-1.5 tabular-nums text-ink">
                {activeCount}
              </span>
            </button>
          )}
          <label className="flex items-center gap-1.5 font-mono text-xs text-mut">
            Sort by:
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortMode)}
              className={selectCls}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Desktop chip groups */}
      <div className="hidden flex-wrap items-center gap-x-6 gap-y-2 lg:flex">
        <ChipGroup label="Auth">
          {AUTH_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              active={auth === o.value}
              onClick={() => onAuthChange(o.value)}
            />
          ))}
        </ChipGroup>
        <ChipGroup label="CORS">
          {TRI_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              active={cors === o.value}
              onClick={() => onCorsChange(o.value)}
            />
          ))}
        </ChipGroup>
        <ChipGroup label="HTTPS">
          {TRI_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              active={https === o.value}
              onClick={() => onHttpsChange(o.value)}
            />
          ))}
        </ChipGroup>
      </div>

      {/* Mobile compact dropdowns */}
      <div className="flex flex-wrap items-center gap-2 lg:hidden">
        <label className="flex items-center gap-1 font-mono text-[11px] text-mut">
          Auth
          <select
            value={auth}
            onChange={(e) => onAuthChange(e.target.value as AuthFilter)}
            className={selectCls}
          >
            {AUTH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1 font-mono text-[11px] text-mut">
          CORS
          <select
            value={cors}
            onChange={(e) => onCorsChange(e.target.value as TriFilter)}
            className={selectCls}
          >
            {TRI_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1 font-mono text-[11px] text-mut">
          HTTPS
          <select
            value={https}
            onChange={(e) => onHttpsChange(e.target.value as TriFilter)}
            className={selectCls}
          >
            {TRI_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-1 font-mono text-[10px] font-medium uppercase tracking-widest text-mut">
        {label}
      </span>
      {children}
    </div>
  );
}
