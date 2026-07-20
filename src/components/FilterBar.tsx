import { Star, X, Zap } from "lucide-react";
import { Chip, type ChipTone } from "./Chip";
import type { AuthFilter, SortMode, TriFilter } from "../types";

export const AUTH_OPTIONS: { value: AuthFilter; label: string; tone: ChipTone }[] = [
  { value: "all", label: "All", tone: "accent" },
  { value: "none", label: "None", tone: "green" },
  { value: "apiKey", label: "API Key", tone: "amber" },
  { value: "OAuth", label: "OAuth", tone: "purple" },
  { value: "other", label: "Other", tone: "neutral" },
];

export const TRI_OPTIONS: { value: TriFilter; label: string; tone: ChipTone }[] = [
  { value: "all", label: "All", tone: "accent" },
  { value: "yes", label: "Yes", tone: "green" },
  { value: "no", label: "No", tone: "red" },
  { value: "unknown", label: "Unknown", tone: "neutral" },
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
    <div className="flex flex-col gap-3.5">
      {/* Desktop: labeled chip columns (AUTH / CORS / HTTPS) */}
      <div className="hidden flex-wrap gap-x-10 gap-y-3 lg:flex">
        <FilterGroup label="Auth">
          {AUTH_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              tone={o.tone}
              active={auth === o.value}
              onClick={() => onAuthChange(o.value)}
            />
          ))}
        </FilterGroup>
        <FilterGroup label="CORS">
          {TRI_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              tone={o.tone}
              active={cors === o.value}
              onClick={() => onCorsChange(o.value)}
            />
          ))}
        </FilterGroup>
        <FilterGroup label="HTTPS">
          {TRI_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              tone={o.tone}
              active={https === o.value}
              onClick={() => onHttpsChange(o.value)}
            />
          ))}
        </FilterGroup>
      </div>

      {/* Mobile: compact dropdowns */}
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

      {/* Tabs + preset row, sort + active count on the right */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-md border border-edge font-mono text-xs">
          <button
            type="button"
            onClick={() => favoritesOnly && onToggleFavoritesOnly()}
            aria-pressed={!favoritesOnly}
            className={`px-3 py-1.5 transition-colors ${
              !favoritesOnly ? "bg-acc/15 font-bold text-acc" : "text-mut hover:text-ink"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => !favoritesOnly && onToggleFavoritesOnly()}
            aria-pressed={favoritesOnly}
            className={`inline-flex items-center gap-1.5 border-l border-edge px-3 py-1.5 transition-colors ${
              favoritesOnly ? "bg-acc/15 font-bold text-acc" : "text-mut hover:text-ink"
            }`}
          >
            <Star size={12} className={favoritesOnly ? "fill-acc" : undefined} />
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
              ? "border-warn bg-warn/15 font-bold text-warn shadow-[0_0_14px_color-mix(in_srgb,var(--warn)_35%,transparent)]"
              : "border-warn/40 text-warn/80 hover:border-warn hover:text-warn"
          }`}
          title="No auth + CORS yes + HTTPS yes"
        >
          <Zap size={12} className={zeroFriction ? "fill-warn" : undefined} />
          Zero-friction
        </button>

        <div className="ml-auto flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              title="Clear all filters"
              className="inline-flex items-center gap-1.5 rounded-md border border-edge px-2.5 py-1.5 font-mono text-xs text-mut transition-colors hover:border-bad/50 hover:text-bad"
            >
              Active filters
              <span className="rounded bg-acc px-1.5 font-bold tabular-nums text-bg">
                {activeCount}
              </span>
              <X size={12} />
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
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-mut">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
