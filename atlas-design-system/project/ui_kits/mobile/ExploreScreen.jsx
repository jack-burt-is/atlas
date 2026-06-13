/* Atlas mobile · Explore Map. Exports window.ExploreScreen */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const { Icon, Tag, Badge } = DS;

  // Peak markers positioned over the terrain svg (percentages of the map box)
  const MARKERS = [
    { x: 32, y: 33, got: true, name: 'Helvellyn', m: 950 },
    { x: 68, y: 62, got: true, name: 'Scafell Pike', m: 978 },
    { x: 52, y: 23, got: true, name: 'Skiddaw', m: 931 },
    { x: 43, y: 71, got: false, name: 'Crinkle Crags', m: 859 },
    { x: 82, y: 71, got: false, name: 'Pillar', m: 892 },
    { x: 15, y: 49, got: true, name: 'Catbells', m: 451 },
    { x: 58, y: 45, got: false, name: 'Bowfell', m: 902 },
    { x: 73, y: 30, got: true, name: 'Fairfield', m: 873 },
  ];

  // explored gold route + a faint unexplored route, as % polylines
  const EXPLORED = '15,49 32,33 52,23 73,30';
  const PARTIAL = '32,33 58,45 68,62';
  const UNEXPLORED = '68,62 82,71 43,71';

  function ExploreScreen({ theme = 'dark' }) {
    const [filter, setFilter] = React.useState('peaks');
    const [sel, setSel] = React.useState(MARKERS[1]);
    const mapSrc = theme === 'light' ? '../../assets/map-terrain-light.svg' : '../../assets/map-terrain.svg';

    return (
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Map area */}
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden', background: 'var(--surface-sunken)' }}>
          <img src={mapSrc} alt="" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          }} />

          {/* routes */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <polyline points={UNEXPLORED} fill="none" stroke="rgba(125,141,156,0.5)" strokeWidth="0.6" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
            <polyline points={PARTIAL} fill="none" stroke="var(--sky-400)" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
            <polyline points={EXPLORED} fill="none" stroke="var(--gold-400)" strokeWidth="0.9" vectorEffect="non-scaling-stroke" style={{ filter: 'drop-shadow(0 0 3px rgba(244,183,64,.6))' }} />
          </svg>

          {/* peak markers */}
          {MARKERS.map((mk) => {
            const active = sel && sel.name === mk.name;
            return (
              <button key={mk.name} onClick={() => setSel(mk)} style={{
                position: 'absolute', left: `${mk.x}%`, top: `${mk.y}%`, transform: 'translate(-50%,-50%)',
                width: active ? 34 : 26, height: active ? 34 : 26, borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                background: mk.got ? 'var(--accent)' : 'var(--surface-overlay)',
                color: mk.got ? 'var(--text-on-gold)' : 'var(--text-muted)',
                border: mk.got ? 'none' : '1.5px solid var(--border-strong)',
                backdropFilter: mk.got ? 'none' : 'blur(6px)',
                boxShadow: mk.got ? 'var(--glow-gold-sm)' : 'var(--shadow-sm)',
                zIndex: active ? 5 : 2, transition: 'all var(--dur-quick) var(--ease-out)',
              }}>
                <Icon name={mk.got ? 'mountain' : 'mountain'} size={active ? 17 : 13} strokeWidth={2.4} />
              </button>
            );
          })}

          {/* top filter bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 16px 28px', background: 'linear-gradient(180deg, var(--bg-app), transparent)' }}>
            <div className="eyebrow" style={{ marginBottom: 10, color: 'var(--text-secondary)' }}>Lake District · 68% explored</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
              {[['peaks', 'Peaks', 214], ['trails', 'Trails', 9], ['landmarks', 'Landmarks', 54], ['gaps', 'Gaps', 93]].map(([id, t, c]) => (
                <Tag key={id} selected={filter === id} count={c} onClick={() => setFilter(id)}>{t}</Tag>
              ))}
            </div>
          </div>

          {/* legend */}
          <div style={{ position: 'absolute', right: 16, bottom: 210, zIndex: 8, display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px', background: 'var(--surface-overlay)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)' }}>
            {[['var(--gold-400)', 'Explored'], ['var(--sky-400)', 'In progress'], ['rgba(125,141,156,0.6)', 'Unexplored']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 3, borderRadius: 2, background: c }} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* selected peak sheet */}
        {sel && (
          <div style={{
            position: 'absolute', left: 14, right: 14, bottom: 110, zIndex: 20,
            background: 'var(--surface-overlay)', backdropFilter: 'blur(18px) saturate(1.3)',
            WebkitBackdropFilter: 'blur(18px) saturate(1.3)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)', padding: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <span style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)', flex: '0 0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: sel.got ? 'var(--accent-soft)' : 'var(--surface-raised)',
                color: sel.got ? 'var(--gold-400)' : 'var(--text-muted)',
                border: sel.got ? '1px solid var(--border-gold)' : '1px solid var(--border-default)',
              }}><Icon name="mountain" size={24} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ font: 'var(--type-h3)', fontSize: 17, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sel.name}</span>
                  {sel.got
                    ? <Badge variant="success" icon={<Icon name="check" size={11} />}>Collected</Badge>
                    : <Badge variant="neutral">Not yet</Badge>}
                </div>
                <div className="eyebrow" style={{ fontSize: 11, marginTop: 4 }}>{sel.m} M · WAINWRIGHT</div>
              </div>
              <Icon name="chevron-right" size={20} color="var(--text-muted)" />
            </div>
          </div>
        )}
      </div>
    );
  }

  window.ExploreScreen = ExploreScreen;
})();
