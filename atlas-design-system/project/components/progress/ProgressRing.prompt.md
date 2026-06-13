Circular completion dial for region coverage and collection totals. Full rings glow gold.

```jsx
<ProgressRing value={68} label="Lake District" />
<ProgressRing value={43} max={282} size={120} color="gold" />
<ProgressRing value={100}><Icon name="check" size={28} color="var(--gold-400)" /></ProgressRing>
```

Center shows a % by default; pass `children` to override (e.g. a count or icon). Colors: `gold | sky | spruce`.
