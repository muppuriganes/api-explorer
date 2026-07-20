import { motion } from "framer-motion";

interface HeroProps {
  totalApis: number;
  totalCategories: number;
}

const RIDGES = [
  "M0 96 L40 78 L90 92 L150 58 L210 88 L270 66 L330 90 L400 48 L470 84 L540 62 L600 88 L660 70 L720 92 L800 74",
  "M0 108 L60 94 L120 106 L190 80 L250 102 L320 86 L390 104 L460 76 L530 100 L610 88 L690 104 L800 92",
  "M0 118 L80 108 L160 116 L240 100 L320 114 L410 102 L500 114 L590 104 L680 114 L800 106",
];

export function Hero({ totalApis, totalCategories }: HeroProps) {
  const pills = [
    `${totalApis > 0 ? totalApis.toLocaleString("en-US") : "1,400+"} APIs`,
    `${totalCategories > 0 ? totalCategories : "50+"} Categories`,
    "Always Free",
    "Developer Friendly",
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: "hidden", marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      className="relative mb-2 overflow-hidden rounded-xl border px-6 pb-24 pt-12 text-center sm:pb-28"
      style={{
        borderColor: "color-mix(in srgb, var(--accent) 22%, var(--edge))",
        background:
          "linear-gradient(160deg, color-mix(in srgb,var(--accent) 6%,var(--surface)) 0%, var(--surface) 55%, color-mix(in srgb,var(--cyan) 4%,var(--surface)) 100%)",
      }}
    >
      {/* Violet orb top-left */}
      <motion.div
        className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 68%)",
          filter: "blur(28px)",
        }}
        animate={{ scale: [1, 1.14, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      {/* Cyan orb bottom-right */}
      <motion.div
        className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(34,211,238,0.16) 0%, transparent 70%)",
          filter: "blur(22px)",
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        aria-hidden="true"
      />

      {/* Scanline texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(transparent 0px, transparent 3px, rgba(167,139,250,0.018) 3px, rgba(167,139,250,0.018) 4px)",
        }}
        aria-hidden="true"
      />

      {/* Title line */}
      <motion.p
        className="font-mono text-xs font-bold tracking-[0.32em]"
        style={{ color: "var(--accent-2)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        &gt;_ API EXPLORER
      </motion.p>

      <motion.h1
        className="mt-4 font-mono text-3xl font-bold leading-tight text-ink sm:text-4xl"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
      >
        Discover powerful APIs.
      </motion.h1>

      <motion.p
        className="mt-1.5 font-mono text-xl sm:text-2xl"
        style={{ color: "var(--muted)" }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.14 }}
      >
        Build amazing things.
      </motion.p>

      {/* Pills */}
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-2 font-mono text-[11px]">
        {pills.map((p, i) => (
          <motion.li
            key={p}
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.2 + i * 0.07 }}
            className="rounded-full px-3 py-1 backdrop-blur-sm"
            style={{
              border: "1px solid color-mix(in srgb, var(--accent) 32%, transparent)",
              background: "color-mix(in srgb, var(--accent) 10%, transparent)",
              color: "var(--accent-2)",
              boxShadow: "0 0 14px -4px rgba(124,58,237,0.3)",
            }}
          >
            {p}
          </motion.li>
        ))}
      </ul>

      {/* Wireframe terrain */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full sm:h-24"
        viewBox="0 0 800 120"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ color: "var(--accent-2)" }}
      >
        <g opacity="0.1">
          {Array.from({ length: 13 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={400} y1={60}
              x2={(i / 12) * 800} y2={120}
              stroke="currentColor" strokeWidth="0.8"
            />
          ))}
          {[70, 82, 96, 112].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="800" y2={y}
              stroke="currentColor" strokeWidth="0.8" />
          ))}
        </g>
        {RIDGES.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="currentColor"
            strokeWidth="1" strokeLinejoin="round"
            opacity={0.4 - i * 0.1}
          />
        ))}
        <rect x="0" y="0" width="800" height="120" fill="url(#hero-fade)" />
        <defs>
          <linearGradient id="hero-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.5" stopColor="var(--surface)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--surface)" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>
    </motion.section>
  );
}
