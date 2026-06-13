/* Atlas mobile · Home dashboard. Exports window.HomeScreen */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const { Icon, ScoreMeter, HeatGrid, CollectionCard, Card, Badge, StatBlock } = DS;

  function SuggestionRow({ s, onGo }) {
    return (
      <button onClick={onGo} style={{
        display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left',
        background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 13, cursor: 'pointer',
        boxShadow: 'var(--shadow-sm), var(--ring-top)',
      }}>
        <span style={{
          flex: '0 0 auto', width: 44, height: 44, borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--accent-soft)', color: 'var(--gold-400)', border: '1px solid var(--border-gold)',
        }}><Icon name={s.icon} size={22} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', font: 'var(--type-label)', fontSize: 15, color: 'var(--text-primary)' }}>{s.title}</span>
          <span style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{s.detail}</span>
          <span className="eyebrow" style={{ fontSize: 10, marginTop: 4, display: 'block' }}>{s.meta}</span>
        </span>
        <Badge variant="gold">{s.tag}</Badge>
      </button>
    );
  }

  function HomeScreen({ go }) {
    const { user, collections, suggestions } = window.AtlasData;
    const M = (n, s) => <Icon name={n} size={s} />;
    return (
      <div style={{ paddingTop: 4 }}>
        <window.AtlasMobileHeader
          eyebrow={`Good morning · ${user.home}`}
          title="Your Atlas"
          right={<DS.Avatar src={user.avatar} name={user.name} level={user.level} ring />}
        />

        <div style={{ padding: '0 20px', marginBottom: 22 }}>
          <ScoreMeter score={user.score} level={user.level} levelProgress={user.levelProgress} toNext={user.toNext} />
        </div>

        <div style={{ padding: '0 20px', marginBottom: 26, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[['Summits', user.summits, 'mountain'], ['Distance', user.distanceKm.toLocaleString(), 'route'], ['Days out', user.daysOut, 'sun']].map(([l, v, ic]) => (
            <Card key={l} pad="sm" style={{ textAlign: 'center' }}>
              <StatBlock align="center" size="sm" label={l} value={v} icon={M(ic, 12)} />
            </Card>
          ))}
        </div>

        <window.AtlasSection title="This year" action="Stats" onAction={() => go('profile')}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>186 days outdoors</span>
              <span className="eyebrow" style={{ fontSize: 10 }}>Last 30 weeks</span>
            </div>
            <HeatGrid columns={15} rows={7} cell={14} gap={4} />
          </Card>
        </window.AtlasSection>

        <window.AtlasSection title="Suggested next" action="More" onAction={() => go('explore')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {suggestions.map((s) => <SuggestionRow key={s.title} s={s} onGo={() => go('explore')} />)}
          </div>
        </window.AtlasSection>

        <window.AtlasSection title="Close to complete" action="All" onAction={() => go('collections')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {collections.filter((c) => c.value < c.max && c.value / c.max > 0.5).slice(0, 2).map((c) => (
              <CollectionCard key={c.id} title={c.title} type={c.type} value={c.value} max={c.max} image={c.img} icon={M(c.icon, 26)} onClick={() => go('collections', c.id)} />
            ))}
          </div>
        </window.AtlasSection>
      </div>
    );
  }

  window.HomeScreen = HomeScreen;
})();
