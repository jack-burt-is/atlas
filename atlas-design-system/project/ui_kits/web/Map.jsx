/* Atlas web · Exploration Map. Pannable/zoomable terrain with peaks, trails,
   landmarks & a feature inspector. Exports window.WebMap */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const { Icon, Badge, Button, ProgressRing, ProgressBar, StatBlock } = DS;

  const PHOTO = (id, w = 480) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
  const M = (n, s) => <Icon name={n} size={s} />;

  /* ---------------- feature data (Lake District) ---------------- */
  // x/y are percentages over the terrain layer.
  const PEAKS = [
    { id: 'helvellyn', kind: 'peak', name: 'Helvellyn', x: 33, y: 30, m: 950, prom: 712, status: 'got', visits: 5, last: 'Mar 2026', coll: 'Wainwrights' },
    { id: 'scafell', kind: 'peak', name: 'Scafell Pike', x: 58, y: 60, m: 978, prom: 912, status: 'got', visits: 3, last: 'Aug 2025', coll: 'Wainwrights' },
    { id: 'skiddaw', kind: 'peak', name: 'Skiddaw', x: 46, y: 17, m: 931, prom: 709, status: 'got', visits: 2, last: 'Oct 2024', coll: 'Wainwrights' },
    { id: 'gable', kind: 'peak', name: 'Great Gable', x: 41, y: 49, m: 899, prom: 425, status: 'got', visits: 1, last: 'Jun 2024', coll: 'Wainwrights' },
    { id: 'fairfield', kind: 'peak', name: 'Fairfield', x: 71, y: 27, m: 873, prom: 270, status: 'got', visits: 2, last: 'May 2025', coll: 'Wainwrights' },
    { id: 'catbells', kind: 'peak', name: 'Catbells', x: 18, y: 43, m: 451, prom: 88, status: 'got', visits: 6, last: 'Feb 2026', coll: 'Wainwrights' },
    { id: 'coniston', kind: 'peak', name: 'Old Man of Coniston', x: 29, y: 75, m: 803, prom: 511, status: 'got', visits: 4, last: 'Sep 2025', coll: 'Wainwrights' },
    { id: 'bowfell', kind: 'peak', name: 'Bowfell', x: 50, y: 56, m: 902, prom: 122, status: 'planned', visits: 0, last: '—', coll: 'Wainwrights' },
    { id: 'blencathra', kind: 'peak', name: 'Blencathra', x: 56, y: 22, m: 868, prom: 463, status: 'none', visits: 0, last: '—', coll: 'Wainwrights' },
    { id: 'crinkle', kind: 'peak', name: 'Crinkle Crags', x: 45, y: 67, m: 859, prom: 71, status: 'none', visits: 0, last: '—', coll: 'Wainwrights' },
    { id: 'pillar', kind: 'peak', name: 'Pillar', x: 80, y: 66, m: 892, prom: 348, status: 'none', visits: 0, last: '—', coll: 'Wainwrights' },
    { id: 'haystacks', kind: 'peak', name: 'Haystacks', x: 73, y: 49, m: 597, prom: 90, status: 'none', visits: 0, last: '—', coll: 'Wainwrights' },
  ];

  const LANDMARKS = [
    { id: 'castlerigg', kind: 'landmark', sub: 'Stone circle', name: 'Castlerigg Stones', x: 50, y: 13, status: 'got', icon: 'flag', last: 'Feb 2026' },
    { id: 'ashness', kind: 'landmark', sub: 'Packhorse bridge', name: 'Ashness Bridge', x: 23, y: 35, status: 'got', icon: 'flag', last: 'Nov 2025' },
    { id: 'taylorgill', kind: 'landmark', sub: 'Waterfall', name: 'Taylor Gill Force', x: 44, y: 41, status: 'got', icon: 'droplets', last: 'Jun 2024' },
    { id: 'blacksail', kind: 'landmark', sub: 'Bothy', name: 'Black Sail Hut', x: 65, y: 56, status: 'got', icon: 'tent', last: 'Aug 2025' },
    { id: 'airaforce', kind: 'landmark', sub: 'Waterfall', name: 'Aira Force', x: 68, y: 18, status: 'none', icon: 'droplets', last: '—' },
    { id: 'mosedale', kind: 'landmark', sub: 'Bothy', name: 'Mosedale Bothy', x: 85, y: 60, status: 'none', icon: 'tent', last: '—' },
  ];

  const TRAILS = [
    { id: 'fairfield-h', kind: 'trail', name: 'Fairfield Horseshoe', km: 17.5, gain: 1067, status: 'got', done: 14, total: 14, pts: '71,27 60,22 56,22 46,17' },
    { id: 'scafell-c', kind: 'trail', name: 'Scafell Circuit', km: 13.2, gain: 982, status: 'planned', done: 4, total: 9, pts: '41,49 50,56 58,60' },
    { id: 'coniston-r', kind: 'trail', name: 'Coniston Round', km: 14.0, gain: 1100, status: 'none', done: 0, total: 8, pts: '29,75 45,67 58,60' },
    { id: 'western-l', kind: 'trail', name: 'Western Fells Loop', km: 19.4, gain: 1480, status: 'none', done: 0, total: 11, pts: '73,49 80,66 65,56' },
  ];

  const ALL = [...PEAKS, ...LANDMARKS, ...TRAILS];

  const STATUS = {
    got: { label: 'Collected', badge: 'success', color: 'var(--gold-400)', soft: 'var(--accent-soft)', border: 'var(--border-gold)', icon: 'check' },
    planned: { label: 'Planned', badge: 'info', color: 'var(--sky-400)', soft: 'var(--info-soft)', border: 'rgba(70,182,232,.4)', icon: 'flag' },
    none: { label: 'Not visited', badge: 'neutral', color: 'var(--text-muted)', soft: 'var(--surface-raised)', border: 'var(--border-default)', icon: 'circle' },
  };
  // trail line colors
  const trailStroke = (s) => s === 'got' ? 'var(--gold-400)' : s === 'planned' ? 'var(--sky-400)' : 'rgba(125,141,156,0.55)';

  const peakImg = (p) => {
    const ids = ['1464822759023-fed622ff2c3b', '1454496522488-7a8e488e8606', '1483728642387-6c3bdd6c93e5', '1486870591958-9b9d0d1dda99', '1469474968028-56623f02e42e', '1458668383970-8ddd3927deed'];
    const i = Math.abs(p.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % ids.length;
    return PHOTO(ids[i], 520);
  };

  /* ---------------- map markers ---------------- */
  function PinMarker({ f, active, scale, onClick }) {
    const st = STATUS[f.status];
    const got = f.status === 'got';
    const planned = f.status === 'planned';
    const size = active ? 40 : 32;
    return (
      <button data-marker onClick={(e) => { e.stopPropagation(); onClick(f); }}
        title={f.name}
        style={{
          position: 'absolute', left: `${f.x}%`, top: `${f.y}%`,
          transform: `translate(-50%,-50%) scale(${1 / scale})`,
          width: size, height: size, borderRadius: '50%', padding: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: got ? 'var(--accent)' : planned ? 'color-mix(in srgb, var(--sky-500) 22%, var(--surface-overlay))' : 'var(--surface-overlay)',
          color: got ? 'var(--text-on-gold)' : planned ? 'var(--sky-300)' : 'var(--text-secondary)',
          border: got ? '2px solid color-mix(in srgb, var(--white) 22%, transparent)' : '1.5px solid ' + (planned ? 'rgba(70,182,232,.55)' : 'var(--border-strong)'),
          backdropFilter: got ? 'none' : 'blur(6px)', WebkitBackdropFilter: got ? 'none' : 'blur(6px)',
          boxShadow: active ? '0 0 0 4px var(--accent-soft), var(--shadow-lg)' : got ? 'var(--glow-gold-sm)' : 'var(--shadow-sm)',
          zIndex: active ? 30 : got ? 6 : 4, transition: 'width .14s var(--ease-out), height .14s var(--ease-out), box-shadow .14s var(--ease-out)',
        }}>
        <Icon name={f.kind === 'landmark' ? f.icon : 'mountain'} size={active ? 19 : 15} strokeWidth={2.4} />
        {active && (
          <span style={{
            position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)', marginTop: 4,
            whiteSpace: 'nowrap', font: 'var(--type-body-sm)', fontSize: 11.5, fontWeight: 700,
            padding: '3px 9px', borderRadius: 'var(--radius-pill)', color: 'var(--text-primary)',
            background: 'var(--surface-overlay)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)',
          }}>{f.name}</span>
        )}
      </button>
    );
  }

  /* ---------------- inspector: feature detail ---------------- */
  function StatRow({ label, value, icon }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
          <Icon name={icon} size={14} color="var(--text-faint)" />{label}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
      </div>
    );
  }

  function FeatureDetail({ f, onBack, onSelect }) {
    const st = STATUS[f.status];
    const isTrail = f.kind === 'trail';
    const nearby = ALL.filter((o) => o.id !== f.id && o.kind === f.kind).slice(0, 3);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* hero */}
        <div style={{ position: 'relative', height: 168, flex: '0 0 168px', overflow: 'hidden' }}>
          {f.kind === 'peak'
            ? <img src={peakImg(f)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div className="atlas-topo" style={{ position: 'absolute', inset: 0, background: 'var(--surface-sunken)' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, var(--surface-card) 4%, color-mix(in srgb, var(--surface-card) 30%, transparent) 55%, transparent)' }} />
          <button onClick={onBack} title="Back" style={{
            position: 'absolute', top: 14, left: 14, width: 34, height: 34, borderRadius: 'var(--radius-pill)',
            display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--text-primary)',
            background: 'var(--surface-overlay)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--border-default)',
          }}><Icon name="arrow-left" size={17} /></button>
          <div style={{ position: 'absolute', left: 18, right: 18, bottom: 14 }}>
            <div className="eyebrow" style={{ fontSize: 10, marginBottom: 6 }}>
              {f.kind === 'peak' ? f.coll : isTrail ? 'National trail' : f.sub} · Lake District
            </div>
            <h2 style={{ font: 'var(--type-h2)', fontSize: 24, color: 'var(--text-primary)', margin: 0, letterSpacing: '-.01em', lineHeight: 1.05, textWrap: 'balance' }}>{f.name}</h2>
          </div>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge variant={st.badge} dot={f.status !== 'none'} icon={f.status === 'got' ? <Icon name="check" size={11} /> : undefined}>{st.label}</Badge>
            {f.kind === 'peak' && <Badge variant="neutral">{f.m} m</Badge>}
            {isTrail && <Badge variant="neutral">{f.km} km</Badge>}
            {f.kind === 'peak' && f.visits > 0 && <Badge variant="neutral">×{f.visits} ascents</Badge>}
          </div>

          {isTrail && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}>Sections walked</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{f.done}/{f.total}</span>
              </div>
              <ProgressBar value={f.done} max={f.total} color={f.status === 'got' ? 'gold' : 'sky'} />
            </div>
          )}

          <div>
            {f.kind === 'peak' && <React.Fragment>
              <StatRow label="Elevation" value={`${f.m} m`} icon="mountain" />
              <StatRow label="Prominence" value={`${f.prom} m`} icon="triangle" />
              <StatRow label="Ascents logged" value={f.visits} icon="footprints" />
              <StatRow label="Last climbed" value={f.last} icon="calendar" />
            </React.Fragment>}
            {isTrail && <React.Fragment>
              <StatRow label="Distance" value={`${f.km} km`} icon="route" />
              <StatRow label="Elevation gain" value={`${f.gain} m`} icon="trending-up" />
              <StatRow label="Sections" value={`${f.done} / ${f.total}`} icon="flag" />
            </React.Fragment>}
            {f.kind === 'landmark' && <React.Fragment>
              <StatRow label="Type" value={f.sub} icon={f.icon} />
              <StatRow label="Status" value={st.label} icon="map-pin" />
              <StatRow label="Last visit" value={f.last} icon="calendar" />
            </React.Fragment>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {f.status === 'got'
              ? <Button variant="secondary" block leftIcon={M('plus', 15)}>Log another visit</Button>
              : <Button variant="primary" block leftIcon={M('flag', 15)}>{f.status === 'planned' ? 'Continue plan' : 'Add to plan'}</Button>}
            <Button variant="ghost" block leftIcon={M('navigation', 15)}>Get directions</Button>
          </div>

          <div style={{ height: 1, background: 'var(--border-subtle)' }} />
          <div>
            <div className="eyebrow" style={{ fontSize: 10, marginBottom: 10 }}>More {f.kind === 'peak' ? 'peaks' : f.kind === 'trail' ? 'trails' : 'landmarks'} nearby</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {nearby.map((o) => <DirectoryRow key={o.id} f={o} onSelect={onSelect} compact />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- inspector: directory row ---------------- */
  function DirectoryRow({ f, onSelect, active, compact }) {
    const st = STATUS[f.status];
    const got = f.status === 'got';
    const meta = f.kind === 'peak' ? `${f.m} m` : f.kind === 'trail' ? `${f.km} km` : f.sub;
    return (
      <button data-marker onClick={() => onSelect(f)} style={{
        display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left', cursor: 'pointer',
        padding: compact ? '8px 9px' : '9px 10px', borderRadius: 'var(--radius-md)',
        border: '1px solid ' + (active ? 'var(--border-gold)' : 'transparent'),
        background: active ? 'var(--accent-soft)' : 'transparent', font: 'inherit', transition: 'var(--t-colors)',
      }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface-raised)'; }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
        <span style={{
          width: 32, height: 32, flex: '0 0 auto', borderRadius: 'var(--radius-md)', display: 'grid', placeItems: 'center',
          background: got ? 'var(--accent-soft)' : 'var(--surface-sunken)',
          border: '1px solid ' + (got ? 'var(--border-gold)' : 'var(--border-default)'),
          color: got ? 'var(--gold-400)' : 'var(--text-muted)',
        }}><Icon name={f.kind === 'landmark' ? f.icon : f.kind === 'trail' ? 'route' : 'mountain'} size={16} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
          <div className="eyebrow" style={{ fontSize: 9.5, marginTop: 2 }}>{meta}</div>
        </div>
        <span title={st.label} style={{ width: 8, height: 8, flex: '0 0 auto', borderRadius: '50%', background: st.color, boxShadow: got ? 'var(--glow-gold-sm)' : 'none' }} />
      </button>
    );
  }

  /* ---------------- inspector: region overview (default) ---------------- */
  function RegionOverview({ filter, shown, onSelect }) {
    const peaksGot = PEAKS.filter((p) => p.status === 'got').length;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border-subtle)' }}>
          <ProgressRing value={68} size={84} stroke={9} label="Explored" />
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow" style={{ fontSize: 10, marginBottom: 5 }}>National Park · Cumbria</div>
            <div style={{ font: 'var(--type-h3)', fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>Lake District</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Badge variant="gold" dot>68% explored</Badge>
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, borderBottom: '1px solid var(--border-subtle)' }}>
          {[['Peaks', `${peaksGot}/${PEAKS.length}`, 'mountain'], ['Trails', `${TRAILS.filter((t) => t.status === 'got').length}/${TRAILS.length}`, 'route'], ['Landmarks', `${LANDMARKS.filter((l) => l.status === 'got').length}/${LANDMARKS.length}`, 'flag'], ['Gaps', `${ALL.filter((f) => f.status === 'none').length}`, 'target']].map(([l, v, ic]) => (
            <div key={l} style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '11px 13px' }}>
              <StatBlock size="sm" label={l} value={v} icon={M(ic, 11)} />
            </div>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
          <div className="eyebrow" style={{ fontSize: 10, padding: '0 6px 10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{filter === 'all' ? 'All features' : filter} on map</span>
            <span style={{ color: 'var(--text-faint)' }}>{shown.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {shown.map((f) => <DirectoryRow key={f.id} f={f} onSelect={onSelect} />)}
            {shown.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Nothing here in this filter.</div>}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- map control button ---------------- */
  function CtrlBtn({ icon, onClick, title }) {
    return (
      <button onClick={onClick} title={title} aria-label={title} style={{
        width: 38, height: 38, display: 'grid', placeItems: 'center', cursor: 'pointer',
        background: 'var(--surface-overlay)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid var(--border-default)', color: 'var(--text-secondary)',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-raised)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--surface-overlay)'; }}>
        <Icon name={icon} size={17} />
      </button>
    );
  }

  /* ---------------- main ---------------- */
  function WebMap({ theme }) {
    const [filter, setFilter] = React.useState('all');
    const [sel, setSel] = React.useState(null);
    const [view, setView] = React.useState({ s: 1, x: 0, y: 0 });
    const canvasRef = React.useRef(null);
    const drag = React.useRef(null);

    React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

    const mapSrc = (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light')
      ? '../../assets/map-terrain-light.svg' : '../../assets/map-terrain.svg';

    const cats = [
      ['all', 'All', ALL.length],
      ['peaks', 'Peaks', PEAKS.length],
      ['trails', 'Trails', TRAILS.length],
      ['landmarks', 'Landmarks', LANDMARKS.length],
      ['gaps', 'Gaps', ALL.filter((f) => f.status === 'none').length],
    ];
    const inFilter = (f) => {
      if (filter === 'all') return true;
      if (filter === 'gaps') return f.status === 'none';
      if (filter === 'peaks') return f.kind === 'peak';
      if (filter === 'trails') return f.kind === 'trail';
      if (filter === 'landmarks') return f.kind === 'landmark';
      return true;
    };
    const shown = ALL.filter(inFilter);
    const pins = shown.filter((f) => f.kind !== 'trail');
    const trailsShown = TRAILS.filter(inFilter);

    /* pan + zoom */
    const clamp = (v, m) => Math.max(-m, Math.min(m, v));
    const applyView = (next) => {
      const el = canvasRef.current;
      const w = el ? el.clientWidth : 800, h = el ? el.clientHeight : 600;
      const mx = (next.s - 1) * w / 2, my = (next.s - 1) * h / 2;
      setView({ s: next.s, x: clamp(next.x, mx), y: clamp(next.y, my) });
    };
    const zoom = (d) => applyView({ ...view, s: Math.max(1, Math.min(2.6, +(view.s + d).toFixed(2))) });
    const reset = () => setView({ s: 1, x: 0, y: 0 });

    const onDown = (e) => {
      if (e.target.closest('[data-marker]')) return;
      drag.current = { px: e.clientX, py: e.clientY, ox: view.x, oy: view.y, moved: false };
      e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onMove = (e) => {
      if (!drag.current) return;
      const dx = e.clientX - drag.current.px, dy = e.clientY - drag.current.py;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
      applyView({ s: view.s, x: drag.current.ox + dx, y: drag.current.oy + dy });
    };
    const onUp = (e) => { try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {} drag.current = null; };
    const onWheel = (e) => { zoom(e.deltaY < 0 ? 0.18 : -0.18); };

    const tabBtn = ([id, label, n]) => {
      const on = filter === id;
      return (
        <button key={id} onClick={() => setFilter(id)} style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px', height: 34, flex: '0 0 auto',
          borderRadius: 'var(--radius-pill)', cursor: 'pointer', border: 'none', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
          background: on ? 'var(--accent)' : 'transparent', color: on ? 'var(--text-on-gold)' : 'var(--text-secondary)',
          boxShadow: on ? 'var(--glow-gold-sm)' : 'none', transition: 'var(--t-colors)',
        }}>
          {label}
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, padding: '1px 6px', borderRadius: 'var(--radius-pill)',
            background: on ? 'rgba(0,0,0,.16)' : 'var(--surface-sunken)', color: on ? 'var(--text-on-gold)' : 'var(--text-muted)',
          }}>{n}</span>
        </button>
      );
    };

    return (
      <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
        {/* MAP CANVAS */}
        <div ref={canvasRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} onWheel={onWheel}
          style={{
            position: 'relative', flex: 1, minWidth: 0, overflow: 'hidden', background: 'var(--surface-sunken)',
            cursor: drag.current ? 'grabbing' : 'grab', touchAction: 'none',
          }}>
          {/* pan/zoom layer */}
          <div style={{
            position: 'absolute', inset: 0, transformOrigin: 'center center',
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`,
            transition: drag.current ? 'none' : 'transform .22s var(--ease-out)',
          }}>
            <img src={mapSrc} alt="Lake District terrain" draggable="false" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            {/* routes */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {trailsShown.map((t) => (
                <polyline key={t.id} points={t.pts} fill="none"
                  stroke={trailStroke(t.status)} strokeWidth={sel && sel.id === t.id ? 1.4 : 0.85}
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray={t.status === 'none' ? '2 2' : undefined}
                  vectorEffect="non-scaling-stroke"
                  style={t.status === 'got' ? { filter: 'drop-shadow(0 0 3px rgba(244,183,64,.55))' } : undefined} />
              ))}
            </svg>
            {/* trail click chips at midpoint */}
            {trailsShown.map((t) => {
              const p = t.pts.split(' ').map((s) => s.split(',').map(Number));
              const mid = p[Math.floor(p.length / 2)];
              const active = sel && sel.id === t.id;
              return (
                <button key={t.id} data-marker onClick={(e) => { e.stopPropagation(); setSel(t); }} title={t.name}
                  style={{
                    position: 'absolute', left: `${mid[0]}%`, top: `${mid[1]}%`,
                    transform: `translate(-50%,-50%) scale(${1 / view.s})`, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 7px', borderRadius: 'var(--radius-pill)',
                    background: 'var(--surface-overlay)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid ' + (active ? 'var(--border-gold)' : 'var(--border-default)'),
                    color: 'var(--text-secondary)', font: 'var(--type-body-sm)', fontSize: 11, fontWeight: 600,
                    boxShadow: active ? '0 0 0 3px var(--accent-soft)' : 'var(--shadow-sm)', zIndex: active ? 20 : 3, whiteSpace: 'nowrap',
                  }}>
                  <Icon name="route" size={12} color={trailStroke(t.status)} />{t.name}
                </button>
              );
            })}
            {/* pin markers */}
            {pins.map((f) => <PinMarker key={f.id} f={f} active={sel && sel.id === f.id} scale={view.s} onClick={setSel} />)}
          </div>

          {/* vignette */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 160px 30px var(--ink-950)' }} />

          {/* TOP floating control bar */}
          <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-overlay)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)' }}>
              <Icon name="mountain-snow" size={16} color="var(--gold-400)" />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>Lake District</span>
              <span style={{ width: 1, height: 16, background: 'var(--border-default)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--gold-400)' }}>68% explored</span>
            </div>
            <div style={{ pointerEvents: 'auto', display: 'flex', gap: 6, padding: 5, borderRadius: 'var(--radius-pill)', background: 'var(--surface-overlay)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)', overflowX: 'auto', maxWidth: '62%' }}>
              {cats.map(tabBtn)}
            </div>
          </div>

          {/* LEGEND */}
          <div style={{ position: 'absolute', left: 16, bottom: 16, display: 'flex', flexDirection: 'column', gap: 7, padding: '11px 13px', borderRadius: 'var(--radius-md)', background: 'var(--surface-overlay)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)' }}>
            <div className="eyebrow" style={{ fontSize: 9, marginBottom: 1 }}>Legend</div>
            {[['var(--gold-400)', 'Collected'], ['var(--sky-400)', 'Planned'], ['rgba(125,141,156,0.7)', 'Not visited']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: c, boxShadow: c.includes('gold') ? 'var(--glow-gold-sm)' : 'none' }} />
                <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{l}</span>
              </div>
            ))}
          </div>

          {/* ZOOM CONTROLS */}
          <div style={{ position: 'absolute', right: 16, bottom: 16, display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)' }}>
            <CtrlBtn icon="plus" title="Zoom in" onClick={() => zoom(0.3)} />
            <div style={{ height: 1, background: 'var(--border-default)' }} />
            <CtrlBtn icon="minus" title="Zoom out" onClick={() => zoom(-0.3)} />
            <div style={{ height: 1, background: 'var(--border-default)' }} />
            <CtrlBtn icon="locate-fixed" title="Reset view" onClick={reset} />
          </div>
        </div>

        {/* INSPECTOR RAIL */}
        <aside style={{ width: 360, flex: '0 0 360px', borderLeft: '1px solid var(--border-subtle)', background: 'var(--surface-card)', overflow: 'hidden' }}>
          {sel
            ? <FeatureDetail f={sel} onBack={() => setSel(null)} onSelect={setSel} />
            : <RegionOverview filter={filter} shown={shown} onSelect={setSel} />}
        </aside>
      </div>
    );
  }

  window.WebMap = WebMap;
})();
