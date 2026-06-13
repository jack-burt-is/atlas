/* Atlas mobile · Profile. Exports window.ProfileScreen */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const { Icon, Avatar, ScoreMeter, HeatGrid, StatBlock, Card, Badge, ProgressBar } = DS;

  function ProfileScreen({ theme = 'dark', setTheme }) {
    const { user, regions, achievements } = window.AtlasData;
    const recent = achievements.filter((a) => a.unlocked).slice(0, 4);
    return (
      <div>
        {/* cover */}
        <div className="atlas-topo" style={{ position: 'relative', padding: '20px 20px 22px', marginBottom: 8, overflow: 'hidden' }}>
          <img src={window.AtlasData.regionHero} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, var(--bg-app) 8%, color-mix(in srgb, var(--bg-app) 62%, transparent) 60%, color-mix(in srgb, var(--bg-app) 40%, transparent) 100%)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar src={user.avatar} name={user.name} size={68} level={user.level} ring />
            <div>
              <h1 style={{ font: 'var(--type-h2)', fontSize: 24, color: 'var(--text-primary)', margin: '0 0 3px' }}>{user.name}</h1>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{user.handle} · {user.home}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px', marginBottom: 22 }}>
          <ScoreMeter score={user.score} level={user.level} levelProgress={user.levelProgress} toNext={user.toNext} />
        </div>

        <div style={{ padding: '0 20px', marginBottom: 26, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[['Summits', user.summits, 'mountain'], ['Distance', `${user.distanceKm.toLocaleString()} km`, 'route'], ['Days out', user.daysOut, 'sun'], ['Countries', user.countries, 'globe']].map(([l, v, ic]) => (
            <Card key={l} pad="sm"><StatBlock size="sm" label={l} value={v} icon={<Icon name={ic} size={12} />} /></Card>
          ))}
        </div>

        <window.AtlasSection title="Activity">
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Lifetime · {user.daysOut} days out</span>
              <span className="eyebrow" style={{ fontSize: 10 }}>2024 — 2026</span>
            </div>
            <HeatGrid columns={15} rows={7} cell={14} gap={4} />
          </Card>
        </window.AtlasSection>

        <window.AtlasSection title="Region progress">
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {regions.map((r) => (
                <ProgressBar key={r.id} label={r.name} value={r.pct} />
              ))}
            </div>
          </Card>
        </window.AtlasSection>

        <window.AtlasSection title="Recent awards">
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {recent.map((a) => (
              <Card key={a.id} emphasis={a.tier === 'gold' || a.tier === 'platinum'} pad="sm" style={{ flex: '0 0 132px', textAlign: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', margin: '2px auto 10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--accent-soft)', color: 'var(--gold-400)', boxShadow: 'var(--glow-gold-sm)',
                }}><Icon name={a.icon} size={22} /></div>
                <div style={{ font: 'var(--type-label)', fontSize: 13, color: 'var(--text-primary)', marginBottom: 6 }}>{a.title}</div>
                <Badge variant={a.tier === 'platinum' ? 'platinum' : a.tier === 'gold' ? 'solid' : a.tier}>{a.points} pts</Badge>
              </Card>
            ))}
          </div>
        </window.AtlasSection>
        <window.AtlasSection title="Preferences">
          <Card pad="sm">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <Icon name="sun-moon" size={18} color="var(--text-muted)" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Appearance</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Choose your map theme</div>
                </div>
              </div>
              <div role="tablist" style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)' }}>
                {[['dark', 'moon'], ['light', 'sun']].map(([id, ic]) => {
                  const on = theme === id;
                  return (
                    <button key={id} onClick={() => setTheme && setTheme(id)} aria-selected={on} style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', cursor: 'pointer',
                      border: 'none', borderRadius: 'var(--radius-pill)', textTransform: 'capitalize',
                      fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
                      background: on ? 'var(--accent)' : 'transparent',
                      color: on ? 'var(--text-on-gold)' : 'var(--text-secondary)',
                      boxShadow: on ? 'var(--glow-gold-sm)' : 'none', transition: 'var(--t-colors)',
                    }}>
                      <Icon name={ic} size={14} strokeWidth={2.2} /> {id}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </window.AtlasSection>
      </div>
    );
  }

  window.ProfileScreen = ProfileScreen;
})();
