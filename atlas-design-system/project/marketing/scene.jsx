/* Atlas LP — shared hooks + the parallax ridgeline hero scene. */
const LP = window.AtlasLP;

/* ---- count-up that fires when in view ---- */
function useCountUp(target, active, duration = 1700) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVal(target); return; }
    let raf, start;
    const tick = (t) => {
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

/* ---- fires once when element scrolls into view ---- */
function useInView(opts = {}) {
  const ref = React.useRef(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } });
    }, { threshold: opts.threshold ?? 0.3, rootMargin: opts.rootMargin ?? '0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

function compactNum(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e5 ? 0 : 0) + 'K';
  return Math.round(n).toLocaleString();
}

/* ============================================================
   RIDGELINES — layered parallax mountain scene
   ============================================================ */
function Ridgelines({ theme }) {
  const W = 1600, H = 760, floor = H + 300;
  const sceneRef = React.useRef(null);
  const layerRefs = React.useRef([]);
  const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // palette per theme — base ink scale doesn't remap in light mode, so we branch
  const pal = theme === 'light'
    ? ['#C4D0DA', '#A7B7C4', '#8AA0AE', '#3f7d5b']
    : ['#1c2a36', '#16222d', '#111a23', '#0f2a22'];
  const pineFill = theme === 'light' ? '#2f6f4f' : '#0c2620';
  const pineStroke = theme === 'light' ? '#3f7d5b' : '#16463a';
  const glow = theme === 'light' ? 'rgba(224,160,38,0.30)' : 'rgba(244,183,64,0.42)';
  const sunX = 1060;

  // ridge layers: [baseY, amp, rough, seed, depthX, depthY]
  const layers = [
    { base: 360, amp: 78,  rough: 0.5, seed: 11, dx: 10, dy: -0.018, fill: pal[0] },
    { base: 470, amp: 104, rough: 0.6, seed: 27, dx: 20, dy: -0.04,  fill: pal[1] },
    { base: 560, amp: 120, rough: 0.7, seed: 41, dx: 34, dy: -0.07,  fill: pal[2] },
  ];
  const fgPts = LP.ridgePoints(W, 650, 96, 0.55, 73, 30);
  const fgPath = LP.pathFromPoints(fgPts, W, floor);

  // pine positions: pick crest points across the foreground ridge
  const pines = fgPts.filter((_, i) => i % 2 === 0).map(([x, y], i) => ({ x, y, s: 0.8 + ((i * 37) % 100) / 140 }));

  React.useEffect(() => {
    if (reduced) return;
    let mx = 0, my = 0, sy = 0, raf;
    const apply = () => {
      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        const L = layers[i] || { dx: 44, dy: -0.10 };
        const tx = mx * (L.dx || 0);
        const ty = sy * (L.dy || 0);
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });
      // foreground (last ref) moves most
      const fg = layerRefs.current[layers.length];
      if (fg) fg.style.transform = `translate3d(${mx * 50}px, ${sy * -0.09}px, 0)`;
      raf = null;
    };
    const onMove = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5);
      my = (e.clientY / window.innerHeight - 0.5);
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onScroll = () => { sy = window.scrollY; if (!raf) raf = requestAnimationFrame(apply); };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [theme]);

  const stars = Array.from({ length: 22 }, (_, i) => {
    const r = LP.mulberry32(i * 99 + 3);
    return { x: 80 + r() * (W - 160), y: 30 + r() * 230, rad: 0.8 + r() * 1.6, d: (i % 5) * 0.7 };
  });

  return (
    <div className="hero-scene" ref={sceneRef} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient id="lp-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={glow} />
            <stop offset="45%" stopColor={glow} stopOpacity="0.5" />
            <stop offset="100%" stopColor={glow} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lp-disc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold-300)" />
            <stop offset="100%" stopColor="var(--gold-600)" />
          </linearGradient>
        </defs>

        {/* sky glow + summit disc */}
        <rect x={W * 0.5} y="40" width="640" height="640" fill="url(#lp-sun)" transform={`translate(${-320}, 0)`} />
        <circle cx={sunX} cy="170" r="46" fill="url(#lp-disc)" opacity={theme === 'light' ? 0.85 : 0.92} />

        {/* stars / twinkle */}
        {theme !== 'light' && stars.map((s, i) => (
          <circle key={i} className="twinkle" cx={s.x} cy={s.y} r={s.rad} fill="var(--ink-100)" style={{ animationDelay: `${s.d}s` }} />
        ))}

        {/* distant ridges */}
        {layers.map((L, i) => (
          <g className="ridge" key={i} ref={(el) => (layerRefs.current[i] = el)}>
            <path d={LP.ridgePath(W, L.base, L.amp, L.rough, L.seed, floor)} fill={L.fill} />
          </g>
        ))}

        {/* foreground ridge + pines (moves most) */}
        <g className="ridge" ref={(el) => (layerRefs.current[layers.length] = el)}>
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

Object.assign(window, { useCountUp, useInView, compactNum, Ridgelines });
