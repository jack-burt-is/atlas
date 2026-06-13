/* Atlas LP — how it works, achievements showcase, testimonials. */
(function () {
const DS = window.AtlasDesignSystem_e1d28e;
const { Icon, AchievementBadge, Badge } = DS;
const LP = window.AtlasLP;

/* ---------------- how it works ---------------- */
function RouteTrail() {
  const bandRef = React.useRef(null);
  const pathRef = React.useRef(null);
  const markerRef = React.useRef(null);
  const flagRef = React.useRef(null);
  const nodeRefs = React.useRef([]);
  const nodes = [{ x: 174, y: 86 }, { x: 550, y: 70 }, { x: 926, y: 44 }];
  const d = "M 40 102 C 100 98 140 90 174 86 C 280 80 360 94 470 90 C 520 88 510 74 550 70 C 660 64 720 82 820 72 C 880 66 900 52 926 44 C 985 38 1015 30 1060 24";

  React.useEffect(() => {
    const path = pathRef.current, band = bandRef.current;
    if (!path || !band) return;
    const L = path.getTotalLength();
    path.style.strokeDasharray = L;
    const fracs = nodes.map((n) => {
      let best = 0, bd = 1e9;
      for (let s = 0; s <= 120; s++) { const pt = path.getPointAtLength((L * s) / 120); const dd = Math.abs(pt.x - n.x); if (dd < bd) { bd = dd; best = s / 120; } }
      return best;
    });
    const draw = (p) => {
      path.style.strokeDashoffset = L * (1 - p);
      if (markerRef.current) {
        const pt = path.getPointAtLength(L * Math.max(0.001, Math.min(1, p)));
        markerRef.current.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
        markerRef.current.style.opacity = (p > 0.015 && p < 0.99) ? 1 : 0;
      }
      nodeRefs.current.forEach((el, i) => { if (el) el.classList.toggle('on', p >= fracs[i] - 0.005); });
      if (flagRef.current) flagRef.current.style.opacity = p > 0.9 ? 1 : 0;
    };
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { draw(1); return; }
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const rect = band.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        const p = Math.max(0, Math.min(1, (vh * 0.82 - rect.top) / (vh * 0.6)));
        draw(p);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="route-band" ref={bandRef} aria-hidden="true">
      <svg viewBox="0 0 1100 124" preserveAspectRatio="none">
        <path className="route-line-bg" d={d} />
        <path className="route-line" ref={pathRef} d={d} />
        {nodes.map((n, i) => (
          <g className="route-node" key={i} ref={(el) => (nodeRefs.current[i] = el)} transform={`translate(${n.x}, ${n.y})`}>
            <circle className="ring" r="9" />
            <circle className="core" r="3.5" />
          </g>
        ))}
        <g className="route-flag" ref={flagRef} transform="translate(1060, 24)">
          <line x1="0" y1="0" x2="0" y2="-30" stroke="var(--gold-300)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 0 -30 L 20 -25 L 0 -19 Z" fill="var(--gold-500)" />
        </g>
        <g className="route-marker" ref={markerRef}>
          <circle className="pulse" r="6" />
          <circle className="hub" r="6" />
        </g>
      </svg>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="sec-pad" style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="wrap">
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 44px' }}>
          <div data-reveal className="lp-eyebrow center" style={{ marginBottom: 18 }}>HOW IT WORKS</div>
          <h2 data-reveal className="h-section" style={{ marginBottom: 18 }}>Three steps to a complete record</h2>
          <p data-reveal className="lead">No new app to carry up the hill. Atlas works with the history you've already got — follow the route.</p>
        </div>
        <RouteTrail />
        <div className="steps">
          {LP.steps.map((s, i) => (
            <div className="step lp-card hoverable" key={i} data-reveal style={{ transitionDelay: `${i * 0.08}s`, background: 'var(--surface-card)' }}>
              <div className="step-num">{s.n}</div>
              <div className="step-ico"><Icon name={s.icon} size={24} /></div>
              <h3 style={{ font: 'var(--type-h3)', marginBottom: 10 }}>{s.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)', fontSize: 'var(--text-base)' }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- achievements showcase ---------------- */
function tierIcon(name) { return <Icon name={name} size={22} />; }

function Achievements() {
  const [ref, seen] = useInView({ threshold: 0.2 });
  return (
    <section id="achievements" className="sec-pad">
      <div className="wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 48 }}>
          <div style={{ maxWidth: 560 }}>
            <div data-reveal className="lp-eyebrow" style={{ marginBottom: 18 }}>ACHIEVEMENTS</div>
            <h2 data-reveal className="h-section" style={{ marginBottom: 18 }}>A trophy case that pays out</h2>
            <p data-reveal className="lead">Evocative, earned achievements — never grind-y noise. Each is worth points toward your Outdoor Score, and the rarer the tier, the bigger the haul.</p>
          </div>
          <div data-reveal style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Badge variant="bronze">BRONZE</Badge>
            <Badge variant="silver">SILVER</Badge>
            <Badge variant="gold">GOLD</Badge>
            <Badge variant="platinum">PLATINUM ★</Badge>
          </div>
        </div>
        <div className="ach-grid" ref={ref}>
          {LP.achievements.map((a, i) => (
            <div key={a.title} data-reveal style={{ transitionDelay: `${(i % 3) * 0.07}s` }}>
              {seen && (
                <AchievementBadge
                  title={a.title} description={a.description} tier={a.tier}
                  points={a.points} unlocked={a.unlocked}
                  progress={a.progress || null}
                  icon={tierIcon(a.icon)} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- testimonials ---------------- */
function Testimonials() {
  return (
    <section className="sec-pad" style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="wrap">
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 56px' }}>
          <div data-reveal className="lp-eyebrow center" style={{ marginBottom: 18 }}>FROM THE TRAILHEAD</div>
          <h2 data-reveal className="h-section">Explorers can't put it down</h2>
        </div>
        <div className="quote-grid">
          {LP.quotes.map((q, i) => (
            <div key={q.name} className="lp-card quote-card hoverable" data-reveal style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="quote-mark">&ldquo;</div>
              <p className="quote-body">{q.body}</p>
              <div className="quote-who">
                <span className="quote-avatar" style={{ background: q.color }}>{q.initials}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{q.name}</div>
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

Object.assign(window, { LPHow: HowItWorks, LPAchievements: Achievements, LPTestimonials: Testimonials });
})();
