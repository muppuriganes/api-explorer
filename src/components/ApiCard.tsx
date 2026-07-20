import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, ExternalLink, Star } from "lucide-react";
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
  /** Only the first ~24 cards animate in per filter change (60fps budget). */
  animateIn: boolean;
  index: number;
}

export const ApiCard = memo(function ApiCard({
  entry,
  isFavorite,
  onToggleFavorite,
  onSelectCategory,
  animateIn,
  index,
}: ApiCardProps) {
  const [copied, setCopied] = useState(false);
  const [pingKey, setPingKey] = useState(0);

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

  const body = (
    <div className="flex h-full flex-col gap-2.5 p-4 [content-visibility:auto] [contain-intrinsic-size:auto_190px]">
      <div className="flex items-start justify-between gap-2">
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-w-0 items-center gap-1.5 font-mono text-sm font-bold text-ink hover:text-acc"
        >
          <span className="truncate">{entry.name}</span>
          <ExternalLink
            size={12}
            className="shrink-0 opacity-0 transition-opacity group-hover:opacity-70"
            aria-hidden="true"
          />
        </a>
        <motion.button
          type="button"
          whileTap={{ scale: 0.75 }}
          onClick={toggleFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="relative -m-1 shrink-0 rounded p-1 text-mut hover:text-warn"
        >
          {pingKey > 0 && (
            <span
              key={pingKey}
              className="ping-once pointer-events-none absolute inset-0 rounded-full border border-warn"
              aria-hidden="true"
            />
          )}
          <Star
            size={16}
            className={isFavorite ? "fill-warn text-warn" : undefined}
          />
        </motion.button>
      </div>

      <p className="line-clamp-2 flex-1 text-[13px] leading-relaxed text-mut">
        {entry.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        <Badge
          label="Auth"
          value={AUTH_LABEL[entry.auth]}
          tone={AUTH_TONE[entry.auth]}
          animate={animateIn}
          index={0}
        />
        <Badge
          label="HTTPS"
          value={triLabel(entry.https)}
          tone={triTone(entry.https)}
          animate={animateIn}
          index={1}
        />
        <Badge
          label="CORS"
          value={triLabel(entry.cors)}
          tone={triTone(entry.cors)}
          animate={animateIn}
          index={2}
        />
      </div>

      <div className="flex items-center justify-between border-t border-edge pt-2.5">
        <button
          type="button"
          onClick={() => onSelectCategory(entry.category)}
          className="rounded bg-surface2 px-2 py-0.5 font-mono text-[11px] text-mut transition-colors hover:text-acc"
          title={`Filter by ${entry.category}`}
        >
          {entry.category}
        </button>
        <button
          type="button"
          onClick={copyUrl}
          className="inline-flex items-center gap-1 rounded p-1 font-mono text-[11px] text-mut hover:text-ink"
          aria-label="Copy API URL"
        >
          {copied ? (
            <>
              <Check size={13} className="text-ok" /> <span className="text-ok">Copied</span>
            </>
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>
    </div>
  );

  if (!animateIn) {
    return <div className="card rounded-lg">{body}</div>;
  }

  return (
    <motion.div
      className="card rounded-lg"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.02, ease: "easeOut" }}
    >
      {body}
    </motion.div>
  );
});
