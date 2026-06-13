# Atlas Design System

**Atlas** is a completionist platform for outdoor exploration — *Letterboxd for adventures, Steam achievements for hiking, a Pokédex for trails, peaks, regions and landmarks.* It sits on top of Strava, Garmin, Komoot, AllTrails and GPX files, imports a user's history, and turns it into **collections, achievements, exploration coverage and long-term goals**.

Atlas does **not** plan routes, navigate, or record activities. It is a *lifetime record* and a *trophy case* — a premium game profile for the outdoors, not a fitness tracker.

> The emotional job of every screen: make people proud of what they've explored and itch to complete what remains.

This project **is** the design system — an automated compiler reads it and ships `_ds_bundle.js` + `_ds_manifest.json` to consuming projects. There is no external codebase or Figma; this brand was created from the product brief.

---

## Sources

- **Product brief** (provided in chat) — company description, core objects, platform split, design direction, and the five hero screens. No codebase, Figma, or prior brand assets were supplied; all visuals here are original to this system.
- Fonts: **Space Grotesk**, **Hanken Grotesk**, **Space Mono** — Google Fonts (loaded via `tokens/fonts.css`).
- Icons: **Lucide** (CDN) — see ICONOGRAPHY.

---

## Content fundamentals

How Atlas writes.

- **Voice:** confident, warm, quietly aspirational. A knowledgeable hiking companion, never a drill sergeant or a hype-bot. Achievement is earned, not gamified into noise.
- **Person:** address the user as **you** ("You've explored 68% of the Lake District"). Atlas refers to itself as **Atlas** or **we**, sparingly.
- **Casing:** **Sentence case** for everything readable — headings, buttons, body ("Connect a source", "Closest to completion"). **UPPERCASE** is reserved for mono data-labels and eyebrows ("OUTDOOR SCORE", "SUMMIT · TRIG POINT") where it reads as cartographic annotation, not shouting.
- **Numbers lead.** Copy is built around figures: `43 / 282 Munros`, `68% explored`, `93 remaining`, `+120 pts`. Always show progress *and* the gap ("121 / 214 · 93 to go"). Use thousands separators (`14,820`). Metric units (m, km).
- **Completion language:** "collected", "unlocked", "explored", "remaining", "closest to completion", "missing nearby", "to go". Frame everything as a collection with a gap to close.
- **Achievements** get evocative proper-noun names + a plain how-to subtitle: *"Skyliner — Climb three 800m summits in one day."* Tiers are Bronze / Silver / Gold / Platinum and award points.
- **Tone examples:**
  - Eyebrow: `LAKE DISTRICT · 68% EXPLORED`
  - Goal nudge: "Blencathra — 2 peaks from your next Wainwright badge"
  - Empty/locked: "78 / 100 to unlock" (always a number, never "keep going!")
- **No emoji.** Iconography carries visual meaning; emoji would cheapen the premium feel. No exclamation-mark hype.

---

## Visual foundations

The system is **dark-first** and **cartographic**. Think a premium game profile crossed with a beautifully printed topo map at night.

