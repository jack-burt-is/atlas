Linear completion bar — Atlas's most-used element. Defaults to a gold gradient; full bars glow.

```jsx
<ProgressBar label="Wainwrights" value={121} max={214} />
<ProgressBar label="Pennine Way" value={64} color="sky" />
<ProgressBar value={100} size="lg" />
```

`max=100` renders a %, otherwise "value / max". Colors: `gold` (default), `sky` (in-progress), `spruce` (completed). Pass `valueFormat` for custom readouts.
