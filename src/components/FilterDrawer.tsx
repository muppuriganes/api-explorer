import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Chip } from "./Chip";
import { AUTH_OPTIONS, TRI_OPTIONS } from "./FilterBar";
import { categoryIcon, type CategoryCount } from "./Sidebar";
import type { FilterState } from "../types";

export type DrawerMode = "filters" | "categories" | null;

interface FilterDrawerProps {
  mode: DrawerMode;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (next: FilterState) => void;
  onClearAll: () => void;
  categories: CategoryCount[];
  selectedCategories: Set<string>;
  onToggleCategory: (name: string) => void;
  onClearCategories: () => void;
}

export function FilterDrawer({
  mode,
  onClose,
  filters,
  onApplyFilters,
  onClearAll,
  categories,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
}: FilterDrawerProps) {
  const [draft, setDraft] = useState<FilterState>(filters);

  useEffect(() => {
    if (mode === "filters") setDraft(filters);
  }, [mode, filters]);

  const zeroFriction =
    draft.auth === "none" && draft.cors === "yes" && draft.https === "yes";

  return (
    <AnimatePresence>
      {mode !== null && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 w-full bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={mode === "filters" ? "Filters" : "Categories"}
            className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl border-t border-edge bg-surface pb-[calc(env(safe-area-inset-bottom)+1rem)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 500) onClose();
            }}
          >
            <div className="sticky top-0 flex justify-center bg-surface pb-2 pt-3">
              <span className="h-1 w-10 rounded-full bg-edge" aria-hidden="true" />
            </div>

            <div className="px-5">
              <h2 className="pb-4 font-mono text-sm font-bold text-ink">
                {mode === "filters" ? "Filters" : "Categories"}
              </h2>

              {mode === "filters" ? (
                <>
                  <DrawerSection title="Authentication">
                    {AUTH_OPTIONS.map((o) => (
                      <Chip
                        key={o.value}
                        label={o.label}
                        active={draft.auth === o.value}
                        onClick={() => setDraft((d) => ({ ...d, auth: o.value }))}
                      />
                    ))}
                  </DrawerSection>
                  <DrawerSection title="CORS">
                    {TRI_OPTIONS.map((o) => (
                      <Chip
                        key={o.value}
                        label={o.label}
                        active={draft.cors === o.value}
                        onClick={() => setDraft((d) => ({ ...d, cors: o.value }))}
                      />
                    ))}
                  </DrawerSection>
                  <DrawerSection title="HTTPS">
                    {TRI_OPTIONS.map((o) => (
                      <Chip
                        key={o.value}
                        label={o.label}
                        active={draft.https === o.value}
                        onClick={() => setDraft((d) => ({ ...d, https: o.value }))}
                      />
                    ))}
                  </DrawerSection>
                  <DrawerSection title="Presets">
                    <button
                      type="button"
                      aria-pressed={zeroFriction}
                      onClick={() =>
                        setDraft(
                          zeroFriction
                            ? { auth: "all", cors: "all", https: "all" }
                            : { auth: "none", cors: "yes", https: "yes" },
                        )
                      }
                      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-xs transition-colors ${
                        zeroFriction
                          ? "border-warn bg-warn/10 text-warn"
                          : "border-edge text-mut"
                      }`}
                    >
                      <Zap size={12} />
                      Zero-friction (No Auth + CORS Yes + HTTPS Yes)
                    </button>
                  </DrawerSection>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onApplyFilters(draft);
                        onClose();
                      }}
                      className="flex-1 rounded-md bg-acc py-2.5 font-mono text-sm font-bold text-bg transition-opacity hover:opacity-90"
                    >
                      Apply Filters
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClearAll();
                        onClose();
                      }}
                      className="rounded-md border border-edge px-4 py-2.5 font-mono text-sm text-mut hover:text-ink"
                    >
                      Clear all
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <CategoryRow
                    label="All APIs"
                    active={selectedCategories.size === 0}
                    onClick={() => {
                      onClearCategories();
                      onClose();
                    }}
                  />
                  {categories.map((c) => {
                    const Icon = categoryIcon(c.name);
                    return (
                      <CategoryRow
                        key={c.name}
                        label={c.name}
                        count={c.count}
                        icon={<Icon size={14} className="shrink-0 opacity-80" />}
                        active={selectedCategories.has(c.name)}
                        onClick={() => onToggleCategory(c.name)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-widest text-mut">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function CategoryRow({
  label,
  count,
  icon,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] transition-colors ${
        active ? "bg-acc/10 text-acc" : "text-mut hover:text-ink"
      }`}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className="shrink-0 font-mono text-[11px] tabular-nums opacity-70">
          {count.toLocaleString("en-US")}
        </span>
      )}
    </button>
  );
}
