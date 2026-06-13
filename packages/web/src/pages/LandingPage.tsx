import React, { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Mountain, Triangle, Route, Tent, Plug, Sparkles, Trophy,
  Check, Minus, ChevronRight, Play, Sun, Moon,
  Sunrise, Flag, Footprints, Droplets,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { ScoreMeter } from "../components/ScoreMeter";
import { HeatGrid } from "../components/HeatGrid";
import { StatBlock } from "../components/StatBlock";
import { CollectionCard } from "../components/CollectionCard";
import { ProgressRing } from "../components/ProgressRing";
import { ProgressBar } from "../components/ProgressBar";
import { AchievementBadge } from "../components/AchievementBadge";
import "./landing.css";

// ── Seeded RNG & geometry ─────────────────────────────────────────────────────

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ridgePoints(W: number, baseY: number, amp: number, rough: number, seed: number, step = 26) {
  const rnd = mulberry32(seed);
  const n = Math.ceil(W / step);
  const f1 = 0.6 + rnd() * 0.5, f2 = 1.7 + rnd() * 1.1, ph = rnd() * 6.28;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * W;
    const t = (i / n) * Math.PI * 2;
    const y = baseY
      - Math.sin(t * f1 + ph) * amp
      - Math.sin(t * f2 + ph * 1.7) * amp * 0.34
      - (rnd() - 0.5) * amp * rough;
    pts.push([Math.round(x), Math.round(y)]);
  }
  return pts;
}

function pathFromPoints(pts: [number, number][], W: number, floor: number) {
  if (!pts.length) return "";
  let d = `M ${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i]![0]} ${pts[i]![1]}`;
  d += ` L ${W} ${floor} L 0 ${floor} Z`;
  return d;
}

function ridgePath(W: number, baseY: number, amp: number, rough: number, seed: number, floor: number) {
  return pathFromPoints(ridgePoints(W, baseY, amp, rough, seed), W, floor);
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } });
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

function useCountUp(target: number, active: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setVal(target); return; }
    let raf = 0, start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return val;
}

function compactNum(n: number) {
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return Math.floor(n / 1e3) + "K";
  return Math.round(n).toLocaleString();
}

// ── Scroll reveal ─────────────────────────────────────────────────────────────

function useScrollReveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll("[data-lp-reveal]");
    if (reduced) { els.forEach((el) => el.classList.add("lp-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("lp-in"); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

// ── Data ──────────────────────────────────────────────────────────────────────

const SOURCES = [
  { name: "Strava", color: "var(--coral-400)" },
  { name: "Garmin", color: "var(--sky-400)" },
  { name: "Komoot", color: "var(--spruce-400)" },
  { name: "AllTrails", color: "var(--spruce-300)" },
  { name: "Apple Health", color: "var(--ink-200)" },
  { name: "GPX & FIT files", color: "var(--gold-400)" },
];

const STATS = [
  { label: "PEAKS LOGGED", to: 1248000, color: "var(--gold-400)" },
  { label: "TRAILS COLLECTED", to: 4920000, color: "var(--sky-400)" },
  { label: "EXPLORERS", to: 92400, color: "var(--spruce-400)" },
  { label: "COLLECTIONS DONE", to: 318000, color: "var(--gold-400)" },
];

const COLLECTIONS = [
  { title: "Wainwrights", type: "FELLS · LAKE DISTRICT", value: 156, max: 214, icon: <Mountain size={22} /> },
  { title: "Munros", type: "SUMMITS · SCOTLAND", value: 43, max: 282, icon: <Triangle size={22} /> },
  { title: "National Trails", type: "LONG-DISTANCE PATHS", value: 9, max: 16, icon: <Route size={22} /> },
  { title: "Coastal Bothies", type: "SHELTERS", value: 12, max: 12, icon: <Tent size={22} /> },
];

const ACHIEVEMENTS = [
  { title: "Skyliner", description: "Climb three 800m summits in one day.", tier: "gold" as const, points: 500, unlocked: true, icon: <Mountain size={22} /> },
  { title: "First Light", description: "Summit before sunrise.", tier: "silver" as const, points: 150, unlocked: true, icon: <Sunrise size={22} /> },
  { title: "Completionist", description: "Finish an entire named collection.", tier: "platinum" as const, points: 1000, unlocked: true, icon: <Trophy size={22} /> },
  { title: "Trailblazer", description: "Log 1,000 km of distinct trail.", tier: "gold" as const, points: 400, unlocked: true, icon: <Footprints size={22} /> },
  { title: "County Tops", description: "Reach the highest point of 10 counties.", tier: "silver" as const, points: 250, unlocked: false, progress: { value: 7, max: 10 }, icon: <Flag size={22} /> },
  { title: "Round the Lakes", description: "Visit all 16 bodies of water in a region.", tier: "bronze" as const, points: 120, unlocked: false, progress: { value: 11, max: 16 }, icon: <Droplets size={22} /> },
];

const QUOTES = [
  { body: "I'd done 60 Wainwrights and never knew. Atlas found them all in my Strava history and suddenly I had a checklist I couldn't stop chasing.", name: "Maya Holloway", meta: "156 / 214 WAINWRIGHTS", initials: "MH", color: "var(--gold-500)" },
  { body: "It's the trophy case I didn't know I wanted. Ten years of hiking finally feels like one connected record instead of scattered files.", name: "Tomas Reier", meta: "OUTDOOR SCORE 14,820", initials: "TR", color: "var(--sky-400)" },
  { body: "The coverage map is dangerous. Seeing a region at 68% explored is the most motivated I've ever been to drive three hours for one hill.", name: "Priya Anand", meta: "GOLD · COMPLETIONIST", initials: "PA", color: "var(--spruce-400)" },
];

const FAQS = [
  { q: "Does Atlas plan routes or navigate?", a: "No — and that's deliberate. Atlas is a lifetime record and a trophy case, not a route planner or a GPS. It sits on top of the tools you already use and turns your history into collections, coverage and achievements." },
  { q: "Which sources can I connect?", a: "Strava, Garmin Connect, Komoot, AllTrails and Apple Health, plus direct GPX and FIT file imports. Connections are read-only: Atlas never posts, edits or deletes anything in your accounts." },
  { q: "Where do collections come from?", a: "Atlas ships with thousands of curated, real-world lists — Wainwrights, Munros, county tops, national trails, waterfalls, bothies and more — and adds new regions every month. You can also build private custom collections." },
  { q: "What's the Outdoor Score?", a: "One number for a lifetime outdoors. Every peak, trail, landmark and achievement awards points; tiers from Bronze to Platinum are worth more. It's the Gamerscore of the outdoors — a single figure that only ever goes up." },
  { q: "Is my data private?", a: "Yes. Your record is private by default. You choose what — if anything — to share, and you can export or delete everything at any time. We don't sell data, ever." },
  { q: "Can I cancel anytime?", a: "Anytime, in one click. If you cancel Pro you keep your full record and drop back to the free tier — nothing you've collected is ever taken away." },
];

const PRO_FEATURES = [
  "Unlimited collections & custom lists",
  "Full worldwide coverage maps & heatmaps",
  "Every achievement tier & the Outdoor Score",
  "Closest-to-completion & missing-nearby nudges",
  "All sources, unlimited history import",
  "Yearly Wrapped & shareable trophy cards",
];

const FREE_FEATURES: (string | { t: string; off: boolean })[] = [
  "3 active collections",
  "Lifetime history import",
  "Regional coverage (1 region)",
  { t: "Achievements & Outdoor Score", off: true },
  { t: "Worldwide maps & heatmaps", off: true },
];

const STEPS = [
  { icon: <Plug size={24} />, n: "STEP 01", title: "Connect a source", body: "Link Strava, Garmin, Komoot, AllTrails or drop a folder of GPX files. Read-only — we never touch your accounts or post anything." },
  { icon: <Sparkles size={24} />, n: "STEP 02", title: "We import your history", body: "Atlas reads every activity you've ever recorded and matches it against peaks, trails, landmarks and regions worldwide. Years of adventures, mapped in minutes." },
  { icon: <Trophy size={24} />, n: "STEP 03", title: "Collect, complete, climb", body: "Watch collections fill, achievements unlock and your Outdoor Score rise. See exactly what's left — and what's closest to done." },
];

// ── Ridgeline SVG scene ───────────────────────────────────────────────────────

function Ridgelines() {
  const W = 1600, H = 760, floor = H + 300;
  const layerRefs = useRef<(SVGGElement | null)[]>([]);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const pal = ["#1c2a36", "#16222d", "#111a23", "#0f2a22"];
  const pineFill = "#0c2620";
  const pineStroke = "#16463a";

  const layers = [
    { base: 360, amp: 78, rough: 0.5, seed: 11, dx: 10, dy: -0.018, fill: pal[0] },
    { base: 470, amp: 104, rough: 0.6, seed: 27, dx: 20, dy: -0.04, fill: pal[1] },
    { base: 560, amp: 120, rough: 0.7, seed: 41, dx: 34, dy: -0.07, fill: pal[2] },
  ];

  const fgPts = ridgePoints(W, 650, 96, 0.55, 73, 30);
  const fgPath = pathFromPoints(fgPts, W, floor);
  const pines = fgPts.filter((_, i) => i % 2 === 0).map(([x, y], i) => ({ x, y, s: 0.8 + ((i * 37) % 100) / 140 }));

  const rng = mulberry32(3);
  const stars = Array.from({ length: 22 }, (_, i) => {
    const r = mulberry32(i * 99 + 3);
    return { x: 80 + r() * (W - 160), y: 30 + r() * 230, rad: 0.8 + r() * 1.6, d: (i % 5) * 0.7 };
  });
  void rng;

  useEffect(() => {
    if (reduced) return;
    let mx = 0, sy = 0, raf = 0;
    const apply = () => {
      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        const L = layers[i] || { dx: 44, dy: -0.10 };
        el.style.transform = `translate3d(${mx * (L.dx || 0)}px, ${sy * (L.dy || 0)}px, 0)`;
      });
      raf = 0;
    };
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5);
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onScroll = () => { sy = window.scrollY; if (!raf) raf = requestAnimationFrame(apply); };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="lp-hero-scene" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient id="lp-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(244,183,64,0.42)" />
            <stop offset="45%" stopColor="rgba(244,183,64,0.21)" />
            <stop offset="100%" stopColor="rgba(244,183,64,0)" />
          </radialGradient>
          <linearGradient id="lp-disc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold-300)" />
            <stop offset="100%" stopColor="var(--gold-600)" />
          </linearGradient>
        </defs>
        <rect x={W * 0.5 - 320} y="40" width="640" height="640" fill="url(#lp-sun)" />
        <circle cx={1060} cy="170" r="46" fill="url(#lp-disc)" opacity={0.92} />
        {stars.map((s, i) => (
          <circle key={i} className="lp-twinkle" cx={s.x} cy={s.y} r={s.rad} fill="var(--ink-100)" style={{ animationDelay: `${s.d}s` }} />
        ))}
        {layers.map((L, i) => (
          <g className="lp-ridge" key={i} ref={(el) => { layerRefs.current[i] = el; }}>
            <path d={ridgePath(W, L.base, L.amp, L.rough, L.seed, floor)} fill={L.fill} />
          </g>
        ))}
        <g className="lp-ridge" ref={(el) => { layerRefs.current[layers.length] = el; }}>
          <path d={fgPath} fill={pal[3]} />
          {pines.map((p, i) => (
            <g key={i} transform={`translate(${p.x}, ${p.y}) scale(${p.s})`} opacity="0.96">
              <rect x="-1.3" y="-2" width="2.6" height="10" fill={pineStroke} />
              <path d="M 0 -26 L 9 -8 L -9 -8 Z" fill={pineFill} stroke={pineStroke} strokeWidth="0.6" />
              <path d="M 0 -18 L 11 2 L -11 2 Z" fill={pineFill} stroke={pineStroke} strokeWidth="0.6" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Achievements", href: "#achievements" },
  { label: "Pricing", href: "#pricing" },
];

function Nav({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
  return (
    <nav className="lp-nav">
      <div className="lp-wrap lp-nav-inner">
        <a href="#top" style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}>
          <img
            src={theme === "light" ? "/atlas-logo-ink.svg" : "/atlas-logo.svg"}
            alt="Atlas"
            style={{ height: 26 }}
          />
        </a>
        <div className="lp-nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.label} className="lp-nav-link" href={l.href}>{l.label}</a>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button className="lp-icon-btn" onClick={toggleTheme} aria-label="Toggle appearance">
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link className="lp-btn lp-btn-sm lp-btn-ghost" to="/login">Sign in</Link>
          <a className="lp-btn lp-btn-sm lp-btn-primary" href="#pricing">Get Atlas Pro</a>
        </div>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function HeroPreview() {
  const [ref, seen] = useInView(0.25);
  const heat = React.useMemo(() => {
    const r = mulberry32(7);
    return Array.from({ length: 7 * 22 }, () => {
      const v = r();
      return v > 0.82 ? 4 : v > 0.66 ? 3 : v > 0.46 ? 2 : v > 0.26 ? 1 : 0;
    });
  }, []);

  return (
    <div ref={ref} className="atlas-glass" style={{
      borderRadius: "var(--radius-2xl)", padding: 24, display: "grid",
      gridTemplateColumns: "auto 1px 1fr", gap: 26, alignItems: "center",
      boxShadow: "var(--shadow-lg), var(--ring-top)", maxWidth: 860, margin: "0 auto",
    }}>
      <div style={{ padding: "4px 8px" }}>
        {seen && <ScoreMeter score={14820} level={27} levelProgress={64} />}
      </div>
      <div style={{ alignSelf: "stretch", background: "var(--border-subtle)" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          <StatBlock size="sm" label="WAINWRIGHTS" value="156 / 214" sub="58 to go" />
          <StatBlock size="sm" label="LAKE DISTRICT" value="68%" sub="explored" />
          <StatBlock size="sm" label="ACHIEVEMENTS" value="92" sub="of 240 unlocked" />
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>52-WEEK EXPLORATION HEATMAP</div>
          <HeatGrid data={heat} columns={22} rows={7} cell={11} gap={3} />
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <header className="lp-hero lp-sec-pad" id="top" style={{ paddingTop: 96, paddingBottom: 60, minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Ridgelines />
      <div className="lp-hero-fade" />
      <div className="lp-wrap lp-hero-content" style={{ width: "100%" }}>
        <div style={{ maxWidth: 760, margin: "0 auto 56px", textAlign: "center" }}>
          <div data-lp-reveal className="lp-eyebrow lp-center" style={{ marginBottom: 22 }}>YOUR LIFETIME EXPLORATION RECORD</div>
          <h1 data-lp-reveal className="lp-h-display" style={{ fontSize: "clamp(44px, 7vw, 86px)", marginBottom: 22, transitionDelay: ".05s" }}>
            Every summit, every trail —<br /><span className="atlas-gold-text">collected.</span>
          </h1>
          <p data-lp-reveal className="lp-lead" style={{ maxWidth: 560, margin: "0 auto", fontSize: "var(--text-xl)", transitionDelay: ".1s" }}>
            Atlas turns the activities you've already logged into collections, achievements and coverage maps. Not a route planner — a trophy case for a lifetime outdoors.
          </p>
          <div data-lp-reveal style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 34, flexWrap: "wrap", transitionDelay: ".15s" }}>
            <Link className="lp-btn lp-btn-lg lp-btn-primary" to="/signup">Start your Atlas</Link>
            <a className="lp-btn lp-btn-lg lp-btn-secondary" href="#how"><Play size={16} /> See how it works</a>
          </div>
          <div data-lp-reveal className="eyebrow" style={{ marginTop: 22, transitionDelay: ".2s" }}>FREE TO START · NO ACTIVITY TRACKING · CANCEL ANYTIME</div>
        </div>
        <div data-lp-reveal style={{ transitionDelay: ".1s" }}><HeroPreview /></div>
      </div>
    </header>
  );
}

// ── Source band ───────────────────────────────────────────────────────────────

function SourceBand() {
  return (
    <section className="lp-section lp-sec-pad-sm" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <div className="lp-wrap" style={{ textAlign: "center" }}>
        <div data-lp-reveal className="eyebrow" style={{ marginBottom: 26 }}>WORKS WITH WHAT YOU ALREADY USE</div>
        <div data-lp-reveal style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
          {SOURCES.map((s) => (
            <div key={s.name} className="lp-source-chip">
              <span className="lp-source-dot" style={{ background: s.color }} />
              {s.name}
            </div>
          ))}
        </div>
        <p data-lp-reveal className="eyebrow" style={{ color: "var(--text-muted)", marginTop: 24, letterSpacing: "var(--tracking-wide)" }}>
          read-only · we never post, edit or track
        </p>
      </div>
    </section>
  );
}

// ── Stat band ─────────────────────────────────────────────────────────────────

function StatCell({ s }: { s: typeof STATS[0] }) {
  const [ref, seen] = useInView(0.5);
  const v = useCountUp(s.to, seen, 1800);
  return (
    <div className="lp-stat-cell" ref={ref}>
      <div className="lp-stat-num" style={{ color: s.color }}>{compactNum(v)}</div>
      <div className="eyebrow" style={{ marginTop: 10 }}>{s.label}</div>
    </div>
  );
}

function StatBand() {
  return (
    <section className="lp-stat-band">
      <div className="lp-wrap"><div className="lp-stat-grid">
        {STATS.map((s) => <StatCell key={s.label} s={s} />)}
      </div></div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

function FeatureRow({ flip, eyebrow, title, body, bullets, children }: {
  flip?: boolean; eyebrow: string; title: string; body: string;
  bullets?: string[]; children: React.ReactNode;
}) {
  return (
    <div className={`lp-feat-row${flip ? " lp-flip" : ""}`}>
      <div className="lp-feat-text" data-lp-reveal>
        <div className="lp-eyebrow" style={{ marginBottom: 16 }}>{eyebrow}</div>
        <h2 className="lp-h-section" style={{ marginBottom: 18 }}>{title}</h2>
        <p className="lp-lead">{body}</p>
        {bullets && (
          <div className="lp-feat-bullets">
            {bullets.map((b, i) => (
              <div className="lp-feat-bullet" key={i}>
                <span className="lp-tick"><Check size={13} /></span>{b}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="lp-feat-visual" data-lp-reveal style={{ transitionDelay: ".08s" }}>{children}</div>
    </div>
  );
}

function CollectionsVisual() {
  const [ref, seen] = useInView(0.3);
  return (
    <div ref={ref} className="lp-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, background: "var(--surface-sunken)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 6px 8px" }}>
        <div className="eyebrow">YOUR COLLECTIONS</div>
        <Badge variant="gold" dot>4 ACTIVE</Badge>
      </div>
      {seen && COLLECTIONS.map((c) => (
        <CollectionCard key={c.title} title={c.title} type={c.type} value={c.value} max={c.max} icon={c.icon} />
      ))}
    </div>
  );
}

function ScoreVisual() {
  const [ref, seen] = useInView(0.35);
  return (
    <div ref={ref} className="lp-card" style={{ padding: 32, background: "var(--surface-sunken)" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
        {seen && <ScoreMeter score={14820} level={27} levelProgress={64} />}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {seen && <ProgressRing value={92} max={240} size={84} stroke={8} color="gold" showValue={false}>
            <div style={{ font: "var(--type-stat)", fontSize: 22 }}>92</div>
          </ProgressRing>}
          <div className="eyebrow">ACHIEVEMENTS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {seen && <ProgressRing value={68} max={100} size={84} stroke={8} color="spruce" />}
          <div className="eyebrow">EXPLORED</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {seen && <ProgressRing value={156} max={214} size={84} stroke={8} color="sky" showValue={false}>
            <div style={{ font: "var(--type-stat)", fontSize: 18 }}>73%</div>
          </ProgressRing>}
          <div className="eyebrow">WAINWRIGHTS</div>
        </div>
      </div>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="lp-section lp-sec-pad">
      <div className="lp-wrap">
        <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 80px" }}>
          <div data-lp-reveal className="lp-eyebrow lp-center" style={{ marginBottom: 18 }}>WHAT ATLAS DOES</div>
          <h2 data-lp-reveal className="lp-h-section" style={{ marginBottom: 18 }}>A Pokédex for the great outdoors</h2>
          <p data-lp-reveal className="lp-lead">Four ways Atlas turns scattered activity files into something you're proud of — and itch to complete.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 120 }}>
          <FeatureRow
            eyebrow="COLLECTIONS"
            title="Every list worth chasing, tracked for you"
            body="Wainwrights, Munros, county tops, national trails, waterfalls, bothies — thousands of real-world collections, automatically filled in from your history. Always see what you've collected and exactly what's left."
            bullets={["Thousands of curated, real lists", "Auto-matched from your activities", "Build private custom collections"]}>
            <CollectionsVisual />
          </FeatureRow>
          <FeatureRow flip
            eyebrow="OUTDOOR SCORE"
            title="One number for a lifetime outdoors"
            body="Every peak, trail, landmark and achievement awards points. Tiers from Bronze to Platinum are worth more. It's the Gamerscore of the outdoors — a single figure that only ever goes up."
            bullets={["Points for everything you've done", "Level up as your record grows", "Compare with friends, never strangers"]}>
            <ScoreVisual />
          </FeatureRow>
        </div>
      </div>
    </section>
  );
}

// ── Coverage ──────────────────────────────────────────────────────────────────

const REGIONS = [
  { name: "Lake District", pct: 68, color: "spruce" as const },
  { name: "Snowdonia", pct: 41, color: "spruce" as const },
  { name: "Peak District", pct: 86, color: "spruce" as const },
  { name: "Cairngorms", pct: 23, color: "sky" as const },
];

function Coverage() {
  const [ref, seen] = useInView(0.25);
  const heat = React.useMemo(() => {
    const r = mulberry32(31);
    return Array.from({ length: 7 * 34 }, () => {
      const v = r();
      return v > 0.8 ? 4 : v > 0.62 ? 3 : v > 0.42 ? 2 : v > 0.22 ? 1 : 0;
    });
  }, []);

  return (
    <section id="coverage" className="lp-section lp-coverage lp-sec-pad">
      <div className="lp-coverage-grid-bg" />
      <div className="lp-wrap" style={{ position: "relative" }}>
        <div className="lp-feat-row">
          <div className="lp-feat-text" data-lp-reveal>
            <div className="lp-eyebrow" style={{ color: "var(--spruce-400)", marginBottom: 16 }}>COVERAGE</div>
            <h2 className="lp-h-section" style={{ marginBottom: 18 }}>See how much ground you've actually covered</h2>
            <p className="lp-lead">Atlas paints every region you've set foot in as a living coverage map. Watch the green spread as you explore — and feel the pull of the gaps you haven't closed yet.</p>
            <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 18 }} ref={ref}>
              {REGIONS.map((rg) => (
                <div key={rg.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ fontWeight: 600, fontSize: "var(--text-base)" }}>{rg.name}</span>
                    <span className="eyebrow" style={{ color: "var(--text-secondary)" }}>{rg.pct}% EXPLORED</span>
                  </div>
                  {seen && <ProgressBar value={rg.pct} max={100} color={rg.color} size="md" showValue={false} />}
                </div>
              ))}
            </div>
          </div>
          <div className="lp-feat-visual" data-lp-reveal style={{ transitionDelay: ".08s" }}>
            <div className="lp-card" style={{ padding: 28, background: "var(--surface-card)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>LAKE DISTRICT</div>
                  <div style={{ font: "var(--type-h2)", color: "var(--text-primary)" }}>
                    <span className="atlas-gold-text" style={{ fontSize: 40 }}>68%</span>
                    <span style={{ color: "var(--text-muted)", fontSize: 16, marginLeft: 8 }}>explored</span>
                  </div>
                </div>
                <Badge variant="success" dot>147 OF 214 FELLS</Badge>
              </div>
              <div style={{ overflowX: "auto" }}>
                <HeatGrid data={heat} columns={34} rows={7} cell={13} gap={4} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="eyebrow">LESS</span>
                  {[0, 1, 2, 3, 4].map((l) => (
                    <span key={l} style={{ width: 13, height: 13, borderRadius: 3, background: `var(--heat-${l})` }} />
                  ))}
                  <span className="eyebrow">MORE</span>
                </div>
                <span className="eyebrow" style={{ color: "var(--spruce-400)" }}>67 FELLS TO GO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────

function RouteTrail() {
  const bandRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const flagRef = useRef<SVGGElement>(null);
  const nodeRefs = useRef<(SVGGElement | null)[]>([]);
  const nodes = [{ x: 174, y: 86 }, { x: 550, y: 70 }, { x: 926, y: 44 }];
  const d = "M 40 102 C 100 98 140 90 174 86 C 280 80 360 94 470 90 C 520 88 510 74 550 70 C 660 64 720 82 820 72 C 880 66 900 52 926 44 C 985 38 1015 30 1060 24";

  useEffect(() => {
    const path = pathRef.current, band = bandRef.current;
    if (!path || !band) return;
    const L = path.getTotalLength();
    path.style.strokeDasharray = String(L);
    const fracs = nodes.map((n) => {
      let best = 0, bd = 1e9;
      for (let s = 0; s <= 120; s++) { const pt = path.getPointAtLength((L * s) / 120); const dd = Math.abs(pt.x - n.x); if (dd < bd) { bd = dd; best = s / 120; } }
      return best;
    });
    const draw = (p: number) => {
      path.style.strokeDashoffset = String(L * (1 - p));
      if (markerRef.current) {
        const pt = path.getPointAtLength(L * Math.max(0.001, Math.min(1, p)));
        markerRef.current.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
        markerRef.current.style.opacity = (p > 0.015 && p < 0.99) ? "1" : "0";
      }
      nodeRefs.current.forEach((el, i) => { if (el) el.classList.toggle("on", p >= (fracs[i] ?? 0) - 0.005); });
      if (flagRef.current) flagRef.current.style.opacity = p > 0.9 ? "1" : "0";
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { draw(1); return; }
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = band.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        const p = Math.max(0, Math.min(1, (vh * 0.82 - rect.top) / (vh * 0.6)));
        draw(p);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="lp-route-band" ref={bandRef} aria-hidden="true">
      <svg viewBox="0 0 1100 124" preserveAspectRatio="none">
        <path className="lp-route-line-bg" d={d} />
        <path className="lp-route-line" ref={pathRef} d={d} />
        {nodes.map((n, i) => (
          <g className="lp-route-node" key={i} ref={(el) => { nodeRefs.current[i] = el; }} transform={`translate(${n.x}, ${n.y})`}>
            <circle className="ring" r="9" />
            <circle className="core" r="3.5" />
          </g>
        ))}
        <g className="lp-route-flag" ref={flagRef} transform="translate(1060, 24)">
          <line x1="0" y1="0" x2="0" y2="-30" stroke="var(--gold-300)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 0 -30 L 20 -25 L 0 -19 Z" fill="var(--gold-500)" />
        </g>
        <g className="lp-route-marker" ref={markerRef}>
          <circle className="pulse" r="6" />
          <circle className="hub" r="6" />
        </g>
      </svg>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="lp-section lp-sec-pad" style={{ background: "var(--bg-base)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
      <div className="lp-wrap">
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 44px" }}>
          <div data-lp-reveal className="lp-eyebrow lp-center" style={{ marginBottom: 18 }}>HOW IT WORKS</div>
          <h2 data-lp-reveal className="lp-h-section" style={{ marginBottom: 18 }}>Three steps to a complete record</h2>
          <p data-lp-reveal className="lp-lead">No new app to carry up the hill. Atlas works with the history you've already got — follow the route.</p>
        </div>
        <RouteTrail />
        <div className="lp-steps">
          {STEPS.map((s, i) => (
            <div className="lp-step lp-card lp-hoverable" key={i} data-lp-reveal style={{ transitionDelay: `${i * 0.08}s`, background: "var(--surface-card)" }}>
              <div className="lp-step-num">{s.n}</div>
              <div className="lp-step-ico">{s.icon}</div>
              <h3 style={{ font: "var(--type-h3)", marginBottom: 10 }}>{s.title}</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "var(--leading-relaxed)", fontSize: "var(--text-base)" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Achievements ──────────────────────────────────────────────────────────────

function AchievementsSection() {
  const [ref, seen] = useInView(0.2);
  return (
    <section id="achievements" className="lp-section lp-sec-pad">
      <div className="lp-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 48 }}>
          <div style={{ maxWidth: 560 }}>
            <div data-lp-reveal className="lp-eyebrow" style={{ marginBottom: 18 }}>ACHIEVEMENTS</div>
            <h2 data-lp-reveal className="lp-h-section" style={{ marginBottom: 18 }}>A trophy case that pays out</h2>
            <p data-lp-reveal className="lp-lead">Evocative, earned achievements — never grind-y noise. Each is worth points toward your Outdoor Score, and the rarer the tier, the bigger the haul.</p>
          </div>
          <div data-lp-reveal style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Badge variant="bronze">BRONZE</Badge>
            <Badge variant="silver">SILVER</Badge>
            <Badge variant="gold">GOLD</Badge>
            <Badge variant="platinum">PLATINUM ★</Badge>
          </div>
        </div>
        <div className="lp-ach-grid" ref={ref}>
          {ACHIEVEMENTS.map((a, i) => (
            <div key={a.title} data-lp-reveal style={{ transitionDelay: `${(i % 3) * 0.07}s` }}>
              {seen && (
                <AchievementBadge
                  title={a.title} description={a.description} tier={a.tier}
                  points={a.points} unlocked={a.unlocked}
                  progress={"progress" in a ? a.progress : null}
                  icon={a.icon} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────

function Testimonials() {
  return (
    <section className="lp-section lp-sec-pad" style={{ background: "var(--bg-base)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
      <div className="lp-wrap">
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 56px" }}>
          <div data-lp-reveal className="lp-eyebrow lp-center" style={{ marginBottom: 18 }}>FROM THE TRAILHEAD</div>
          <h2 data-lp-reveal className="lp-h-section">Explorers can't put it down</h2>
        </div>
        <div className="lp-quote-grid">
          {QUOTES.map((q, i) => (
            <div key={q.name} className="lp-card lp-quote-card lp-hoverable" data-lp-reveal style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="lp-quote-mark">&ldquo;</div>
              <p className="lp-quote-body">{q.body}</p>
              <div className="lp-quote-who">
                <span className="lp-quote-avatar" style={{ background: q.color }}>{q.initials}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{q.name}</div>
                  <div className="eyebrow" style={{ marginTop: 2 }}>{q.meta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────

function FeatLine({ children, off }: { children: React.ReactNode; off?: boolean }) {
  return (
    <div className={`lp-price-feat${off ? " lp-off" : ""}`}>
      <span className="lp-tick">{off ? <Minus size={16} /> : <Check size={16} />}</span>
      <span>{children}</span>
    </div>
  );
}

function Pricing() {
  const [annual, setAnnual] = useState(true);
  const monthly = 8, annualPerMo = 6;
  const price = annual ? annualPerMo : monthly;

  return (
    <section id="pricing" className="lp-section lp-sec-pad">
      <div className="lp-wrap">
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 40px" }}>
          <div data-lp-reveal className="lp-eyebrow lp-center" style={{ marginBottom: 18 }}>PRICING</div>
          <h2 data-lp-reveal className="lp-h-section" style={{ marginBottom: 18 }}>Start free. Go Pro when you're hooked.</h2>
          <p data-lp-reveal className="lp-lead">One simple plan. Everything Atlas can do, for less than a coffee a month.</p>
        </div>
        <div data-lp-reveal style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <div className="lp-price-toggle" role="group" aria-label="Billing period">
            <button className={!annual ? "active" : ""} onClick={() => setAnnual(false)}>Monthly</button>
            <button className={annual ? "active" : ""} onClick={() => setAnnual(true)}>
              Annual <Badge variant="success">SAVE 25%</Badge>
            </button>
          </div>
        </div>
        <div className="lp-price-grid">
          <div className="lp-card lp-price-card" data-lp-reveal>
            <div className="eyebrow" style={{ marginBottom: 12 }}>BASE CAMP</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span className="lp-price-amt" style={{ fontSize: 44 }}>Free</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: "12px 0 24px", lineHeight: 1.5 }}>
              For getting your history in and seeing your first collections fill.
            </p>
            <Link className="lp-btn lp-btn-md lp-btn-secondary" to="/signup" style={{ width: "100%" }}>Create free account</Link>
            <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 28 }}>
              {FREE_FEATURES.map((f, i) => typeof f === "string"
                ? <FeatLine key={i}>{f}</FeatLine>
                : <FeatLine key={i} off>{f.t}</FeatLine>)}
            </div>
          </div>
          <div className="lp-card lp-price-card lp-pro atlas-topo" data-lp-reveal style={{ transitionDelay: ".08s" }}>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div className="eyebrow" style={{ color: "var(--gold-400)" }}>ATLAS PRO</div>
                <Badge variant="gold" dot>MOST POPULAR</Badge>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span className="lp-price-amt atlas-gold-text">${price}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "var(--text-base)" }}>/ month</span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", margin: "12px 0 24px", lineHeight: 1.5 }}>
                {annual ? `Billed annually at $${annualPerMo * 12} — 25% off the monthly price.` : "Billed monthly. Switch to annual any time to save 25%."}
              </p>
              <Link className="lp-btn lp-btn-md lp-btn-primary" to="/signup" style={{ width: "100%" }}>Start 14-day free trial</Link>
              <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 28 }}>
                {PRO_FEATURES.map((f, i) => <FeatLine key={i}>{f}</FeatLine>)}
              </div>
            </div>
          </div>
        </div>
        <p data-lp-reveal className="eyebrow" style={{ color: "var(--text-muted)", textAlign: "center", marginTop: 28, letterSpacing: "var(--tracking-wide)" }}>
          14-day free trial · no card required · cancel in one click
        </p>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="lp-section lp-sec-pad" style={{ background: "var(--bg-base)", borderTop: "1px solid var(--border-subtle)" }}>
      <div className="lp-wrap-narrow">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div data-lp-reveal className="lp-eyebrow lp-center" style={{ marginBottom: 18 }}>QUESTIONS</div>
          <h2 data-lp-reveal className="lp-h-section">Good to know</h2>
        </div>
        <div data-lp-reveal>
          {FAQS.map((f, i) => (
            <div key={i} className={`lp-faq-item${open === i ? " open" : ""}`}>
              <button className="lp-faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                {f.q}
                <span className="chev"><ChevronRight size={20} /></span>
              </button>
              <div className="lp-faq-a"><div className="lp-faq-a-inner">{f.a}</div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCTA() {
  const [ref, seen] = useInView(0.3);
  return (
    <section className="lp-section lp-sec-pad">
      <div className="lp-wrap">
        <div className="lp-final-cta atlas-topo" ref={ref} data-lp-reveal style={{ border: "1px solid var(--border-default)", boxShadow: "var(--shadow-lg)" }}>
          <svg viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true"
            style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: 120, opacity: 0.7 }}>
            <path d="M 0 110 C 120 96 150 60 250 54 C 350 48 380 30 460 26 C 520 23 560 14 600 8"
              fill="none" stroke="var(--gold-500)" strokeWidth="2.5" strokeLinecap="round"
              style={seen
                ? { strokeDasharray: "760", strokeDashoffset: "0", transition: "stroke-dashoffset 2.4s var(--ease-in-out)" }
                : { strokeDasharray: "760", strokeDashoffset: "760" }} />
            <g transform="translate(600,8)" opacity={seen ? 1 : 0} style={{ transition: "opacity .4s ease 2s" }}>
              <path d="M -2 0 L -2 -26 L 16 -20 L -2 -14" fill="var(--gold-500)" stroke="var(--gold-300)" strokeWidth="1.5" strokeLinejoin="round" />
            </g>
          </svg>
          <div style={{ position: "relative" }}>
            <div className="lp-eyebrow lp-center" style={{ justifyContent: "center", marginBottom: 20 }}>THE GAP IS WAITING TO BE CLOSED</div>
            <h2 className="lp-h-section" style={{ fontSize: "clamp(32px, 5vw, 56px)", marginBottom: 20 }}>Start your Atlas today</h2>
            <p className="lp-lead" style={{ maxWidth: 520, margin: "0 auto 32px" }}>
              Connect a source and watch years of adventures turn into one record you'll want to complete.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link className="lp-btn lp-btn-lg lp-btn-primary" to="/signup">Start free</Link>
              <a className="lp-btn lp-btn-lg lp-btn-secondary" href="#pricing">See Pro plans</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

const FOOTER_COLS = [
  { h: "PRODUCT", links: ["Features", "Collections", "Achievements", "Coverage maps", "Outdoor Score"] },
  { h: "SOURCES", links: ["Strava", "Garmin", "Komoot", "AllTrails", "GPX import"] },
  { h: "COMPANY", links: ["About", "Journal", "Careers", "Press kit", "Contact"] },
];

function Footer({ theme }: { theme: string }) {
  return (
    <footer className="lp-footer">
      <div className="lp-wrap" style={{ padding: "64px 32px 36px" }}>
        <div className="lp-footer-grid">
          <div className="lp-footer-col">
            <img src={theme === "light" ? "/atlas-logo-ink.svg" : "/atlas-logo.svg"} alt="Atlas" style={{ height: 26, marginBottom: 18 }} />
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.6, maxWidth: 280 }}>
              A lifetime record and a trophy case for everything you've explored. Not a tracker — a celebration.
            </p>
            <div className="eyebrow" style={{ marginTop: 20 }}>54.4609° N · 3.0886° W</div>
          </div>
          {FOOTER_COLS.map((c) => (
            <div className="lp-footer-col" key={c.h}>
              <h5>{c.h}</h5>
              {c.links.map((l) => <a className="lp-footer-link" href="#" key={l}>{l}</a>)}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginTop: 48, paddingTop: 28, borderTop: "1px solid var(--border-subtle)" }}>
          <div className="eyebrow" style={{ color: "var(--text-muted)" }}>© 2026 ATLAS · MADE FOR THE LONG GAME</div>
          <div style={{ display: "flex", gap: 22 }}>
            <a className="lp-footer-link" href="#">Privacy</a>
            <a className="lp-footer-link" href="#">Terms</a>
            <a className="lp-footer-link" href="#">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("atlas-theme") || "dark"; } catch { return "dark"; }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("atlas-theme", theme); } catch { /* noop */ }
  }, [theme]);

  useScrollReveal();

  return (
    <>
      <Nav theme={theme} toggleTheme={() => setTheme((t) => t === "dark" ? "light" : "dark")} />
      <Hero />
      <SourceBand />
      <StatBand />
      <Features />
      <Coverage />
      <HowItWorks />
      <AchievementsSection />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer theme={theme} />
    </>
  );
}
