import { useState, type ComponentType } from "react";
import {
  BookOpen,
  Briefcase,
  Bus,
  Camera,
  Car,
  Clapperboard,
  Cloud,
  CloudSun,
  Code2,
  Coins,
  Database,
  DollarSign,
  FlaskConical,
  Gamepad2,
  Globe,
  Hash,
  HeartPulse,
  KeyRound,
  Landmark,
  Leaf,
  Link as LinkIcon,
  Mail,
  MapPin,
  Menu,
  Music,
  Newspaper,
  Palette,
  PawPrint,
  Phone,
  Shield,
  ShoppingCart,
  Sparkles,
  Terminal,
  TrendingUp,
  Trophy,
  Users,
  UtensilsCrossed,
  Video,
} from "lucide-react";

type IconType = ComponentType<{ size?: number | string; className?: string }>;

const ICON_MAP: [RegExp, IconType][] = [
  [/animal/i, PawPrint],
  [/anime/i, Sparkles],
  [/art|design/i, Palette],
  [/auth/i, KeyRound],
  [/book|diction/i, BookOpen],
  [/business|jobs/i, Briefcase],
  [/cloud/i, Cloud],
  [/integration|development|developer/i, Code2],
  [/crypto|blockchain/i, Coins],
  [/currency|finance/i, DollarSign],
  [/data|machine/i, Database],
  [/document|patent|text/i, Newspaper],
  [/email/i, Mail],
  [/entertain|photo/i, Clapperboard],
  [/environment/i, Leaf],
  [/food|drink/i, UtensilsCrossed],
  [/game|comic/i, Gamepad2],
  [/geocod|calendar|event/i, MapPin],
  [/government|open/i, Landmark],
  [/health/i, HeartPulse],
  [/music|podcast/i, Music],
  [/news/i, Newspaper],
  [/personality|social/i, Users],
  [/phone/i, Phone],
  [/photography/i, Camera],
  [/programming/i, Terminal],
  [/science|math/i, FlaskConical],
  [/security|malware/i, Shield],
  [/shopping/i, ShoppingCart],
  [/sport/i, Trophy],
  [/track|transport/i, Bus],
  [/url/i, LinkIcon],
  [/vehicle/i, Car],
  [/video/i, Video],
  [/weather/i, CloudSun],
  [/test|continuous/i, TrendingUp],
];

export function categoryIcon(name: string): IconType {
  for (const [re, icon] of ICON_MAP) {
    if (re.test(name)) return icon;
  }
  return Hash;
}

const COLLAPSED_COUNT = 18;

export interface CategoryCount {
  name: string;
  count: number;
}

interface SidebarProps {
  categories: CategoryCount[];
  selected: Set<string>;
  onToggleCategory: (name: string) => void;
  onClearCategories: () => void;
  totalCount: number;
  onCollapse: () => void;
}

export function Sidebar({
  categories,
  selected,
  onToggleCategory,
  onClearCategories,
  totalCount,
  onCollapse,
}: SidebarProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? categories : categories.slice(0, COLLAPSED_COUNT);

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-edge bg-bg lg:flex">
      <div className="flex items-center justify-between px-4 pb-4 pt-5">
        <p className="font-mono text-sm font-bold tracking-tight text-acc">
          &gt;_ API EXPLORER
        </p>
        <button
          type="button"
          onClick={onCollapse}
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
          className="rounded p-1 text-mut transition-colors hover:text-acc"
        >
          <Menu size={15} />
        </button>
      </div>

      <nav className="flex-1 px-2 pb-6" aria-label="Categories">
        <p className="px-2 pb-2 font-mono text-[10px] font-medium uppercase tracking-widest text-mut">
          Categories
        </p>

        <SidebarRow
          icon={Globe}
          label="All APIs"
          count={totalCount}
          active={selected.size === 0}
          onClick={onClearCategories}
        />
        {visible.map((c) => (
          <SidebarRow
            key={c.name}
            icon={categoryIcon(c.name)}
            label={c.name}
            count={c.count}
            active={selected.has(c.name)}
            onClick={() => onToggleCategory(c.name)}
          />
        ))}

        {categories.length > COLLAPSED_COUNT && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="mt-1 w-full rounded-md px-2 py-1.5 text-left font-mono text-xs text-mut transition-colors hover:text-acc"
          >
            {showAll
              ? "− show fewer categories"
              : `+ view all categories (${categories.length})`}
          </button>
        )}
      </nav>
    </aside>
  );
}

function SidebarRow({
  icon: Icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: IconType;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left font-mono text-xs transition-colors ${
        active
          ? "bg-acc/15 font-bold text-acc shadow-[0_0_12px_color-mix(in_srgb,var(--accent)_15%,transparent)]"
          : "text-mut hover:bg-surface hover:text-ink"
      }`}
    >
      <Icon size={14} className="shrink-0 opacity-80" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span
        className={`shrink-0 rounded px-1.5 py-px font-mono text-[10px] tabular-nums ${
          active ? "bg-acc font-bold text-bg" : "opacity-60"
        }`}
      >
        {count.toLocaleString("en-US")}
      </span>
    </button>
  );
}
