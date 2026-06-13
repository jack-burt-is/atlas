/* Atlas web · shared chrome (sidebar + topbar) and data re-use.
   Exports to window: AtlasWebShell, AtlasPanel */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const { Icon, Avatar, Badge } = DS;

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'map', label: 'Exploration Map', icon: 'map' },
    { id: 'collections', label: 'Collections', icon: 'layout-grid' },
    { id: 'regions', label: 'Regions', icon: 'mountain-snow' },
    { id: 'achievements', label: 'Achievements', icon: 'trophy' },
  ];
  const NAV2 = [
    { id: 'stats', label: 'Statistics', icon: 'bar-chart-3' },
    { id: 'sources', label: 'Connected sources', icon: 'plug' },
  ];

  function NavItem({ item, active, onClick }) {
    const on = active === item.id;
    return (
      <button onClick={() => onClick(item.id)} style={{
        display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left',
        padding: '9px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
        border: '1px solid ' + (on ? 'var(--border-gold)' : 'transparent'),
        background: on ? 'var(--accent-soft)' : 'transparent',
        color: on ? 'var(--text-accent)' : 'var(--text-secondary)',
        font: 'var(--type-body-sm)', fontWeight: on ? 600 : 500, fontSize: 14,
        transition: 'var(--t-colors)',
      }}
        onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'var(--surface-raised)'; }}
        onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}
      >
        <Icon name={item.icon} size={18} strokeWidth={on ? 2.3 : 2} />
        {item.label}
      </button>
    );
  }

  function AtlasWebShell({ active, onNav, children }) {
    const { user } = window.AtlasData;
    return (
      <div style={{ display: 'flex', height: '100%', background: 'var(--bg-app)' }}>
        {/* Sidebar */}
        <aside style={{
          width: 250, flex: '0 0 250px', borderRight: '1px solid var(--border-subtle)',
          background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', padding: '20px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 22px' }}>
            <img src="../../assets/atlas-mark.svg" height="28" alt="" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '.06em', color: 'var(--text-primary)' }}>ATLAS</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {NAV.map((n) => <NavItem key={n.id} item={n} active={active} onClick={onNav} />)}
          </nav>
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '16px 8px' }} />
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {NAV2.map((n) => <NavItem key={n.id} item={n} active={active} onClick={onNav} />)}
          </nav>

          <div style={{ marginTop: 'auto' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: 10,
              borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
            }}>
              <Avatar src={user.avatar} name={user.name} level={user.level} size={36} ring />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold-400)' }}>{user.score.toLocaleString()} pts</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    );
  }

  function AtlasPanel({ title, action, children, style = {}, bodyStyle = {} }) {
    return (
      <section style={{
        background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm), var(--ring-top)', ...style,
      }}>
        {(title || action) && (
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ font: 'var(--type-h3)', fontSize: 16, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
            {action}
          </header>
        )}
        <div style={{ padding: 18, ...bodyStyle }}>{children}</div>
      </section>
    );
  }

  Object.assign(window, { AtlasWebShell, AtlasPanel });
})();
