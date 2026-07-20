import { RotateCw, SearchX, WifiOff } from "lucide-react";

interface EmptyStateProps {
  variant: "no-results" | "error";
  onAction: () => void;
}

export function EmptyState({ variant, onAction }: EmptyStateProps) {
  const isError = variant === "error";
  const Icon = isError ? WifiOff : SearchX;

  return (
    <div className="card flex flex-col items-center gap-4 rounded-lg px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface2 text-mut">
        <Icon size={22} />
      </span>
      <div className="font-mono text-sm">
        {isError ? (
          <>
            <p className="text-ink">
              <span className="text-bad">&gt;</span> could not reach the public-apis registry
            </p>
            <p className="mt-1 text-xs text-mut">
              Check your connection — no cached data is available yet.
            </p>
          </>
        ) : (
          <>
            <p className="text-ink">
              <span className="text-acc">&gt;</span> 0 results found
            </p>
            <p className="mt-1 text-xs text-mut">
              No APIs match this search and filter combination.
            </p>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex items-center gap-1.5 rounded-md border border-acc/50 px-3 py-1.5 font-mono text-xs text-acc transition-colors hover:bg-acc/10"
      >
        {isError ? (
          <>
            <RotateCw size={12} /> Retry
          </>
        ) : (
          "Clear all filters"
        )}
      </button>
    </div>
  );
}
