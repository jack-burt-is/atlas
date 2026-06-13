/* Atlas mobile · Collections list + collection detail (Pokédex grid).
   Exports window.CollectionsScreen */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const { Icon, Tag, CollectionCard, CollectibleItem, ProgressRing, Badge, Button } = DS;

  function CollectionsList({ go }) {
    const { collections } = window.AtlasData;
    const [type, setType] = React.useState('all');
    const M = (n, s) => <Icon name={n} size={s} />;
    const types = ['all', 'Peaks', 'National Trail', 'Landmarks'];
    const shown = collections.filter((c) => type === 'all' || c.type === type);
    return (
      <div>
        <window.AtlasMobileHeader eyebrow="Lifetime record" title="Collections" />
        <div style={{ padding: '0 20px', marginBottom: 18, display: 'flex', gap: 8, overflowX: 'auto' }}>
          {types.map((t) => (
            <Tag key={t} selected={type === t} onClick={() => setType(t)}>{t === 'all' ? 'All' : t === 'National Trail' ? 'Trails' : t}</Tag>
          ))}
        </div>
        <div style={{ padding: '0 20px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shown.map((c) => (
            <CollectionCard key={c.id} title={c.title} type={c.type} value={c.value} max={c.max}
              image={c.img} icon={M(c.icon, 26)} onClick={() => go(c.id)} />
          ))}
        </div>
      </div>
    );
  }

  function CollectionDetail({ onBack }) {
    const { peaks } = window.AtlasData;
    const [tab, setTab] = React.useState('all');
    const got = peaks.filter((p) => p.got).length;
    const shown = peaks.filter((p) => tab === 'all' || (tab === 'got' ? p.got : !p.got));
    return (
      <div>
        {/* hero */}
        <div style={{ padding: '4px 20px 22px', position: 'relative' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, marginBottom: 16, fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600 }}>
            <Icon name="chevron-left" size={18} /> Collections
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <ProgressRing value={121} max={214} size={92} stroke={9} label="Done" showValue />
            <div>
              <div className="eyebrow" style={{ marginBottom: 5 }}>Peaks · Lake District</div>
              <h1 style={{ font: 'var(--type-h1)', fontSize: 28, color: 'var(--text-primary)', margin: '0 0 8px' }}>Wainwrights</h1>
              <div style={{ display: 'flex', gap: 8 }}>
                <Badge variant="gold" dot>121 / 214</Badge>
                <Badge variant="neutral">93 to go</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* segmented */}
        <div style={{ padding: '0 20px', marginBottom: 16, display: 'flex', gap: 8 }}>
          {[['all', `All 214`], ['got', `Collected ${got}`], ['missing', `Remaining`]].map(([id, l]) => (
            <Tag key={id} selected={tab === id} onClick={() => setTab(id)}>{l}</Tag>
          ))}
        </div>

        {/* grid */}
        <div style={{ padding: '0 20px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {shown.map((p) => (
            <CollectibleItem key={p.name} name={p.name} collected={p.got} image={p.img}
              meta={p.got ? <><b>{p.m}m</b><span>×{p.visits}</span></> : <b>{p.m}m</b>}
              icon={<Icon name="mountain" size={30} />}
              checkIcon={<Icon name="check" size={13} />} />
          ))}
        </div>
      </div>
    );
  }

  function CollectionsScreen({ go, detail, onBack }) {
    return detail ? <CollectionDetail onBack={onBack} /> : <CollectionsList go={go} />;
  }

  window.CollectionsScreen = CollectionsScreen;
})();
