import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, PanelLeftOpen, RefreshCw, Sun, TriangleAlert } from "lucide-react";
import { ApiCard } from "./components/ApiCard";
import { ApiViewModal } from "./components/ApiViewModal";
import { EmptyState } from "./components/EmptyState";
import { FilterBar } from "./components/FilterBar";
import { FilterDrawer, type DrawerMode } from "./components/FilterDrawer";
import { Hero } from "./components/Hero";
import { LandingPage } from "./components/LandingPage";
import { MobileNav } from "./components/MobileNav";
import { SearchBar } from "./components/SearchBar";
import { Sidebar, type CategoryCount } from "./components/Sidebar";
import { StatsCards } from "./components/StatsCards";
import { useApis } from "./hooks/useApis";
import { useDebounce } from "./hooks/useDebounce";
import { useFavorites } from "./hooks/useFavorites";
import { useTheme } from "./hooks/useTheme";
import { fuzzyScore } from "./lib/fuzzy";
import type { ApiEntry, FilterState, SortMode } from "./types";

const PAGE_SIZE = 60;
const ANIMATED_CARDS = 24;
const NO_FILTERS: FilterState = { auth: "all", cors: "all", https: "all" };

export default function App() {
  const [showApp, setShowApp] = useState(false);

  const { status, entries, stale, fromCache, refreshing, refresh } = useApis();
  const { favorites, toggleFavorite } = useFavorites();
  const { theme, toggleTheme } = useTheme();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>(NO_FILTERS);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState<SortMode>("az");
  const [drawer, setDrawer] = useState<DrawerMode>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [viewEntry, setViewEntry] = useState<ApiEntry | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------ */
  /* Filtering pipeline (memoized — the list is 1,400+ items)            */
  /* ------------------------------------------------------------------ */

  const baseFiltered = useMemo(
    () =>
      entries.filter(
        (e) =>
          (filters.auth === "all" || e.auth === filters.auth) &&
          (filters.cors === "all" || e.cors === filters.cors) &&
          (filters.https === "all" || e.https === filters.https) &&
          (!favoritesOnly || favorites.has(e.id)),
      ),
    [entries, filters, favoritesOnly, favorites],
  );

  const searched = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) return baseFiltered;
    return baseFiltered
      .map((e) => ({ e, s: fuzzyScore(q, e) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.e.name.localeCompare(b.e.name))
      .map((x) => x.e);
  }, [baseFiltered, debouncedQuery]);

  // Category facets are computed *before* the category filter is applied,
  // so counts answer "how many would I get if I picked this category".
  const allCategoryNames = useMemo(() => {
    const names: string[] = [];
    const seen = new Set<string>();
    for (const e of entries) {
      if (!seen.has(e.category)) {
        seen.add(e.category);
        names.push(e.category);
      }
    }
    return names;
  }, [entries]);

  const categoryList: CategoryCount[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of searched) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
    return allCategoryNames.map((name) => ({ name, count: counts.get(name) ?? 0 }));
  }, [allCategoryNames, searched]);

  const categoryFiltered = useMemo(
    () =>
      selectedCategories.size === 0
        ? searched
        : searched.filter((e) => selectedCategories.has(e.category)),
    [searched, selectedCategories],
  );

  const sorted = useMemo(() => {
    const hasQuery = debouncedQuery.trim().length > 0;
    const arr = [...categoryFiltered];
    if (sort === "az") {
      // With a query active, relevance order (from the search step) wins.
      if (!hasQuery) arr.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "category") {
      arr.sort(
        (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
      );
    } else {
      const rank = (e: (typeof arr)[number]) =>
        (e.auth === "none" ? 0 : 2) + (e.cors === "yes" ? 0 : 1);
      arr.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
    }
    return arr;
  }, [categoryFiltered, sort, debouncedQuery]);

  /* ------------------------------------------------------------------ */
  /* Derived UI state                                                    */
  /* ------------------------------------------------------------------ */

  const zeroFriction =
    filters.auth === "none" && filters.cors === "yes" && filters.https === "yes";

  const activeFilterCount =
    (filters.auth !== "all" ? 1 : 0) +
    (filters.cors !== "all" ? 1 : 0) +
    (filters.https !== "all" ? 1 : 0) +
    (selectedCategories.size > 0 ? 1 : 0) +
    (favoritesOnly ? 1 : 0);

  const landing =
    query === "" && activeFilterCount === 0 && status !== "error";

  // Key that changes whenever the visible result set changes — drives the
  // card-cascade remount and resets pagination.
  const filterKey = useMemo(
    () =>
      JSON.stringify([
        debouncedQuery,
        [...selectedCategories],
        filters,
        favoritesOnly,
        sort,
      ]),
    [debouncedQuery, selectedCategories, filters, favoritesOnly, sort],
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filterKey]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (obsEntries) => {
        if (obsEntries[0].isIntersecting) setVisibleCount((c) => c + PAGE_SIZE);
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [status]);

  /* ------------------------------------------------------------------ */
  /* Actions                                                             */
  /* ------------------------------------------------------------------ */

  const toggleCategory = useCallback((name: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const selectSingleCategory = useCallback((name: string) => {
    setSelectedCategories(new Set([name]));
    window.scrollTo({ top: 0 });
  }, []);

  const clearCategories = useCallback(() => setSelectedCategories(new Set()), []);

  const clearAll = useCallback(() => {
    setQuery("");
    setFilters(NO_FILTERS);
    setSelectedCategories(new Set());
    setFavoritesOnly(false);
  }, []);

  const toggleZeroFriction = useCallback(() => {
    setFilters((f) =>
      f.auth === "none" && f.cors === "yes" && f.https === "yes"
        ? NO_FILTERS
        : { auth: "none", cors: "yes", https: "yes" },
    );
  }, []);

  // Keyboard UX: "/" focuses search, Esc clears + blurs it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if (e.key === "/" && !inField) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === searchRef.current) {
        setQuery("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  const visible = sorted.slice(0, visibleCount);

  return (
    <AnimatePresence mode="wait">
      {!showApp ? (
        <motion.div
          key="landing"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <LandingPage onEnter={() => setShowApp(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="min-h-screen bg-bg font-sans text-ink">
            <div className="mx-auto flex max-w-[1440px]">
              {sidebarOpen && (
                <Sidebar
                  categories={categoryList}
                  selected={selectedCategories}
                  onToggleCategory={toggleCategory}
                  onClearCategories={clearCategories}
                  totalCount={searched.length}
                  onCollapse={() => setSidebarOpen(false)}
                />
              )}

              <main className="min-w-0 flex-1 px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-12">
                {/* Top bar */}
                <header className="mb-4 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    {!sidebarOpen && (
                      <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        title="Show sidebar"
                        aria-label="Show sidebar"
                        className="hidden rounded-md border border-edge p-2 text-mut transition-colors hover:border-acc/50 hover:text-acc lg:inline-flex"
                      >
                        <PanelLeftOpen size={14} />
                      </button>
                    )}
                    <p
                      className={`font-mono text-sm font-bold text-acc ${sidebarOpen ? "lg:invisible" : ""
                        }`}
                    >
                      &gt;_ API EXPLORER
                    </p>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {stale && (
                      <span className="hidden items-center gap-1.5 rounded-md border border-warn/40 bg-warn/10 px-2 py-1 font-mono text-[11px] text-warn sm:inline-flex">
                        <TriangleAlert size={12} /> cached data — network unavailable
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={refresh}
                      disabled={refreshing}
                      title="Refresh data"
                      aria-label="Refresh data"
                      className="rounded-md border border-edge p-2 text-mut transition-colors hover:border-acc/50 hover:text-acc disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={refreshing ? "animate-spin" : undefined} />
                    </button>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                      aria-label="Toggle color theme"
                      className="rounded-md border border-edge p-2 text-mut transition-colors hover:border-acc/50 hover:text-acc"
                    >
                      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                    </button>
                  </div>
                </header>

                <div className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {landing && (
                      <Hero
                        totalApis={entries.length}
                        totalCategories={allCategoryNames.length}
                      />
                    )}
                  </AnimatePresence>

                  <SearchBar
                    value={query}
                    onChange={setQuery}
                    inputRef={searchRef}
                    status={status}
                    stale={stale}
                    fromCache={fromCache}
                    entryCount={entries.length}
                  />

                  <FilterBar
                    auth={filters.auth}
                    onAuthChange={(v) => setFilters((f) => ({ ...f, auth: v }))}
                    cors={filters.cors}
                    onCorsChange={(v) => setFilters((f) => ({ ...f, cors: v }))}
                    https={filters.https}
                    onHttpsChange={(v) => setFilters((f) => ({ ...f, https: v }))}
                    zeroFriction={zeroFriction}
                    onToggleZeroFriction={toggleZeroFriction}
                    favoritesOnly={favoritesOnly}
                    onToggleFavoritesOnly={() => setFavoritesOnly((v) => !v)}
                    favoritesCount={favorites.size}
                    sort={sort}
                    onSortChange={setSort}
                    activeCount={activeFilterCount}
                    onClearAll={clearAll}
                  />

                  <StatsCards
                    totalApis={entries.length}
                    totalCategories={allCategoryNames.length}
                    matching={sorted.length}
                  />

                  {status === "loading" && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="card h-44 rounded-lg p-4">
                          <div className="skeleton-cursor mb-3 h-4 w-2/5 rounded" />
                          <div className="skeleton-cursor mb-2 h-3 w-full rounded" />
                          <div className="skeleton-cursor h-3 w-3/4 rounded" />
                        </div>
                      ))}
                    </div>
                  )}

                  {status === "error" && <EmptyState variant="error" onAction={refresh} />}

                  {status === "ready" && sorted.length === 0 && (
                    <EmptyState variant="no-results" onAction={clearAll} />
                  )}

                  {status === "ready" && sorted.length > 0 && (
                    <>
                      <div
                        key={filterKey}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                      >
                        {visible.map((entry, i) => (
                          <ApiCard
                            key={entry.id}
                            entry={entry}
                            isFavorite={favorites.has(entry.id)}
                            onToggleFavorite={toggleFavorite}
                            onSelectCategory={selectSingleCategory}
                            onView={setViewEntry}
                            animateIn={i < ANIMATED_CARDS}
                            index={i}
                          />
                        ))}
                      </div>
                      <div ref={sentinelRef} aria-hidden="true" />
                      {visibleCount < sorted.length && (
                        <p className="pb-2 text-center font-mono text-xs text-mut">
                          showing {visible.length.toLocaleString("en-US")} of{" "}
                          {sorted.length.toLocaleString("en-US")} — scroll for more
                        </p>
                      )}
                    </>
                  )}
                </div>
              </main>
            </div>

            <MobileNav
              favoritesOnly={favoritesOnly}
              onHome={() => {
                clearAll();
                window.scrollTo({ top: 0 });
              }}
              onCategories={() => setDrawer("categories")}
              onFavorites={() => setFavoritesOnly((v) => !v)}
              onFilters={() => setDrawer("filters")}
              activeFilterCount={activeFilterCount}
            />

            <FilterDrawer
              mode={drawer}
              onClose={() => setDrawer(null)}
              filters={filters}
              onApplyFilters={setFilters}
              onClearAll={clearAll}
              categories={categoryList}
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
              onClearCategories={clearCategories}
            />

            <ApiViewModal entry={viewEntry} onClose={() => setViewEntry(null)} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
