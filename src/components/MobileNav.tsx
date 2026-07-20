import { Home, LayoutGrid, SlidersHorizontal, Star } from "lucide-react";

interface MobileNavProps {
  favoritesOnly: boolean;
  onHome: () => void;
  onCategories: () => void;
  onFavorites: () => void;
  onFilters: () => void;
  activeFilterCount: number;
}

export function MobileNav({
  favoritesOnly,
  onHome,
  onCategories,
  onFavorites,
  onFilters,
  activeFilterCount,
}: MobileNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        <NavButton icon={<Home size={18} />} label="Home" onClick={onHome} />
        <NavButton icon={<LayoutGrid size={18} />} label="Categories" onClick={onCategories} />
        <NavButton
          icon={<Star size={18} className={favoritesOnly ? "fill-warn text-warn" : undefined} />}
          label="Favorites"
          active={favoritesOnly}
          onClick={onFavorites}
        />
        <NavButton
          icon={
            <span className="relative">
              <SlidersHorizontal size={18} />
              {activeFilterCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-acc px-1 font-mono text-[9px] font-bold text-bg">
                  {activeFilterCount}
                </span>
              )}
            </span>
          }
          label="Filters"
          onClick={onFilters}
        />
      </div>
    </nav>
  );
}

function NavButton({
  icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2.5 font-mono text-[10px] transition-colors ${
        active ? "text-warn" : "text-mut hover:text-ink"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
