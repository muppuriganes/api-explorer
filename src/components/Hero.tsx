import { motion } from "framer-motion";

interface HeroProps {
  totalApis: number;
  totalCategories: number;
}

const WAVES = [
  "M0 46 C 80 30, 140 58, 220 42 S 360 26, 440 44 S 580 60, 660 40 S 760 28, 800 42",
  "M0 54 C 90 42, 150 64, 240 50 S 380 36, 460 52 S 600 66, 680 48 S 770 40, 800 50",
  "M0 38 C 70 24, 150 48, 230 34 S 370 20, 450 38 S 590 52, 670 32 S 760 22, 800 36",
];

export function Hero({ totalApis, totalCategories }: HeroProps) {
  const stats = [
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
      transition={{ duration: 0.25 }}
      className="relative mb-2 overflow-hidden rounded-lg border border-edge bg-surface px-6 pb-10 pt-10 text-center"
    >
      <p className="font-mono text-xs font-bold tracking-widest text-acc">
        &gt;_ API EXPLORER
      </p>
      <h1 className="mt-3 font-mono text-2xl font-bold leading-tight text-ink sm:text-3xl">
        Discover powerful APIs.
      </h1>
      <p className="mt-1 font-mono text-lg text-mut sm:text-xl">Build amazing things.</p>

      <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-mono text-[11px] text-mut">
        {stats.map((s) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-acc" aria-hidden="true" />
            {s}
          </li>
        ))}
      </ul>

      {/* Subtle terminal data-wave */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 w-full text-acc"
        viewBox="0 0 800 64"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {WAVES.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity={0.12 - i * 0.03}
          />
        ))}
      </svg>
    </motion.section>
  );
}
