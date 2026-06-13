/* Atlas mobile · bottom tab bar + small shared bits.
   Exports to window: AtlasTabBar, AtlasMobileHeader, AtlasSection */
(function () {
  const { Icon } = window.AtlasDesignSystem_e1d28e;

  const TABS = [
    { id: 'home', label: 'Home', icon: 'house' },
    { id: 'explore', label: 'Explore', icon: 'map' },
    { id: 'collections', label: 'Collections', icon: 'layout-grid' },
    { id: 'achievements', label: 'Awards', icon: 'trophy' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ];

  function AtlasTabBar({ active, onChange }) {
    return (
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 30,
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 26px)',
        background: 'linear-gradient(180deg, transparent 0%, var(--bg-app) 60%)',
      }}>
        <div style={{
          margin: '0 14px', height: 64, borderRadius: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          background: 'var(--surface-overlay)', backdropFilter: 'blur(18px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.3)',
          border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)',
        }}>
          {TABS.map((t) => {
            const on = active === t.id;
            return (
              <button key={t.id} onClick={() => onChange(t.id)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
                color: on ? 'var(--gold-400)' : 'var(--text-faint)', flex: 1,
              }}>
                <Icon name={t.icon} size={22} strokeWidth={on ? 2.4 : 2} />
                <span style={{
                  fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: on ? 700 : 500,
                  letterSpacing: '.01em',
                }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function AtlasMobileHeader({ title, eyebrow, right = null }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        padding: '8px 20px 18px', gap: 12,
      }}>
        <div>
          {eyebrow && <div className="eyebrow" style={{ marginBottom: 5 }}>{eyebrow}</div>}
          <h1 style={{ font: 'var(--type-h1)', fontSize: 30, color: 'var(--text-primary)', letterSpacing: '-.02em', margin: 0 }}>{title}</h1>
        </div>
        {right}
      </div>
    );
  }

  function AtlasSection({ title, action, onAction, children, style = {} }) {
    return (
      <section style={{ padding: '0 20px', marginBottom: 26, ...style }}>
        {(title || action) && (
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 13 }}>
            {title && <h2 style={{ font: 'var(--type-h3)', fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>}
            {action && <button onClick={onAction} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--gold-400)',
            }}>{action}</button>}
          </div>
        )}
        {children}
      </section>
    );
  }

  Object.assign(window, { AtlasTabBar, AtlasMobileHeader, AtlasSection });
})();
