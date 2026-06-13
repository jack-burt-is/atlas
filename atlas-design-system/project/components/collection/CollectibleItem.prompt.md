A single collectible — peak, trig point, bothy, waterfall — in a Pokédex-style grid.

```jsx
<CollectibleItem collected name="Helvellyn"
  meta={<><b>950m</b><span>×3 visits</span></>}
  icon={<Icon name="mountain" size={30} />}
  checkIcon={<Icon name="check" size={13} />} />

<CollectibleItem name="Skiddaw" meta={<b>931m</b>}
  icon={<Icon name="mountain" size={30} />} />
```

`collected` switches the tile from muted silhouette to the gold "got it" state with a check corner. Lay out in a responsive grid for the collection feel.
