interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  /** "preset" gives the ⚡ Zero-friction chip its yellow-green terminal look. */
  variant?: "default" | "preset";
}

export function Chip({ label, active, onClick, variant = "default" }: ChipProps) {
  const base =
    "rounded-md border px-2.5 py-1 font-mono text-xs transition-colors cursor-pointer select-none";
  let cls: string;
  if (variant === "preset") {
    cls = active
      ? "border-warn text-warn bg-warn/10 shadow-[0_0_12px_color-mix(in_srgb,var(--warn)_35%,transparent)]"
      : "border-edge text-mut hover:border-warn/60 hover:text-warn";
  } else {
    cls = active
      ? "border-acc text-acc bg-acc/10 shadow-[0_0_10px_color-mix(in_srgb,var(--accent)_28%,transparent)]"
      : "border-edge text-mut hover:border-acc/50 hover:text-ink";
  }
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`${base} ${cls}`}>
      {label}
    </button>
  );
}
