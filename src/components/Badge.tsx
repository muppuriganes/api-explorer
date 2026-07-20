import type { CSSProperties } from "react";
import { motion } from "framer-motion";

export type BadgeTone = "green" | "amber" | "red" | "purple" | "neutral";

const TONE_VAR: Record<BadgeTone, string> = {
  green: "var(--ok)",
  amber: "var(--warn)",
  red: "var(--bad)",
  purple: "var(--info)",
  neutral: "var(--muted)",
};

interface BadgeProps {
  label: string;
  value: string;
  tone: BadgeTone;
  /** LED power-on entrance; index staggers badges left-to-right. */
  animate?: boolean;
  index?: number;
}

export function Badge({ label, value, tone, animate = false, index = 0 }: BadgeProps) {
  const style = { "--tone": TONE_VAR[tone] } as CSSProperties;
  const content = (
    <>
      <span className="led" aria-hidden="true" />
      <span className="opacity-60">{label}</span>
      <span>{value}</span>
    </>
  );

  if (!animate) {
    return (
      <span className="badge" style={style}>
        {content}
      </span>
    );
  }

  return (
    <motion.span
      className="badge"
      style={style}
      initial={{ opacity: 0, scale: 0.9, filter: "brightness(0.6)" }}
      animate={{ opacity: 1, scale: 1, filter: "brightness(1)" }}
      transition={{ duration: 0.15, delay: 0.1 + index * 0.04 }}
    >
      {content}
    </motion.span>
  );
}
