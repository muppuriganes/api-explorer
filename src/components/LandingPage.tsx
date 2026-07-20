import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Shield,
  Globe2,
  Code2,
  Search,
  Star,
  ChevronDown,
  Sparkles,
  Database,
  Layers,
  ExternalLink,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */
const FEATURES = [
  {
    icon: Database,
    title: "1,400+ Public APIs",
    desc: "Curated registry of free public APIs across every domain — weather, finance, gaming, AI, and more.",
    color: "var(--accent)",
    glow: "rgba(124,58,237,0.2)",
  },
  {
    icon: Layers,
    title: "50+ Categories",
    desc: "Every API neatly organized by category. Drill down to exactly what you need in seconds.",
    color: "var(--cyan)",
    glow: "rgba(34,211,238,0.18)",
  },
  {
    icon: Zap,
    title: "Instant Live Preview",
    desc: "Hit View on any card to call the API right in your browser and see the real JSON response.",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.18)",
  },
  {
    icon: Search,
    title: "Fuzzy Search",
    desc: "Smart fuzzy search ranks results by relevance. Find any API even if you misspell the name.",
    color: "#10b981",
    glow: "rgba(16,185,129,0.18)",
  },
  {
    icon: Shield,
    title: "CORS & Auth Info",
    desc: "Every API shows Auth type, HTTPS support, and CORS status so you know before you integrate.",
    color: "#f43f5e",
    glow: "rgba(244,63,94,0.18)",
  },
  {
    icon: Star,
    title: "Favorites",
    desc: "Star your go-to APIs and filter to just your favorites. Persisted locally, always there.",
    color: "var(--accent-2)",
    glow: "rgba(167,139,250,0.2)",
  },
];

const STATS = [
  { value: "1,400+", label: "Public APIs" },
  { value: "50+", label: "Categories" },
  { value: "100%", label: "Free to Use" },
  { value: "0", label: "Auth Required" },
];

const TICKER_ITEMS = [
  "Weather", "Finance", "Blockchain", "Gaming", "AI / ML", "Music", "Sports",
  "Government", "Health", "Photography", "Science", "News", "Animals", "Food",
  "Anime", "Books", "Geocoding", "Security", "Social", "Transport",
];

/* ------------------------------------------------------------------ */
/* Sub-components                                                       */
/* ------------------------------------------------------------------ */

