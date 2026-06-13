Base surface for grouping content on the dark canvas. Everything sits on a Card.

```jsx
<Card>…</Card>
<Card interactive onClick={open}>…</Card>
<Card emphasis pad="lg">Featured achievement</Card>
```

`pad`: `none | sm | md | lg`. `interactive` adds hover-raise. `emphasis` gives the gold glow for featured/unlocked items. Use `pad="none"` when the card contains edge-to-edge media.
