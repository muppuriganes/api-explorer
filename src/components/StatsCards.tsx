import type { CSSProperties, ComponentType } from "react";
import { Database, Filter, Layers } from "lucide-react";
import { useCountUp } from "../hooks/useCountUp";

interface StatDef {
  label: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
  toneVar: string;
  spark: number[];
}

const STATS: StatDef[] = [
  {
    label: "Total APIs",
    icon: Database,
    toneVar: "var(--ok)",
    spark: [4, 9, 6, 12, 10, 16, 14, 20],
  },
  {
    label: "Categories",
    icon: Layers,
    toneVar: "var(--warn)",
    spark: [10, 7, 12, 9, 14, 11, 15, 13],
  },
  {
    label: "Matching",
    icon: Filter,
    toneVar: "var(--info)",
    spark: [14, 10, 16, 8, 13, 6, 12, 9],
  },
];

function Sparkline({ points, tone }: { points: number[]; tone: string }) {
  const max = Math.max(...points);
  const path = points
    .map((p, i) => `${(i / (points.length - 1)) * 56},${22 - (p / max) * 18}`)
    .join(" ");
  return (
    <svg width="56" height="24" viewBox="0 0 56 24" aria-hidden="true" className="opacity-50">
      <polyline
        points={path}
        fill="none"
        stroke={tone}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatCard({ def, value }: { def: StatDef; value: number }) {
  const display = useCountUp(value);
  const Icon = def.icon;
  return (
    <div
      className="card flex items-center justify-between gap-3 rounded-lg px-4 py-3"
      style={{ "--tone": def.toneVar } as CSSProperties}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
          style={{
            color: def.toneVar,
            background: `color-mix(in srgb, ${def.toneVar} 12%, transparent)`,
          }}
        >
          <Icon size={15} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] font-medium uppercase tracking-widest text-mut">
            {def.label}
          </p>
          <p className="font-mono text-xl font-bold text-ink tabular-nums">
            {display.toLocaleString("en-US")}
          </p>
        </div>
      </div>
      <Sparkline points={def.spark} tone={def.toneVar} />
    </div>
  );
}

interface StatsCardsProps {
  totalApis: number;
  totalCategories: number;
  matching: number;
}

export function StatsCards({ totalApis, totalCategories, matching }: StatsCardsProps) {
  const values = [totalApis, totalCategories, matching];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {STATS.map((def, i) => (
        <StatCard key={def.label} def={def} value={values[i]} />
      ))}
    </div>
  );
}
