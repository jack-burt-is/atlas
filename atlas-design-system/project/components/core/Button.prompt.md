Primary call-to-action. Gold primary for the single most important action on a view; secondary/ghost for everything else.

```jsx
<Button variant="primary" leftIcon={<Icon name="plus" size={16} />}>Connect a source</Button>
<Button variant="secondary">View all</Button>
<Button variant="ghost" size="sm">Skip</Button>
```

Variants: `primary` (gold), `secondary` (raised surface), `ghost`, `danger`. Sizes `sm | md | lg`. `block` stretches full width. Use exactly one primary button per view.