- **Color.** A cool near-black ink scale (`--ink-950 … --ink-50`) is the canvas. **Summit Gold (`#F4B740`)** is the one brand color — it means achievement, completion, score, and the single primary action per view. Three supporting accents, each with a job: **Sky** (`#46B6E8`) = in-progress, **Spruce** (`#37BE76`) = completed/explored, **Coral** (`#F2705A`) = alerts. Medal tiers (bronze/silver/gold/platinum) and a **gold exploration heatmap ramp** (`--heat-0…4`, GitHub-contribution style) round it out. Never introduce new hues; derive from these.
- **Type.** **Space Grotesk** for display/headings and all large stat numerals (tight tracking, tabular figures). **Hanken Grotesk** for body & UI (1.45 leading). **Space Mono** for data: coordinates, elevation, eyebrows, stat captions — uppercase, wide tracking (0.08–0.16em). The mono labels are a signature; they make data feel surveyed.
- **Spacing.** 4px base grid (`--space-1…12`). Generous gutters (24px), roomy cards.
- **Backgrounds.** Mostly flat ink. The signature texture is **`.atlas-topo`** — faint repeating contour lines (`assets/topo-contours.svg`) plus a soft warm radial glow top-right and a cool one bottom-left. Used on profile covers and region hero banners, never behind dense data. The Explore map uses a full-bleed stylized terrain (`assets/map-terrain.svg`). No photographic imagery is shipped (see CAVEATS) — use `image-slot` placeholders if a layout needs photos.
- **Gradients** are restrained: gold gradient *text* for hero numerals (`.atlas-gold-text`), gradient *fills* inside progress bars/rings, and the ambient map glows. **No** full-screen purple/blue gradient backgrounds.
- **Elevation.** Depth on dark = a slightly lighter fill + a soft shadow + a 1px inset top highlight (`--ring-top`). Cards: `--surface-card` + `--border-subtle` + `--shadow-sm` + ring-top, radius **14px** (`--radius-lg`). The **gold glow** (`--glow-gold-sm/md/lg`) is earned — it marks unlocked achievements, the score meter, completed collections, and featured cards. Tier glows for medals.
- **Borders.** Hairline white-alpha (`--border-subtle` 6% → `--border-strong` 16%). Gold border (`--border-gold`) signals emphasis/selection.
- **Radii.** Controls 10px, cards 14px, large sheets 18–24px, pills 999px. Avatars & medals are circles.
- **Motion.** Smooth and confident, never bouncy by default — `--ease-out` for UI, `--dur-quick` (180ms) typical. The one indulgence: `--ease-emphasis` (a gentle overshoot) is reserved for achievement-unlock reveals. Progress bars/rings animate their fill on mount (`--dur-slow`). Respect `prefers-reduced-motion`.
- **Hover/press.** Hover = lighter surface and/or a 2px lift on cards; primary buttons add the gold glow. Press = `translateY(1px)` and a darker gold. Tags/nav use the gold soft-tint + gold border when selected.
- **Transparency & blur.** Frosted overlays (`.atlas-glass`, `--surface-overlay` + `backdrop-blur`) for sticky bars, the mobile tab bar, map sheets and popovers — anything floating over the map or content. Solid surfaces everywhere else.
- **Imagery vibe (when added):** cool, slightly desaturated, dusk/dawn alpine — to sit naturally on the ink canvas and let gold pop. Avoid warm sunny stock-photo energy.

---

## Theming (dark + light)

Atlas is **dark by default**; a **light "paper" variant** is opt-in via `data-theme="light"` on any ancestor (the kits set it on `<html>`).

- **How it works.** The base palette (ink scale, Summit Gold, accents, tiers) never changes. Only the **semantic** tokens are remapped inside the `[data-theme="light"]` scope (`tokens/theme-light.css`): surfaces become a cool paper set (`--bg-app` `#E9EDF1`, `--surface-card` `#FFFFFF`), text becomes ink, borders flip to dark-alpha, shadows soften and cool, the heatmap ramp goes paper→gold, and gold glows ease off. So **any component built on the semantic tokens themes automatically** — build with `--surface-card` / `--text-primary` / `--border-default`, never a raw `--ink-*` or hex.
- **Brand utilities** are re-skinned for light too: `.atlas-topo` swaps to ink contour lines (`assets/topo-contours-ink.svg`) with warmer glows, and `.atlas-gold-text` darkens to a `gold-600 → gold-700` gradient so hero numerals stay legible on paper.
- **The Explore map adapts:** a light terrain (`assets/map-terrain-light.svg`) replaces the night map; routes, markers and the frosted sheet/legend read on both.
- **Switching it:** set `document.documentElement.dataset.theme = 'light' | 'dark'`. In the **mobile** kit it's a preference (Profile → Appearance, Dark/Light segmented control). In the **web** kit it's the sun/moon toggle in the top bar. Persist the choice in `localStorage` in production; the kits keep it in component state.
- **Gotcha:** inline `background-image` overrides beat the themed `.atlas-topo` rule — prefer the class, or branch the asset on theme (as `ExploreScreen` does for the map).