/** Animated particle field */
function ParticleField() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    dur: Math.random() * 12 + 8,
    delay: Math.random() * -15,
    opacity: Math.random() * 0.35 + 0.05,
  }));

  return (
    <div className="landing-particles" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="landing-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [p.opacity, p.opacity * 2.5, p.opacity],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

/** Horizontal scrolling ticker */
function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="landing-ticker-wrap" aria-hidden="true">
      <motion.div
        className="landing-ticker"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="landing-ticker-item">
            <Code2 size={12} />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/** Single feature card */
function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
}) {
  const Icon = feature.icon;
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const glow = el.querySelector<HTMLElement>(".lp-card-glow");
    if (glow) {
      glow.style.opacity = "1";
      glow.style.background = `radial-gradient(circle at ${x}px ${y}px, ${feature.glow} 0%, transparent 60%)`;
    }
  };

  const handleMouseLeave = () => {
    const glow = ref.current?.querySelector<HTMLElement>(".lp-card-glow");
    if (glow) glow.style.opacity = "0";
  };

  return (
    <motion.div
      ref={ref}
      className="lp-feature-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="lp-card-glow" aria-hidden="true" />
      <div
        className="lp-feature-icon"
        style={{
          background: `color-mix(in srgb, ${feature.color} 12%, transparent)`,
          border: `1px solid color-mix(in srgb, ${feature.color} 28%, transparent)`,
          color: feature.color,
          boxShadow: `0 0 18px -5px ${feature.glow}`,
        }}
      >
        <Icon size={20} />
      </div>
      <h3 className="lp-feature-title">{feature.title}</h3>
      <p className="lp-feature-desc">{feature.desc}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Main landing page                                                    */
/* ------------------------------------------------------------------ */
interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const [glowX, setGlowX] = useState(50);
  const [glowY, setGlowY] = useState(40);

  // Track mouse for hero glow
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setGlowX((e.clientX / window.innerWidth) * 100);
      setGlowY((e.clientY / window.innerHeight) * 100);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={containerRef} className="landing-root">

      {/* ── Global aurora background ── */}
      <div className="landing-aurora" aria-hidden="true">
        <motion.div
          className="landing-orb landing-orb-1"
          style={{ left: `${glowX * 0.3}%`, top: `${glowY * 0.3}%` }}
          transition={{ type: "spring", stiffness: 30, damping: 20 }}
        />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
        <div className="landing-grid" />
      </div>

      <ParticleField />

      {/* ── NAV ── */}
      <motion.nav
        className="landing-nav"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon">
              <Globe2 size={16} />
            </div>
            <span>&gt;_ API EXPLORER</span>
          </div>
          <motion.button
            onClick={onEnter}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="landing-nav-cta"
          >
            Launch App <ExternalLink size={13} />
          </motion.button>
        </div>
      </motion.nav>

      {/* ─────────────── HERO ─────────────── */}
      <motion.section
        className="landing-hero"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Badge */}
        <motion.div
          className="landing-badge"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Sparkles size={12} />
          <span>1,400+ Public APIs — All Free, No Registration</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="landing-headline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          Discover. Explore.
          <br />
          <span className="landing-headline-gradient">Build Faster.</span>
        </motion.h1>

        <motion.p
          className="landing-sub"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28 }}
        >
          The ultimate browser for public REST APIs. Search, filter, preview live responses,
          and find the perfect API for your next project — all in one place.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="landing-ctas"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
        >
          <motion.button
            onClick={onEnter}
            className="landing-cta-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            <span>Explore APIs</span>
            <ArrowRight size={16} />
          </motion.button>
          <motion.button
            onClick={onEnter}
            className="landing-cta-secondary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Search size={15} />
            <span>Start Searching</span>
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="landing-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.52 }}
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="landing-stat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55 + i * 0.07 }}
            >
              <span className="landing-stat-value">{s.value}</span>
              <span className="landing-stat-label">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="landing-scroll-cue"
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </motion.section>

      {/* ─────────────── TICKER ─────────────── */}
      <div className="landing-ticker-section">
        <Ticker />
      </div>

      {/* ─────────────── FEATURES ─────────────── */}
      <section className="landing-section">
        <div className="landing-section-inner">
          <motion.div
            className="landing-section-header"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="landing-eyebrow">Everything you need</p>
            <h2 className="landing-section-title">Built for developers, by developers</h2>
            <p className="landing-section-sub">
              Stop wasting time searching GitHub readme files. API Explorer gives you
              structured, filterable, live-testable access to the entire public API ecosystem.
            </p>
          </motion.div>

          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── HOW IT WORKS ─────────────── */}
      <section className="landing-section landing-how">
        <div className="landing-section-inner">
          <motion.div
            className="landing-section-header"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="landing-eyebrow">Simple workflow</p>
            <h2 className="landing-section-title">Go from idea to API in seconds</h2>
          </motion.div>

          <div className="lp-steps">
            {[
              { n: "01", title: "Search or Browse", desc: "Type any keyword or browse by category. Fuzzy search finds APIs even with typos." },
              { n: "02", title: "Check Requirements", desc: "See Auth type, HTTPS, and CORS support at a glance. Filter by zero-friction APIs." },
              { n: "03", title: "Preview Live Response", desc: "Click View to call the API and see real JSON — syntax highlighted, right in the browser." },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                className="lp-step"
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="lp-step-num">{step.n}</div>
                <div>
                  <h3 className="lp-step-title">{step.title}</h3>
                  <p className="lp-step-desc">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── FINAL CTA ─────────────── */}
      <section className="landing-final-cta">
        <div className="landing-final-inner">
          <div className="landing-final-glow" aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="landing-eyebrow">Ready to explore?</p>
            <h2 className="landing-final-title">Your next favourite API is one search away.</h2>
            <p className="landing-final-sub">
              No sign-up. No API key. No cost. Just open it and start building.
            </p>
            <motion.button
              onClick={onEnter}
              className="landing-cta-primary landing-cta-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              <span>Open API Explorer</span>
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer className="landing-footer">
        <p className="landing-footer-text">
          &gt;_ API EXPLORER — Free, open, no registration required.
          Data sourced from{" "}
          <a
            href="https://github.com/public-apis/public-apis"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-footer-link"
          >
            public-apis/public-apis
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
