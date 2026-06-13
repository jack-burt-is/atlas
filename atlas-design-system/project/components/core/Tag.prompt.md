Filter chip for category and collection-type filtering (Peaks · Trails · Regions · Landmarks).

```jsx
<Tag selected count={282}>Munros</Tag>
<Tag icon={<Icon name="route" size={14} />}>Trails</Tag>
<Tag onRemove={() => clear('lake-district')}>Lake District</Tag>
```

`selected` gives the gold state; `count` adds a mono count; `onRemove` adds a × for active filters. Set `interactive={false}` for a read-only label.
