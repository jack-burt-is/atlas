/* Atlas web · Region progress page (Lake District). Exports window.WebRegion */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const { Icon, ProgressRing, ProgressBar, StatBlock, CollectibleItem, Badge, Button, CollectionCard } = DS;
  const { AtlasPanel } = window;

  function WebRegion({ onNav }) {
    const { peaks } = window.AtlasData;
    const missing = peaks.filter((p) => !p.got);
    const M = (n, s) => <Icon name={n} size={s} />;
    return (
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* hero banner */}
        <div className="atlas-topo" style={{
          position: 'relative', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)',
          padding: 28, overflow: 'hidden', boxShadow: 'var(--shadow-md)',
        }}>
          <img src={window.AtlasData.regionHero} alt="" aria-hidden="true" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(100deg, var(--bg-app) 18%, color-mix(in srgb, var(--bg-app) 60%, transparent) 44%, color-mix(in srgb, var(--bg-app) 12%, transparent) 100%), linear-gradient(0deg, color-mix(in srgb, var(--bg-app) 45%, transparent), transparent 60%)',
          }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 28 }}>
            <ProgressRing value={68} size={132} stroke={12} label="Explored" />
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>National Park · Cumbria, England</div>
              <h1 style={{ font: 'var(--type-display)', fontSize: 44, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-.02em' }}>Lake District</h1>
              <div style={{ display: 'flex', gap: 10 }}>
                <Badge variant="gold" dot>68% explored</Badge>
                <Badge variant="success">9 trails done</Badge>
                <Badge variant="neutral">54 landmarks</Badge>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button variant="primary" leftIcon={M('map', 16)} onClick={() => onNav('map')}>View on map</Button>
              <Button variant="secondary" leftIcon={M('target', 16)}>Set a goal</Button>
            </div>
          </div>
        </div>

        {/* stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[['Peaks', '121 / 214', 'mountain', 'spruce'], ['Trails', '9 / 13', 'route', 'sky'], ['Landmarks', '54 / 96', 'flag', 'gold'], ['Distance here', '1,284 km', 'footprints', 'gold']].map(([l, v, ic]) => (
            <div key={l} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 18, boxShadow: 'var(--ring-top)' }}>
              <StatBlock label={l} value={v} icon={M(ic, 12)} />
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
          <AtlasPanel title="Progress by collection">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <ProgressBar label="Wainwrights" value={121} max={214} />
              <ProgressBar label="Birketts" value={203} max={541} color="sky" />
              <ProgressBar label="Lakeland waterfalls" value={18} max={42} color="sky" />
              <ProgressBar label="Bothies & shelters" value={4} max={9} color="spruce" />
              <ProgressBar label="Lake circuits" value={6} max={6} />
            </div>
          </AtlasPanel>

          <AtlasPanel title="Missing nearby" action={<Badge variant="gold">+ up to 380 pts</Badge>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {missing.slice(0, 4).map((p) => (
                <CollectibleItem key={p.name} name={p.name} meta={<b>{p.m}m</b>} image={p.img} collected={p.got} icon={M('mountain', 28)} />
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <Button variant="secondary" block onClick={() => onNav('map')}>Show all 93 gaps</Button>
            </div>
          </AtlasPanel>
        </div>
      </div>
    );
  }

  window.WebRegion = WebRegion;
})();
