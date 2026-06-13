/* Atlas web · Collections page — overview + collection detail (Pokédex grid).
   Exports window.WebCollections */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const { Icon, ProgressRing, ProgressBar, StatBlock, CollectionCard, CollectibleItem, Badge, Button } = DS;
  const { AtlasPanel } = window;

  const M = (n, s) => <Icon name={n} size={s} />;
  const pctOf = (c) => Math.round((c.value / c.max) * 100);

  const TYPE_META = {
    'Peaks': { icon: 'mountain', label: 'Peaks' },
    'National Trail': { icon: 'route', label: 'Trails' },
    'Landmarks': { icon: 'flag', label: 'Landmarks' },
  };

  /* ---------- overview / list ---------- */
  function CollectionsList({ onOpen }) {
    const { collections } = window.AtlasData;
    const [type, setType] = React.useState('all');

    const completed = collections.filter((c) => c.value >= c.max);
    const avg = Math.round(collections.reduce((s, c) => s + pctOf(c), 0) / collections.length);
    const types = Object.keys(TYPE_META).filter((t) => collections.some((c) => c.type === t));

    const typeStat = (t) => {
      const set = collections.filter((c) => c.type === t);
      const done = set.filter((c) => c.value >= c.max).length;
      return { count: set.length, done, pct: Math.round(set.reduce((s, c) => s + pctOf(c), 0) / set.length) };
    };

    const filters = [['all', 'All', collections.length], ...types.map((t) => [t, TYPE_META[t].label, collections.filter((c) => c.type === t).length])];
    const shown = collections.filter((c) => type === 'all' || c.type === type);
    const closest = collections.filter((c) => c.value < c.max).sort((a, b) => pctOf(b) - pctOf(a));

    return (
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* hero */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 20 }}>
          <div className="atlas-topo" style={{
            position: 'relative', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-gold)',
            padding: 28, overflow: 'hidden', boxShadow: 'var(--glow-gold-sm), var(--ring-top)',
            display: 'flex', alignItems: 'center', gap: 26,
          }}>
            <ProgressRing value={avg} size={124} stroke={12} label="Avg complete" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Completionist · Lifetime</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                <span className="atlas-gold-text" style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 46, lineHeight: 1,
                  letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums',
                }}>{completed.length}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  / {collections.length} collections completed
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <Badge variant="gold" dot>{collections.length} collections tracked</Badge>
                <Badge variant="neutral">{closest.length} in progress</Badge>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 26px' }}>
                {types.map((t) => {
                  const s = typeStat(t);
                  return (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <span style={{
                        width: 40, height: 40, flex: '0 0 auto', borderRadius: 'var(--radius-md)', display: 'grid', placeItems: 'center',
                        background: 'var(--accent-soft)', border: '1px solid var(--border-gold)', color: 'var(--gold-400)',
                      }}><Icon name={TYPE_META[t].icon} size={19} /></span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                          {s.pct}<span style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 500 }}>%</span>
                        </div>
                        <div className="eyebrow" style={{ fontSize: 9.5, marginTop: 4 }}>{TYPE_META[t].label} · {s.count}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <AtlasPanel title="Closest to completion" action={<Badge variant="gold">{closest.length} active</Badge>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {closest.slice(0, 4).map((c) => (
                <button key={c.id} onClick={() => onOpen(c)} style={{
                  display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit',
                }}>
                  <span style={{
                    width: 38, height: 38, flex: '0 0 auto', borderRadius: 'var(--radius-md)', overflow: 'hidden',
                    display: 'grid', placeItems: 'center', background: 'var(--surface-sunken)',
                    border: '1px solid var(--border-default)',
                  }}><img src={c.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', flex: '0 0 auto' }}>{c.value}/{c.max}</span>
                    </div>
                    <ProgressBar value={c.value} max={c.max} color={c.type === 'National Trail' ? 'sky' : 'gold'} />
                  </div>
                </button>
              ))}
            </div>
          </AtlasPanel>
        </div>

        {/* filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-pill)' }}>
            {filters.map(([id, l, n]) => {
              const on = type === id;
              return (
                <button key={id} onClick={() => setType(id)} style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '0 16px', height: 34,
                  borderRadius: 'var(--radius-pill)', cursor: 'pointer', border: 'none',
                  fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
                  background: on ? 'var(--accent)' : 'transparent',
                  color: on ? 'var(--text-on-gold)' : 'var(--text-secondary)',
                  boxShadow: on ? 'var(--glow-gold-sm)' : 'none', transition: 'var(--t-colors)',
                }}>
                  {l}
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, padding: '1px 6px', borderRadius: 'var(--radius-pill)',
                    background: on ? 'rgba(0,0,0,.16)' : 'var(--surface-sunken)',
                    color: on ? 'var(--text-on-gold)' : 'var(--text-muted)',
                  }}>{n}</span>
                </button>
              );
            })}
          </div>
          <Button variant="ghost" size="sm" leftIcon={M('arrow-up-down', 15)}>Sort by progress</Button>
        </div>

        {/* grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {shown.map((c) => (
            <CollectionCard key={c.id} title={c.title} type={c.type} value={c.value} max={c.max}
              image={c.img} icon={M(c.icon, 26)} onClick={() => onOpen(c)} />
          ))}
        </div>
      </div>
    );
  }

  /* ---------- detail (Pokédex grid) ---------- */
  function CollectionDetail({ collection, onBack }) {
    const { peaks } = window.AtlasData;
    const [tab, setTab] = React.useState('all');
    const got = peaks.filter((p) => p.got).length;
    const remaining = collection.max - collection.value;
    const visits = peaks.filter((p) => p.got).reduce((s, p) => s + (p.visits || 0), 0);
    const highest = Math.max(...peaks.filter((p) => p.got).map((p) => p.m));
    const shown = peaks.filter((p) => tab === 'all' || (tab === 'got' ? p.got : !p.got));

    return (
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
          background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0,
          fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
        }}>
          <Icon name="chevron-left" size={18} /> All collections
        </button>

        {/* hero banner */}
        <div className="atlas-topo" style={{
          position: 'relative', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)',
          padding: 28, overflow: 'hidden', boxShadow: 'var(--shadow-md)',
        }}>
          <img src={collection.img} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(100deg, var(--bg-app) 18%, color-mix(in srgb, var(--bg-app) 60%, transparent) 44%, color-mix(in srgb, var(--bg-app) 12%, transparent) 100%), linear-gradient(0deg, color-mix(in srgb, var(--bg-app) 45%, transparent), transparent 60%)',
          }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 28 }}>
            <ProgressRing value={collection.value} max={collection.max} size={132} stroke={12} label="Collected" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>{collection.type} · Lake District</div>
              <h1 style={{ font: 'var(--type-display)', fontSize: 44, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-.02em' }}>{collection.title}</h1>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Badge variant="gold" dot>{collection.value} / {collection.max}</Badge>
                {remaining > 0 ? <Badge variant="neutral">{remaining} to go</Badge> : <Badge variant="success">Completed</Badge>}
                <Badge variant="neutral">{pctOf(collection)}% complete</Badge>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button variant="primary" leftIcon={M('map', 16)}>View on map</Button>
              <Button variant="secondary" leftIcon={M('target', 16)}>Set a goal</Button>
            </div>
          </div>
        </div>

        {/* stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[['Collected', `${collection.value}`, 'circle-check'], ['Remaining', `${remaining}`, 'target'], ['Total visits', `${visits}`, 'footprints'], ['Highest', `${highest}m`, 'mountain']].map(([l, v, ic]) => (
            <div key={l} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 18, boxShadow: 'var(--ring-top)' }}>
              <StatBlock label={l} value={v} icon={M(ic, 12)} />
            </div>
          ))}
        </div>

        {/* segmented + grid */}
        <div style={{ display: 'flex', gap: 6, padding: 4, alignSelf: 'flex-start', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-pill)' }}>
          {[['all', 'All', peaks.length], ['got', 'Collected', got], ['missing', 'Remaining', peaks.length - got]].map(([id, l, n]) => {
            const on = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '0 16px', height: 34,
                borderRadius: 'var(--radius-pill)', cursor: 'pointer', border: 'none',
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
                background: on ? 'var(--accent)' : 'transparent', color: on ? 'var(--text-on-gold)' : 'var(--text-secondary)',
                boxShadow: on ? 'var(--glow-gold-sm)' : 'none', transition: 'var(--t-colors)',
              }}>
                {l}
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, padding: '1px 6px', borderRadius: 'var(--radius-pill)',
                  background: on ? 'rgba(0,0,0,.16)' : 'var(--surface-sunken)', color: on ? 'var(--text-on-gold)' : 'var(--text-muted)',
                }}>{n}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }}>
          {shown.map((p) => (
            <CollectibleItem key={p.name} name={p.name} collected={p.got} image={p.img}
              meta={p.got ? <React.Fragment><b>{p.m}m</b><span>×{p.visits}</span></React.Fragment> : <b>{p.m}m</b>}
              icon={<Icon name="mountain" size={30} />}
              checkIcon={<Icon name="check" size={13} />} />
          ))}
        </div>
      </div>
    );
  }

  function WebCollections({ onNav }) {
    const [open, setOpen] = React.useState(null);
    React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });
    return open
      ? <CollectionDetail collection={open} onBack={() => setOpen(null)} />
      : <CollectionsList onOpen={setOpen} />;
  }

  window.WebCollections = WebCollections;
})();
