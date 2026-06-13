Steam/Xbox-style achievement — locked or unlocked, tiered, worth points.

```jsx
<AchievementBadge unlocked tier="gold" points={500} title="Skyliner"
  description="Climb three 800m summits in one day"
  icon={<Icon name="mountain" size={26} />} />

<AchievementBadge tier="silver" points={250} title="Centurion"
  description="Visit 100 unique summits"
  icon={<Icon name="lock" size={20} />}
  progress={{ value: 312, max: 100 }} />
```

Locked badges dim and can show `progress` toward unlock. Tiers: `bronze | silver | gold | platinum`. Use a lock icon for the locked glyph.
