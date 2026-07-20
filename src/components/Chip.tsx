import type { CSSProperties } from "react";

export type ChipTone = "accent" | "green" | "amber" | "red" | "purple" | "neutral";

const TONE_VAR: Record<ChipTone, string> = {
  accent: "var(--accent)",
  green: "var(--ok)",
  amber: "var(--warn)",
  red: "var(--bad)",
  purple: "var(--info)",
  neutral: "var(--muted)",
};

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  /** Semantic color — active chips fill solid in their tone (mock style). */
  tone?: ChipTone;
}

export function Chip({ label, active, onClick, tone = "accent" }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`chip ${active ? "is-active" : ""}`}
      style={{ "--tone": TONE_VAR[tone] } as CSSProperties}
    >
      {label}
    </button>
  );
}