---

## Iconography

- **System:** [Lucide](https://lucide.dev) loaded from CDN (`https://unpkg.com/lucide@latest`). Clean, consistent **2px stroke**, rounded joins — it matches the cartographic line-work and the contour motif. This was an original choice for the brand (no icon set was supplied); it is flagged as a substitution-by-default in CAVEATS.
- **Wrapper:** use the `Icon` component (`<Icon name="mountain" size={20} />`) so sizing/stroke stay consistent. After React renders, call `window.lucide.createIcons()` (the kits do this in an effect).
- **Common glyphs:** `mountain`, `triangle` (trig/county tops), `route` (trails), `map` / `map-pin`, `flag`, `trophy`, `award`, `target`, `compass`, `footprints`, `tent` (bothies), `droplets` (waterfalls), `lock` (locked achievements), `check`, `chevron-right`.
- **Stroke weight bumps** to ~2.3–2.4 for active nav/selected states; color shifts to `--gold-400`.
- **No emoji. No unicode-glyph icons.** The Roman numerals on medal tiers (III/II/I) and `★` for platinum are intentional typographic marks, not icon substitutes.
- **Logo:** the Atlas mark is **nested contour-chevrons** — reads simultaneously as a summit, a contour map, and the letter "A". Files in `assets/`: `atlas-mark.svg` (gold), `atlas-mark-light.svg`, `atlas-mark-ink.svg`, `atlas-logo.svg` (lockup, light wordmark for dark bg), `atlas-logo-ink.svg` (for light bg).

---

## Index / manifest

**Root**
- `styles.css` — global entry (import this). `@import`s only.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `elevation.css`, `motion.css`, `base.css` (reset + `.atlas-topo`, `.atlas-glass`, `.atlas-gold-text`, `.eyebrow`), `theme-light.css` (the `[data-theme="light"]` paper variant).
- `assets/` — `atlas-mark*.svg`, `atlas-logo*.svg`, `topo-contours.svg` + `topo-contours-ink.svg` (tiling texture, dark/light), `map-terrain.svg` + `map-terrain-light.svg` (Explore backdrop, dark/light).
- `SKILL.md` — Agent-Skill front matter for use in Claude Code.

**Components** (`window.AtlasDesignSystem_e1d28e`)
- `components/core/` — `Icon`, `Button`, `Badge`, `Card`, `Avatar`, `Tag`.
- `components/progress/` — `ProgressBar`, `ProgressRing`, `StatBlock`, `HeatGrid`.
- `components/collection/` — `CollectionCard`, `AchievementBadge`, `CollectibleItem`, `ScoreMeter`.
  Each has a `.jsx`, `.d.ts` (props), `.prompt.md` (usage), and a directory `*.card.html` thumbnail.

**UI kits**
- `ui_kits/mobile/` — the **mobile app** in an iOS frame: Home dashboard, Explore map, Collections + collection detail (Pokédex grid), Achievement gallery, Profile. Interactive bottom-tab navigation. Entry: `index.html`.
- `ui_kits/web/` — the **web power-user dashboard**: Dashboard (score, activity heatmap, next goals, closest-to-completion, recent unlocks) and the **Lake District region progress** page. Sidebar navigation. Entry: `index.html`.

**Foundations specimen cards** — `guidelines/*.html` (rendered in the Design System tab): colors (ink, gold, accents, tiers, heatmap, semantic), type (display, stat, body, mono), spacing (scale, radii, elevation), brand (logo, topo motif).

---

## CAVEATS / open questions

See the end-of-build note in chat — fonts and icon set are sensible defaults chosen for the brand (no originals existed), and no photographic imagery is bundled. Flagged for your confirmation.
