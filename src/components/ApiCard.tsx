import { memo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Eye, Star } from "lucide-react";
import { Badge, type BadgeTone } from "./Badge";
import type { ApiEntry } from "../types";

const AUTH_TONE: Record<ApiEntry["auth"], BadgeTone> = {
  none: "green",
  apiKey: "amber",
  OAuth: "red",
  other: "purple",
};

const AUTH_LABEL: Record<ApiEntry["auth"], string> = {
  none: "None",
  apiKey: "API Key",
  OAuth: "OAuth",
  other: "Other",
};

function triTone(value: ApiEntry["https"]): BadgeTone {
  if (value === "yes") return "green";
  if (value === "no") return "red";
  return "neutral";
}

function triLabel(value: ApiEntry["https"]): string {
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  return "Unknown";
}

interface ApiCardProps {
  entry: ApiEntry;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectCategory: (category: string) => void;
  onView: (entry: ApiEntry) => void;
  /** Only the first ~24 cards animate in per filter change (60fps budget). */
  animateIn: boolean;
  index: number;
}

/**
 * useTilt — attaches mouse-tracking 3-D tilt + cursor glow to the OUTER
 * card element so the border, background, and content all move as one unit.
 */
function useTilt() {
  const outerRef = useRef<HTMLDivElement>(null);

  const onMouseEnter = () => {
    const el = outerRef.current;
    if (!el) return;
    // Snap transitions off so the card follows the cursor immediately
    el.style.transition = "border-color 0.18s ease, box-shadow 0.18s ease";
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = outerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -7;
    const rotY = ((x - cx) / cx) * 7;

    // Apply tilt to the OUTER element — border + content tilt together
    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;

    // Move the glow highlight with the cursor
    const glow = el.querySelector<HTMLElement>(".card-glow");
    if (glow) {
      glow.style.opacity = "1";
      glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(124,58,237,0.18) 0%, transparent 60%)`;
    }
  };

  const onMouseLeave = () => {
    const el = outerRef.current;
    if (!el) return;
    // Smooth spring back
    el.style.transition =
      "transform 0.5s cubic-bezier(0.23,1,0.32,1), border-color 0.18s ease, box-shadow 0.18s ease";
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)";

    const glow = el.querySelector<HTMLElement>(".card-glow");
    if (glow) glow.style.opacity = "0";
  };

  return { outerRef, onMouseEnter, onMouseMove, onMouseLeave };
}

export const ApiCard = memo(function ApiCard({
  entry,
  isFavorite,
  onToggleFavorite,
  onSelectCategory,
  onView,
  animateIn,
  index,
}: ApiCardProps) {
  const [copied, setCopied] = useState(false);
  const [pingKey, setPingKey] = useState(0);
  const { outerRef, onMouseEnter, onMouseMove, onMouseLeave } = useTilt();

  const copyUrl = () => {
    navigator.clipboard
      .writeText(entry.url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      })
      .catch(() => {
        /* clipboard unavailable — ignore */
      });
  };

  const toggleFavorite = () => {
    if (!isFavorite) setPingKey((k) => k + 1);
    onToggleFavorite(entry.id);
  };

  // Card content — no transform, no ref here
  const content = (
    <>
      {/* Cursor-tracking glow — sits inside the outer card, clips naturally */}
      <div className="card-glow" aria-hidden="true" />

      {/* Main content above the glow */}
      <div className="relative z-10 flex h-full flex-col gap-2.5 p-4 [contain-intrinsic-size:auto_190px] [content-visibility:auto]">
        <div className="flex items-start justify-between gap-2">
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-w-0 items-center gap-1.5 font-mono text-[15px] font-bold text-ink hover:text-acc"
          >
            <span className="truncate">{entry.name}</span>
          </a>
          <motion.button
            type="button"
            whileTap={{ scale: 0.75 }}
            onClick={toggleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className="relative -m-1 shrink-0 rounded p-1 text-mut hover:text-acc"
          >
            {pingKey > 0 && (
              <span
                key={pingKey}
                className="ping-once pointer-events-none absolute inset-0 rounded-full border border-acc"
                aria-hidden="true"
              />
            )}
            <Star size={16} className={isFavorite ? "fill-acc text-acc" : undefined} />
          </motion.button>
        </div>

        <p className="line-clamp-2 flex-1 text-[13px] leading-relaxed text-mut">
          {entry.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          <Badge label="Auth" value={AUTH_LABEL[entry.auth]} tone={AUTH_TONE[entry.auth]} animate={animateIn} index={0} />
          <Badge label="HTTPS" value={triLabel(entry.https)} tone={triTone(entry.https)} animate={animateIn} index={1} />
          <Badge label="CORS" value={triLabel(entry.cors)} tone={triTone(entry.cors)} animate={animateIn} index={2} />
        </div>

        <div className="flex items-center justify-between border-t border-edge pt-2.5">
          <button
            type="button"
            onClick={() => onSelectCategory(entry.category)}
            className="card-category-pill rounded px-2 py-0.5 font-mono text-[11px] transition-colors"
            title={`Filter by ${entry.category}`}
          >
            {entry.category}
          </button>

          <div className="flex items-center gap-1">
            <motion.button
              type="button"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onView(entry)}
              className="card-view-btn"
              aria-label={`Preview ${entry.name} API response`}
            >
              <Eye size={12} />
              <span>View</span>
            </motion.button>

            <button
              type="button"
              onClick={copyUrl}
              className="inline-flex items-center gap-1 rounded p-1 font-mono text-[11px] text-mut hover:text-ink"
              aria-label="Copy API URL"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-ok" />{" "}
                  <span className="text-ok">Copied</span>
                </>
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // Shared tilt props applied to the OUTER element
  const tiltProps = {
    ref: outerRef,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
  };

  if (!animateIn) {
    return (
      <div className="card card-3d rounded-lg" {...tiltProps}>
        {content}
      </div>
    );
  }

  return (
    <motion.div
      className="card card-3d rounded-lg"
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.025, ease: [0.22, 1, 0.36, 1] }}
      {...tiltProps}
    >
      {content}
    </motion.div>
  );
});
