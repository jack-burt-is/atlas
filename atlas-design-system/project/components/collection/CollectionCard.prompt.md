A completionist collection with progress — the core unit of the Collections surface.

```jsx
<CollectionCard title="Wainwrights" type="Peaks" value={121} max={214}
  icon={<Icon name="mountain" size={26} />} />
<CollectionCard title="Pennine Way" type="National Trail" value={32} max={32}
  icon={<Icon name="route" size={26} />} />
```

Completed collections (value ≥ max) get the gold glow and a "Completed" caption. Pass `image` for a real thumbnail instead of an icon.
