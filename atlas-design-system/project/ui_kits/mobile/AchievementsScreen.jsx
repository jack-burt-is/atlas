/* Atlas mobile · Achievement gallery. Exports window.AchievementsScreen */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const { Icon, AchievementBadge, Tag, StatBlock, Card } = DS;

  function AchievementsScreen() {
    const { achievements } = window.AtlasData;
    const [tab, setTab] = React.useState('all');
    const unlocked = achievements.filter((a) => a.unlocked);
    const pts = unlocked.reduce((s, a) => s + a.points, 0);
    const shown = achievements.filter((a) => tab === 'all' || (tab === 'unlocked' ? a.unlocked : !a.unlocked));
    return (
      <div>
        <window.AtlasMobileHeader eyebrow="Trophy case" title="Achievements" />

        <div style={{ padding: '0 20px', marginBottom: 22, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Card pad="sm" style={{ textAlign: 'center' }}><StatBlock align="center" size="sm" label="Unlocked" value={`${unlocked.length}/${achievements.length}`} /></Card>
          <Card pad="sm" style={{ textAlign: 'center' }}><StatBlock align="center" size="sm" label="Points" value={pts.toLocaleString()} gold /></Card>
          <Card pad="sm" style={{ textAlign: 'center' }}><StatBlock align="center" size="sm" label="Platinum" value="1" /></Card>
        </div>

        <div style={{ padding: '0 20px', marginBottom: 16, display: 'flex', gap: 8 }}>
          {[['all', 'All'], ['unlocked', 'Unlocked'], ['locked', 'Locked']].map(([id, l]) => (
            <Tag key={id} selected={tab === id} onClick={() => setTab(id)}>{l}</Tag>
          ))}
        </div>

        <div style={{ padding: '0 20px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shown.map((a) => (
            <AchievementBadge key={a.id} title={a.title} description={a.desc} tier={a.tier}
              points={a.points} unlocked={a.unlocked} progress={a.progress}
              icon={<Icon name={a.unlocked ? a.icon : 'lock'} size={a.unlocked ? 24 : 20} />} />
          ))}
        </div>
      </div>
    );
  }

  window.AchievementsScreen = AchievementsScreen;
})();
