/* Atlas web · Achievements / trophy case. Exports window.WebAchievements */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const { Icon, ProgressRing, ProgressBar, AchievementBadge, Badge, Button } = DS;
  const { AtlasPanel } = window;

  const TIERS = [
    { id: 'platinum', label: 'Platinum', color: 'var(--tier-platinum)', glow: 'var(--glow-platinum)', mark: '★' },
    { id: 'gold', label: 'Gold', color: 'var(--tier-gold)', glow: 'var(--glow-gold-md)', mark: 'I' },
    { id: 'silver', label: 'Silver', color: 'var(--tier-silver)', glow: 'var(--glow-silver)', mark: 'II' },
    { id: 'bronze', label: 'Bronze', color: 'var(--tier-bronze)', glow: 'var(--glow-bronze)', mark: 'III' },
  ];

  function Medal({ tier, have, total }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 46, height: 46, flex: '0 0 auto', borderRadius: '50%', display: 'grid', placeItems: 'center',
          background: tier.color, color: 'var(--ink-950)', boxShadow: tier.glow,
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
        }}>{tier.mark}</span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: 'var(--text-primary)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {have}<span style={{ color: 'var(--text-faint)', fontWeight: 500 }}> / {total}</span>
          </div>
          <div className="eyebrow" style={{ fontSize: 9.5, marginTop: 4, color: tier.color }}>{tier.label}</div>
        </div>
      </div>
    );
  }

  const FILTERS = [
    ['all', 'All'],
    ['unlocked', 'Unlocked'],
    ['progress', 'In progress'],
    ['locked', 'Locked'],
  ];

  function WebAchievements({ onNav }) {
    const { achievements } = window.AtlasData;
    const [filter, setFilter] = React.useState('all');
    const M = (n, s) => <Icon name={n} size={s} />;

    const unlocked = achievements.filter((a) => a.unlocked);
    const points = unlocked.reduce((s, a) => s + a.points, 0);
    const possible = achievements.reduce((s, a) => s + a.points, 0);
    const pct = Math.round((unlocked.length / achievements.length) * 100);

    const tierCount = (id) => ({
      have: unlocked.filter((a) => a.tier === id).length,
      total: achievements.filter((a) => a.tier === id).length,
    });

    const inProgress = achievements
      .filter((a) => !a.unlocked && a.progress)
      .sort((a, b) => b.progress.value / b.progress.max - a.progress.value / a.progress.max);

    const matches = (a) =>
      filter === 'all' ? true
      : filter === 'unlocked' ? a.unlocked
      : filter === 'progress' ? (!a.unlocked && !!a.progress)
      : !a.unlocked;

    // unlocked first, then by progress, then locked-no-progress
    const shown = achievements.filter(matches).slice().sort((a, b) => {
      const rank = (x) => x.unlocked ? 0 : x.progress ? 1 : 2;
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      if (a.progress && b.progress) return b.progress.value / b.progress.max - a.progress.value / a.progress.max;
      return 0;
    });

    const count = (id) =>
      id === 'all' ? achievements.length
      : id === 'unlocked' ? unlocked.length
      : id === 'progress' ? inProgress.length
      : achievements.filter((a) => !a.unlocked).length;

    return (
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* hero */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 20 }}>
          <div className="atlas-topo" style={{
            position: 'relative', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-gold)',
            padding: 28, overflow: 'hidden', boxShadow: 'var(--glow-gold-sm), var(--ring-top)',
            display: 'flex', alignItems: 'center', gap: 26,
          }}>
            <ProgressRing value={pct} size={124} stroke={12} label="Completed" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Trophy Case · Lifetime</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                <span className="atlas-gold-text" style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 46, lineHeight: 1,
                  letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums',
                }}>{points.toLocaleString()}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  / {possible.toLocaleString()} pts
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <Badge variant="gold" dot>{unlocked.length} of {achievements.length} unlocked</Badge>
                <Badge variant="neutral">Adds to Outdoor Score</Badge>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 28px' }}>
                {TIERS.map((t) => <Medal key={t.id} tier={t} {...tierCount(t.id)} />)}
              </div>
            </div>
          </div>

          <AtlasPanel title="Closest to unlock" action={<Badge variant="gold">+{inProgress.reduce((s, a) => s + a.points, 0).toLocaleString()} pts</Badge>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {inProgress.slice(0, 4).map((a) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <span style={{
                    width: 38, height: 38, flex: '0 0 auto', borderRadius: 'var(--radius-md)',
                    display: 'grid', placeItems: 'center', background: 'var(--surface-sunken)',
                    border: '1px solid var(--border-default)', color: 'var(--text-secondary)',
                  }}><Icon name={a.icon} size={18} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', flex: '0 0 auto' }}>{a.progress.value}/{a.progress.max}</span>
                    </div>
                    <ProgressBar value={a.progress.value} max={a.progress.max} color={a.tier === 'platinum' ? 'sky' : 'gold'} />
                  </div>
                </div>
              ))}
            </div>
          </AtlasPanel>
        </div>

        {/* filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-pill)' }}>
            {FILTERS.map(([id, l]) => {
              const on = filter === id;
              return (
                <button key={id} onClick={() => setFilter(id)} style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '0 16px', height: 34,
                  borderRadius: 'var(--radius-pill)', cursor: 'pointer', border: 'none',
                  fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
                  background: on ? 'var(--accent)' : 'transparent',
                  color: on ? 'var(--text-on-gold)' : 'var(--text-secondary)',
                  boxShadow: on ? 'var(--glow-gold-sm)' : 'none', transition: 'var(--t-colors)',
                }}>
                  {l}
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700,
                    padding: '1px 6px', borderRadius: 'var(--radius-pill)',
                    background: on ? 'rgba(0,0,0,.16)' : 'var(--surface-sunken)',
                    color: on ? 'var(--text-on-gold)' : 'var(--text-muted)',
                  }}>{count(id)}</span>
                </button>
              );
            })}
          </div>
          <Button variant="ghost" size="sm" leftIcon={M('share-2', 15)} onClick={() => onNav('dashboard')}>Share trophy case</Button>
        </div>

        {/* grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {shown.map((a) => (
            <AchievementBadge
              key={a.id}
              title={a.title}
              description={(
                <React.Fragment>
                  {a.desc}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)' }}>
                    <Icon name={a.unlocked ? 'calendar-check' : 'users'} size={11} />
                    {a.unlocked ? `Earned ${a.date}` : `${a.rarity}% of explorers have this`}
                  </span>
                </React.Fragment>
              )}
              tier={a.tier}
              points={a.points}
              unlocked={a.unlocked}
              progress={a.progress}
              icon={<Icon name={a.unlocked ? a.icon : 'lock'} size={a.unlocked ? 24 : 20} />}
            />
          ))}
        </div>
      </div>
    );
  }

  window.WebAchievements = WebAchievements;
})();
