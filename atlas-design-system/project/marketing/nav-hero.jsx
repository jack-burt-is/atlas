/* Atlas LP — Nav, Hero, and the "works with" source band. */
(function () {
const DS = window.AtlasDesignSystem_e1d28e;
const { Icon, ScoreMeter, StatBlock, HeatGrid, Badge } = DS;

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Achievements', href: '#achievements' },
  { label: 'Pricing', href: '#pricing' },
];

function Nav({ theme, toggleTheme }) {
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
          <img src={theme === 'light' ? '../assets/atlas-logo-ink.svg' : '../assets/atlas-logo.svg'}
            alt="Atlas" style={{ height: 26 }} />
        </a>
        <div className="nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.label} className="nav-link" href={l.href}>{l.label}</a>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle appearance" title="Toggle appearance">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
          </button>
          <a className="btn btn-sm btn-ghost" href="#" style={{ }}>Sign in</a>
          <a className="btn btn-sm btn-primary" href="#pricing">Get Atlas Pro</a>
        </div>
      </div>
    </nav>
  );
}

function HeroPreview() {
  const [ref, seen] = useInView({ threshold: 0.25 });
  // a curated heat pattern (0–4) for the mini coverage strip
  const heat = React.useMemo(() => {
    const r = window.AtlasLP.mulberry32(7);
    return Array.from({ length: 7 * 22 }, () => {
      const v = r();
      return v > 0.82 ? 4 : v > 0.66 ? 3 : v > 0.46 ? 2 : v > 0.26 ? 1 : 0;
    });
  }, []);
  return (
    <div ref={ref} className="atlas-glass" style={{
      borderRadius: 'var(--radius-2xl)', padding: 24, display: 'grid',
      gridTemplateColumns: 'auto 1px 1fr', gap: 26, alignItems: 'center',
      boxShadow: 'var(--shadow-lg), var(--ring-top)', maxWidth: 860, margin: '0 auto',
    }}>
      <div style={{ padding: '4px 8px' }}>
        {seen && <ScoreMeter score={14820} level={27} levelProgress={64} />}
      </div>
      <div style={{ alignSelf: 'stretch', background: 'var(--border-subtle)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
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

function Hero({ theme }) {
  return (
    <header className="hero sec-pad" id="top" style={{ paddingTop: 96, paddingBottom: 60, minHeight: '92vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Ridgelines theme={theme} />
      <div className="hero-fade" />
      <div className="wrap hero-content" style={{ width: '100%' }}>
        <div style={{ maxWidth: 760, margin: '0 auto 56px', textAlign: 'center' }}>
          <div data-reveal className="lp-eyebrow center" style={{ marginBottom: 22 }}>YOUR LIFETIME EXPLORATION RECORD</div>
          <h1 data-reveal className="h-display" style={{ fontSize: 'clamp(44px, 7vw, 86px)', marginBottom: 22, transitionDelay: '.05s' }}>
            Every summit, every trail —<br /><span className="atlas-gold-text">collected.</span>
          </h1>
          <p data-reveal className="lead" style={{ maxWidth: 560, margin: '0 auto', fontSize: 'var(--text-xl)', transitionDelay: '.1s' }}>
            Atlas turns the activities you've already logged into collections, achievements and coverage maps. Not a route planner — a trophy case for a lifetime outdoors.
          </p>
          <div data-reveal style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 34, flexWrap: 'wrap', transitionDelay: '.15s' }}>
            <a className="btn btn-lg btn-primary" href="#pricing">Start your Atlas</a>
            <a className="btn btn-lg btn-secondary" href="#how"><Icon name="play" size={16} /> See how it works</a>
          </div>
          <div data-reveal className="eyebrow" style={{ marginTop: 22, transitionDelay: '.2s' }}>FREE TO START · NO ACTIVITY TRACKING · CANCEL ANYTIME</div>
        </div>
        <div data-reveal style={{ transitionDelay: '.1s' }}><HeroPreview /></div>
      </div>
    </header>
  );
}

function SourceBand() {
  const sources = window.AtlasLP.sources;
  return (
    <section className="sec-pad-sm" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <div className="wrap" style={{ textAlign: 'center' }}>
        <div data-reveal className="eyebrow" style={{ marginBottom: 26 }}>WORKS WITH WHAT YOU ALREADY USE</div>
        <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
          {sources.map((s) => (
            <div key={s.name} className="source-chip">
              <span className="source-dot" style={{ background: s.color }} />
              {s.name}
            </div>
          ))}
        </div>
        <p data-reveal className="eyebrow muted" style={{ marginTop: 24, letterSpacing: 'var(--tracking-wide)' }}>
          read-only · we never post, edit or track
        </p>
      </div>
    </section>
  );
}

Object.assign(window, { LPNav: Nav, LPHero: Hero, LPSourceBand: SourceBand });
})();
