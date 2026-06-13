---
name: atlas-design
description: Use this skill to generate well-branded interfaces and assets for Atlas, the completionist platform for outdoor exploration, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Fast orientation
- **What Atlas is:** a lifetime record + trophy case for outdoor exploration (collections, achievements, exploration coverage, Outdoor Score). NOT a route planner, navigator, or activity recorder. Premium game profile, never a fitness tracker.
- **Foundations:** `styles.css` is the single entry point — link it and use the CSS custom properties (`--accent` / Summit Gold, the `--ink-*` scale, `--surface-card`, `--glow-gold-*`, `--heat-0…4`, `--font-display/sans/mono`). Tokens live in `tokens/`.
- **Components:** load `_ds_bundle.js` and read from `window.AtlasDesignSystem_e1d28e` (Button, Badge, Card, Tag, Avatar, Icon, ProgressBar, ProgressRing, StatBlock, HeatGrid, CollectionCard, AchievementBadge, CollectibleItem, ScoreMeter). Each component dir has a `.prompt.md` with usage.
- **Icons:** Lucide via `<script src="https://unpkg.com/lucide@latest">`; use the `Icon` component and call `lucide.createIcons()` after render.
- **Full reference UIs:** `ui_kits/mobile/` (app) and `ui_kits/web/` (dashboard). Read these to see the brand assembled.
- **Voice & visuals:** see the CONTENT FUNDAMENTALS and VISUAL FOUNDATIONS sections of `readme.md`. Dark-first, cartographic, sentence-case copy, mono uppercase data-labels, gold = achievement, numbers lead, no emoji.
