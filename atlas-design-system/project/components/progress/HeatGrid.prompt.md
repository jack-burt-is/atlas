Exploration heatmap — the GitHub-contribution motif applied to outdoor activity. A signature Atlas visual.

```jsx
<HeatGrid columns={30} rows={7} />
<HeatGrid data={[0,1,2,4,3,1,...]} cell={11} />
```

Cells use the `--heat-0…4` gold ramp (0 = unexplored). Pass real `data` (levels 0–4) for activity density, region coverage, or a year-in-review strip.
