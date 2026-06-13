/* Atlas LP — live stat band, feature deep-dives, and the green coverage section. */
(function () {
const DS = window.AtlasDesignSystem_e1d28e;
const { Icon, CollectionCard, ScoreMeter, ProgressRing, ProgressBar, HeatGrid, StatBlock, Badge } = DS;
const LP = window.AtlasLP;

/* ---------------- live stat band ---------------- */
function StatCell({ s }) {
  const [ref, seen] = useInView({ threshold: 0.5 });
  const v = useCountUp(s.to, seen, 1800);
  return (
    <div className="stat-cell" ref={ref}>
      <div className="stat-num" style={{ color: s.color }}>{compactNum(v)}</div>
      <div className="eyebrow" style={{ marginTop: 10 }}>{s.label}</div>
    </div>
  );
}
function StatBand() {
  return (
    <section className="stat-band">
      <div className="wrap"><div className="stat-grid">
        {LP.stats.map((s) => <StatCell key={s.label} s={s} />)}
      </div></div>
    </section>
  );
}

/* ---------------- feature row scaffold ---------------- */
function FeatureRow({ flip, eyebrow, title, body, bullets, children }) {
  return (
    <div className={`feat-row${flip ? ' flip' : ''}`}>
      <div className="feat-text" data-reveal>
        <div className="lp-eyebrow" style={{ marginBottom: 16 }}>{eyebrow}</div>
        <h2 className="h-section" style={{ marginBottom: 18 }}>{title}</h2>
        <p className="lead">{body}</p>
        {bullets && (
          <div className="feat-bullets">
            {bullets.map((b, i) => (
              <div className="feat-bullet" key={i}>
                <span className="tick"><Icon name="check" size={13} /></span>{b}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="feat-visual" data-reveal style={{ transitionDelay: '.08s' }}>{children}</div>
    </div>
  );
}

function CollectionsVisual() {
  const [ref, seen] = useInView({ threshold: 0.3 });
  return (
    <div ref={ref} className="lp-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--surface-sunken)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 6px 8px' }}>
        <div className="eyebrow">YOUR COLLECTIONS</div>
        <Badge variant="gold" dot>4 ACTIVE</Badge>
      </div>
      {seen && LP.collections.map((c) => (
        <CollectionCard key={c.title} title={c.title} type={c.type} value={c.value} max={c.max}
          icon={<Icon name={c.icon} size={22} />} />
      ))}
    </div>
  );
}

function ScoreVisual() {
  const [ref, seen] = useInView({ threshold: 0.35 });
  return (
    <div ref={ref} className="lp-card" style={{ padding: 32, background: 'var(--surface-sunken)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        {seen && <ScoreMeter score={14820} level={27} levelProgress={64} />}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {seen && <ProgressRing value={92} max={240} size={84} stroke={8} color="gold" showValue={false}>
            <div style={{ font: 'var(--type-stat)', fontSize: 22 }}>92</div>
          </ProgressRing>}
          <div className="eyebrow">ACHIEVEMENTS</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {seen && <ProgressRing value={68} max={100} size={84} stroke={8} color="spruce" />}
          <div className="eyebrow">EXPLORED</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {seen && <ProgressRing value={156} max={214} size={84} stroke={8} color="sky" showValue={false}>
            <div style={{ font: 'var(--type-stat)', fontSize: 18 }}>73%</div>
          </ProgressRing>}
          <div className="eyebrow">WAINWRIGHTS</div>
        </div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="sec-pad">
      <div className="wrap">
        <div style={{ textAlign: 'center', maxWidth: 660, margin: '0 auto 80px' }}>
          <div data-reveal className="lp-eyebrow center" style={{ marginBottom: 18 }}>WHAT ATLAS DOES</div>
          <h2 data-reveal className="h-section" style={{ marginBottom: 18 }}>A Pokédex for the great outdoors</h2>
          <p data-reveal className="lead">Four ways Atlas turns scattered activity files into something you're proud of — and itch to complete.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 120 }}>
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

/* ---------------- green coverage section ---------------- */
function CoverageSection() {
  const [ref, seen] = useInView({ threshold: 0.25 });
  const heat = React.useMemo(() => {
    const r = LP.mulberry32(31);
    return Array.from({ length: 7 * 34 }, () => {
      const v = r();
      return v > 0.8 ? 4 : v > 0.62 ? 3 : v > 0.42 ? 2 : v > 0.22 ? 1 : 0;
    });
  }, []);
  const regions = [
    { name: "Lake District", pct: 68, color: "spruce" },
    { name: "Snowdonia", pct: 41, color: "spruce" },
    { name: "Peak District", pct: 86, color: "spruce" },
    { name: "Cairngorms", pct: 23, color: "sky" },
  ];
  return (
    <section id="coverage" className="coverage sec-pad">
      <div className="coverage-grid-bg" />
      <div className="wrap" style={{ position: 'relative' }}>
        <div className="feat-row">
          <div className="feat-text" data-reveal>
            <div className="lp-eyebrow" style={{ color: 'var(--spruce-400)', marginBottom: 16 }}>COVERAGE</div>
            <h2 className="h-section" style={{ marginBottom: 18 }}>See how much ground you've actually&nbsp;covered</h2>
            <p className="lead">Atlas paints every region you've set foot in as a living coverage map. Watch the green spread as you explore — and feel the pull of the gaps you haven't closed yet.</p>
            <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 18 }} ref={ref}>
              {regions.map((rg) => (
                <div key={rg.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{rg.name}</span>
                    <span className="eyebrow" style={{ color: 'var(--text-secondary)' }}>{rg.pct}% EXPLORED</span>
                  </div>
                  {seen && <ProgressBar value={rg.pct} max={100} color={rg.color} size="md" showValue={false} />}
                </div>
              ))}
            </div>
          </div>
          <div className="feat-visual" data-reveal style={{ transitionDelay: '.08s' }}>
            <div className="lp-card" style={{ padding: 28, background: 'var(--surface-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>LAKE DISTRICT</div>
                  <div style={{ font: 'var(--type-h2)', color: 'var(--text-primary)' }}>
                    <span className="atlas-gold-text" style={{ fontSize: 40 }}>68%</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 16, marginLeft: 8 }}>explored</span>
                  </div>
                </div>
                <Badge variant="success" dot>147 OF 214 FELLS</Badge>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <HeatGrid data={heat} columns={34} rows={7} cell={13} gap={4} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="eyebrow">LESS</span>
                  {[0,1,2,3,4].map((l) => (
                    <span key={l} style={{ width: 13, height: 13, borderRadius: 3, background: `var(--heat-${l})` }} />
                  ))}
                  <span className="eyebrow">MORE</span>
                </div>
                <span className="eyebrow" style={{ color: 'var(--spruce-400)' }}>67 FELLS TO GO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { LPStatBand: StatBand, LPFeatures: FeaturesSection, LPCoverage: CoverageSection });
})();
