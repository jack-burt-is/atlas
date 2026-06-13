/* Atlas LP — pricing, FAQ, final CTA, footer. */
(function () {
const DS = window.AtlasDesignSystem_e1d28e;
const { Icon, Badge } = DS;
const LP = window.AtlasLP;

/* ---------------- pricing ---------------- */
function Pricing() {
  const [annual, setAnnual] = React.useState(true);
  const monthly = 8;
  const annualPerMo = 6;
  const price = annual ? annualPerMo : monthly;

  const FeatLine = ({ children, off }) => (
    <div className={`price-feat${off ? ' off' : ''}`}>
      <span className="tick"><Icon name={off ? 'minus' : 'check'} size={16} /></span>
      <span>{children}</span>
    </div>
  );

  return (
    <section id="pricing" className="sec-pad">
      <div className="wrap">
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 40px' }}>
          <div data-reveal className="lp-eyebrow center" style={{ marginBottom: 18 }}>PRICING</div>
          <h2 data-reveal className="h-section" style={{ marginBottom: 18 }}>Start free. Go Pro when you're hooked.</h2>
          <p data-reveal className="lead">One simple plan. Everything Atlas can do, for less than a coffee a month.</p>
        </div>

        <div data-reveal style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div className="price-toggle" role="group" aria-label="Billing period">
            <button className={!annual ? 'active' : ''} onClick={() => setAnnual(false)}>Monthly</button>
            <button className={annual ? 'active' : ''} onClick={() => setAnnual(true)}>
              Annual <Badge variant="success" style={{ marginLeft: 2 }}>SAVE 25%</Badge>
            </button>
          </div>
        </div>

        <div className="price-grid">
          {/* Free */}
          <div className="lp-card price-card" data-reveal>
            <div className="eyebrow" style={{ marginBottom: 12 }}>BASE CAMP</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span className="price-amt" style={{ fontSize: 44 }}>Free</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: '12px 0 24px', lineHeight: 1.5 }}>
              For getting your history in and seeing your first collections fill.
            </p>
            <a className="btn btn-md btn-secondary" href="#" style={{ width: '100%' }}>Create free account</a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 28 }}>
              {LP.freeFeatures.map((f, i) => typeof f === 'string'
                ? <FeatLine key={i}>{f}</FeatLine>
                : <FeatLine key={i} off>{f.t}</FeatLine>)}
            </div>
          </div>

          {/* Pro */}
          <div className="lp-card price-card pro" data-reveal style={{ transitionDelay: '.08s', background: 'var(--surface-card)' }}>
            <div className="atlas-topo" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="eyebrow" style={{ color: 'var(--gold-400)' }}>ATLAS PRO</div>
                <Badge variant="gold" dot>MOST POPULAR</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="price-amt atlas-gold-text">${price}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }}>/ month</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: '12px 0 24px', lineHeight: 1.5 }}>
                {annual ? `Billed annually at $${annualPerMo * 12} — 25% off the monthly price.` : 'Billed monthly. Switch to annual any time to save 25%.'}
              </p>
              <a className="btn btn-md btn-primary" href="#" style={{ width: '100%' }}>Start 14-day free trial</a>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 28 }}>
                {LP.proFeatures.map((f, i) => <FeatLine key={i}>{f}</FeatLine>)}
              </div>
            </div>
          </div>
        </div>
        <p data-reveal className="eyebrow muted" style={{ textAlign: 'center', marginTop: 28, letterSpacing: 'var(--tracking-wide)' }}>
          14-day free trial · no card required · cancel in one click
        </p>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function FAQ() {
  const [open, setOpen] = React.useState(0);
  return (
    <section className="sec-pad" style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="wrap-narrow">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div data-reveal className="lp-eyebrow center" style={{ marginBottom: 18 }}>QUESTIONS</div>
          <h2 data-reveal className="h-section">Good to know</h2>
        </div>
        <div data-reveal>
          {LP.faqs.map((f, i) => (
            <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                {f.q}
                <span className="chev"><Icon name="chevron-right" size={20} /></span>
              </button>
              <div className="faq-a"><div className="faq-a-inner">{f.a}</div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- final CTA ---------------- */
function FinalCTA() {
  const [ref, seen] = useInView({ threshold: 0.3 });
  return (
    <section className="sec-pad">
      <div className="wrap">
        <div className="final-cta atlas-topo" ref={ref} data-reveal style={{ border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)' }}>
          <svg viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true"
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 120, opacity: 0.7 }}>
            <path d="M 0 110 C 120 96 150 60 250 54 C 350 48 380 30 460 26 C 520 23 560 14 600 8"
              fill="none" stroke="var(--gold-500)" strokeWidth="2.5" strokeLinecap="round"
              style={ seen ? { strokeDasharray: 760, strokeDashoffset: 0, transition: 'stroke-dashoffset 2.4s var(--ease-in-out)' } : { strokeDasharray: 760, strokeDashoffset: 760 }} />
            <g transform="translate(600,8)" opacity={seen ? 1 : 0} style={{ transition: 'opacity .4s ease 2s' }}>
              <path d="M -2 0 L -2 -26 L 16 -20 L -2 -14" fill="var(--gold-500)" stroke="var(--gold-300)" strokeWidth="1.5" strokeLinejoin="round" />
            </g>
          </svg>
          <div style={{ position: 'relative' }}>
            <div className="lp-eyebrow center" style={{ justifyContent: 'center', marginBottom: 20 }}>THE GAP IS WAITING TO BE CLOSED</div>
            <h2 className="h-section" style={{ fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: 20 }}>
              Start your Atlas today
            </h2>
            <p className="lead" style={{ maxWidth: 520, margin: '0 auto 32px' }}>
              Connect a source and watch years of adventures turn into one record you'll want to complete.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a className="btn btn-lg btn-primary" href="#">Start free</a>
              <a className="btn btn-lg btn-secondary" href="#pricing">See Pro plans</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- footer ---------------- */
function Footer({ theme }) {
  const cols = [
    { h: 'PRODUCT', links: ['Features', 'Collections', 'Achievements', 'Coverage maps', 'Outdoor Score'] },
    { h: 'SOURCES', links: ['Strava', 'Garmin', 'Komoot', 'AllTrails', 'GPX import'] },
    { h: 'COMPANY', links: ['About', 'Journal', 'Careers', 'Press kit', 'Contact'] },
  ];
  return (
    <footer className="footer">
      <div className="wrap" style={{ padding: '64px 32px 36px' }}>
        <div className="footer-grid">
          <div className="footer-col">
            <img src={theme === 'light' ? '../assets/atlas-logo-ink.svg' : '../assets/atlas-logo.svg'} alt="Atlas" style={{ height: 26, marginBottom: 18 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6, maxWidth: 280 }}>
              A lifetime record and a trophy case for everything you've explored. Not a tracker — a celebration.
            </p>
            <div className="eyebrow" style={{ marginTop: 20 }}>54.4609° N · 3.0886° W</div>
          </div>
          {cols.map((c) => (
            <div className="footer-col" key={c.h}>
              <h5>{c.h}</h5>
              {c.links.map((l) => <a className="footer-link" href="#" key={l}>{l}</a>)}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginTop: 48, paddingTop: 28, borderTop: '1px solid var(--border-subtle)' }}>
          <div className="eyebrow muted">© 2026 ATLAS · MADE FOR THE LONG GAME</div>
          <div style={{ display: 'flex', gap: 22 }}>
            <a className="footer-link" href="#">Privacy</a>
            <a className="footer-link" href="#">Terms</a>
            <a className="footer-link" href="#">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { LPPricing: Pricing, LPFAQ: FAQ, LPFinalCTA: FinalCTA, LPFooter: Footer });
})();
