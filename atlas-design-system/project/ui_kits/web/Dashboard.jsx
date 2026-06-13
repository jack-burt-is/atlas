/* Atlas web · Dashboard view. Exports window.WebDashboard */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const { Icon, ScoreMeter, HeatGrid, ProgressBar, ProgressRing, CollectionCard, AchievementBadge, StatBlock, Badge, Button } = DS;
  const { AtlasPanel } = window;

  function WebDashboard({ onNav }) {
    const { user, collections, regions, achievements, suggestions } = window.AtlasData;
    const M = (n, s) => <Icon name={n} size={s} />;
    const recent = achievements.filter((a) => a.unlocked);

    return (
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* hero row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ScoreMeter score={user.score} level={user.level} levelProgress={user.levelProgress} toNext={user.toNext} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {[['Summits', user.summits, 'mountain'], ['Distance', user.distanceKm.toLocaleString(), 'route'], ['Days out', user.daysOut, 'sun'], ['Countries', user.countries, 'globe']].map(([l, v, ic]) => (
                <div key={l} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--ring-top)' }}>
                  <StatBlock size="sm" label={l} value={v} icon={M(ic, 12)} />
                </div>
              ))}
            </div>
            <AtlasPanel title="Exploration activity" action={<span className="eyebrow" style={{ fontSize: 10 }}>2024 — 2026</span>}>
              <HeatGrid columns={52} rows={7} cell={11} gap={3} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>Less</span>
                {['--heat-0', '--heat-1', '--heat-2', '--heat-3', '--heat-4'].map((h) => <span key={h} style={{ width: 11, height: 11, borderRadius: 3, background: `var(${h})` }} />)}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>More</span>
              </div>
            </AtlasPanel>
          </div>

          <AtlasPanel title="Next goals" action={<Button variant="ghost" size="sm" onClick={() => onNav('map')}>Open map</Button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {suggestions.map((s) => (
                <div key={s.title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 40, height: 40, flex: '0 0 auto', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-soft)', color: 'var(--gold-400)', border: '1px solid var(--border-gold)' }}><Icon name={s.icon} size={20} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{s.title}</div>
                    <div className="eyebrow" style={{ fontSize: 10, marginTop: 2 }}>{s.meta}</div>
                  </div>
                  <Badge variant="gold">{s.tag}</Badge>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '2px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {regions.slice(0, 3).map((r) => <ProgressBar key={r.id} label={r.name} value={r.pct} />)}
              </div>
            </div>
          </AtlasPanel>
        </div>

        {/* collections + achievements */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <AtlasPanel title="Closest to completion" action={<Button variant="ghost" size="sm" onClick={() => onNav('collections')}>All collections</Button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {collections.filter((c) => c.value < c.max).sort((a, b) => b.value / b.max - a.value / a.max).slice(0, 3).map((c) => (
                <CollectionCard key={c.id} title={c.title} type={c.type} value={c.value} max={c.max} image={c.img} icon={M(c.icon, 26)} />
              ))}
            </div>
          </AtlasPanel>
          <AtlasPanel title="Recent unlocks" action={<Button variant="ghost" size="sm" onClick={() => onNav('achievements')}>Trophy case</Button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recent.slice(0, 3).map((a) => (
                <AchievementBadge key={a.id} title={a.title} description={a.desc} tier={a.tier} points={a.points} unlocked icon={M(a.icon, 24)} />
              ))}
            </div>
          </AtlasPanel>
        </div>
      </div>
    );
  }

  window.WebDashboard = WebDashboard;
})();
