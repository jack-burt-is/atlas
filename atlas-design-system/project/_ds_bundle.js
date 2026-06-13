/* @ds-bundle: {"format":3,"namespace":"AtlasDesignSystem_e1d28e","components":[{"name":"AchievementBadge","sourcePath":"components/collection/AchievementBadge.jsx"},{"name":"CollectibleItem","sourcePath":"components/collection/CollectibleItem.jsx"},{"name":"CollectionCard","sourcePath":"components/collection/CollectionCard.jsx"},{"name":"ScoreMeter","sourcePath":"components/collection/ScoreMeter.jsx"},{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"HeatGrid","sourcePath":"components/progress/HeatGrid.jsx"},{"name":"ProgressBar","sourcePath":"components/progress/ProgressBar.jsx"},{"name":"ProgressRing","sourcePath":"components/progress/ProgressRing.jsx"},{"name":"StatBlock","sourcePath":"components/progress/StatBlock.jsx"}],"sourceHashes":{"components/collection/AchievementBadge.jsx":"d3414b326ba2","components/collection/CollectibleItem.jsx":"ba2841f61c1f","components/collection/CollectionCard.jsx":"0c0a908f99f6","components/collection/ScoreMeter.jsx":"7368056f816a","components/core/Avatar.jsx":"b6caeaf0c55e","components/core/Badge.jsx":"d681fa2e39d3","components/core/Button.jsx":"3681a94cb0a5","components/core/Card.jsx":"4e1bffaaf82d","components/core/Icon.jsx":"f3838ac63982","components/core/Tag.jsx":"0309ff5e1b1c","components/progress/HeatGrid.jsx":"fbd357933cd5","components/progress/ProgressBar.jsx":"714772125ff9","components/progress/ProgressRing.jsx":"9383d5ee72ad","components/progress/StatBlock.jsx":"e79382ec441c","marketing/app.jsx":"7106313dd0b5","marketing/data.js":"94a8ff7fe5cc","marketing/features.jsx":"8be8d89b6b0f","marketing/nav-hero.jsx":"378452e4b965","marketing/pricing.jsx":"0a6d5350b049","marketing/scene.jsx":"171a24b3c2bc","marketing/showcase.jsx":"30cf38b825a3","ui_kits/mobile/AchievementsScreen.jsx":"b7acec2e38ff","ui_kits/mobile/Chrome.jsx":"04b9dc4250dc","ui_kits/mobile/CollectionsScreen.jsx":"c3abdf467dcc","ui_kits/mobile/ExploreScreen.jsx":"0ace1ff43448","ui_kits/mobile/HomeScreen.jsx":"3bce268fd5d3","ui_kits/mobile/ProfileScreen.jsx":"c9a9714bf5ee","ui_kits/mobile/data.js":"0e009467f4a9","ui_kits/mobile/ios-frame.jsx":"be3343be4b51","ui_kits/web/Achievements.jsx":"eac504d4fdd8","ui_kits/web/Collections.jsx":"56d96e21a465","ui_kits/web/Dashboard.jsx":"7d8a27b3cd62","ui_kits/web/Map.jsx":"d4e56d259d01","ui_kits/web/Region.jsx":"33ceb12c93bc","ui_kits/web/Shell.jsx":"6d9d0f285f5e","ui_kits/web/data.js":"f5e792251fbb"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AtlasDesignSystem_e1d28e = window.AtlasDesignSystem_e1d28e || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/collection/AchievementBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas · AchievementBadge
   Steam/Xbox-style achievement. Locked or unlocked, tiered, with points
   and optional progress toward the next unlock. */

const TIER = {
  bronze: {
    color: 'var(--tier-bronze)',
    glow: 'var(--glow-bronze)',
    soft: 'rgba(199,123,67,.16)'
  },
  silver: {
    color: 'var(--tier-silver)',
    glow: 'var(--glow-silver)',
    soft: 'rgba(180,193,205,.14)'
  },
  gold: {
    color: 'var(--tier-gold)',
    glow: 'var(--glow-gold-md)',
    soft: 'var(--accent-soft)'
  },
  platinum: {
    color: 'var(--tier-platinum)',
    glow: 'var(--glow-platinum)',
    soft: 'rgba(143,224,230,.14)'
  }
};
const CSS = `
.atlas-ach{
  display:flex; gap:14px; align-items:center; width:100%; text-align:left;
  background:var(--surface-card); border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg); box-shadow:var(--shadow-sm), var(--ring-top);
  padding:14px; font-family:var(--font-sans); transition:var(--t-colors), transform var(--dur-quick) var(--ease-out);
}
.atlas-ach--unlocked{ cursor:pointer; }
.atlas-ach--unlocked:hover{ transform:translateY(-2px); box-shadow:var(--shadow-md), var(--ring-top); }
.atlas-ach--locked{ opacity:.72; }
.atlas-ach__medal{
  position:relative; flex:0 0 auto; width:56px; height:56px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
}
.atlas-ach__lockwrap{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:var(--text-muted); }
.atlas-ach__body{ flex:1; min-width:0; }
.atlas-ach__top{ display:flex; align-items:center; gap:8px; margin-bottom:3px; }
.atlas-ach__title{ font-family:var(--font-display); font-weight:600; font-size:15px; color:var(--text-primary); letter-spacing:-.01em; }
.atlas-ach--locked .atlas-ach__title{ color:var(--text-secondary); }
.atlas-ach__desc{ font-size:13px; color:var(--text-muted); line-height:1.4; }
.atlas-ach__pts{
  flex:0 0 auto; display:flex; flex-direction:column; align-items:flex-end; gap:3px; padding-left:8px;
}
.atlas-ach__ptval{ font-family:var(--font-display); font-weight:700; font-size:18px; color:var(--gold-400); font-variant-numeric:tabular-nums; line-height:1; }
.atlas-ach--locked .atlas-ach__ptval{ color:var(--text-faint); }
.atlas-ach__ptlbl{ font-family:var(--font-mono); font-size:9px; text-transform:uppercase; letter-spacing:.1em; color:var(--text-faint); white-space:nowrap; }
.atlas-ach__prog{ margin-top:8px; height:5px; border-radius:var(--radius-pill); background:var(--surface-sunken); overflow:hidden; }
.atlas-ach__progfill{ height:100%; background:linear-gradient(90deg, var(--gold-600), var(--gold-400)); border-radius:var(--radius-pill); }
.atlas-ach__progtxt{ font-family:var(--font-mono); font-size:10px; color:var(--text-muted); margin-top:5px; display:block; }
`;
function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-ach-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-ach-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}
function AchievementBadge({
  title,
  description = null,
  tier = 'bronze',
  points = 0,
  unlocked = false,
  icon = null,
  progress = null,
  // { value, max } toward unlock (locked only)
  className = '',
  ...rest
}) {
  ensure();
  const t = TIER[tier] || TIER.bronze;
  const pct = progress ? Math.min(100, progress.value / progress.max * 100) : 0;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['atlas-ach', unlocked ? 'atlas-ach--unlocked' : 'atlas-ach--locked', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "atlas-ach__medal",
    style: {
      background: unlocked ? t.soft : 'var(--surface-raised)',
      color: unlocked ? t.color : 'var(--text-faint)',
      boxShadow: unlocked ? t.glow : 'inset 0 0 0 1px var(--border-default)'
    }
  }, unlocked ? icon : /*#__PURE__*/React.createElement("span", {
    className: "atlas-ach__lockwrap"
  }, icon)), /*#__PURE__*/React.createElement("span", {
    className: "atlas-ach__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atlas-ach__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atlas-ach__title"
  }, title)), description && /*#__PURE__*/React.createElement("span", {
    className: "atlas-ach__desc"
  }, description), !unlocked && progress && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "atlas-ach__prog"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atlas-ach__progfill",
    style: {
      width: `${pct}%`,
      display: 'block'
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "atlas-ach__progtxt"
  }, progress.value, " / ", progress.max, " to unlock"))), /*#__PURE__*/React.createElement("span", {
    className: "atlas-ach__pts"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atlas-ach__ptval"
  }, points), /*#__PURE__*/React.createElement("span", {
    className: "atlas-ach__ptlbl"
  }, tier, " \xB7 pts")));
}
Object.assign(__ds_scope, { AchievementBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/collection/AchievementBadge.jsx", error: String((e && e.message) || e) }); }

// components/collection/CollectibleItem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas · CollectibleItem
   A single collectible — a peak, trig point, bothy, waterfall. Pokédex-style
   tile that reads as "collected" (gold) or "not yet" (muted silhouette). */

const CSS = `
.atlas-item{
  position:relative; display:flex; flex-direction:column; gap:9px; width:100%;
  background:var(--surface-card); border:1px solid var(--border-subtle);
  border-radius:var(--radius-md); padding:13px; font-family:var(--font-sans);
  text-align:left; cursor:pointer; transition:var(--t-colors), transform var(--dur-quick) var(--ease-out);
}
.atlas-item:hover{ transform:translateY(-2px); border-color:var(--border-default); }
.atlas-item__media{
  width:100%; aspect-ratio:1.4; border-radius:var(--radius-sm); overflow:hidden;
  display:flex; align-items:center; justify-content:center;
  background:linear-gradient(150deg, var(--surface-raised), var(--surface-sunken));
  border:1px solid var(--border-subtle); position:relative;
}
.atlas-item__media img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.atlas-item--missing .atlas-item__media img{ filter:grayscale(1) brightness(.46) contrast(.95); }
.atlas-item--got .atlas-item__media{ background:linear-gradient(150deg, var(--accent-soft-2), var(--surface-sunken)); border-color:var(--border-gold); color:var(--gold-400); }
.atlas-item--missing .atlas-item__media{ color:var(--text-faint); }
.atlas-item__check{
  position:absolute; top:6px; right:6px; width:20px; height:20px; border-radius:50%;
  background:var(--accent); color:var(--text-on-gold); display:flex; align-items:center; justify-content:center;
  box-shadow:var(--glow-gold-sm);
}
.atlas-item__name{ font-family:var(--font-display); font-weight:600; font-size:14px; color:var(--text-primary); letter-spacing:-.01em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.atlas-item--missing .atlas-item__name{ color:var(--text-muted); }
.atlas-item__meta{ font-family:var(--font-mono); font-size:11px; color:var(--text-muted); display:flex; gap:8px; }
.atlas-item__meta b{ color:var(--text-secondary); font-weight:700; }
`;
function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-item-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-item-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}
function CollectibleItem({
  name,
  meta = null,
  icon = null,
  image = null,
  collected = false,
  checkIcon = null,
  className = '',
  ...rest
}) {
  ensure();
  return /*#__PURE__*/React.createElement("button", _extends({
    className: ['atlas-item', collected ? 'atlas-item--got' : 'atlas-item--missing', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "atlas-item__media"
  }, icon, image && /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: "",
    loading: "lazy",
    onError: e => {
      e.currentTarget.style.display = 'none';
    }
  }), collected && /*#__PURE__*/React.createElement("span", {
    className: "atlas-item__check"
  }, checkIcon)), /*#__PURE__*/React.createElement("span", {
    className: "atlas-item__name"
  }, name), meta && /*#__PURE__*/React.createElement("span", {
    className: "atlas-item__meta"
  }, meta));
}
Object.assign(__ds_scope, { CollectibleItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/collection/CollectibleItem.jsx", error: String((e && e.message) || e) }); }

// components/collection/CollectionCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas · CollectionCard
   A completionist collection (Munros, Wainwrights, a National Trail…)
   with progress. Self-contained; pass an icon node and optional image. */

const CSS = `
.atlas-coll{
  position:relative; display:flex; gap:14px; align-items:center;
  background:var(--surface-card); border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg); box-shadow:var(--shadow-sm), var(--ring-top);
  padding:14px; cursor:pointer; transition:var(--t-colors), transform var(--dur-quick) var(--ease-out);
  text-align:left; width:100%; font-family:var(--font-sans);
}
.atlas-coll:hover{ transform:translateY(-2px); border-color:var(--border-default); box-shadow:var(--shadow-md), var(--ring-top); }
.atlas-coll--done{ border-color:var(--border-gold); box-shadow:var(--glow-gold-sm), var(--ring-top); }
.atlas-coll__media{
  flex:0 0 auto; width:60px; height:60px; border-radius:var(--radius-md);
  display:flex; align-items:center; justify-content:center; overflow:hidden;
  background:linear-gradient(150deg, var(--surface-raised), var(--surface-sunken));
  border:1px solid var(--border-default); color:var(--gold-400);
}
.atlas-coll__media img{ width:100%; height:100%; object-fit:cover; }
.atlas-coll__body{ flex:1; min-width:0; display:flex; flex-direction:column; gap:8px; }
.atlas-coll__top{ display:flex; align-items:baseline; justify-content:space-between; gap:10px; }
.atlas-coll__type{ font-family:var(--font-mono); font-size:10px; text-transform:uppercase; letter-spacing:.12em; color:var(--text-muted); }
.atlas-coll__title{ font-family:var(--font-display); font-weight:600; font-size:16px; color:var(--text-primary); letter-spacing:-.01em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.atlas-coll__count{ font-family:var(--font-mono); font-size:13px; font-weight:700; color:var(--text-primary); font-variant-numeric:tabular-nums; flex:0 0 auto; white-space:nowrap; }
.atlas-coll__count b{ color:var(--gold-400); }
.atlas-coll__track{ height:7px; border-radius:var(--radius-pill); background:var(--surface-sunken); overflow:hidden; box-shadow:inset 0 1px 2px rgba(0,0,0,.4); }
.atlas-coll__fill{ height:100%; border-radius:var(--radius-pill); background:linear-gradient(90deg, var(--gold-600), var(--gold-400)); transition:width var(--dur-slow) var(--ease-out); }
.atlas-coll--done .atlas-coll__fill{ background:linear-gradient(90deg, var(--gold-500), var(--gold-300)); box-shadow:0 0 10px rgba(244,183,64,.5); }
.atlas-coll__pct{ font-family:var(--font-mono); font-size:11px; color:var(--text-muted); }
`;
function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-coll-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-coll-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}
function CollectionCard({
  title,
  type = 'Collection',
  value = 0,
  max = 100,
  icon = null,
  image = null,
  className = '',
  ...rest
}) {
  ensure();
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const done = pct >= 100;
  return /*#__PURE__*/React.createElement("button", _extends({
    className: ['atlas-coll', done ? 'atlas-coll--done' : '', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "atlas-coll__media"
  }, image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: ""
  }) : icon), /*#__PURE__*/React.createElement("span", {
    className: "atlas-coll__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atlas-coll__top"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "atlas-coll__type"
  }, type), /*#__PURE__*/React.createElement("span", {
    className: "atlas-coll__title",
    style: {
      display: 'block'
    }
  }, title)), /*#__PURE__*/React.createElement("span", {
    className: "atlas-coll__count"
  }, /*#__PURE__*/React.createElement("b", null, value), " / ", max)), /*#__PURE__*/React.createElement("span", {
    className: "atlas-coll__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atlas-coll__fill",
    style: {
      width: `${pct}%`,
      display: 'block'
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "atlas-coll__pct"
  }, done ? 'Completed' : `${Math.round(pct)}% complete · ${max - value} remaining`)));
}
Object.assign(__ds_scope, { CollectionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/collection/CollectionCard.jsx", error: String((e && e.message) || e) }); }

// components/collection/ScoreMeter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas · ScoreMeter
   The Outdoor Score + level display (Gamerscore-style). Shows the level
   chip, the gold score figure, and progress to the next level. */

const CSS = `
.atlas-score{
  display:flex; align-items:center; gap:16px; font-family:var(--font-sans);
  background:linear-gradient(135deg, var(--surface-raised), var(--surface-sunken));
  border:1px solid var(--border-gold); border-radius:var(--radius-lg);
  box-shadow:var(--glow-gold-sm), var(--ring-top); padding:16px 18px;
}
.atlas-score__lvl{
  flex:0 0 auto; width:52px; height:52px; border-radius:var(--radius-md);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  background:var(--accent); color:var(--text-on-gold); box-shadow:var(--glow-gold-sm);
}
.atlas-score__lvlnum{ font-family:var(--font-display); font-weight:700; font-size:22px; line-height:1; }
.atlas-score__lvllbl{ font-family:var(--font-mono); font-size:8px; text-transform:uppercase; letter-spacing:.14em; opacity:.8; }
.atlas-score__body{ flex:1; min-width:0; display:flex; flex-direction:column; gap:6px; }
.atlas-score__cap{ font-family:var(--font-mono); font-size:10px; text-transform:uppercase; letter-spacing:.14em; color:var(--text-muted); }
.atlas-score__val{ font-family:var(--font-display); font-weight:700; font-size:32px; line-height:1; letter-spacing:-.02em; font-variant-numeric:tabular-nums; white-space:nowrap; }
.atlas-score__next{ font-family:var(--font-mono); font-size:11px; color:var(--text-muted); }
.atlas-score__track{ height:7px; border-radius:var(--radius-pill); background:var(--surface-sunken); overflow:hidden; box-shadow:inset 0 1px 2px rgba(0,0,0,.4); }
.atlas-score__fill{ height:100%; border-radius:var(--radius-pill); background:linear-gradient(90deg, var(--gold-600), var(--gold-300)); transition:width var(--dur-slow) var(--ease-out); }
`;
function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-score-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-score-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}
function ScoreMeter({
  score = 0,
  level = 1,
  levelProgress = 0,
  // 0..100 toward next level
  toNext = null,
  // points remaining label
  className = '',
  ...rest
}) {
  ensure();
  const pct = Math.max(0, Math.min(100, levelProgress));
  const fmt = typeof score === 'number' ? score.toLocaleString() : score;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['atlas-score', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "atlas-score__lvl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atlas-score__lvlnum"
  }, level), /*#__PURE__*/React.createElement("span", {
    className: "atlas-score__lvllbl"
  }, "Level")), /*#__PURE__*/React.createElement("div", {
    className: "atlas-score__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atlas-score__cap"
  }, "Outdoor Score"), /*#__PURE__*/React.createElement("span", {
    className: "atlas-gold-text atlas-score__val"
  }, fmt), /*#__PURE__*/React.createElement("div", {
    className: "atlas-score__track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atlas-score__fill",
    style: {
      width: `${pct}%`
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "atlas-score__next"
  }, toNext != null ? toNext : `${Math.round(pct)}% to level ${level + 1}`)));
}
Object.assign(__ds_scope, { ScoreMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/collection/ScoreMeter.jsx", error: String((e && e.message) || e) }); }

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas · Avatar
   Circular user image or initials, with an optional gold level ring + badge. */

const CSS = `
.atlas-avatar{ position:relative; display:inline-flex; flex:0 0 auto; }
.atlas-avatar__img{
  width:100%; height:100%; border-radius:50%; object-fit:cover; display:block;
  background:var(--surface-raised); color:var(--text-secondary);
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-display); font-weight:700; letter-spacing:-.01em;
  border:1px solid var(--border-default);
}
.atlas-avatar--ring .atlas-avatar__img{ box-shadow:0 0 0 2px var(--bg-app), 0 0 0 4px var(--accent); }
.atlas-avatar__lvl{
  position:absolute; bottom:-3px; right:-3px;
  background:var(--accent); color:var(--text-on-gold);
  font-family:var(--font-display); font-weight:700; font-size:11px; line-height:1;
  min-width:20px; height:20px; padding:0 5px; border-radius:var(--radius-pill);
  display:flex; align-items:center; justify-content:center;
  border:2px solid var(--bg-app); box-shadow:var(--glow-gold-sm);
}
`;
function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-avatar-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-avatar-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}
function Avatar({
  src = null,
  name = '',
  size = 44,
  level = null,
  ring = false,
  className = '',
  ...rest
}) {
  ensure();
  const initials = name.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const fontSize = Math.round(size * 0.38);
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['atlas-avatar', ring ? 'atlas-avatar--ring' : '', className].filter(Boolean).join(' '),
    style: {
      width: size,
      height: size
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    className: "atlas-avatar__img",
    src: src,
    alt: name
  }) : /*#__PURE__*/React.createElement("span", {
    className: "atlas-avatar__img",
    style: {
      fontSize
    }
  }, initials || '?'), level != null && /*#__PURE__*/React.createElement("span", {
    className: "atlas-avatar__lvl"
  }, level));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas · Badge
   Small status / tier label. Tier variants carry the medal colors. */

const CSS = `
.atlas-badge{
  display:inline-flex; align-items:center; gap:5px;
  height:22px; padding:0 9px; border-radius:var(--radius-pill);
  font-family:var(--font-mono); font-size:11px; font-weight:700;
  text-transform:uppercase; letter-spacing:0.06em; line-height:1;
  border:1px solid transparent; white-space:nowrap;
}
.atlas-badge .dot{ width:6px; height:6px; border-radius:50%; background:currentColor; }
.atlas-badge--neutral{ background:var(--surface-raised); color:var(--text-secondary); border-color:var(--border-default); }
.atlas-badge--gold{ background:var(--accent-soft); color:var(--gold-300); border-color:var(--border-gold); }
.atlas-badge--success{ background:var(--success-soft); color:var(--spruce-300); }
.atlas-badge--info{ background:var(--info-soft); color:var(--sky-300); }
.atlas-badge--danger{ background:var(--danger-soft); color:var(--coral-300); }
.atlas-badge--bronze{ background:rgba(199,123,67,.16); color:var(--tier-bronze); border-color:rgba(199,123,67,.4); }
.atlas-badge--silver{ background:rgba(180,193,205,.14); color:var(--tier-silver); border-color:rgba(180,193,205,.4); }
.atlas-badge--platinum{ background:rgba(143,224,230,.14); color:var(--tier-platinum); border-color:rgba(143,224,230,.4); }
.atlas-badge--solid{ background:var(--accent); color:var(--text-on-gold); border-color:transparent; }
`;
function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-badge-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-badge-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}
function Badge({
  variant = 'neutral',
  dot = false,
  icon = null,
  className = '',
  children,
  ...rest
}) {
  ensure();
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['atlas-badge', `atlas-badge--${variant}`, className].filter(Boolean).join(' ')
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas · Button
   Primary action is Summit Gold with ink text — premium, confident.
   Variants: primary | secondary | ghost | danger.
   Sizes: sm | md | lg. Optional leftIcon / rightIcon nodes. */

const CSS = `
.atlas-btn{
  --_h: var(--control-md);
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  height:var(--_h); padding:0 18px; border-radius:var(--radius-md);
  font-family:var(--font-sans); font-size:14px; font-weight:600;
  letter-spacing:-0.005em; line-height:1; white-space:nowrap;
  border:1px solid transparent; cursor:pointer; user-select:none;
  transition:var(--t-colors), transform var(--dur-fast) var(--ease-out);
}
.atlas-btn:active{ transform:translateY(1px); }
.atlas-btn:disabled{ opacity:.45; cursor:not-allowed; transform:none; }
.atlas-btn--sm{ --_h:var(--control-sm); padding:0 12px; font-size:13px; }
.atlas-btn--lg{ --_h:var(--control-lg); padding:0 22px; font-size:15px; }
.atlas-btn--block{ width:100%; }

.atlas-btn--primary{ background:var(--accent); color:var(--text-on-gold); }
.atlas-btn--primary:hover:not(:disabled){ background:var(--accent-hover); box-shadow:var(--glow-gold-sm); }
.atlas-btn--primary:active{ background:var(--accent-press); }

.atlas-btn--secondary{ background:var(--surface-raised); color:var(--text-primary); border-color:var(--border-strong); }
.atlas-btn--secondary:hover:not(:disabled){ background:var(--surface-hover); border-color:var(--border-strong); }

.atlas-btn--ghost{ background:transparent; color:var(--text-secondary); }
.atlas-btn--ghost:hover:not(:disabled){ background:var(--surface-raised); color:var(--text-primary); }

.atlas-btn--danger{ background:var(--status-danger); color:#fff; }
.atlas-btn--danger:hover:not(:disabled){ filter:brightness(1.08); }
`;
function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-btn-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-btn-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}
function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  leftIcon = null,
  rightIcon = null,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  ensure();
  const cls = ['atlas-btn', `atlas-btn--${variant}`, size !== 'md' ? `atlas-btn--${size}` : '', block ? 'atlas-btn--block' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls,
    disabled: disabled
  }, rest), leftIcon, children, rightIcon);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas · Card
   Base surface container. Optional interactive hover-raise and gold emphasis. */

const CSS = `
.atlas-card{
  position:relative;
  background:var(--surface-card);
  border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg);
  box-shadow:var(--shadow-sm), var(--ring-top);
  padding:var(--space-5);
}
.atlas-card--pad-sm{ padding:var(--space-4); }
.atlas-card--pad-lg{ padding:var(--space-6); }
.atlas-card--flush{ padding:0; overflow:hidden; }
.atlas-card--interactive{ cursor:pointer; transition:var(--t-colors), transform var(--dur-quick) var(--ease-out); }
.atlas-card--interactive:hover{ transform:translateY(-2px); border-color:var(--border-default); box-shadow:var(--shadow-md), var(--ring-top); }
.atlas-card--emphasis{ border-color:var(--border-gold); box-shadow:var(--glow-gold-sm), var(--ring-top); }
`;
function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-card-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-card-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}
function Card({
  pad = 'md',
  interactive = false,
  emphasis = false,
  as = 'div',
  className = '',
  children,
  ...rest
}) {
  ensure();
  const Tag = as;
  const cls = ['atlas-card', pad === 'sm' ? 'atlas-card--pad-sm' : pad === 'lg' ? 'atlas-card--pad-lg' : pad === 'none' ? 'atlas-card--flush' : '', interactive ? 'atlas-card--interactive' : '', emphasis ? 'atlas-card--emphasis' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
/* Atlas · Icon
   Thin wrapper around Lucide. Requires the Lucide UMD script on the page
   (https://unpkg.com/lucide@latest). Renders an <i data-lucide> placeholder
   and asks Lucide to swap it for an SVG after mount. */

function Icon({
  name = 'circle',
  size = 20,
  strokeWidth = 2,
  color = 'currentColor',
  style = {},
  className = ''
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (window.lucide && ref.current) {
      // Reset so re-renders re-create the svg
      ref.current.innerHTML = '';
      const i = document.createElement('i');
      i.setAttribute('data-lucide', name);
      ref.current.appendChild(i);
      window.lucide.createIcons({
        attrs: {
          width: size,
          height: size,
          'stroke-width': strokeWidth
        },
        nameAttr: 'data-lucide'
      });
    }
  }, [name, size, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    className: className,
    "aria-hidden": "true",
    style: {
      display: 'inline-flex',
      width: size,
      height: size,
      color,
      flex: '0 0 auto',
      ...style
    }
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas · Tag
   Filter chip / category pill. Selectable and optionally removable. */

const CSS = `
.atlas-tag{
  display:inline-flex; align-items:center; gap:6px;
  height:30px; padding:0 12px; border-radius:var(--radius-pill);
  font-family:var(--font-sans); font-size:13px; font-weight:500; line-height:1;
  background:var(--surface-raised); color:var(--text-secondary);
  border:1px solid var(--border-default); cursor:pointer;
  transition:var(--t-colors);
}
.atlas-tag:hover{ color:var(--text-primary); border-color:var(--border-strong); }
.atlas-tag--selected{ background:var(--accent-soft); color:var(--gold-300); border-color:var(--border-gold); }
.atlas-tag--static{ cursor:default; }
.atlas-tag__count{ font-family:var(--font-mono); font-size:11px; opacity:.8; }
.atlas-tag__x{ display:inline-flex; opacity:.7; margin-right:-2px; }
.atlas-tag__x:hover{ opacity:1; }
`;
function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-tag-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-tag-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}
function Tag({
  selected = false,
  count = null,
  icon = null,
  onRemove = null,
  interactive = true,
  className = '',
  children,
  ...rest
}) {
  ensure();
  const cls = ['atlas-tag', selected ? 'atlas-tag--selected' : '', !interactive ? 'atlas-tag--static' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), icon, children, count != null && /*#__PURE__*/React.createElement("span", {
    className: "atlas-tag__count"
  }, count), onRemove && /*#__PURE__*/React.createElement("span", {
    className: "atlas-tag__x",
    onClick: e => {
      e.stopPropagation();
      onRemove(e);
    },
    "aria-label": "Remove"
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/progress/HeatGrid.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas · HeatGrid
   GitHub-style exploration heatmap on the gold-on-ink ramp.
   Pass a flat array of intensity levels (0–4), or columns×rows is auto-filled. */

const HEAT = ['var(--heat-0)', 'var(--heat-1)', 'var(--heat-2)', 'var(--heat-3)', 'var(--heat-4)'];
function HeatGrid({
  data = null,
  columns = 30,
  rows = 7,
  cell = 13,
  gap = 4,
  radius = 3,
  className = '',
  ...rest
}) {
  const cells = React.useMemo(() => {
    if (data) return data;
    const n = columns * rows;
    return Array.from({
      length: n
    }, () => Math.floor(Math.pow(Math.random(), 1.6) * 5));
  }, [data, columns, rows]);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, ${cell}px)`,
      gridAutoRows: `${cell}px`,
      gap
    }
  }, rest), cells.map((lvl, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: cell,
      height: cell,
      borderRadius: radius,
      background: HEAT[Math.max(0, Math.min(4, lvl))],
      outline: lvl === 0 ? '1px solid var(--border-subtle)' : 'none',
      outlineOffset: -1
    }
  })));
}
Object.assign(__ds_scope, { HeatGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/progress/HeatGrid.jsx", error: String((e && e.message) || e) }); }

// components/progress/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas · ProgressBar
   Linear completion bar. Gold by default; the product's core motif. */

const CSS = `
.atlas-pbar{ display:flex; flex-direction:column; gap:7px; width:100%; }
.atlas-pbar__head{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; }
.atlas-pbar__label{ flex:1 1 auto; min-width:0; font-family:var(--font-sans); font-size:13px; font-weight:500; color:var(--text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.atlas-pbar__val{ flex:0 0 auto; font-family:var(--font-mono); font-size:12px; font-weight:700; color:var(--text-primary); font-variant-numeric:tabular-nums; white-space:nowrap; }
.atlas-pbar__track{ position:relative; height:8px; border-radius:var(--radius-pill); background:var(--surface-sunken); overflow:hidden; box-shadow:inset 0 1px 2px rgba(0,0,0,.4); }
.atlas-pbar--lg .atlas-pbar__track{ height:12px; }
.atlas-pbar--sm .atlas-pbar__track{ height:6px; }
.atlas-pbar__fill{ position:absolute; inset:0 auto 0 0; border-radius:var(--radius-pill); transition:width var(--dur-slow) var(--ease-out); }
.atlas-pbar__fill--gold{ background:linear-gradient(90deg, var(--gold-600), var(--gold-400)); }
.atlas-pbar__fill--sky{ background:linear-gradient(90deg, var(--sky-500), var(--sky-300)); }
.atlas-pbar__fill--spruce{ background:linear-gradient(90deg, var(--spruce-500), var(--spruce-300)); }
.atlas-pbar__fill--complete{ background:linear-gradient(90deg, var(--gold-500), var(--gold-300)); box-shadow:0 0 12px rgba(244,183,64,.5); }
`;
function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-pbar-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-pbar-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}
function ProgressBar({
  value = 0,
  max = 100,
  label = null,
  size = 'md',
  color = 'gold',
  showValue = true,
  valueFormat = null,
  className = '',
  ...rest
}) {
  ensure();
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const complete = pct >= 100;
  const fillColor = complete ? 'complete' : color;
  const display = valueFormat ? valueFormat(value, max, pct) : max === 100 ? `${Math.round(pct)}%` : `${value} / ${max}`;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['atlas-pbar', `atlas-pbar--${size}`, className].filter(Boolean).join(' ')
  }, rest), (label || showValue) && /*#__PURE__*/React.createElement("div", {
    className: "atlas-pbar__head"
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "atlas-pbar__label"
  }, label), showValue && /*#__PURE__*/React.createElement("span", {
    className: "atlas-pbar__val"
  }, display)), /*#__PURE__*/React.createElement("div", {
    className: "atlas-pbar__track"
  }, /*#__PURE__*/React.createElement("div", {
    className: `atlas-pbar__fill atlas-pbar__fill--${fillColor}`,
    style: {
      width: `${pct}%`
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/progress/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/progress/ProgressRing.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas · ProgressRing
   Circular completion dial. Center shows % or custom children. */

const COLORS = {
  gold: ['var(--gold-400)', 'var(--gold-600)'],
  sky: ['var(--sky-300)', 'var(--sky-500)'],
  spruce: ['var(--spruce-300)', 'var(--spruce-500)']
};
let gid = 0;
function ProgressRing({
  value = 0,
  max = 100,
  size = 96,
  stroke = 8,
  color = 'gold',
  label = null,
  showValue = true,
  children = null,
  className = '',
  ...rest
}) {
  const idRef = React.useRef(null);
  if (idRef.current === null) idRef.current = `atlas-ring-${++gid}`;
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = pct / 100 * c;
  const [from, to] = COLORS[color] || COLORS.gold;
  const complete = pct >= 100;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    style: {
      position: 'relative',
      width: size,
      height: size,
      display: 'inline-flex'
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: 'rotate(-90deg)'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: idRef.current,
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: from
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: to
  }))), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--surface-sunken)",
    strokeWidth: stroke
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: `url(#${idRef.current})`,
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeDasharray: `${dash} ${c}`,
    style: {
      transition: 'stroke-dasharray var(--dur-slow) var(--ease-out)',
      filter: complete ? 'drop-shadow(0 0 6px rgba(244,183,64,.6))' : 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1
    }
  }, children || showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: size * 0.26,
      color: 'var(--text-primary)',
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1
    }
  }, Math.round(pct), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: size * 0.14,
      color: 'var(--text-muted)'
    }
  }, "%")), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: Math.max(9, size * 0.1),
      textTransform: 'uppercase',
      letterSpacing: '.1em',
      color: 'var(--text-muted)'
    }
  }, label)));
}
Object.assign(__ds_scope, { ProgressRing });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/progress/ProgressRing.jsx", error: String((e && e.message) || e) }); }

// components/progress/StatBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas · StatBlock
   Big tabular figure with a mono caption — the product's vital signs. */

function StatBlock({
  value,
  label,
  sub = null,
  icon = null,
  gold = false,
  align = 'left',
  size = 'md',
  className = '',
  ...rest
}) {
  const sizes = {
    sm: 30,
    md: 40,
    lg: 56
  };
  const fs = sizes[size] || sizes.md;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      alignItems: align === 'center' ? 'center' : 'flex-start',
      textAlign: align
    }
  }, rest), (label || icon) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '.12em',
      color: 'var(--text-muted)'
    }
  }, icon, label), /*#__PURE__*/React.createElement("span", {
    className: gold ? 'atlas-gold-text' : '',
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      lineHeight: 1,
      fontSize: fs,
      letterSpacing: '-.02em',
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
      color: gold ? undefined : 'var(--text-primary)'
    }
  }, value), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, sub));
}
Object.assign(__ds_scope, { StatBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/progress/StatBlock.jsx", error: String((e && e.message) || e) }); }

// marketing/app.jsx
try { (() => {
/* Atlas LP — app shell: theme, reveal observer, icon refresh, composition. */
(function () {
  function App() {
    const [theme, setTheme] = React.useState(() => {
      try {
        return localStorage.getItem('atlas-lp-theme') || 'dark';
      } catch (e) {
        return 'dark';
      }
    });
    React.useEffect(() => {
      document.documentElement.dataset.theme = theme;
      try {
        localStorage.setItem('atlas-lp-theme', theme);
      } catch (e) {}
    }, [theme]);
    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    // refresh lucide icons after each render
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });

    // global scroll-reveal observer
    React.useEffect(() => {
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const els = document.querySelectorAll('[data-reveal]');
      if (reduced) {
        els.forEach(el => el.classList.add('in'));
        return;
      }
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -8% 0px'
      });
      els.forEach(el => io.observe(el));
      return () => io.disconnect();
    });
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(window.LPNav, {
      theme: theme,
      toggleTheme: toggleTheme
    }), /*#__PURE__*/React.createElement(window.LPHero, {
      theme: theme
    }), /*#__PURE__*/React.createElement(window.LPSourceBand, null), /*#__PURE__*/React.createElement(window.LPStatBand, null), /*#__PURE__*/React.createElement(window.LPFeatures, null), /*#__PURE__*/React.createElement(window.LPCoverage, null), /*#__PURE__*/React.createElement(window.LPHow, null), /*#__PURE__*/React.createElement(window.LPAchievements, null), /*#__PURE__*/React.createElement(window.LPTestimonials, null), /*#__PURE__*/React.createElement(window.LPPricing, null), /*#__PURE__*/React.createElement(window.LPFAQ, null), /*#__PURE__*/React.createElement(window.LPFinalCTA, null), /*#__PURE__*/React.createElement(window.LPFooter, {
      theme: theme
    }));
  }
  ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "marketing/app.jsx", error: String((e && e.message) || e) }); }

// marketing/data.js
try { (() => {
/* Atlas landing page — content, numbers, and ridgeline geometry.
   Plain JS, attached to window for the babel component scripts. */
(function () {
  // ---- seeded RNG so ridge shapes are stable across renders ----
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Sample a mountain ridgeline across [0..W]. Sum of two sines + seeded jitter.
  function ridgePoints(W, baseY, amp, rough, seed, step) {
    const rnd = mulberry32(seed);
    step = step || 26;
    const n = Math.ceil(W / step);
    const f1 = 0.6 + rnd() * 0.5,
      f2 = 1.7 + rnd() * 1.1,
      ph = rnd() * 6.28;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const x = i / n * W;
      const t = i / n * Math.PI * 2;
      const y = baseY - Math.sin(t * f1 + ph) * amp - Math.sin(t * f2 + ph * 1.7) * amp * 0.34 - (rnd() - 0.5) * amp * rough;
      pts.push([Math.round(x), Math.round(y)]);
    }
    return pts;
  }

  // Closed silhouette path filled down to `floor`.
  function pathFromPoints(pts, W, floor) {
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i][0]} ${pts[i][1]}`;
    d += ` L ${W} ${floor} L 0 ${floor} Z`;
    return d;
  }
  function ridgePath(W, baseY, amp, rough, seed, floor) {
    return pathFromPoints(ridgePoints(W, baseY, amp, rough, seed), W, floor);
  }
  window.AtlasLP = {
    mulberry32,
    ridgePath,
    ridgePoints,
    pathFromPoints,
    sources: [{
      name: "Strava",
      color: "var(--coral-400)"
    }, {
      name: "Garmin",
      color: "var(--sky-400)"
    }, {
      name: "Komoot",
      color: "var(--spruce-400)"
    }, {
      name: "AllTrails",
      color: "var(--spruce-300)"
    }, {
      name: "Apple Health",
      color: "var(--ink-200)"
    }, {
      name: "GPX & FIT files",
      color: "var(--gold-400)"
    }],
    stats: [{
      label: "PEAKS LOGGED",
      to: 1248000,
      fmt: "compact",
      color: "var(--gold-400)"
    }, {
      label: "TRAILS COLLECTED",
      to: 4920000,
      fmt: "compact",
      color: "var(--sky-400)"
    }, {
      label: "EXPLORERS",
      to: 92400,
      fmt: "compact",
      color: "var(--spruce-400)"
    }, {
      label: "COLLECTIONS DONE",
      to: 318000,
      fmt: "compact",
      color: "var(--gold-400)"
    }],
    collections: [{
      title: "Wainwrights",
      type: "FELLS · LAKE DISTRICT",
      value: 156,
      max: 214,
      icon: "mountain"
    }, {
      title: "Munros",
      type: "SUMMITS · SCOTLAND",
      value: 43,
      max: 282,
      icon: "triangle"
    }, {
      title: "National Trails",
      type: "LONG-DISTANCE PATHS",
      value: 9,
      max: 16,
      icon: "route"
    }, {
      title: "Coastal Bothies",
      type: "SHELTERS",
      value: 12,
      max: 12,
      icon: "tent"
    }],
    achievements: [{
      title: "Skyliner",
      description: "Climb three 800m summits in one day.",
      tier: "gold",
      points: 500,
      unlocked: true,
      icon: "mountain"
    }, {
      title: "First Light",
      description: "Summit before sunrise.",
      tier: "silver",
      points: 150,
      unlocked: true,
      icon: "sunrise"
    }, {
      title: "Completionist",
      description: "Finish an entire named collection.",
      tier: "platinum",
      points: 1000,
      unlocked: true,
      icon: "trophy"
    }, {
      title: "Trailblazer",
      description: "Log 1,000 km of distinct trail.",
      tier: "gold",
      points: 400,
      unlocked: true,
      icon: "footprints"
    }, {
      title: "County Tops",
      description: "Reach the highest point of 10 counties.",
      tier: "silver",
      points: 250,
      unlocked: false,
      progress: {
        value: 7,
        max: 10
      },
      icon: "flag"
    }, {
      title: "Round the Lakes",
      description: "Visit all 16 bodies of water in a region.",
      tier: "bronze",
      points: 120,
      unlocked: false,
      progress: {
        value: 11,
        max: 16
      },
      icon: "droplets"
    }],
    steps: [{
      icon: "plug",
      n: "STEP 01",
      title: "Connect a source",
      body: "Link Strava, Garmin, Komoot, AllTrails or drop a folder of GPX files. Read-only — we never touch your accounts or post anything."
    }, {
      icon: "sparkles",
      n: "STEP 02",
      title: "We import your history",
      body: "Atlas reads every activity you've ever recorded and matches it against peaks, trails, landmarks and regions worldwide. Years of adventures, mapped in minutes."
    }, {
      icon: "trophy",
      n: "STEP 03",
      title: "Collect, complete, climb",
      body: "Watch collections fill, achievements unlock and your Outdoor Score rise. See exactly what's left — and what's closest to done."
    }],
    quotes: [{
      body: "I'd done 60 Wainwrights and never knew. Atlas found them all in my Strava history and suddenly I had a checklist I couldn't stop chasing.",
      name: "Maya Holloway",
      meta: "156 / 214 WAINWRIGHTS",
      initials: "MH",
      color: "var(--gold-500)"
    }, {
      body: "It's the trophy case I didn't know I wanted. Ten years of hiking finally feels like one connected record instead of scattered files.",
      name: "Tomas Reier",
      meta: "OUTDOOR SCORE 14,820",
      initials: "TR",
      color: "var(--sky-400)"
    }, {
      body: "The coverage map is dangerous. Seeing a region at 68% explored is the most motivated I've ever been to drive three hours for one hill.",
      name: "Priya Anand",
      meta: "GOLD · COMPLETIONIST",
      initials: "PA",
      color: "var(--spruce-400)"
    }],
    faqs: [{
      q: "Does Atlas plan routes or navigate?",
      a: "No — and that's deliberate. Atlas is a lifetime record and a trophy case, not a route planner or a GPS. It sits on top of the tools you already use and turns your history into collections, coverage and achievements."
    }, {
      q: "Which sources can I connect?",
      a: "Strava, Garmin Connect, Komoot, AllTrails and Apple Health, plus direct GPX and FIT file imports. Connections are read-only: Atlas never posts, edits or deletes anything in your accounts."
    }, {
      q: "Where do collections come from?",
      a: "Atlas ships with thousands of curated, real-world lists — Wainwrights, Munros, county tops, national trails, waterfalls, bothies and more — and adds new regions every month. You can also build private custom collections."
    }, {
      q: "What's the Outdoor Score?",
      a: "One number for a lifetime outdoors. Every peak, trail, landmark and achievement awards points; tiers from Bronze to Platinum are worth more. It's the Gamerscore of the outdoors — a single figure that only ever goes up."
    }, {
      q: "Is my data private?",
      a: "Yes. Your record is private by default. You choose what — if anything — to share, and you can export or delete everything at any time. We don't sell data, ever."
    }, {
      q: "Can I cancel anytime?",
      a: "Anytime, in one click. If you cancel Pro you keep your full record and drop back to the free tier — nothing you've collected is ever taken away."
    }],
    proFeatures: ["Unlimited collections & custom lists", "Full worldwide coverage maps & heatmaps", "Every achievement tier & the Outdoor Score", "Closest-to-completion & missing-nearby nudges", "All sources, unlimited history import", "Yearly Wrapped & shareable trophy cards"],
    freeFeatures: ["3 active collections", "Lifetime history import", "Regional coverage (1 region)", {
      t: "Achievements & Outdoor Score",
      off: true
    }, {
      t: "Worldwide maps & heatmaps",
      off: true
    }]
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "marketing/data.js", error: String((e && e.message) || e) }); }

// marketing/features.jsx
try { (() => {
/* Atlas LP — live stat band, feature deep-dives, and the green coverage section. */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const {
    Icon,
    CollectionCard,
    ScoreMeter,
    ProgressRing,
    ProgressBar,
    HeatGrid,
    StatBlock,
    Badge
  } = DS;
  const LP = window.AtlasLP;

  /* ---------------- live stat band ---------------- */
  function StatCell({
    s
  }) {
    const [ref, seen] = useInView({
      threshold: 0.5
    });
    const v = useCountUp(s.to, seen, 1800);
    return /*#__PURE__*/React.createElement("div", {
      className: "stat-cell",
      ref: ref
    }, /*#__PURE__*/React.createElement("div", {
      className: "stat-num",
      style: {
        color: s.color
      }
    }, compactNum(v)), /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginTop: 10
      }
    }, s.label));
  }
  function StatBand() {
    return /*#__PURE__*/React.createElement("section", {
      className: "stat-band"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "stat-grid"
    }, LP.stats.map(s => /*#__PURE__*/React.createElement(StatCell, {
      key: s.label,
      s: s
    })))));
  }

  /* ---------------- feature row scaffold ---------------- */
  function FeatureRow({
    flip,
    eyebrow,
    title,
    body,
    bullets,
    children
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: `feat-row${flip ? ' flip' : ''}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "feat-text",
      "data-reveal": true
    }, /*#__PURE__*/React.createElement("div", {
      className: "lp-eyebrow",
      style: {
        marginBottom: 16
      }
    }, eyebrow), /*#__PURE__*/React.createElement("h2", {
      className: "h-section",
      style: {
        marginBottom: 18
      }
    }, title), /*#__PURE__*/React.createElement("p", {
      className: "lead"
    }, body), bullets && /*#__PURE__*/React.createElement("div", {
      className: "feat-bullets"
    }, bullets.map((b, i) => /*#__PURE__*/React.createElement("div", {
      className: "feat-bullet",
      key: i
    }, /*#__PURE__*/React.createElement("span", {
      className: "tick"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 13
    })), b)))), /*#__PURE__*/React.createElement("div", {
      className: "feat-visual",
      "data-reveal": true,
      style: {
        transitionDelay: '.08s'
      }
    }, children));
  }
  function CollectionsVisual() {
    const [ref, seen] = useInView({
      threshold: 0.3
    });
    return /*#__PURE__*/React.createElement("div", {
      ref: ref,
      className: "lp-card",
      style: {
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: 'var(--surface-sunken)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2px 6px 8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow"
    }, "YOUR COLLECTIONS"), /*#__PURE__*/React.createElement(Badge, {
      variant: "gold",
      dot: true
    }, "4 ACTIVE")), seen && LP.collections.map(c => /*#__PURE__*/React.createElement(CollectionCard, {
      key: c.title,
      title: c.title,
      type: c.type,
      value: c.value,
      max: c.max,
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: c.icon,
        size: 22
      })
    })));
  }
  function ScoreVisual() {
    const [ref, seen] = useInView({
      threshold: 0.35
    });
    return /*#__PURE__*/React.createElement("div", {
      ref: ref,
      className: "lp-card",
      style: {
        padding: 32,
        background: 'var(--surface-sunken)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 28
      }
    }, seen && /*#__PURE__*/React.createElement(ScoreMeter, {
      score: 14820,
      level: 27,
      levelProgress: 64
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: 18,
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8
      }
    }, seen && /*#__PURE__*/React.createElement(ProgressRing, {
      value: 92,
      max: 240,
      size: 84,
      stroke: 8,
      color: "gold",
      showValue: false
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-stat)',
        fontSize: 22
      }
    }, "92")), /*#__PURE__*/React.createElement("div", {
      className: "eyebrow"
    }, "ACHIEVEMENTS")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8
      }
    }, seen && /*#__PURE__*/React.createElement(ProgressRing, {
      value: 68,
      max: 100,
      size: 84,
      stroke: 8,
      color: "spruce"
    }), /*#__PURE__*/React.createElement("div", {
      className: "eyebrow"
    }, "EXPLORED")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8
      }
    }, seen && /*#__PURE__*/React.createElement(ProgressRing, {
      value: 156,
      max: 214,
      size: 84,
      stroke: 8,
      color: "sky",
      showValue: false
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-stat)',
        fontSize: 18
      }
    }, "73%")), /*#__PURE__*/React.createElement("div", {
      className: "eyebrow"
    }, "WAINWRIGHTS"))));
  }
  function FeaturesSection() {
    return /*#__PURE__*/React.createElement("section", {
      id: "features",
      className: "sec-pad"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wrap"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        maxWidth: 660,
        margin: '0 auto 80px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      "data-reveal": true,
      className: "lp-eyebrow center",
      style: {
        marginBottom: 18
      }
    }, "WHAT ATLAS DOES"), /*#__PURE__*/React.createElement("h2", {
      "data-reveal": true,
      className: "h-section",
      style: {
        marginBottom: 18
      }
    }, "A Pok\xE9dex for the great outdoors"), /*#__PURE__*/React.createElement("p", {
      "data-reveal": true,
      className: "lead"
    }, "Four ways Atlas turns scattered activity files into something you're proud of \u2014 and itch to complete.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 120
      }
    }, /*#__PURE__*/React.createElement(FeatureRow, {
      eyebrow: "COLLECTIONS",
      title: "Every list worth chasing, tracked for you",
      body: "Wainwrights, Munros, county tops, national trails, waterfalls, bothies \u2014 thousands of real-world collections, automatically filled in from your history. Always see what you've collected and exactly what's left.",
      bullets: ["Thousands of curated, real lists", "Auto-matched from your activities", "Build private custom collections"]
    }, /*#__PURE__*/React.createElement(CollectionsVisual, null)), /*#__PURE__*/React.createElement(FeatureRow, {
      flip: true,
      eyebrow: "OUTDOOR SCORE",
      title: "One number for a lifetime outdoors",
      body: "Every peak, trail, landmark and achievement awards points. Tiers from Bronze to Platinum are worth more. It's the Gamerscore of the outdoors \u2014 a single figure that only ever goes up.",
      bullets: ["Points for everything you've done", "Level up as your record grows", "Compare with friends, never strangers"]
    }, /*#__PURE__*/React.createElement(ScoreVisual, null)))));
  }

  /* ---------------- green coverage section ---------------- */
  function CoverageSection() {
    const [ref, seen] = useInView({
      threshold: 0.25
    });
    const heat = React.useMemo(() => {
      const r = LP.mulberry32(31);
      return Array.from({
        length: 7 * 34
      }, () => {
        const v = r();
        return v > 0.8 ? 4 : v > 0.62 ? 3 : v > 0.42 ? 2 : v > 0.22 ? 1 : 0;
      });
    }, []);
    const regions = [{
      name: "Lake District",
      pct: 68,
      color: "spruce"
    }, {
      name: "Snowdonia",
      pct: 41,
      color: "spruce"
    }, {
      name: "Peak District",
      pct: 86,
      color: "spruce"
    }, {
      name: "Cairngorms",
      pct: 23,
      color: "sky"
    }];
    return /*#__PURE__*/React.createElement("section", {
      id: "coverage",
      className: "coverage sec-pad"
    }, /*#__PURE__*/React.createElement("div", {
      className: "coverage-grid-bg"
    }), /*#__PURE__*/React.createElement("div", {
      className: "wrap",
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "feat-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "feat-text",
      "data-reveal": true
    }, /*#__PURE__*/React.createElement("div", {
      className: "lp-eyebrow",
      style: {
        color: 'var(--spruce-400)',
        marginBottom: 16
      }
    }, "COVERAGE"), /*#__PURE__*/React.createElement("h2", {
      className: "h-section",
      style: {
        marginBottom: 18
      }
    }, "See how much ground you've actually\xA0covered"), /*#__PURE__*/React.createElement("p", {
      className: "lead"
    }, "Atlas paints every region you've set foot in as a living coverage map. Watch the green spread as you explore \u2014 and feel the pull of the gaps you haven't closed yet."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 30,
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      },
      ref: ref
    }, regions.map(rg => /*#__PURE__*/React.createElement("div", {
      key: rg.name
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        fontSize: 'var(--text-base)'
      }
    }, rg.name), /*#__PURE__*/React.createElement("span", {
      className: "eyebrow",
      style: {
        color: 'var(--text-secondary)'
      }
    }, rg.pct, "% EXPLORED")), seen && /*#__PURE__*/React.createElement(ProgressBar, {
      value: rg.pct,
      max: 100,
      color: rg.color,
      size: "md",
      showValue: false
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "feat-visual",
      "data-reveal": true,
      style: {
        transitionDelay: '.08s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "lp-card",
      style: {
        padding: 28,
        background: 'var(--surface-card)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 6
      }
    }, "LAKE DISTRICT"), /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-h2)',
        color: 'var(--text-primary)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "atlas-gold-text",
      style: {
        fontSize: 40
      }
    }, "68%"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)',
        fontSize: 16,
        marginLeft: 8
      }
    }, "explored"))), /*#__PURE__*/React.createElement(Badge, {
      variant: "success",
      dot: true
    }, "147 OF 214 FELLS")), /*#__PURE__*/React.createElement("div", {
      style: {
        overflowX: 'auto'
      }
    }, /*#__PURE__*/React.createElement(HeatGrid, {
      data: heat,
      columns: 34,
      rows: 7,
      cell: 13,
      gap: 4
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 18,
        paddingTop: 18,
        borderTop: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "eyebrow"
    }, "LESS"), [0, 1, 2, 3, 4].map(l => /*#__PURE__*/React.createElement("span", {
      key: l,
      style: {
        width: 13,
        height: 13,
        borderRadius: 3,
        background: `var(--heat-${l})`
      }
    })), /*#__PURE__*/React.createElement("span", {
      className: "eyebrow"
    }, "MORE")), /*#__PURE__*/React.createElement("span", {
      className: "eyebrow",
      style: {
        color: 'var(--spruce-400)'
      }
    }, "67 FELLS TO GO")))))));
  }
  Object.assign(window, {
    LPStatBand: StatBand,
    LPFeatures: FeaturesSection,
    LPCoverage: CoverageSection
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "marketing/features.jsx", error: String((e && e.message) || e) }); }

// marketing/nav-hero.jsx
try { (() => {
/* Atlas LP — Nav, Hero, and the "works with" source band. */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const {
    Icon,
    ScoreMeter,
    StatBlock,
    HeatGrid,
    Badge
  } = DS;
  const NAV_LINKS = [{
    label: 'Features',
    href: '#features'
  }, {
    label: 'How it works',
    href: '#how'
  }, {
    label: 'Achievements',
    href: '#achievements'
  }, {
    label: 'Pricing',
    href: '#pricing'
  }];
  function Nav({
    theme,
    toggleTheme
  }) {
    return /*#__PURE__*/React.createElement("nav", {
      className: "nav"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wrap nav-inner"
    }, /*#__PURE__*/React.createElement("a", {
      href: "#top",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flex: '0 0 auto'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: theme === 'light' ? '../assets/atlas-logo-ink.svg' : '../assets/atlas-logo.svg',
      alt: "Atlas",
      style: {
        height: 26
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "nav-links"
    }, NAV_LINKS.map(l => /*#__PURE__*/React.createElement("a", {
      key: l.label,
      className: "nav-link",
      href: l.href
    }, l.label))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "icon-btn",
      onClick: toggleTheme,
      "aria-label": "Toggle appearance",
      title: "Toggle appearance"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: theme === 'dark' ? 'sun' : 'moon',
      size: 17
    })), /*#__PURE__*/React.createElement("a", {
      className: "btn btn-sm btn-ghost",
      href: "#",
      style: {}
    }, "Sign in"), /*#__PURE__*/React.createElement("a", {
      className: "btn btn-sm btn-primary",
      href: "#pricing"
    }, "Get Atlas Pro"))));
  }
  function HeroPreview() {
    const [ref, seen] = useInView({
      threshold: 0.25
    });
    // a curated heat pattern (0–4) for the mini coverage strip
    const heat = React.useMemo(() => {
      const r = window.AtlasLP.mulberry32(7);
      return Array.from({
        length: 7 * 22
      }, () => {
        const v = r();
        return v > 0.82 ? 4 : v > 0.66 ? 3 : v > 0.46 ? 2 : v > 0.26 ? 1 : 0;
      });
    }, []);
    return /*#__PURE__*/React.createElement("div", {
      ref: ref,
      className: "atlas-glass",
      style: {
        borderRadius: 'var(--radius-2xl)',
        padding: 24,
        display: 'grid',
        gridTemplateColumns: 'auto 1px 1fr',
        gap: 26,
        alignItems: 'center',
        boxShadow: 'var(--shadow-lg), var(--ring-top)',
        maxWidth: 860,
        margin: '0 auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 8px'
      }
    }, seen && /*#__PURE__*/React.createElement(ScoreMeter, {
      score: 14820,
      level: 27,
      levelProgress: 64
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: 'stretch',
        background: 'var(--border-subtle)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 28,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(StatBlock, {
      size: "sm",
      label: "WAINWRIGHTS",
      value: "156 / 214",
      sub: "58 to go"
    }), /*#__PURE__*/React.createElement(StatBlock, {
      size: "sm",
      label: "LAKE DISTRICT",
      value: "68%",
      sub: "explored"
    }), /*#__PURE__*/React.createElement(StatBlock, {
      size: "sm",
      label: "ACHIEVEMENTS",
      value: "92",
      sub: "of 240 unlocked"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 8
      }
    }, "52-WEEK EXPLORATION HEATMAP"), /*#__PURE__*/React.createElement(HeatGrid, {
      data: heat,
      columns: 22,
      rows: 7,
      cell: 11,
      gap: 3
    }))));
  }
  function Hero({
    theme
  }) {
    return /*#__PURE__*/React.createElement("header", {
      className: "hero sec-pad",
      id: "top",
      style: {
        paddingTop: 96,
        paddingBottom: 60,
        minHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Ridgelines, {
      theme: theme
    }), /*#__PURE__*/React.createElement("div", {
      className: "hero-fade"
    }), /*#__PURE__*/React.createElement("div", {
      className: "wrap hero-content",
      style: {
        width: '100%'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 760,
        margin: '0 auto 56px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      "data-reveal": true,
      className: "lp-eyebrow center",
      style: {
        marginBottom: 22
      }
    }, "YOUR LIFETIME EXPLORATION RECORD"), /*#__PURE__*/React.createElement("h1", {
      "data-reveal": true,
      className: "h-display",
      style: {
        fontSize: 'clamp(44px, 7vw, 86px)',
        marginBottom: 22,
        transitionDelay: '.05s'
      }
    }, "Every summit, every trail \u2014", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      className: "atlas-gold-text"
    }, "collected.")), /*#__PURE__*/React.createElement("p", {
      "data-reveal": true,
      className: "lead",
      style: {
        maxWidth: 560,
        margin: '0 auto',
        fontSize: 'var(--text-xl)',
        transitionDelay: '.1s'
      }
    }, "Atlas turns the activities you've already logged into collections, achievements and coverage maps. Not a route planner \u2014 a trophy case for a lifetime outdoors."), /*#__PURE__*/React.createElement("div", {
      "data-reveal": true,
      style: {
        display: 'flex',
        gap: 14,
        justifyContent: 'center',
        marginTop: 34,
        flexWrap: 'wrap',
        transitionDelay: '.15s'
      }
    }, /*#__PURE__*/React.createElement("a", {
      className: "btn btn-lg btn-primary",
      href: "#pricing"
    }, "Start your Atlas"), /*#__PURE__*/React.createElement("a", {
      className: "btn btn-lg btn-secondary",
      href: "#how"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "play",
      size: 16
    }), " See how it works")), /*#__PURE__*/React.createElement("div", {
      "data-reveal": true,
      className: "eyebrow",
      style: {
        marginTop: 22,
        transitionDelay: '.2s'
      }
    }, "FREE TO START \xB7 NO ACTIVITY TRACKING \xB7 CANCEL ANYTIME")), /*#__PURE__*/React.createElement("div", {
      "data-reveal": true,
      style: {
        transitionDelay: '.1s'
      }
    }, /*#__PURE__*/React.createElement(HeroPreview, null))));
  }
  function SourceBand() {
    const sources = window.AtlasLP.sources;
    return /*#__PURE__*/React.createElement("section", {
      className: "sec-pad-sm",
      style: {
        paddingTop: 56,
        paddingBottom: 56
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "wrap",
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      "data-reveal": true,
      className: "eyebrow",
      style: {
        marginBottom: 26
      }
    }, "WORKS WITH WHAT YOU ALREADY USE"), /*#__PURE__*/React.createElement("div", {
      "data-reveal": true,
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 14,
        justifyContent: 'center'
      }
    }, sources.map(s => /*#__PURE__*/React.createElement("div", {
      key: s.name,
      className: "source-chip"
    }, /*#__PURE__*/React.createElement("span", {
      className: "source-dot",
      style: {
        background: s.color
      }
    }), s.name))), /*#__PURE__*/React.createElement("p", {
      "data-reveal": true,
      className: "eyebrow muted",
      style: {
        marginTop: 24,
        letterSpacing: 'var(--tracking-wide)'
      }
    }, "read-only \xB7 we never post, edit or track")));
  }
  Object.assign(window, {
    LPNav: Nav,
    LPHero: Hero,
    LPSourceBand: SourceBand
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "marketing/nav-hero.jsx", error: String((e && e.message) || e) }); }

// marketing/pricing.jsx
try { (() => {
/* Atlas LP — pricing, FAQ, final CTA, footer. */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const {
    Icon,
    Badge
  } = DS;
  const LP = window.AtlasLP;

  /* ---------------- pricing ---------------- */
  function Pricing() {
    const [annual, setAnnual] = React.useState(true);
    const monthly = 8;
    const annualPerMo = 6;
    const price = annual ? annualPerMo : monthly;
    const FeatLine = ({
      children,
      off
    }) => /*#__PURE__*/React.createElement("div", {
      className: `price-feat${off ? ' off' : ''}`
    }, /*#__PURE__*/React.createElement("span", {
      className: "tick"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: off ? 'minus' : 'check',
      size: 16
    })), /*#__PURE__*/React.createElement("span", null, children));
    return /*#__PURE__*/React.createElement("section", {
      id: "pricing",
      className: "sec-pad"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wrap"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        maxWidth: 600,
        margin: '0 auto 40px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      "data-reveal": true,
      className: "lp-eyebrow center",
      style: {
        marginBottom: 18
      }
    }, "PRICING"), /*#__PURE__*/React.createElement("h2", {
      "data-reveal": true,
      className: "h-section",
      style: {
        marginBottom: 18
      }
    }, "Start free. Go Pro when you're hooked."), /*#__PURE__*/React.createElement("p", {
      "data-reveal": true,
      className: "lead"
    }, "One simple plan. Everything Atlas can do, for less than a coffee a month.")), /*#__PURE__*/React.createElement("div", {
      "data-reveal": true,
      style: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 40
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "price-toggle",
      role: "group",
      "aria-label": "Billing period"
    }, /*#__PURE__*/React.createElement("button", {
      className: !annual ? 'active' : '',
      onClick: () => setAnnual(false)
    }, "Monthly"), /*#__PURE__*/React.createElement("button", {
      className: annual ? 'active' : '',
      onClick: () => setAnnual(true)
    }, "Annual ", /*#__PURE__*/React.createElement(Badge, {
      variant: "success",
      style: {
        marginLeft: 2
      }
    }, "SAVE 25%")))), /*#__PURE__*/React.createElement("div", {
      className: "price-grid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lp-card price-card",
      "data-reveal": true
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 12
      }
    }, "BASE CAMP"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "price-amt",
      style: {
        fontSize: 44
      }
    }, "Free")), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--text-muted)',
        fontSize: 'var(--text-sm)',
        margin: '12px 0 24px',
        lineHeight: 1.5
      }
    }, "For getting your history in and seeing your first collections fill."), /*#__PURE__*/React.createElement("a", {
      className: "btn btn-md btn-secondary",
      href: "#",
      style: {
        width: '100%'
      }
    }, "Create free account"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 13,
        marginTop: 28
      }
    }, LP.freeFeatures.map((f, i) => typeof f === 'string' ? /*#__PURE__*/React.createElement(FeatLine, {
      key: i
    }, f) : /*#__PURE__*/React.createElement(FeatLine, {
      key: i,
      off: true
    }, f.t)))), /*#__PURE__*/React.createElement("div", {
      className: "lp-card price-card pro",
      "data-reveal": true,
      style: {
        transitionDelay: '.08s',
        background: 'var(--surface-card)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "atlas-topo",
      style: {
        position: 'absolute',
        inset: 0,
        opacity: 0.5,
        pointerEvents: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        color: 'var(--gold-400)'
      }
    }, "ATLAS PRO"), /*#__PURE__*/React.createElement(Badge, {
      variant: "gold",
      dot: true
    }, "MOST POPULAR")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "price-amt atlas-gold-text"
    }, "$", price), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)',
        fontSize: 'var(--text-base)'
      }
    }, "/ month")), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--text-secondary)',
        fontSize: 'var(--text-sm)',
        margin: '12px 0 24px',
        lineHeight: 1.5
      }
    }, annual ? `Billed annually at $${annualPerMo * 12} — 25% off the monthly price.` : 'Billed monthly. Switch to annual any time to save 25%.'), /*#__PURE__*/React.createElement("a", {
      className: "btn btn-md btn-primary",
      href: "#",
      style: {
        width: '100%'
      }
    }, "Start 14-day free trial"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 13,
        marginTop: 28
      }
    }, LP.proFeatures.map((f, i) => /*#__PURE__*/React.createElement(FeatLine, {
      key: i
    }, f)))))), /*#__PURE__*/React.createElement("p", {
      "data-reveal": true,
      className: "eyebrow muted",
      style: {
        textAlign: 'center',
        marginTop: 28,
        letterSpacing: 'var(--tracking-wide)'
      }
    }, "14-day free trial \xB7 no card required \xB7 cancel in one click")));
  }

  /* ---------------- FAQ ---------------- */
  function FAQ() {
    const [open, setOpen] = React.useState(0);
    return /*#__PURE__*/React.createElement("section", {
      className: "sec-pad",
      style: {
        background: 'var(--bg-base)',
        borderTop: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "wrap-narrow"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        marginBottom: 48
      }
    }, /*#__PURE__*/React.createElement("div", {
      "data-reveal": true,
      className: "lp-eyebrow center",
      style: {
        marginBottom: 18
      }
    }, "QUESTIONS"), /*#__PURE__*/React.createElement("h2", {
      "data-reveal": true,
      className: "h-section"
    }, "Good to know")), /*#__PURE__*/React.createElement("div", {
      "data-reveal": true
    }, LP.faqs.map((f, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: `faq-item${open === i ? ' open' : ''}`
    }, /*#__PURE__*/React.createElement("button", {
      className: "faq-q",
      onClick: () => setOpen(open === i ? -1 : i),
      "aria-expanded": open === i
    }, f.q, /*#__PURE__*/React.createElement("span", {
      className: "chev"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 20
    }))), /*#__PURE__*/React.createElement("div", {
      className: "faq-a"
    }, /*#__PURE__*/React.createElement("div", {
      className: "faq-a-inner"
    }, f.a)))))));
  }

  /* ---------------- final CTA ---------------- */
  function FinalCTA() {
    const [ref, seen] = useInView({
      threshold: 0.3
    });
    return /*#__PURE__*/React.createElement("section", {
      className: "sec-pad"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "final-cta atlas-topo",
      ref: ref,
      "data-reveal": true,
      style: {
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-lg)'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 600 120",
      preserveAspectRatio: "none",
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: 120,
        opacity: 0.7
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: "M 0 110 C 120 96 150 60 250 54 C 350 48 380 30 460 26 C 520 23 560 14 600 8",
      fill: "none",
      stroke: "var(--gold-500)",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      style: seen ? {
        strokeDasharray: 760,
        strokeDashoffset: 0,
        transition: 'stroke-dashoffset 2.4s var(--ease-in-out)'
      } : {
        strokeDasharray: 760,
        strokeDashoffset: 760
      }
    }), /*#__PURE__*/React.createElement("g", {
      transform: "translate(600,8)",
      opacity: seen ? 1 : 0,
      style: {
        transition: 'opacity .4s ease 2s'
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: "M -2 0 L -2 -26 L 16 -20 L -2 -14",
      fill: "var(--gold-500)",
      stroke: "var(--gold-300)",
      strokeWidth: "1.5",
      strokeLinejoin: "round"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "lp-eyebrow center",
      style: {
        justifyContent: 'center',
        marginBottom: 20
      }
    }, "THE GAP IS WAITING TO BE CLOSED"), /*#__PURE__*/React.createElement("h2", {
      className: "h-section",
      style: {
        fontSize: 'clamp(32px, 5vw, 56px)',
        marginBottom: 20
      }
    }, "Start your Atlas today"), /*#__PURE__*/React.createElement("p", {
      className: "lead",
      style: {
        maxWidth: 520,
        margin: '0 auto 32px'
      }
    }, "Connect a source and watch years of adventures turn into one record you'll want to complete."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 14,
        justifyContent: 'center',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("a", {
      className: "btn btn-lg btn-primary",
      href: "#"
    }, "Start free"), /*#__PURE__*/React.createElement("a", {
      className: "btn btn-lg btn-secondary",
      href: "#pricing"
    }, "See Pro plans"))))));
  }

  /* ---------------- footer ---------------- */
  function Footer({
    theme
  }) {
    const cols = [{
      h: 'PRODUCT',
      links: ['Features', 'Collections', 'Achievements', 'Coverage maps', 'Outdoor Score']
    }, {
      h: 'SOURCES',
      links: ['Strava', 'Garmin', 'Komoot', 'AllTrails', 'GPX import']
    }, {
      h: 'COMPANY',
      links: ['About', 'Journal', 'Careers', 'Press kit', 'Contact']
    }];
    return /*#__PURE__*/React.createElement("footer", {
      className: "footer"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wrap",
      style: {
        padding: '64px 32px 36px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "footer-grid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "footer-col"
    }, /*#__PURE__*/React.createElement("img", {
      src: theme === 'light' ? '../assets/atlas-logo-ink.svg' : '../assets/atlas-logo.svg',
      alt: "Atlas",
      style: {
        height: 26,
        marginBottom: 18
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--text-muted)',
        fontSize: 'var(--text-sm)',
        lineHeight: 1.6,
        maxWidth: 280
      }
    }, "A lifetime record and a trophy case for everything you've explored. Not a tracker \u2014 a celebration."), /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginTop: 20
      }
    }, "54.4609\xB0 N \xB7 3.0886\xB0 W")), cols.map(c => /*#__PURE__*/React.createElement("div", {
      className: "footer-col",
      key: c.h
    }, /*#__PURE__*/React.createElement("h5", null, c.h), c.links.map(l => /*#__PURE__*/React.createElement("a", {
      className: "footer-link",
      href: "#",
      key: l
    }, l))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginTop: 48,
        paddingTop: 28,
        borderTop: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow muted"
    }, "\xA9 2026 ATLAS \xB7 MADE FOR THE LONG GAME"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 22
      }
    }, /*#__PURE__*/React.createElement("a", {
      className: "footer-link",
      href: "#"
    }, "Privacy"), /*#__PURE__*/React.createElement("a", {
      className: "footer-link",
      href: "#"
    }, "Terms"), /*#__PURE__*/React.createElement("a", {
      className: "footer-link",
      href: "#"
    }, "Status")))));
  }
  Object.assign(window, {
    LPPricing: Pricing,
    LPFAQ: FAQ,
    LPFinalCTA: FinalCTA,
    LPFooter: Footer
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "marketing/pricing.jsx", error: String((e && e.message) || e) }); }

// marketing/scene.jsx
try { (() => {
/* Atlas LP — shared hooks + the parallax ridgeline hero scene. */
const LP = window.AtlasLP;

/* ---- count-up that fires when in view ---- */
function useCountUp(target, active, duration = 1700) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(target);
      return;
    }
    let raf, start;
    const tick = t => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return val;
}

/* ---- fires once when element scrolls into view ---- */
function useInView(opts = {}) {
  const ref = React.useRef(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      });
    }, {
      threshold: opts.threshold ?? 0.3,
      rootMargin: opts.rootMargin ?? '0px'
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}
function compactNum(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e5 ? 0 : 0) + 'K';
  return Math.round(n).toLocaleString();
}

/* ============================================================
   RIDGELINES — layered parallax mountain scene
   ============================================================ */
function Ridgelines({
  theme
}) {
  const W = 1600,
    H = 760,
    floor = H + 300;
  const sceneRef = React.useRef(null);
  const layerRefs = React.useRef([]);
  const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // palette per theme — base ink scale doesn't remap in light mode, so we branch
  const pal = theme === 'light' ? ['#C4D0DA', '#A7B7C4', '#8AA0AE', '#3f7d5b'] : ['#1c2a36', '#16222d', '#111a23', '#0f2a22'];
  const pineFill = theme === 'light' ? '#2f6f4f' : '#0c2620';
  const pineStroke = theme === 'light' ? '#3f7d5b' : '#16463a';
  const glow = theme === 'light' ? 'rgba(224,160,38,0.30)' : 'rgba(244,183,64,0.42)';
  const sunX = 1060;

  // ridge layers: [baseY, amp, rough, seed, depthX, depthY]
  const layers = [{
    base: 360,
    amp: 78,
    rough: 0.5,
    seed: 11,
    dx: 10,
    dy: -0.018,
    fill: pal[0]
  }, {
    base: 470,
    amp: 104,
    rough: 0.6,
    seed: 27,
    dx: 20,
    dy: -0.04,
    fill: pal[1]
  }, {
    base: 560,
    amp: 120,
    rough: 0.7,
    seed: 41,
    dx: 34,
    dy: -0.07,
    fill: pal[2]
  }];
  const fgPts = LP.ridgePoints(W, 650, 96, 0.55, 73, 30);
  const fgPath = LP.pathFromPoints(fgPts, W, floor);

  // pine positions: pick crest points across the foreground ridge
  const pines = fgPts.filter((_, i) => i % 2 === 0).map(([x, y], i) => ({
    x,
    y,
    s: 0.8 + i * 37 % 100 / 140
  }));
  React.useEffect(() => {
    if (reduced) return;
    let mx = 0,
      my = 0,
      sy = 0,
      raf;
    const apply = () => {
      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        const L = layers[i] || {
          dx: 44,
          dy: -0.10
        };
        const tx = mx * (L.dx || 0);
        const ty = sy * (L.dy || 0);
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });
      // foreground (last ref) moves most
      const fg = layerRefs.current[layers.length];
      if (fg) fg.style.transform = `translate3d(${mx * 50}px, ${sy * -0.09}px, 0)`;
      raf = null;
    };
    const onMove = e => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onScroll = () => {
      sy = window.scrollY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener('mousemove', onMove, {
      passive: true
    });
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [theme]);
  const stars = Array.from({
    length: 22
  }, (_, i) => {
    const r = LP.mulberry32(i * 99 + 3);
    return {
      x: 80 + r() * (W - 160),
      y: 30 + r() * 230,
      rad: 0.8 + r() * 1.6,
      d: i % 5 * 0.7
    };
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "hero-scene",
    ref: sceneRef,
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "xMidYMax slice"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("radialGradient", {
    id: "lp-sun",
    cx: "50%",
    cy: "50%",
    r: "50%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: glow
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "45%",
    stopColor: glow,
    stopOpacity: "0.5"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: glow,
    stopOpacity: "0"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "lp-disc",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "var(--gold-300)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "var(--gold-600)"
  }))), /*#__PURE__*/React.createElement("rect", {
    x: W * 0.5,
    y: "40",
    width: "640",
    height: "640",
    fill: "url(#lp-sun)",
    transform: `translate(${-320}, 0)`
  }), /*#__PURE__*/React.createElement("circle", {
    cx: sunX,
    cy: "170",
    r: "46",
    fill: "url(#lp-disc)",
    opacity: theme === 'light' ? 0.85 : 0.92
  }), theme !== 'light' && stars.map((s, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    className: "twinkle",
    cx: s.x,
    cy: s.y,
    r: s.rad,
    fill: "var(--ink-100)",
    style: {
      animationDelay: `${s.d}s`
    }
  })), layers.map((L, i) => /*#__PURE__*/React.createElement("g", {
    className: "ridge",
    key: i,
    ref: el => layerRefs.current[i] = el
  }, /*#__PURE__*/React.createElement("path", {
    d: LP.ridgePath(W, L.base, L.amp, L.rough, L.seed, floor),
    fill: L.fill
  }))), /*#__PURE__*/React.createElement("g", {
    className: "ridge",
    ref: el => layerRefs.current[layers.length] = el
  }, /*#__PURE__*/React.createElement("path", {
    d: fgPath,
    fill: pal[3]
  }), pines.map((p, i) => /*#__PURE__*/React.createElement("g", {
    key: i,
    transform: `translate(${p.x}, ${p.y}) scale(${p.s})`,
    opacity: "0.96"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "-1.3",
    y: "-2",
    width: "2.6",
    height: "10",
    fill: pineStroke
  }), /*#__PURE__*/React.createElement("path", {
    d: "M 0 -26 L 9 -8 L -9 -8 Z",
    fill: pineFill,
    stroke: pineStroke,
    strokeWidth: "0.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M 0 -18 L 11 2 L -11 2 Z",
    fill: pineFill,
    stroke: pineStroke,
    strokeWidth: "0.6"
  }))))));
}
Object.assign(window, {
  useCountUp,
  useInView,
  compactNum,
  Ridgelines
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "marketing/scene.jsx", error: String((e && e.message) || e) }); }

// marketing/showcase.jsx
try { (() => {
/* Atlas LP — how it works, achievements showcase, testimonials. */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const {
    Icon,
    AchievementBadge,
    Badge
  } = DS;
  const LP = window.AtlasLP;

  /* ---------------- how it works ---------------- */
  function RouteTrail() {
    const bandRef = React.useRef(null);
    const pathRef = React.useRef(null);
    const markerRef = React.useRef(null);
    const flagRef = React.useRef(null);
    const nodeRefs = React.useRef([]);
    const nodes = [{
      x: 174,
      y: 86
    }, {
      x: 550,
      y: 70
    }, {
      x: 926,
      y: 44
    }];
    const d = "M 40 102 C 100 98 140 90 174 86 C 280 80 360 94 470 90 C 520 88 510 74 550 70 C 660 64 720 82 820 72 C 880 66 900 52 926 44 C 985 38 1015 30 1060 24";
    React.useEffect(() => {
      const path = pathRef.current,
        band = bandRef.current;
      if (!path || !band) return;
      const L = path.getTotalLength();
      path.style.strokeDasharray = L;
      const fracs = nodes.map(n => {
        let best = 0,
          bd = 1e9;
        for (let s = 0; s <= 120; s++) {
          const pt = path.getPointAtLength(L * s / 120);
          const dd = Math.abs(pt.x - n.x);
          if (dd < bd) {
            bd = dd;
            best = s / 120;
          }
        }
        return best;
      });
      const draw = p => {
        path.style.strokeDashoffset = L * (1 - p);
        if (markerRef.current) {
          const pt = path.getPointAtLength(L * Math.max(0.001, Math.min(1, p)));
          markerRef.current.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
          markerRef.current.style.opacity = p > 0.015 && p < 0.99 ? 1 : 0;
        }
        nodeRefs.current.forEach((el, i) => {
          if (el) el.classList.toggle('on', p >= fracs[i] - 0.005);
        });
        if (flagRef.current) flagRef.current.style.opacity = p > 0.9 ? 1 : 0;
      };
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        draw(1);
        return;
      }
      let raf = null;
      const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          const rect = band.getBoundingClientRect();
          const vh = window.innerHeight || 800;
          const p = Math.max(0, Math.min(1, (vh * 0.82 - rect.top) / (vh * 0.6)));
          draw(p);
        });
      };
      onScroll();
      window.addEventListener('scroll', onScroll, {
        passive: true
      });
      window.addEventListener('resize', onScroll);
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        if (raf) cancelAnimationFrame(raf);
      };
    }, []);
    return /*#__PURE__*/React.createElement("div", {
      className: "route-band",
      ref: bandRef,
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 1100 124",
      preserveAspectRatio: "none"
    }, /*#__PURE__*/React.createElement("path", {
      className: "route-line-bg",
      d: d
    }), /*#__PURE__*/React.createElement("path", {
      className: "route-line",
      ref: pathRef,
      d: d
    }), nodes.map((n, i) => /*#__PURE__*/React.createElement("g", {
      className: "route-node",
      key: i,
      ref: el => nodeRefs.current[i] = el,
      transform: `translate(${n.x}, ${n.y})`
    }, /*#__PURE__*/React.createElement("circle", {
      className: "ring",
      r: "9"
    }), /*#__PURE__*/React.createElement("circle", {
      className: "core",
      r: "3.5"
    }))), /*#__PURE__*/React.createElement("g", {
      className: "route-flag",
      ref: flagRef,
      transform: "translate(1060, 24)"
    }, /*#__PURE__*/React.createElement("line", {
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "-30",
      stroke: "var(--gold-300)",
      strokeWidth: "2.5",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M 0 -30 L 20 -25 L 0 -19 Z",
      fill: "var(--gold-500)"
    })), /*#__PURE__*/React.createElement("g", {
      className: "route-marker",
      ref: markerRef
    }, /*#__PURE__*/React.createElement("circle", {
      className: "pulse",
      r: "6"
    }), /*#__PURE__*/React.createElement("circle", {
      className: "hub",
      r: "6"
    }))));
  }
  function HowItWorks() {
    return /*#__PURE__*/React.createElement("section", {
      id: "how",
      className: "sec-pad",
      style: {
        background: 'var(--bg-base)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "wrap"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        maxWidth: 640,
        margin: '0 auto 44px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      "data-reveal": true,
      className: "lp-eyebrow center",
      style: {
        marginBottom: 18
      }
    }, "HOW IT WORKS"), /*#__PURE__*/React.createElement("h2", {
      "data-reveal": true,
      className: "h-section",
      style: {
        marginBottom: 18
      }
    }, "Three steps to a complete record"), /*#__PURE__*/React.createElement("p", {
      "data-reveal": true,
      className: "lead"
    }, "No new app to carry up the hill. Atlas works with the history you've already got \u2014 follow the route.")), /*#__PURE__*/React.createElement(RouteTrail, null), /*#__PURE__*/React.createElement("div", {
      className: "steps"
    }, LP.steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
      className: "step lp-card hoverable",
      key: i,
      "data-reveal": true,
      style: {
        transitionDelay: `${i * 0.08}s`,
        background: 'var(--surface-card)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "step-num"
    }, s.n), /*#__PURE__*/React.createElement("div", {
      className: "step-ico"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: s.icon,
      size: 24
    })), /*#__PURE__*/React.createElement("h3", {
      style: {
        font: 'var(--type-h3)',
        marginBottom: 10
      }
    }, s.title), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--text-secondary)',
        lineHeight: 'var(--leading-relaxed)',
        fontSize: 'var(--text-base)'
      }
    }, s.body))))));
  }

  /* ---------------- achievements showcase ---------------- */
  function tierIcon(name) {
    return /*#__PURE__*/React.createElement(Icon, {
      name: name,
      size: 22
    });
  }
  function Achievements() {
    const [ref, seen] = useInView({
      threshold: 0.2
    });
    return /*#__PURE__*/React.createElement("section", {
      id: "achievements",
      className: "sec-pad"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wrap"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: 24,
        marginBottom: 48
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 560
      }
    }, /*#__PURE__*/React.createElement("div", {
      "data-reveal": true,
      className: "lp-eyebrow",
      style: {
        marginBottom: 18
      }
    }, "ACHIEVEMENTS"), /*#__PURE__*/React.createElement("h2", {
      "data-reveal": true,
      className: "h-section",
      style: {
        marginBottom: 18
      }
    }, "A trophy case that pays out"), /*#__PURE__*/React.createElement("p", {
      "data-reveal": true,
      className: "lead"
    }, "Evocative, earned achievements \u2014 never grind-y noise. Each is worth points toward your Outdoor Score, and the rarer the tier, the bigger the haul.")), /*#__PURE__*/React.createElement("div", {
      "data-reveal": true,
      style: {
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: "bronze"
    }, "BRONZE"), /*#__PURE__*/React.createElement(Badge, {
      variant: "silver"
    }, "SILVER"), /*#__PURE__*/React.createElement(Badge, {
      variant: "gold"
    }, "GOLD"), /*#__PURE__*/React.createElement(Badge, {
      variant: "platinum"
    }, "PLATINUM \u2605"))), /*#__PURE__*/React.createElement("div", {
      className: "ach-grid",
      ref: ref
    }, LP.achievements.map((a, i) => /*#__PURE__*/React.createElement("div", {
      key: a.title,
      "data-reveal": true,
      style: {
        transitionDelay: `${i % 3 * 0.07}s`
      }
    }, seen && /*#__PURE__*/React.createElement(AchievementBadge, {
      title: a.title,
      description: a.description,
      tier: a.tier,
      points: a.points,
      unlocked: a.unlocked,
      progress: a.progress || null,
      icon: tierIcon(a.icon)
    }))))));
  }

  /* ---------------- testimonials ---------------- */
  function Testimonials() {
    return /*#__PURE__*/React.createElement("section", {
      className: "sec-pad",
      style: {
        background: 'var(--bg-base)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "wrap"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        maxWidth: 600,
        margin: '0 auto 56px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      "data-reveal": true,
      className: "lp-eyebrow center",
      style: {
        marginBottom: 18
      }
    }, "FROM THE TRAILHEAD"), /*#__PURE__*/React.createElement("h2", {
      "data-reveal": true,
      className: "h-section"
    }, "Explorers can't put it down")), /*#__PURE__*/React.createElement("div", {
      className: "quote-grid"
    }, LP.quotes.map((q, i) => /*#__PURE__*/React.createElement("div", {
      key: q.name,
      className: "lp-card quote-card hoverable",
      "data-reveal": true,
      style: {
        transitionDelay: `${i * 0.08}s`
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "quote-mark"
    }, "\u201C"), /*#__PURE__*/React.createElement("p", {
      className: "quote-body"
    }, q.body), /*#__PURE__*/React.createElement("div", {
      className: "quote-who"
    }, /*#__PURE__*/React.createElement("span", {
      className: "quote-avatar",
      style: {
        background: q.color
      }
    }, q.initials), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 'var(--text-sm)'
      }
    }, q.name), /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginTop: 2
      }
    }, q.meta))))))));
  }
  Object.assign(window, {
    LPHow: HowItWorks,
    LPAchievements: Achievements,
    LPTestimonials: Testimonials
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "marketing/showcase.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/AchievementsScreen.jsx
try { (() => {
/* Atlas mobile · Achievement gallery. Exports window.AchievementsScreen */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const {
    Icon,
    AchievementBadge,
    Tag,
    StatBlock,
    Card
  } = DS;
  function AchievementsScreen() {
    const {
      achievements
    } = window.AtlasData;
    const [tab, setTab] = React.useState('all');
    const unlocked = achievements.filter(a => a.unlocked);
    const pts = unlocked.reduce((s, a) => s + a.points, 0);
    const shown = achievements.filter(a => tab === 'all' || (tab === 'unlocked' ? a.unlocked : !a.unlocked));
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.AtlasMobileHeader, {
      eyebrow: "Trophy case",
      title: "Achievements"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 20px',
        marginBottom: 22,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Card, {
      pad: "sm",
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement(StatBlock, {
      align: "center",
      size: "sm",
      label: "Unlocked",
      value: `${unlocked.length}/${achievements.length}`
    })), /*#__PURE__*/React.createElement(Card, {
      pad: "sm",
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement(StatBlock, {
      align: "center",
      size: "sm",
      label: "Points",
      value: pts.toLocaleString(),
      gold: true
    })), /*#__PURE__*/React.createElement(Card, {
      pad: "sm",
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement(StatBlock, {
      align: "center",
      size: "sm",
      label: "Platinum",
      value: "1"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 20px',
        marginBottom: 16,
        display: 'flex',
        gap: 8
      }
    }, [['all', 'All'], ['unlocked', 'Unlocked'], ['locked', 'Locked']].map(([id, l]) => /*#__PURE__*/React.createElement(Tag, {
      key: id,
      selected: tab === id,
      onClick: () => setTab(id)
    }, l))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 20px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, shown.map(a => /*#__PURE__*/React.createElement(AchievementBadge, {
      key: a.id,
      title: a.title,
      description: a.desc,
      tier: a.tier,
      points: a.points,
      unlocked: a.unlocked,
      progress: a.progress,
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: a.unlocked ? a.icon : 'lock',
        size: a.unlocked ? 24 : 20
      })
    }))));
  }
  window.AchievementsScreen = AchievementsScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/AchievementsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/Chrome.jsx
try { (() => {
/* Atlas mobile · bottom tab bar + small shared bits.
   Exports to window: AtlasTabBar, AtlasMobileHeader, AtlasSection */
(function () {
  const {
    Icon
  } = window.AtlasDesignSystem_e1d28e;
  const TABS = [{
    id: 'home',
    label: 'Home',
    icon: 'house'
  }, {
    id: 'explore',
    label: 'Explore',
    icon: 'map'
  }, {
    id: 'collections',
    label: 'Collections',
    icon: 'layout-grid'
  }, {
    id: 'achievements',
    label: 'Awards',
    icon: 'trophy'
  }, {
    id: 'profile',
    label: 'Profile',
    icon: 'user'
  }];
  function AtlasTabBar({
    active,
    onChange
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'sticky',
        bottom: 0,
        zIndex: 30,
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 26px)',
        background: 'linear-gradient(180deg, transparent 0%, var(--bg-app) 60%)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        margin: '0 14px',
        height: 64,
        borderRadius: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        background: 'var(--surface-overlay)',
        backdropFilter: 'blur(18px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.3)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-lg)'
      }
    }, TABS.map(t => {
      const on = active === t.id;
      return /*#__PURE__*/React.createElement("button", {
        key: t.id,
        onClick: () => onChange(t.id),
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 6px',
          color: on ? 'var(--gold-400)' : 'var(--text-faint)',
          flex: 1
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: t.icon,
        size: 22,
        strokeWidth: on ? 2.4 : 2
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-sans)',
          fontSize: 10,
          fontWeight: on ? 700 : 500,
          letterSpacing: '.01em'
        }
      }, t.label));
    })));
  }
  function AtlasMobileHeader({
    title,
    eyebrow,
    right = null
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '8px 20px 18px',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", null, eyebrow && /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 5
      }
    }, eyebrow), /*#__PURE__*/React.createElement("h1", {
      style: {
        font: 'var(--type-h1)',
        fontSize: 30,
        color: 'var(--text-primary)',
        letterSpacing: '-.02em',
        margin: 0
      }
    }, title)), right);
  }
  function AtlasSection({
    title,
    action,
    onAction,
    children,
    style = {}
  }) {
    return /*#__PURE__*/React.createElement("section", {
      style: {
        padding: '0 20px',
        marginBottom: 26,
        ...style
      }
    }, (title || action) && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 13
      }
    }, title && /*#__PURE__*/React.createElement("h2", {
      style: {
        font: 'var(--type-h3)',
        fontSize: 18,
        color: 'var(--text-primary)',
        margin: 0
      }
    }, title), action && /*#__PURE__*/React.createElement("button", {
      onClick: onAction,
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--gold-400)'
      }
    }, action)), children);
  }
  Object.assign(window, {
    AtlasTabBar,
    AtlasMobileHeader,
    AtlasSection
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/CollectionsScreen.jsx
try { (() => {
/* Atlas mobile · Collections list + collection detail (Pokédex grid).
   Exports window.CollectionsScreen */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const {
    Icon,
    Tag,
    CollectionCard,
    CollectibleItem,
    ProgressRing,
    Badge,
    Button
  } = DS;
  function CollectionsList({
    go
  }) {
    const {
      collections
    } = window.AtlasData;
    const [type, setType] = React.useState('all');
    const M = (n, s) => /*#__PURE__*/React.createElement(Icon, {
      name: n,
      size: s
    });
    const types = ['all', 'Peaks', 'National Trail', 'Landmarks'];
    const shown = collections.filter(c => type === 'all' || c.type === type);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.AtlasMobileHeader, {
      eyebrow: "Lifetime record",
      title: "Collections"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 20px',
        marginBottom: 18,
        display: 'flex',
        gap: 8,
        overflowX: 'auto'
      }
    }, types.map(t => /*#__PURE__*/React.createElement(Tag, {
      key: t,
      selected: type === t,
      onClick: () => setType(t)
    }, t === 'all' ? 'All' : t === 'National Trail' ? 'Trails' : t))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 20px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, shown.map(c => /*#__PURE__*/React.createElement(CollectionCard, {
      key: c.id,
      title: c.title,
      type: c.type,
      value: c.value,
      max: c.max,
      image: c.img,
      icon: M(c.icon, 26),
      onClick: () => go(c.id)
    }))));
  }
  function CollectionDetail({
    onBack
  }) {
    const {
      peaks
    } = window.AtlasData;
    const [tab, setTab] = React.useState('all');
    const got = peaks.filter(p => p.got).length;
    const shown = peaks.filter(p => tab === 'all' || (tab === 'got' ? p.got : !p.got));
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 20px 22px',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onBack,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        background: 'none',
        border: 'none',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        padding: 0,
        marginBottom: 16,
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-left",
      size: 18
    }), " Collections"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 18
      }
    }, /*#__PURE__*/React.createElement(ProgressRing, {
      value: 121,
      max: 214,
      size: 92,
      stroke: 9,
      label: "Done",
      showValue: true
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 5
      }
    }, "Peaks \xB7 Lake District"), /*#__PURE__*/React.createElement("h1", {
      style: {
        font: 'var(--type-h1)',
        fontSize: 28,
        color: 'var(--text-primary)',
        margin: '0 0 8px'
      }
    }, "Wainwrights"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: "gold",
      dot: true
    }, "121 / 214"), /*#__PURE__*/React.createElement(Badge, {
      variant: "neutral"
    }, "93 to go"))))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 20px',
        marginBottom: 16,
        display: 'flex',
        gap: 8
      }
    }, [['all', `All 214`], ['got', `Collected ${got}`], ['missing', `Remaining`]].map(([id, l]) => /*#__PURE__*/React.createElement(Tag, {
      key: id,
      selected: tab === id,
      onClick: () => setTab(id)
    }, l))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 20px 8px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10
      }
    }, shown.map(p => /*#__PURE__*/React.createElement(CollectibleItem, {
      key: p.name,
      name: p.name,
      collected: p.got,
      image: p.img,
      meta: p.got ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, p.m, "m"), /*#__PURE__*/React.createElement("span", null, "\xD7", p.visits)) : /*#__PURE__*/React.createElement("b", null, p.m, "m"),
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "mountain",
        size: 30
      }),
      checkIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 13
      })
    }))));
  }
  function CollectionsScreen({
    go,
    detail,
    onBack
  }) {
    return detail ? /*#__PURE__*/React.createElement(CollectionDetail, {
      onBack: onBack
    }) : /*#__PURE__*/React.createElement(CollectionsList, {
      go: go
    });
  }
  window.CollectionsScreen = CollectionsScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/CollectionsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/ExploreScreen.jsx
try { (() => {
/* Atlas mobile · Explore Map. Exports window.ExploreScreen */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const {
    Icon,
    Tag,
    Badge
  } = DS;

  // Peak markers positioned over the terrain svg (percentages of the map box)
  const MARKERS = [{
    x: 32,
    y: 33,
    got: true,
    name: 'Helvellyn',
    m: 950
  }, {
    x: 68,
    y: 62,
    got: true,
    name: 'Scafell Pike',
    m: 978
  }, {
    x: 52,
    y: 23,
    got: true,
    name: 'Skiddaw',
    m: 931
  }, {
    x: 43,
    y: 71,
    got: false,
    name: 'Crinkle Crags',
    m: 859
  }, {
    x: 82,
    y: 71,
    got: false,
    name: 'Pillar',
    m: 892
  }, {
    x: 15,
    y: 49,
    got: true,
    name: 'Catbells',
    m: 451
  }, {
    x: 58,
    y: 45,
    got: false,
    name: 'Bowfell',
    m: 902
  }, {
    x: 73,
    y: 30,
    got: true,
    name: 'Fairfield',
    m: 873
  }];

  // explored gold route + a faint unexplored route, as % polylines
  const EXPLORED = '15,49 32,33 52,23 73,30';
  const PARTIAL = '32,33 58,45 68,62';
  const UNEXPLORED = '68,62 82,71 43,71';
  function ExploreScreen({
    theme = 'dark'
  }) {
    const [filter, setFilter] = React.useState('peaks');
    const [sel, setSel] = React.useState(MARKERS[1]);
    const mapSrc = theme === 'light' ? '../../assets/map-terrain-light.svg' : '../../assets/map-terrain.svg';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        flex: 1,
        overflow: 'hidden',
        background: 'var(--surface-sunken)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: mapSrc,
      alt: "",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }), /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%'
      }
    }, /*#__PURE__*/React.createElement("polyline", {
      points: UNEXPLORED,
      fill: "none",
      stroke: "rgba(125,141,156,0.5)",
      strokeWidth: "0.6",
      strokeDasharray: "2 2",
      vectorEffect: "non-scaling-stroke"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: PARTIAL,
      fill: "none",
      stroke: "var(--sky-400)",
      strokeWidth: "0.7",
      vectorEffect: "non-scaling-stroke"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: EXPLORED,
      fill: "none",
      stroke: "var(--gold-400)",
      strokeWidth: "0.9",
      vectorEffect: "non-scaling-stroke",
      style: {
        filter: 'drop-shadow(0 0 3px rgba(244,183,64,.6))'
      }
    })), MARKERS.map(mk => {
      const active = sel && sel.name === mk.name;
      return /*#__PURE__*/React.createElement("button", {
        key: mk.name,
        onClick: () => setSel(mk),
        style: {
          position: 'absolute',
          left: `${mk.x}%`,
          top: `${mk.y}%`,
          transform: 'translate(-50%,-50%)',
          width: active ? 34 : 26,
          height: active ? 34 : 26,
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          background: mk.got ? 'var(--accent)' : 'var(--surface-overlay)',
          color: mk.got ? 'var(--text-on-gold)' : 'var(--text-muted)',
          border: mk.got ? 'none' : '1.5px solid var(--border-strong)',
          backdropFilter: mk.got ? 'none' : 'blur(6px)',
          boxShadow: mk.got ? 'var(--glow-gold-sm)' : 'var(--shadow-sm)',
          zIndex: active ? 5 : 2,
          transition: 'all var(--dur-quick) var(--ease-out)'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: mk.got ? 'mountain' : 'mountain',
        size: active ? 17 : 13,
        strokeWidth: 2.4
      }));
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '14px 16px 28px',
        background: 'linear-gradient(180deg, var(--bg-app), transparent)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 10,
        color: 'var(--text-secondary)'
      }
    }, "Lake District \xB7 68% explored"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 2
      }
    }, [['peaks', 'Peaks', 214], ['trails', 'Trails', 9], ['landmarks', 'Landmarks', 54], ['gaps', 'Gaps', 93]].map(([id, t, c]) => /*#__PURE__*/React.createElement(Tag, {
      key: id,
      selected: filter === id,
      count: c,
      onClick: () => setFilter(id)
    }, t)))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        right: 16,
        bottom: 210,
        zIndex: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '10px 12px',
        background: 'var(--surface-overlay)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-md)'
      }
    }, [['var(--gold-400)', 'Explored'], ['var(--sky-400)', 'In progress'], ['rgba(125,141,156,0.6)', 'Unexplored']].map(([c, l]) => /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 14,
        height: 3,
        borderRadius: 2,
        background: c
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
        whiteSpace: 'nowrap'
      }
    }, l))))), sel && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 110,
        zIndex: 20,
        background: 'var(--surface-overlay)',
        backdropFilter: 'blur(18px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.3)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        padding: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 13
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 48,
        height: 48,
        borderRadius: 'var(--radius-md)',
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: sel.got ? 'var(--accent-soft)' : 'var(--surface-raised)',
        color: sel.got ? 'var(--gold-400)' : 'var(--text-muted)',
        border: sel.got ? '1px solid var(--border-gold)' : '1px solid var(--border-default)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "mountain",
      size: 24
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--type-h3)',
        fontSize: 17,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, sel.name), sel.got ? /*#__PURE__*/React.createElement(Badge, {
      variant: "success",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 11
      })
    }, "Collected") : /*#__PURE__*/React.createElement(Badge, {
      variant: "neutral"
    }, "Not yet")), /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 11,
        marginTop: 4
      }
    }, sel.m, " M \xB7 WAINWRIGHT")), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 20,
      color: "var(--text-muted)"
    }))));
  }
  window.ExploreScreen = ExploreScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/ExploreScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/HomeScreen.jsx
try { (() => {
/* Atlas mobile · Home dashboard. Exports window.HomeScreen */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const {
    Icon,
    ScoreMeter,
    HeatGrid,
    CollectionCard,
    Card,
    Badge,
    StatBlock
  } = DS;
  function SuggestionRow({
    s,
    onGo
  }) {
    return /*#__PURE__*/React.createElement("button", {
      onClick: onGo,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        width: '100%',
        textAlign: 'left',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 13,
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm), var(--ring-top)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: '0 0 auto',
        width: 44,
        height: 44,
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--accent-soft)',
        color: 'var(--gold-400)',
        border: '1px solid var(--border-gold)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: s.icon,
      size: 22
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        font: 'var(--type-label)',
        fontSize: 15,
        color: 'var(--text-primary)'
      }
    }, s.title), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 13,
        color: 'var(--text-muted)',
        marginTop: 2
      }
    }, s.detail), /*#__PURE__*/React.createElement("span", {
      className: "eyebrow",
      style: {
        fontSize: 10,
        marginTop: 4,
        display: 'block'
      }
    }, s.meta)), /*#__PURE__*/React.createElement(Badge, {
      variant: "gold"
    }, s.tag));
  }
  function HomeScreen({
    go
  }) {
    const {
      user,
      collections,
      suggestions
    } = window.AtlasData;
    const M = (n, s) => /*#__PURE__*/React.createElement(Icon, {
      name: n,
      size: s
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(window.AtlasMobileHeader, {
      eyebrow: `Good morning · ${user.home}`,
      title: "Your Atlas",
      right: /*#__PURE__*/React.createElement(DS.Avatar, {
        src: user.avatar,
        name: user.name,
        level: user.level,
        ring: true
      })
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 20px',
        marginBottom: 22
      }
    }, /*#__PURE__*/React.createElement(ScoreMeter, {
      score: user.score,
      level: user.level,
      levelProgress: user.levelProgress,
      toNext: user.toNext
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 20px',
        marginBottom: 26,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 10
      }
    }, [['Summits', user.summits, 'mountain'], ['Distance', user.distanceKm.toLocaleString(), 'route'], ['Days out', user.daysOut, 'sun']].map(([l, v, ic]) => /*#__PURE__*/React.createElement(Card, {
      key: l,
      pad: "sm",
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement(StatBlock, {
      align: "center",
      size: "sm",
      label: l,
      value: v,
      icon: M(ic, 12)
    })))), /*#__PURE__*/React.createElement(window.AtlasSection, {
      title: "This year",
      action: "Stats",
      onAction: () => go('profile')
    }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: 'var(--text-secondary)'
      }
    }, "186 days outdoors"), /*#__PURE__*/React.createElement("span", {
      className: "eyebrow",
      style: {
        fontSize: 10
      }
    }, "Last 30 weeks")), /*#__PURE__*/React.createElement(HeatGrid, {
      columns: 15,
      rows: 7,
      cell: 14,
      gap: 4
    }))), /*#__PURE__*/React.createElement(window.AtlasSection, {
      title: "Suggested next",
      action: "More",
      onAction: () => go('explore')
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, suggestions.map(s => /*#__PURE__*/React.createElement(SuggestionRow, {
      key: s.title,
      s: s,
      onGo: () => go('explore')
    })))), /*#__PURE__*/React.createElement(window.AtlasSection, {
      title: "Close to complete",
      action: "All",
      onAction: () => go('collections')
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, collections.filter(c => c.value < c.max && c.value / c.max > 0.5).slice(0, 2).map(c => /*#__PURE__*/React.createElement(CollectionCard, {
      key: c.id,
      title: c.title,
      type: c.type,
      value: c.value,
      max: c.max,
      image: c.img,
      icon: M(c.icon, 26),
      onClick: () => go('collections', c.id)
    })))));
  }
  window.HomeScreen = HomeScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/ProfileScreen.jsx
try { (() => {
/* Atlas mobile · Profile. Exports window.ProfileScreen */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const {
    Icon,
    Avatar,
    ScoreMeter,
    HeatGrid,
    StatBlock,
    Card,
    Badge,
    ProgressBar
  } = DS;
  function ProfileScreen({
    theme = 'dark',
    setTheme
  }) {
    const {
      user,
      regions,
      achievements
    } = window.AtlasData;
    const recent = achievements.filter(a => a.unlocked).slice(0, 4);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "atlas-topo",
      style: {
        position: 'relative',
        padding: '20px 20px 22px',
        marginBottom: 8,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: window.AtlasData.regionHero,
      alt: "",
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }), /*#__PURE__*/React.createElement("div", {
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(0deg, var(--bg-app) 8%, color-mix(in srgb, var(--bg-app) 62%, transparent) 60%, color-mix(in srgb, var(--bg-app) 40%, transparent) 100%)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      src: user.avatar,
      name: user.name,
      size: 68,
      level: user.level,
      ring: true
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
      style: {
        font: 'var(--type-h2)',
        fontSize: 24,
        color: 'var(--text-primary)',
        margin: '0 0 3px'
      }
    }, user.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text-muted)'
      }
    }, user.handle, " \xB7 ", user.home)))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 20px',
        marginBottom: 22
      }
    }, /*#__PURE__*/React.createElement(ScoreMeter, {
      score: user.score,
      level: user.level,
      levelProgress: user.levelProgress,
      toNext: user.toNext
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 20px',
        marginBottom: 26,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10
      }
    }, [['Summits', user.summits, 'mountain'], ['Distance', `${user.distanceKm.toLocaleString()} km`, 'route'], ['Days out', user.daysOut, 'sun'], ['Countries', user.countries, 'globe']].map(([l, v, ic]) => /*#__PURE__*/React.createElement(Card, {
      key: l,
      pad: "sm"
    }, /*#__PURE__*/React.createElement(StatBlock, {
      size: "sm",
      label: l,
      value: v,
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: ic,
        size: 12
      })
    })))), /*#__PURE__*/React.createElement(window.AtlasSection, {
      title: "Activity"
    }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: 'var(--text-secondary)'
      }
    }, "Lifetime \xB7 ", user.daysOut, " days out"), /*#__PURE__*/React.createElement("span", {
      className: "eyebrow",
      style: {
        fontSize: 10
      }
    }, "2024 \u2014 2026")), /*#__PURE__*/React.createElement(HeatGrid, {
      columns: 15,
      rows: 7,
      cell: 14,
      gap: 4
    }))), /*#__PURE__*/React.createElement(window.AtlasSection, {
      title: "Region progress"
    }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, regions.map(r => /*#__PURE__*/React.createElement(ProgressBar, {
      key: r.id,
      label: r.name,
      value: r.pct
    }))))), /*#__PURE__*/React.createElement(window.AtlasSection, {
      title: "Recent awards"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        overflowX: 'auto',
        paddingBottom: 4
      }
    }, recent.map(a => /*#__PURE__*/React.createElement(Card, {
      key: a.id,
      emphasis: a.tier === 'gold' || a.tier === 'platinum',
      pad: "sm",
      style: {
        flex: '0 0 132px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 48,
        height: 48,
        borderRadius: '50%',
        margin: '2px auto 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--accent-soft)',
        color: 'var(--gold-400)',
        boxShadow: 'var(--glow-gold-sm)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: a.icon,
      size: 22
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-label)',
        fontSize: 13,
        color: 'var(--text-primary)',
        marginBottom: 6
      }
    }, a.title), /*#__PURE__*/React.createElement(Badge, {
      variant: a.tier === 'platinum' ? 'platinum' : a.tier === 'gold' ? 'solid' : a.tier
    }, a.points, " pts"))))), /*#__PURE__*/React.createElement(window.AtlasSection, {
      title: "Preferences"
    }, /*#__PURE__*/React.createElement(Card, {
      pad: "sm"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "sun-moon",
      size: 18,
      color: "var(--text-muted)"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text-primary)'
      }
    }, "Appearance"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--text-muted)'
      }
    }, "Choose your map theme"))), /*#__PURE__*/React.createElement("div", {
      role: "tablist",
      style: {
        display: 'flex',
        gap: 3,
        padding: 3,
        borderRadius: 'var(--radius-pill)',
        background: 'var(--surface-sunken)',
        border: '1px solid var(--border-subtle)'
      }
    }, [['dark', 'moon'], ['light', 'sun']].map(([id, ic]) => {
      const on = theme === id;
      return /*#__PURE__*/React.createElement("button", {
        key: id,
        onClick: () => setTheme && setTheme(id),
        "aria-selected": on,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          cursor: 'pointer',
          border: 'none',
          borderRadius: 'var(--radius-pill)',
          textTransform: 'capitalize',
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 600,
          background: on ? 'var(--accent)' : 'transparent',
          color: on ? 'var(--text-on-gold)' : 'var(--text-secondary)',
          boxShadow: on ? 'var(--glow-gold-sm)' : 'none',
          transition: 'var(--t-colors)'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: ic,
        size: 14,
        strokeWidth: 2.2
      }), " ", id);
    }))))));
  }
  window.ProfileScreen = ProfileScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/ProfileScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/data.js
try { (() => {
/* Atlas mobile · shared mock data + tiny helpers.
   Exposed on window.AtlasData for all mobile screens. */
(function () {
  const M = (name, size = 24) => ({
    __icon: name,
    size
  });

  // Stock placeholders (Unsplash) — swap for owned imagery later.
  const PHOTO = (id, w = 320) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
  const user = {
    name: 'Maya Okonkwo',
    handle: '@mayaventures',
    level: 24,
    score: 14820,
    levelProgress: 62,
    toNext: '680 pts to Level 25',
    avatar: PHOTO('1494790108377-be9c29b29330', 160),
    home: 'Ambleside, Cumbria',
    summits: 312,
    distanceKm: 4109,
    daysOut: 186,
    countries: 4
  };
  const collections = [{
    id: 'wainwrights',
    title: 'Wainwrights',
    type: 'Peaks',
    value: 121,
    max: 214,
    icon: 'mountain',
    img: PHOTO('1486870591958-9b9d0d1dda99', 160)
  }, {
    id: 'munros',
    title: 'Munros',
    type: 'Peaks',
    value: 43,
    max: 282,
    icon: 'mountain',
    img: PHOTO('1483728642387-6c3bdd6c93e5', 160)
  }, {
    id: 'county-tops',
    title: 'County Tops',
    type: 'Peaks',
    value: 39,
    max: 91,
    icon: 'triangle',
    img: PHOTO('1454496522488-7a8e488e8606', 160)
  }, {
    id: 'swcp',
    title: 'South West Coast Path',
    type: 'National Trail',
    value: 1014,
    max: 1014,
    icon: 'route',
    img: PHOTO('1505159940484-eb2b9f2588e2', 160)
  }, {
    id: 'pennine',
    title: 'Pennine Way',
    type: 'National Trail',
    value: 268,
    max: 431,
    icon: 'route',
    img: PHOTO('1551632811-561732d1e306', 160)
  }, {
    id: 'trigs',
    title: 'Trig Pillars',
    type: 'Landmarks',
    value: 88,
    max: 300,
    icon: 'triangle',
    img: PHOTO('1464822759023-fed622ff2c3b', 160)
  }, {
    id: 'bothies',
    title: 'Bothies',
    type: 'Landmarks',
    value: 12,
    max: 81,
    icon: 'tent',
    img: PHOTO('1478131143081-80f7f84ca84d', 160)
  }, {
    id: 'waterfalls',
    title: 'Waterfalls',
    type: 'Landmarks',
    value: 21,
    max: 64,
    icon: 'droplets',
    img: PHOTO('1432405972618-c60b0225b8f9', 160)
  }];
  const regions = [{
    id: 'lakes',
    name: 'Lake District',
    pct: 68,
    peaks: '121/214',
    trails: 9,
    landmarks: 54
  }, {
    id: 'snowdonia',
    name: 'Snowdonia',
    pct: 42,
    peaks: '38/90',
    trails: 4,
    landmarks: 22
  }, {
    id: 'peak',
    name: 'Peak District',
    pct: 55,
    peaks: '24/55',
    trails: 6,
    landmarks: 31
  }, {
    id: 'cairngorms',
    name: 'Cairngorms',
    pct: 23,
    peaks: '12/55',
    trails: 2,
    landmarks: 9
  }];
  const achievements = [{
    id: 'skyliner',
    title: 'Skyliner',
    desc: 'Climb three 800m summits in one day',
    tier: 'gold',
    points: 500,
    unlocked: true,
    icon: 'mountain'
  }, {
    id: 'first-k',
    title: 'Into Thin Air',
    desc: 'Reach your first 1000m summit',
    tier: 'silver',
    points: 250,
    unlocked: true,
    icon: 'flag'
  }, {
    id: 'trail-done',
    title: 'End to End',
    desc: 'Complete a National Trail',
    tier: 'gold',
    points: 500,
    unlocked: true,
    icon: 'route'
  }, {
    id: 'fifty-k',
    title: 'The Long Way',
    desc: 'Hike 50km in a single day',
    tier: 'platinum',
    points: 750,
    unlocked: true,
    icon: 'footprints'
  }, {
    id: 'centurion',
    title: 'Centurion',
    desc: 'Visit 100 unique summits',
    tier: 'silver',
    points: 250,
    unlocked: false,
    icon: 'lock',
    progress: {
      value: 78,
      max: 100
    }
  }, {
    id: 'region-90',
    title: 'Local Legend',
    desc: 'Explore 90% of a single region',
    tier: 'gold',
    points: 500,
    unlocked: false,
    icon: 'lock',
    progress: {
      value: 68,
      max: 90
    }
  }, {
    id: 'dawn',
    title: 'First Light',
    desc: 'Summit before sunrise',
    tier: 'bronze',
    points: 100,
    unlocked: false,
    icon: 'lock',
    progress: null
  }, {
    id: 'all-weather',
    title: 'All Weather',
    desc: 'Summit in snow, rain and sun',
    tier: 'bronze',
    points: 100,
    unlocked: false,
    icon: 'lock',
    progress: {
      value: 2,
      max: 3
    }
  }];

  // peaks within the Wainwrights collection (Pokédex grid)
  const peaks = [{
    name: 'Scafell Pike',
    m: 978,
    got: true,
    visits: 3,
    img: PHOTO('1464822759023-fed622ff2c3b', 240)
  }, {
    name: 'Helvellyn',
    m: 950,
    got: true,
    visits: 5,
    img: PHOTO('1454496522488-7a8e488e8606', 240)
  }, {
    name: 'Skiddaw',
    m: 931,
    got: true,
    visits: 2,
    img: PHOTO('1483728642387-6c3bdd6c93e5', 240)
  }, {
    name: 'Great Gable',
    m: 899,
    got: true,
    visits: 1,
    img: PHOTO('1486870591958-9b9d0d1dda99', 240)
  }, {
    name: 'Blencathra',
    m: 868,
    got: false,
    img: PHOTO('1469474968028-56623f02e42e', 240)
  }, {
    name: 'Bowfell',
    m: 902,
    got: true,
    visits: 1,
    img: PHOTO('1458668383970-8ddd3927deed', 240)
  }, {
    name: 'Pillar',
    m: 892,
    got: false,
    img: PHOTO('1426604966848-d7adac402bff', 240)
  }, {
    name: 'Fairfield',
    m: 873,
    got: true,
    visits: 2,
    img: PHOTO('1472791108553-c9405341e398', 240)
  }, {
    name: 'Crinkle Crags',
    m: 859,
    got: false,
    img: PHOTO('1519681393784-d120267933ba', 240)
  }, {
    name: 'Old Man of Coniston',
    m: 803,
    got: true,
    visits: 4,
    img: PHOTO('1464822759023-fed622ff2c3b', 240)
  }, {
    name: 'Catbells',
    m: 451,
    got: true,
    visits: 6,
    img: PHOTO('1454496522488-7a8e488e8606', 240)
  }, {
    name: 'Haystacks',
    m: 597,
    got: false,
    img: PHOTO('1483728642387-6c3bdd6c93e5', 240)
  }];
  const suggestions = [{
    title: 'Blencathra',
    detail: '2 peaks from your next Wainwright badge',
    meta: '868m · 11km from home',
    icon: 'mountain',
    tag: '+120 pts'
  }, {
    title: 'Finish the Pennine Way',
    detail: '12 sections remaining',
    meta: '163km left',
    icon: 'route',
    tag: '+500 pts'
  }, {
    title: 'Aira Force',
    detail: 'Waterfall · never visited',
    meta: 'Lake District · 9km',
    icon: 'droplets',
    tag: '+40 pts'
  }];
  const feed = [{
    title: 'Skyliner',
    sub: 'Gold achievement unlocked',
    tier: 'gold',
    when: '2d ago',
    points: 500
  }, {
    title: 'Fairfield',
    sub: 'New Wainwright collected',
    tier: null,
    when: '2d ago',
    points: 60
  }, {
    title: 'Level 24 reached',
    sub: 'Outdoor Score 14,300',
    tier: null,
    when: '1w ago',
    points: 0
  }];

  // Lake District region hero photography
  const regionHero = PHOTO('1506905925346-21bda4d32df4', 1280);
  window.AtlasData = {
    user,
    collections,
    regions,
    achievements,
    peaks,
    suggestions,
    feed,
    regionHero
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/data.js", error: String((e && e.message) || e) }); }

// ui_kits/mobile/ios-frame.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports (to window): IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard
//
// Usage — wrap your screen content in <IOSDevice> to get the bezel, status bar
// and home indicator (props: title, dark, keyboard):
//
//   <IOSDevice title="Settings">
//     ...your screen content...
//   </IOSDevice>
//   <IOSDevice dark title="Search" keyboard>…</IOSDevice>
/* END USAGE */

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/ios-frame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Achievements.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas web · Achievements / trophy case. Exports window.WebAchievements */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const {
    Icon,
    ProgressRing,
    ProgressBar,
    AchievementBadge,
    Badge,
    Button
  } = DS;
  const {
    AtlasPanel
  } = window;
  const TIERS = [{
    id: 'platinum',
    label: 'Platinum',
    color: 'var(--tier-platinum)',
    glow: 'var(--glow-platinum)',
    mark: '★'
  }, {
    id: 'gold',
    label: 'Gold',
    color: 'var(--tier-gold)',
    glow: 'var(--glow-gold-md)',
    mark: 'I'
  }, {
    id: 'silver',
    label: 'Silver',
    color: 'var(--tier-silver)',
    glow: 'var(--glow-silver)',
    mark: 'II'
  }, {
    id: 'bronze',
    label: 'Bronze',
    color: 'var(--tier-bronze)',
    glow: 'var(--glow-bronze)',
    mark: 'III'
  }];
  function Medal({
    tier,
    have,
    total
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 46,
        height: 46,
        flex: '0 0 auto',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: tier.color,
        color: 'var(--ink-950)',
        boxShadow: tier.glow,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 16
      }
    }, tier.mark), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 19,
        color: 'var(--text-primary)',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums'
      }
    }, have, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-faint)',
        fontWeight: 500
      }
    }, " / ", total)), /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 9.5,
        marginTop: 4,
        color: tier.color
      }
    }, tier.label)));
  }
  const FILTERS = [['all', 'All'], ['unlocked', 'Unlocked'], ['progress', 'In progress'], ['locked', 'Locked']];
  function WebAchievements({
    onNav
  }) {
    const {
      achievements
    } = window.AtlasData;
    const [filter, setFilter] = React.useState('all');
    const M = (n, s) => /*#__PURE__*/React.createElement(Icon, {
      name: n,
      size: s
    });
    const unlocked = achievements.filter(a => a.unlocked);
    const points = unlocked.reduce((s, a) => s + a.points, 0);
    const possible = achievements.reduce((s, a) => s + a.points, 0);
    const pct = Math.round(unlocked.length / achievements.length * 100);
    const tierCount = id => ({
      have: unlocked.filter(a => a.tier === id).length,
      total: achievements.filter(a => a.tier === id).length
    });
    const inProgress = achievements.filter(a => !a.unlocked && a.progress).sort((a, b) => b.progress.value / b.progress.max - a.progress.value / a.progress.max);
    const matches = a => filter === 'all' ? true : filter === 'unlocked' ? a.unlocked : filter === 'progress' ? !a.unlocked && !!a.progress : !a.unlocked;

    // unlocked first, then by progress, then locked-no-progress
    const shown = achievements.filter(matches).slice().sort((a, b) => {
      const rank = x => x.unlocked ? 0 : x.progress ? 1 : 2;
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      if (a.progress && b.progress) return b.progress.value / b.progress.max - a.progress.value / a.progress.max;
      return 0;
    });
    const count = id => id === 'all' ? achievements.length : id === 'unlocked' ? unlocked.length : id === 'progress' ? inProgress.length : achievements.filter(a => !a.unlocked).length;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1.35fr 1fr',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "atlas-topo",
      style: {
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-gold)',
        padding: 28,
        overflow: 'hidden',
        boxShadow: 'var(--glow-gold-sm), var(--ring-top)',
        display: 'flex',
        alignItems: 'center',
        gap: 26
      }
    }, /*#__PURE__*/React.createElement(ProgressRing, {
      value: pct,
      size: 124,
      stroke: 12,
      label: "Completed"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 8
      }
    }, "Trophy Case \xB7 Lifetime"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "atlas-gold-text",
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 46,
        lineHeight: 1,
        letterSpacing: '-.02em',
        fontVariantNumeric: 'tabular-nums'
      }
    }, points.toLocaleString()), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap'
      }
    }, "/ ", possible.toLocaleString(), " pts")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        marginBottom: 20,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: "gold",
      dot: true
    }, unlocked.length, " of ", achievements.length, " unlocked"), /*#__PURE__*/React.createElement(Badge, {
      variant: "neutral"
    }, "Adds to Outdoor Score")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '14px 28px'
      }
    }, TIERS.map(t => /*#__PURE__*/React.createElement(Medal, _extends({
      key: t.id,
      tier: t
    }, tierCount(t.id))))))), /*#__PURE__*/React.createElement(AtlasPanel, {
      title: "Closest to unlock",
      action: /*#__PURE__*/React.createElement(Badge, {
        variant: "gold"
      }, "+", inProgress.reduce((s, a) => s + a.points, 0).toLocaleString(), " pts")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, inProgress.slice(0, 4).map(a => /*#__PURE__*/React.createElement("div", {
      key: a.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 13
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 38,
        height: 38,
        flex: '0 0 auto',
        borderRadius: 'var(--radius-md)',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--surface-sunken)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-secondary)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: a.icon,
      size: 18
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, a.title), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-muted)',
        flex: '0 0 auto'
      }
    }, a.progress.value, "/", a.progress.max)), /*#__PURE__*/React.createElement(ProgressBar, {
      value: a.progress.value,
      max: a.progress.max,
      color: a.tier === 'platinum' ? 'sky' : 'gold'
    }))))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        padding: 4,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-pill)'
      }
    }, FILTERS.map(([id, l]) => {
      const on = filter === id;
      return /*#__PURE__*/React.createElement("button", {
        key: id,
        onClick: () => setFilter(id),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '0 16px',
          height: 34,
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          border: 'none',
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 600,
          background: on ? 'var(--accent)' : 'transparent',
          color: on ? 'var(--text-on-gold)' : 'var(--text-secondary)',
          boxShadow: on ? 'var(--glow-gold-sm)' : 'none',
          transition: 'var(--t-colors)'
        }
      }, l, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          fontWeight: 700,
          padding: '1px 6px',
          borderRadius: 'var(--radius-pill)',
          background: on ? 'rgba(0,0,0,.16)' : 'var(--surface-sunken)',
          color: on ? 'var(--text-on-gold)' : 'var(--text-muted)'
        }
      }, count(id)));
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      leftIcon: M('share-2', 15),
      onClick: () => onNav('dashboard')
    }, "Share trophy case")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12
      }
    }, shown.map(a => /*#__PURE__*/React.createElement(AchievementBadge, {
      key: a.id,
      title: a.title,
      description: /*#__PURE__*/React.createElement(React.Fragment, null, a.desc, /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 6,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-faint)'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: a.unlocked ? 'calendar-check' : 'users',
        size: 11
      }), a.unlocked ? `Earned ${a.date}` : `${a.rarity}% of explorers have this`)),
      tier: a.tier,
      points: a.points,
      unlocked: a.unlocked,
      progress: a.progress,
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: a.unlocked ? a.icon : 'lock',
        size: a.unlocked ? 24 : 20
      })
    }))));
  }
  window.WebAchievements = WebAchievements;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Achievements.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Collections.jsx
try { (() => {
/* Atlas web · Collections page — overview + collection detail (Pokédex grid).
   Exports window.WebCollections */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const {
    Icon,
    ProgressRing,
    ProgressBar,
    StatBlock,
    CollectionCard,
    CollectibleItem,
    Badge,
    Button
  } = DS;
  const {
    AtlasPanel
  } = window;
  const M = (n, s) => /*#__PURE__*/React.createElement(Icon, {
    name: n,
    size: s
  });
  const pctOf = c => Math.round(c.value / c.max * 100);
  const TYPE_META = {
    'Peaks': {
      icon: 'mountain',
      label: 'Peaks'
    },
    'National Trail': {
      icon: 'route',
      label: 'Trails'
    },
    'Landmarks': {
      icon: 'flag',
      label: 'Landmarks'
    }
  };

  /* ---------- overview / list ---------- */
  function CollectionsList({
    onOpen
  }) {
    const {
      collections
    } = window.AtlasData;
    const [type, setType] = React.useState('all');
    const completed = collections.filter(c => c.value >= c.max);
    const avg = Math.round(collections.reduce((s, c) => s + pctOf(c), 0) / collections.length);
    const types = Object.keys(TYPE_META).filter(t => collections.some(c => c.type === t));
    const typeStat = t => {
      const set = collections.filter(c => c.type === t);
      const done = set.filter(c => c.value >= c.max).length;
      return {
        count: set.length,
        done,
        pct: Math.round(set.reduce((s, c) => s + pctOf(c), 0) / set.length)
      };
    };
    const filters = [['all', 'All', collections.length], ...types.map(t => [t, TYPE_META[t].label, collections.filter(c => c.type === t).length])];
    const shown = collections.filter(c => type === 'all' || c.type === type);
    const closest = collections.filter(c => c.value < c.max).sort((a, b) => pctOf(b) - pctOf(a));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1.35fr 1fr',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "atlas-topo",
      style: {
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-gold)',
        padding: 28,
        overflow: 'hidden',
        boxShadow: 'var(--glow-gold-sm), var(--ring-top)',
        display: 'flex',
        alignItems: 'center',
        gap: 26
      }
    }, /*#__PURE__*/React.createElement(ProgressRing, {
      value: avg,
      size: 124,
      stroke: 12,
      label: "Avg complete"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 8
      }
    }, "Completionist \xB7 Lifetime"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "atlas-gold-text",
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 46,
        lineHeight: 1,
        letterSpacing: '-.02em',
        fontVariantNumeric: 'tabular-nums'
      }
    }, completed.length), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap'
      }
    }, "/ ", collections.length, " collections completed")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        marginBottom: 20,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: "gold",
      dot: true
    }, collections.length, " collections tracked"), /*#__PURE__*/React.createElement(Badge, {
      variant: "neutral"
    }, closest.length, " in progress")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '14px 26px'
      }
    }, types.map(t => {
      const s = typeStat(t);
      return /*#__PURE__*/React.createElement("div", {
        key: t,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 11
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 40,
          height: 40,
          flex: '0 0 auto',
          borderRadius: 'var(--radius-md)',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--accent-soft)',
          border: '1px solid var(--border-gold)',
          color: 'var(--gold-400)'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: TYPE_META[t].icon,
        size: 19
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 18,
          color: 'var(--text-primary)',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums'
        }
      }, s.pct, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12,
          color: 'var(--text-faint)',
          fontWeight: 500
        }
      }, "%")), /*#__PURE__*/React.createElement("div", {
        className: "eyebrow",
        style: {
          fontSize: 9.5,
          marginTop: 4
        }
      }, TYPE_META[t].label, " \xB7 ", s.count)));
    })))), /*#__PURE__*/React.createElement(AtlasPanel, {
      title: "Closest to completion",
      action: /*#__PURE__*/React.createElement(Badge, {
        variant: "gold"
      }, closest.length, " active")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 15
      }
    }, closest.slice(0, 4).map(c => /*#__PURE__*/React.createElement("button", {
      key: c.id,
      onClick: () => onOpen(c),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        width: '100%',
        textAlign: 'left',
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        font: 'inherit'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 38,
        height: 38,
        flex: '0 0 auto',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--surface-sunken)',
        border: '1px solid var(--border-default)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: c.img,
      alt: "",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, c.title), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-muted)',
        flex: '0 0 auto'
      }
    }, c.value, "/", c.max)), /*#__PURE__*/React.createElement(ProgressBar, {
      value: c.value,
      max: c.max,
      color: c.type === 'National Trail' ? 'sky' : 'gold'
    }))))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        padding: 4,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-pill)'
      }
    }, filters.map(([id, l, n]) => {
      const on = type === id;
      return /*#__PURE__*/React.createElement("button", {
        key: id,
        onClick: () => setType(id),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '0 16px',
          height: 34,
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          border: 'none',
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 600,
          background: on ? 'var(--accent)' : 'transparent',
          color: on ? 'var(--text-on-gold)' : 'var(--text-secondary)',
          boxShadow: on ? 'var(--glow-gold-sm)' : 'none',
          transition: 'var(--t-colors)'
        }
      }, l, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          fontWeight: 700,
          padding: '1px 6px',
          borderRadius: 'var(--radius-pill)',
          background: on ? 'rgba(0,0,0,.16)' : 'var(--surface-sunken)',
          color: on ? 'var(--text-on-gold)' : 'var(--text-muted)'
        }
      }, n));
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      leftIcon: M('arrow-up-down', 15)
    }, "Sort by progress")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12
      }
    }, shown.map(c => /*#__PURE__*/React.createElement(CollectionCard, {
      key: c.id,
      title: c.title,
      type: c.type,
      value: c.value,
      max: c.max,
      image: c.img,
      icon: M(c.icon, 26),
      onClick: () => onOpen(c)
    }))));
  }

  /* ---------- detail (Pokédex grid) ---------- */
  function CollectionDetail({
    collection,
    onBack
  }) {
    const {
      peaks
    } = window.AtlasData;
    const [tab, setTab] = React.useState('all');
    const got = peaks.filter(p => p.got).length;
    const remaining = collection.max - collection.value;
    const visits = peaks.filter(p => p.got).reduce((s, p) => s + (p.visits || 0), 0);
    const highest = Math.max(...peaks.filter(p => p.got).map(p => p.m));
    const shown = peaks.filter(p => tab === 'all' || (tab === 'got' ? p.got : !p.got));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onBack,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        background: 'none',
        border: 'none',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        padding: 0,
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-left",
      size: 18
    }), " All collections"), /*#__PURE__*/React.createElement("div", {
      className: "atlas-topo",
      style: {
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-default)',
        padding: 28,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: collection.img,
      alt: "",
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }), /*#__PURE__*/React.createElement("div", {
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(100deg, var(--bg-app) 18%, color-mix(in srgb, var(--bg-app) 60%, transparent) 44%, color-mix(in srgb, var(--bg-app) 12%, transparent) 100%), linear-gradient(0deg, color-mix(in srgb, var(--bg-app) 45%, transparent), transparent 60%)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 28
      }
    }, /*#__PURE__*/React.createElement(ProgressRing, {
      value: collection.value,
      max: collection.max,
      size: 132,
      stroke: 12,
      label: "Collected"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 8
      }
    }, collection.type, " \xB7 Lake District"), /*#__PURE__*/React.createElement("h1", {
      style: {
        font: 'var(--type-display)',
        fontSize: 44,
        color: 'var(--text-primary)',
        margin: '0 0 12px',
        letterSpacing: '-.02em'
      }
    }, collection.title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: "gold",
      dot: true
    }, collection.value, " / ", collection.max), remaining > 0 ? /*#__PURE__*/React.createElement(Badge, {
      variant: "neutral"
    }, remaining, " to go") : /*#__PURE__*/React.createElement(Badge, {
      variant: "success"
    }, "Completed"), /*#__PURE__*/React.createElement(Badge, {
      variant: "neutral"
    }, pctOf(collection), "% complete"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      leftIcon: M('map', 16)
    }, "View on map"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      leftIcon: M('target', 16)
    }, "Set a goal")))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 16
      }
    }, [['Collected', `${collection.value}`, 'circle-check'], ['Remaining', `${remaining}`, 'target'], ['Total visits', `${visits}`, 'footprints'], ['Highest', `${highest}m`, 'mountain']].map(([l, v, ic]) => /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 18,
        boxShadow: 'var(--ring-top)'
      }
    }, /*#__PURE__*/React.createElement(StatBlock, {
      label: l,
      value: v,
      icon: M(ic, 12)
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        padding: 4,
        alignSelf: 'flex-start',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-pill)'
      }
    }, [['all', 'All', peaks.length], ['got', 'Collected', got], ['missing', 'Remaining', peaks.length - got]].map(([id, l, n]) => {
      const on = tab === id;
      return /*#__PURE__*/React.createElement("button", {
        key: id,
        onClick: () => setTab(id),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '0 16px',
          height: 34,
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          border: 'none',
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 600,
          background: on ? 'var(--accent)' : 'transparent',
          color: on ? 'var(--text-on-gold)' : 'var(--text-secondary)',
          boxShadow: on ? 'var(--glow-gold-sm)' : 'none',
          transition: 'var(--t-colors)'
        }
      }, l, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          fontWeight: 700,
          padding: '1px 6px',
          borderRadius: 'var(--radius-pill)',
          background: on ? 'rgba(0,0,0,.16)' : 'var(--surface-sunken)',
          color: on ? 'var(--text-on-gold)' : 'var(--text-muted)'
        }
      }, n));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(6,1fr)',
        gap: 12
      }
    }, shown.map(p => /*#__PURE__*/React.createElement(CollectibleItem, {
      key: p.name,
      name: p.name,
      collected: p.got,
      image: p.img,
      meta: p.got ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, p.m, "m"), /*#__PURE__*/React.createElement("span", null, "\xD7", p.visits)) : /*#__PURE__*/React.createElement("b", null, p.m, "m"),
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "mountain",
        size: 30
      }),
      checkIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 13
      })
    }))));
  }
  function WebCollections({
    onNav
  }) {
    const [open, setOpen] = React.useState(null);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    return open ? /*#__PURE__*/React.createElement(CollectionDetail, {
      collection: open,
      onBack: () => setOpen(null)
    }) : /*#__PURE__*/React.createElement(CollectionsList, {
      onOpen: setOpen
    });
  }
  window.WebCollections = WebCollections;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Collections.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Dashboard.jsx
try { (() => {
/* Atlas web · Dashboard view. Exports window.WebDashboard */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const {
    Icon,
    ScoreMeter,
    HeatGrid,
    ProgressBar,
    ProgressRing,
    CollectionCard,
    AchievementBadge,
    StatBlock,
    Badge,
    Button
  } = DS;
  const {
    AtlasPanel
  } = window;
  function WebDashboard({
    onNav
  }) {
    const {
      user,
      collections,
      regions,
      achievements,
      suggestions
    } = window.AtlasData;
    const M = (n, s) => /*#__PURE__*/React.createElement(Icon, {
      name: n,
      size: s
    });
    const recent = achievements.filter(a => a.unlocked);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1.3fr 1fr',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(ScoreMeter, {
      score: user.score,
      level: user.level,
      levelProgress: user.levelProgress,
      toNext: user.toNext
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 12
      }
    }, [['Summits', user.summits, 'mountain'], ['Distance', user.distanceKm.toLocaleString(), 'route'], ['Days out', user.daysOut, 'sun'], ['Countries', user.countries, 'globe']].map(([l, v, ic]) => /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
        boxShadow: 'var(--ring-top)'
      }
    }, /*#__PURE__*/React.createElement(StatBlock, {
      size: "sm",
      label: l,
      value: v,
      icon: M(ic, 12)
    })))), /*#__PURE__*/React.createElement(AtlasPanel, {
      title: "Exploration activity",
      action: /*#__PURE__*/React.createElement("span", {
        className: "eyebrow",
        style: {
          fontSize: 10
        }
      }, "2024 \u2014 2026")
    }, /*#__PURE__*/React.createElement(HeatGrid, {
      columns: 52,
      rows: 7,
      cell: 11,
      gap: 3
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 14,
        justifyContent: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-muted)'
      }
    }, "Less"), ['--heat-0', '--heat-1', '--heat-2', '--heat-3', '--heat-4'].map(h => /*#__PURE__*/React.createElement("span", {
      key: h,
      style: {
        width: 11,
        height: 11,
        borderRadius: 3,
        background: `var(${h})`
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-muted)'
      }
    }, "More")))), /*#__PURE__*/React.createElement(AtlasPanel, {
      title: "Next goals",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        size: "sm",
        onClick: () => onNav('map')
      }, "Open map")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, suggestions.map(s => /*#__PURE__*/React.createElement("div", {
      key: s.title,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 40,
        height: 40,
        flex: '0 0 auto',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--accent-soft)',
        color: 'var(--gold-400)',
        border: '1px solid var(--border-gold)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: s.icon,
      size: 20
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text-primary)'
      }
    }, s.title), /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 10,
        marginTop: 2
      }
    }, s.meta)), /*#__PURE__*/React.createElement(Badge, {
      variant: "gold"
    }, s.tag))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'var(--border-subtle)',
        margin: '2px 0'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, regions.slice(0, 3).map(r => /*#__PURE__*/React.createElement(ProgressBar, {
      key: r.id,
      label: r.name,
      value: r.pct
    })))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement(AtlasPanel, {
      title: "Closest to completion",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        size: "sm",
        onClick: () => onNav('collections')
      }, "All collections")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, collections.filter(c => c.value < c.max).sort((a, b) => b.value / b.max - a.value / a.max).slice(0, 3).map(c => /*#__PURE__*/React.createElement(CollectionCard, {
      key: c.id,
      title: c.title,
      type: c.type,
      value: c.value,
      max: c.max,
      image: c.img,
      icon: M(c.icon, 26)
    })))), /*#__PURE__*/React.createElement(AtlasPanel, {
      title: "Recent unlocks",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        size: "sm",
        onClick: () => onNav('achievements')
      }, "Trophy case")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, recent.slice(0, 3).map(a => /*#__PURE__*/React.createElement(AchievementBadge, {
      key: a.id,
      title: a.title,
      description: a.desc,
      tier: a.tier,
      points: a.points,
      unlocked: true,
      icon: M(a.icon, 24)
    }))))));
  }
  window.WebDashboard = WebDashboard;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Map.jsx
try { (() => {
/* Atlas web · Exploration Map. Pannable/zoomable terrain with peaks, trails,
   landmarks & a feature inspector. Exports window.WebMap */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const {
    Icon,
    Badge,
    Button,
    ProgressRing,
    ProgressBar,
    StatBlock
  } = DS;
  const PHOTO = (id, w = 480) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
  const M = (n, s) => /*#__PURE__*/React.createElement(Icon, {
    name: n,
    size: s
  });

  /* ---------------- feature data (Lake District) ---------------- */
  // x/y are percentages over the terrain layer.
  const PEAKS = [{
    id: 'helvellyn',
    kind: 'peak',
    name: 'Helvellyn',
    x: 33,
    y: 30,
    m: 950,
    prom: 712,
    status: 'got',
    visits: 5,
    last: 'Mar 2026',
    coll: 'Wainwrights'
  }, {
    id: 'scafell',
    kind: 'peak',
    name: 'Scafell Pike',
    x: 58,
    y: 60,
    m: 978,
    prom: 912,
    status: 'got',
    visits: 3,
    last: 'Aug 2025',
    coll: 'Wainwrights'
  }, {
    id: 'skiddaw',
    kind: 'peak',
    name: 'Skiddaw',
    x: 46,
    y: 17,
    m: 931,
    prom: 709,
    status: 'got',
    visits: 2,
    last: 'Oct 2024',
    coll: 'Wainwrights'
  }, {
    id: 'gable',
    kind: 'peak',
    name: 'Great Gable',
    x: 41,
    y: 49,
    m: 899,
    prom: 425,
    status: 'got',
    visits: 1,
    last: 'Jun 2024',
    coll: 'Wainwrights'
  }, {
    id: 'fairfield',
    kind: 'peak',
    name: 'Fairfield',
    x: 71,
    y: 27,
    m: 873,
    prom: 270,
    status: 'got',
    visits: 2,
    last: 'May 2025',
    coll: 'Wainwrights'
  }, {
    id: 'catbells',
    kind: 'peak',
    name: 'Catbells',
    x: 18,
    y: 43,
    m: 451,
    prom: 88,
    status: 'got',
    visits: 6,
    last: 'Feb 2026',
    coll: 'Wainwrights'
  }, {
    id: 'coniston',
    kind: 'peak',
    name: 'Old Man of Coniston',
    x: 29,
    y: 75,
    m: 803,
    prom: 511,
    status: 'got',
    visits: 4,
    last: 'Sep 2025',
    coll: 'Wainwrights'
  }, {
    id: 'bowfell',
    kind: 'peak',
    name: 'Bowfell',
    x: 50,
    y: 56,
    m: 902,
    prom: 122,
    status: 'planned',
    visits: 0,
    last: '—',
    coll: 'Wainwrights'
  }, {
    id: 'blencathra',
    kind: 'peak',
    name: 'Blencathra',
    x: 56,
    y: 22,
    m: 868,
    prom: 463,
    status: 'none',
    visits: 0,
    last: '—',
    coll: 'Wainwrights'
  }, {
    id: 'crinkle',
    kind: 'peak',
    name: 'Crinkle Crags',
    x: 45,
    y: 67,
    m: 859,
    prom: 71,
    status: 'none',
    visits: 0,
    last: '—',
    coll: 'Wainwrights'
  }, {
    id: 'pillar',
    kind: 'peak',
    name: 'Pillar',
    x: 80,
    y: 66,
    m: 892,
    prom: 348,
    status: 'none',
    visits: 0,
    last: '—',
    coll: 'Wainwrights'
  }, {
    id: 'haystacks',
    kind: 'peak',
    name: 'Haystacks',
    x: 73,
    y: 49,
    m: 597,
    prom: 90,
    status: 'none',
    visits: 0,
    last: '—',
    coll: 'Wainwrights'
  }];
  const LANDMARKS = [{
    id: 'castlerigg',
    kind: 'landmark',
    sub: 'Stone circle',
    name: 'Castlerigg Stones',
    x: 50,
    y: 13,
    status: 'got',
    icon: 'flag',
    last: 'Feb 2026'
  }, {
    id: 'ashness',
    kind: 'landmark',
    sub: 'Packhorse bridge',
    name: 'Ashness Bridge',
    x: 23,
    y: 35,
    status: 'got',
    icon: 'flag',
    last: 'Nov 2025'
  }, {
    id: 'taylorgill',
    kind: 'landmark',
    sub: 'Waterfall',
    name: 'Taylor Gill Force',
    x: 44,
    y: 41,
    status: 'got',
    icon: 'droplets',
    last: 'Jun 2024'
  }, {
    id: 'blacksail',
    kind: 'landmark',
    sub: 'Bothy',
    name: 'Black Sail Hut',
    x: 65,
    y: 56,
    status: 'got',
    icon: 'tent',
    last: 'Aug 2025'
  }, {
    id: 'airaforce',
    kind: 'landmark',
    sub: 'Waterfall',
    name: 'Aira Force',
    x: 68,
    y: 18,
    status: 'none',
    icon: 'droplets',
    last: '—'
  }, {
    id: 'mosedale',
    kind: 'landmark',
    sub: 'Bothy',
    name: 'Mosedale Bothy',
    x: 85,
    y: 60,
    status: 'none',
    icon: 'tent',
    last: '—'
  }];
  const TRAILS = [{
    id: 'fairfield-h',
    kind: 'trail',
    name: 'Fairfield Horseshoe',
    km: 17.5,
    gain: 1067,
    status: 'got',
    done: 14,
    total: 14,
    pts: '71,27 60,22 56,22 46,17'
  }, {
    id: 'scafell-c',
    kind: 'trail',
    name: 'Scafell Circuit',
    km: 13.2,
    gain: 982,
    status: 'planned',
    done: 4,
    total: 9,
    pts: '41,49 50,56 58,60'
  }, {
    id: 'coniston-r',
    kind: 'trail',
    name: 'Coniston Round',
    km: 14.0,
    gain: 1100,
    status: 'none',
    done: 0,
    total: 8,
    pts: '29,75 45,67 58,60'
  }, {
    id: 'western-l',
    kind: 'trail',
    name: 'Western Fells Loop',
    km: 19.4,
    gain: 1480,
    status: 'none',
    done: 0,
    total: 11,
    pts: '73,49 80,66 65,56'
  }];
  const ALL = [...PEAKS, ...LANDMARKS, ...TRAILS];
  const STATUS = {
    got: {
      label: 'Collected',
      badge: 'success',
      color: 'var(--gold-400)',
      soft: 'var(--accent-soft)',
      border: 'var(--border-gold)',
      icon: 'check'
    },
    planned: {
      label: 'Planned',
      badge: 'info',
      color: 'var(--sky-400)',
      soft: 'var(--info-soft)',
      border: 'rgba(70,182,232,.4)',
      icon: 'flag'
    },
    none: {
      label: 'Not visited',
      badge: 'neutral',
      color: 'var(--text-muted)',
      soft: 'var(--surface-raised)',
      border: 'var(--border-default)',
      icon: 'circle'
    }
  };
  // trail line colors
  const trailStroke = s => s === 'got' ? 'var(--gold-400)' : s === 'planned' ? 'var(--sky-400)' : 'rgba(125,141,156,0.55)';
  const peakImg = p => {
    const ids = ['1464822759023-fed622ff2c3b', '1454496522488-7a8e488e8606', '1483728642387-6c3bdd6c93e5', '1486870591958-9b9d0d1dda99', '1469474968028-56623f02e42e', '1458668383970-8ddd3927deed'];
    const i = Math.abs(p.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % ids.length;
    return PHOTO(ids[i], 520);
  };

  /* ---------------- map markers ---------------- */
  function PinMarker({
    f,
    active,
    scale,
    onClick
  }) {
    const st = STATUS[f.status];
    const got = f.status === 'got';
    const planned = f.status === 'planned';
    const size = active ? 40 : 32;
    return /*#__PURE__*/React.createElement("button", {
      "data-marker": true,
      onClick: e => {
        e.stopPropagation();
        onClick(f);
      },
      title: f.name,
      style: {
        position: 'absolute',
        left: `${f.x}%`,
        top: `${f.y}%`,
        transform: `translate(-50%,-50%) scale(${1 / scale})`,
        width: size,
        height: size,
        borderRadius: '50%',
        padding: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: got ? 'var(--accent)' : planned ? 'color-mix(in srgb, var(--sky-500) 22%, var(--surface-overlay))' : 'var(--surface-overlay)',
        color: got ? 'var(--text-on-gold)' : planned ? 'var(--sky-300)' : 'var(--text-secondary)',
        border: got ? '2px solid color-mix(in srgb, var(--white) 22%, transparent)' : '1.5px solid ' + (planned ? 'rgba(70,182,232,.55)' : 'var(--border-strong)'),
        backdropFilter: got ? 'none' : 'blur(6px)',
        WebkitBackdropFilter: got ? 'none' : 'blur(6px)',
        boxShadow: active ? '0 0 0 4px var(--accent-soft), var(--shadow-lg)' : got ? 'var(--glow-gold-sm)' : 'var(--shadow-sm)',
        zIndex: active ? 30 : got ? 6 : 4,
        transition: 'width .14s var(--ease-out), height .14s var(--ease-out), box-shadow .14s var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: f.kind === 'landmark' ? f.icon : 'mountain',
      size: active ? 19 : 15,
      strokeWidth: 2.4
    }), active && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: '110%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: 4,
        whiteSpace: 'nowrap',
        font: 'var(--type-body-sm)',
        fontSize: 11.5,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 'var(--radius-pill)',
        color: 'var(--text-primary)',
        background: 'var(--surface-overlay)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-md)'
      }
    }, f.name));
  }

  /* ---------------- inspector: feature detail ---------------- */
  function StatRow({
    label,
    value,
    icon
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '9px 0',
        borderBottom: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--text-muted)',
        fontSize: 13
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 14,
      color: "var(--text-faint)"
    }), label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text-primary)'
      }
    }, value));
  }
  function FeatureDetail({
    f,
    onBack,
    onSelect
  }) {
    const st = STATUS[f.status];
    const isTrail = f.kind === 'trail';
    const nearby = ALL.filter(o => o.id !== f.id && o.kind === f.kind).slice(0, 3);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: 168,
        flex: '0 0 168px',
        overflow: 'hidden'
      }
    }, f.kind === 'peak' ? /*#__PURE__*/React.createElement("img", {
      src: peakImg(f),
      alt: "",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }) : /*#__PURE__*/React.createElement("div", {
      className: "atlas-topo",
      style: {
        position: 'absolute',
        inset: 0,
        background: 'var(--surface-sunken)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(0deg, var(--surface-card) 4%, color-mix(in srgb, var(--surface-card) 30%, transparent) 55%, transparent)'
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: onBack,
      title: "Back",
      style: {
        position: 'absolute',
        top: 14,
        left: 14,
        width: 34,
        height: 34,
        borderRadius: 'var(--radius-pill)',
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        color: 'var(--text-primary)',
        background: 'var(--surface-overlay)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid var(--border-default)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 17
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 18,
        right: 18,
        bottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 10,
        marginBottom: 6
      }
    }, f.kind === 'peak' ? f.coll : isTrail ? 'National trail' : f.sub, " \xB7 Lake District"), /*#__PURE__*/React.createElement("h2", {
      style: {
        font: 'var(--type-h2)',
        fontSize: 24,
        color: 'var(--text-primary)',
        margin: 0,
        letterSpacing: '-.01em',
        lineHeight: 1.05,
        textWrap: 'balance'
      }
    }, f.name))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: st.badge,
      dot: f.status !== 'none',
      icon: f.status === 'got' ? /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 11
      }) : undefined
    }, st.label), f.kind === 'peak' && /*#__PURE__*/React.createElement(Badge, {
      variant: "neutral"
    }, f.m, " m"), isTrail && /*#__PURE__*/React.createElement(Badge, {
      variant: "neutral"
    }, f.km, " km"), f.kind === 'peak' && f.visits > 0 && /*#__PURE__*/React.createElement(Badge, {
      variant: "neutral"
    }, "\xD7", f.visits, " ascents")), isTrail && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        color: 'var(--text-secondary)',
        fontWeight: 600
      }
    }, "Sections walked"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text-muted)'
      }
    }, f.done, "/", f.total)), /*#__PURE__*/React.createElement(ProgressBar, {
      value: f.done,
      max: f.total,
      color: f.status === 'got' ? 'gold' : 'sky'
    })), /*#__PURE__*/React.createElement("div", null, f.kind === 'peak' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(StatRow, {
      label: "Elevation",
      value: `${f.m} m`,
      icon: "mountain"
    }), /*#__PURE__*/React.createElement(StatRow, {
      label: "Prominence",
      value: `${f.prom} m`,
      icon: "triangle"
    }), /*#__PURE__*/React.createElement(StatRow, {
      label: "Ascents logged",
      value: f.visits,
      icon: "footprints"
    }), /*#__PURE__*/React.createElement(StatRow, {
      label: "Last climbed",
      value: f.last,
      icon: "calendar"
    })), isTrail && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(StatRow, {
      label: "Distance",
      value: `${f.km} km`,
      icon: "route"
    }), /*#__PURE__*/React.createElement(StatRow, {
      label: "Elevation gain",
      value: `${f.gain} m`,
      icon: "trending-up"
    }), /*#__PURE__*/React.createElement(StatRow, {
      label: "Sections",
      value: `${f.done} / ${f.total}`,
      icon: "flag"
    })), f.kind === 'landmark' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(StatRow, {
      label: "Type",
      value: f.sub,
      icon: f.icon
    }), /*#__PURE__*/React.createElement(StatRow, {
      label: "Status",
      value: st.label,
      icon: "map-pin"
    }), /*#__PURE__*/React.createElement(StatRow, {
      label: "Last visit",
      value: f.last,
      icon: "calendar"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 9
      }
    }, f.status === 'got' ? /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      block: true,
      leftIcon: M('plus', 15)
    }, "Log another visit") : /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      leftIcon: M('flag', 15)
    }, f.status === 'planned' ? 'Continue plan' : 'Add to plan'), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      block: true,
      leftIcon: M('navigation', 15)
    }, "Get directions")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'var(--border-subtle)'
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 10,
        marginBottom: 10
      }
    }, "More ", f.kind === 'peak' ? 'peaks' : f.kind === 'trail' ? 'trails' : 'landmarks', " nearby"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }
    }, nearby.map(o => /*#__PURE__*/React.createElement(DirectoryRow, {
      key: o.id,
      f: o,
      onSelect: onSelect,
      compact: true
    }))))));
  }

  /* ---------------- inspector: directory row ---------------- */
  function DirectoryRow({
    f,
    onSelect,
    active,
    compact
  }) {
    const st = STATUS[f.status];
    const got = f.status === 'got';
    const meta = f.kind === 'peak' ? `${f.m} m` : f.kind === 'trail' ? `${f.km} km` : f.sub;
    return /*#__PURE__*/React.createElement("button", {
      "data-marker": true,
      onClick: () => onSelect(f),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        padding: compact ? '8px 9px' : '9px 10px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid ' + (active ? 'var(--border-gold)' : 'transparent'),
        background: active ? 'var(--accent-soft)' : 'transparent',
        font: 'inherit',
        transition: 'var(--t-colors)'
      },
      onMouseEnter: e => {
        if (!active) e.currentTarget.style.background = 'var(--surface-raised)';
      },
      onMouseLeave: e => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 32,
        height: 32,
        flex: '0 0 auto',
        borderRadius: 'var(--radius-md)',
        display: 'grid',
        placeItems: 'center',
        background: got ? 'var(--accent-soft)' : 'var(--surface-sunken)',
        border: '1px solid ' + (got ? 'var(--border-gold)' : 'var(--border-default)'),
        color: got ? 'var(--gold-400)' : 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: f.kind === 'landmark' ? f.icon : f.kind === 'trail' ? 'route' : 'mountain',
      size: 16
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, f.name), /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 9.5,
        marginTop: 2
      }
    }, meta)), /*#__PURE__*/React.createElement("span", {
      title: st.label,
      style: {
        width: 8,
        height: 8,
        flex: '0 0 auto',
        borderRadius: '50%',
        background: st.color,
        boxShadow: got ? 'var(--glow-gold-sm)' : 'none'
      }
    }));
  }

  /* ---------------- inspector: region overview (default) ---------------- */
  function RegionOverview({
    filter,
    shown,
    onSelect
  }) {
    const peaksGot = PEAKS.filter(p => p.status === 'got').length;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        borderBottom: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement(ProgressRing, {
      value: 68,
      size: 84,
      stroke: 9,
      label: "Explored"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 10,
        marginBottom: 5
      }
    }, "National Park \xB7 Cumbria"), /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-h3)',
        fontSize: 18,
        color: 'var(--text-primary)',
        marginBottom: 8
      }
    }, "Lake District"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: "gold",
      dot: true
    }, "68% explored")))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px 18px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        borderBottom: '1px solid var(--border-subtle)'
      }
    }, [['Peaks', `${peaksGot}/${PEAKS.length}`, 'mountain'], ['Trails', `${TRAILS.filter(t => t.status === 'got').length}/${TRAILS.length}`, 'route'], ['Landmarks', `${LANDMARKS.filter(l => l.status === 'got').length}/${LANDMARKS.length}`, 'flag'], ['Gaps', `${ALL.filter(f => f.status === 'none').length}`, 'target']].map(([l, v, ic]) => /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        background: 'var(--surface-sunken)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '11px 13px'
      }
    }, /*#__PURE__*/React.createElement(StatBlock, {
      size: "sm",
      label: l,
      value: v,
      icon: M(ic, 11)
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '14px 12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 10,
        padding: '0 6px 10px',
        display: 'flex',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("span", null, filter === 'all' ? 'All features' : filter, " on map"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-faint)'
      }
    }, shown.length)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }
    }, shown.map(f => /*#__PURE__*/React.createElement(DirectoryRow, {
      key: f.id,
      f: f,
      onSelect: onSelect
    })), shown.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 20,
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 13
      }
    }, "Nothing here in this filter."))));
  }

  /* ---------------- map control button ---------------- */
  function CtrlBtn({
    icon,
    onClick,
    title
  }) {
    return /*#__PURE__*/React.createElement("button", {
      onClick: onClick,
      title: title,
      "aria-label": title,
      style: {
        width: 38,
        height: 38,
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        background: 'var(--surface-overlay)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-secondary)'
      },
      onMouseEnter: e => {
        e.currentTarget.style.color = 'var(--text-primary)';
        e.currentTarget.style.background = 'var(--surface-raised)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.background = 'var(--surface-overlay)';
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 17
    }));
  }

  /* ---------------- main ---------------- */
  function WebMap({
    theme
  }) {
    const [filter, setFilter] = React.useState('all');
    const [sel, setSel] = React.useState(null);
    const [view, setView] = React.useState({
      s: 1,
      x: 0,
      y: 0
    });
    const canvasRef = React.useRef(null);
    const drag = React.useRef(null);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    const mapSrc = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light' ? '../../assets/map-terrain-light.svg' : '../../assets/map-terrain.svg';
    const cats = [['all', 'All', ALL.length], ['peaks', 'Peaks', PEAKS.length], ['trails', 'Trails', TRAILS.length], ['landmarks', 'Landmarks', LANDMARKS.length], ['gaps', 'Gaps', ALL.filter(f => f.status === 'none').length]];
    const inFilter = f => {
      if (filter === 'all') return true;
      if (filter === 'gaps') return f.status === 'none';
      if (filter === 'peaks') return f.kind === 'peak';
      if (filter === 'trails') return f.kind === 'trail';
      if (filter === 'landmarks') return f.kind === 'landmark';
      return true;
    };
    const shown = ALL.filter(inFilter);
    const pins = shown.filter(f => f.kind !== 'trail');
    const trailsShown = TRAILS.filter(inFilter);

    /* pan + zoom */
    const clamp = (v, m) => Math.max(-m, Math.min(m, v));
    const applyView = next => {
      const el = canvasRef.current;
      const w = el ? el.clientWidth : 800,
        h = el ? el.clientHeight : 600;
      const mx = (next.s - 1) * w / 2,
        my = (next.s - 1) * h / 2;
      setView({
        s: next.s,
        x: clamp(next.x, mx),
        y: clamp(next.y, my)
      });
    };
    const zoom = d => applyView({
      ...view,
      s: Math.max(1, Math.min(2.6, +(view.s + d).toFixed(2)))
    });
    const reset = () => setView({
      s: 1,
      x: 0,
      y: 0
    });
    const onDown = e => {
      if (e.target.closest('[data-marker]')) return;
      drag.current = {
        px: e.clientX,
        py: e.clientY,
        ox: view.x,
        oy: view.y,
        moved: false
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onMove = e => {
      if (!drag.current) return;
      const dx = e.clientX - drag.current.px,
        dy = e.clientY - drag.current.py;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
      applyView({
        s: view.s,
        x: drag.current.ox + dx,
        y: drag.current.oy + dy
      });
    };
    const onUp = e => {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
      drag.current = null;
    };
    const onWheel = e => {
      zoom(e.deltaY < 0 ? 0.18 : -0.18);
    };
    const tabBtn = ([id, label, n]) => {
      const on = filter === id;
      return /*#__PURE__*/React.createElement("button", {
        key: id,
        onClick: () => setFilter(id),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '0 14px',
          height: 34,
          flex: '0 0 auto',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          border: 'none',
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 600,
          background: on ? 'var(--accent)' : 'transparent',
          color: on ? 'var(--text-on-gold)' : 'var(--text-secondary)',
          boxShadow: on ? 'var(--glow-gold-sm)' : 'none',
          transition: 'var(--t-colors)'
        }
      }, label, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          fontWeight: 700,
          padding: '1px 6px',
          borderRadius: 'var(--radius-pill)',
          background: on ? 'rgba(0,0,0,.16)' : 'var(--surface-sunken)',
          color: on ? 'var(--text-on-gold)' : 'var(--text-muted)'
        }
      }, n));
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        height: '100%',
        minHeight: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      ref: canvasRef,
      onPointerDown: onDown,
      onPointerMove: onMove,
      onPointerUp: onUp,
      onPointerLeave: onUp,
      onWheel: onWheel,
      style: {
        position: 'relative',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        background: 'var(--surface-sunken)',
        cursor: drag.current ? 'grabbing' : 'grab',
        touchAction: 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        transformOrigin: 'center center',
        transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`,
        transition: drag.current ? 'none' : 'transform .22s var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: mapSrc,
      alt: "Lake District terrain",
      draggable: "false",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }), /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }
    }, trailsShown.map(t => /*#__PURE__*/React.createElement("polyline", {
      key: t.id,
      points: t.pts,
      fill: "none",
      stroke: trailStroke(t.status),
      strokeWidth: sel && sel.id === t.id ? 1.4 : 0.85,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeDasharray: t.status === 'none' ? '2 2' : undefined,
      vectorEffect: "non-scaling-stroke",
      style: t.status === 'got' ? {
        filter: 'drop-shadow(0 0 3px rgba(244,183,64,.55))'
      } : undefined
    }))), trailsShown.map(t => {
      const p = t.pts.split(' ').map(s => s.split(',').map(Number));
      const mid = p[Math.floor(p.length / 2)];
      const active = sel && sel.id === t.id;
      return /*#__PURE__*/React.createElement("button", {
        key: t.id,
        "data-marker": true,
        onClick: e => {
          e.stopPropagation();
          setSel(t);
        },
        title: t.name,
        style: {
          position: 'absolute',
          left: `${mid[0]}%`,
          top: `${mid[1]}%`,
          transform: `translate(-50%,-50%) scale(${1 / view.s})`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px 4px 7px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--surface-overlay)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid ' + (active ? 'var(--border-gold)' : 'var(--border-default)'),
          color: 'var(--text-secondary)',
          font: 'var(--type-body-sm)',
          fontSize: 11,
          fontWeight: 600,
          boxShadow: active ? '0 0 0 3px var(--accent-soft)' : 'var(--shadow-sm)',
          zIndex: active ? 20 : 3,
          whiteSpace: 'nowrap'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "route",
        size: 12,
        color: trailStroke(t.status)
      }), t.name);
    }), pins.map(f => /*#__PURE__*/React.createElement(PinMarker, {
      key: f.id,
      f: f,
      active: sel && sel.id === f.id,
      scale: view.s,
      onClick: setSel
    }))), /*#__PURE__*/React.createElement("div", {
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        boxShadow: 'inset 0 0 160px 30px var(--ink-950)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        pointerEvents: 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--surface-overlay)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-md)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "mountain-snow",
      size: 16,
      color: "var(--gold-400)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 700,
        color: 'var(--text-primary)'
      }
    }, "Lake District"), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 1,
        height: 16,
        background: 'var(--border-default)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11.5,
        color: 'var(--gold-400)'
      }
    }, "68% explored")), /*#__PURE__*/React.createElement("div", {
      style: {
        pointerEvents: 'auto',
        display: 'flex',
        gap: 6,
        padding: 5,
        borderRadius: 'var(--radius-pill)',
        background: 'var(--surface-overlay)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-md)',
        overflowX: 'auto',
        maxWidth: '62%'
      }
    }, cats.map(tabBtn))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 16,
        bottom: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
        padding: '11px 13px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-overlay)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-md)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 9,
        marginBottom: 1
      }
    }, "Legend"), [['var(--gold-400)', 'Collected'], ['var(--sky-400)', 'Planned'], ['rgba(125,141,156,0.7)', 'Not visited']].map(([c, l]) => /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 11,
        height: 11,
        borderRadius: '50%',
        background: c,
        boxShadow: c.includes('gold') ? 'var(--glow-gold-sm)' : 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)'
      }
    }, l)))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-md)'
      }
    }, /*#__PURE__*/React.createElement(CtrlBtn, {
      icon: "plus",
      title: "Zoom in",
      onClick: () => zoom(0.3)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'var(--border-default)'
      }
    }), /*#__PURE__*/React.createElement(CtrlBtn, {
      icon: "minus",
      title: "Zoom out",
      onClick: () => zoom(-0.3)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'var(--border-default)'
      }
    }), /*#__PURE__*/React.createElement(CtrlBtn, {
      icon: "locate-fixed",
      title: "Reset view",
      onClick: reset
    }))), /*#__PURE__*/React.createElement("aside", {
      style: {
        width: 360,
        flex: '0 0 360px',
        borderLeft: '1px solid var(--border-subtle)',
        background: 'var(--surface-card)',
        overflow: 'hidden'
      }
    }, sel ? /*#__PURE__*/React.createElement(FeatureDetail, {
      f: sel,
      onBack: () => setSel(null),
      onSelect: setSel
    }) : /*#__PURE__*/React.createElement(RegionOverview, {
      filter: filter,
      shown: shown,
      onSelect: setSel
    })));
  }
  window.WebMap = WebMap;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Map.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Region.jsx
try { (() => {
/* Atlas web · Region progress page (Lake District). Exports window.WebRegion */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const {
    Icon,
    ProgressRing,
    ProgressBar,
    StatBlock,
    CollectibleItem,
    Badge,
    Button,
    CollectionCard
  } = DS;
  const {
    AtlasPanel
  } = window;
  function WebRegion({
    onNav
  }) {
    const {
      peaks
    } = window.AtlasData;
    const missing = peaks.filter(p => !p.got);
    const M = (n, s) => /*#__PURE__*/React.createElement(Icon, {
      name: n,
      size: s
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "atlas-topo",
      style: {
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-default)',
        padding: 28,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: window.AtlasData.regionHero,
      alt: "",
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }), /*#__PURE__*/React.createElement("div", {
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(100deg, var(--bg-app) 18%, color-mix(in srgb, var(--bg-app) 60%, transparent) 44%, color-mix(in srgb, var(--bg-app) 12%, transparent) 100%), linear-gradient(0deg, color-mix(in srgb, var(--bg-app) 45%, transparent), transparent 60%)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 28
      }
    }, /*#__PURE__*/React.createElement(ProgressRing, {
      value: 68,
      size: 132,
      stroke: 12,
      label: "Explored"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 8
      }
    }, "National Park \xB7 Cumbria, England"), /*#__PURE__*/React.createElement("h1", {
      style: {
        font: 'var(--type-display)',
        fontSize: 44,
        color: 'var(--text-primary)',
        margin: '0 0 12px',
        letterSpacing: '-.02em'
      }
    }, "Lake District"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: "gold",
      dot: true
    }, "68% explored"), /*#__PURE__*/React.createElement(Badge, {
      variant: "success"
    }, "9 trails done"), /*#__PURE__*/React.createElement(Badge, {
      variant: "neutral"
    }, "54 landmarks"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      leftIcon: M('map', 16),
      onClick: () => onNav('map')
    }, "View on map"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      leftIcon: M('target', 16)
    }, "Set a goal")))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 16
      }
    }, [['Peaks', '121 / 214', 'mountain', 'spruce'], ['Trails', '9 / 13', 'route', 'sky'], ['Landmarks', '54 / 96', 'flag', 'gold'], ['Distance here', '1,284 km', 'footprints', 'gold']].map(([l, v, ic]) => /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 18,
        boxShadow: 'var(--ring-top)'
      }
    }, /*#__PURE__*/React.createElement(StatBlock, {
      label: l,
      value: v,
      icon: M(ic, 12)
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement(AtlasPanel, {
      title: "Progress by collection"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }
    }, /*#__PURE__*/React.createElement(ProgressBar, {
      label: "Wainwrights",
      value: 121,
      max: 214
    }), /*#__PURE__*/React.createElement(ProgressBar, {
      label: "Birketts",
      value: 203,
      max: 541,
      color: "sky"
    }), /*#__PURE__*/React.createElement(ProgressBar, {
      label: "Lakeland waterfalls",
      value: 18,
      max: 42,
      color: "sky"
    }), /*#__PURE__*/React.createElement(ProgressBar, {
      label: "Bothies & shelters",
      value: 4,
      max: 9,
      color: "spruce"
    }), /*#__PURE__*/React.createElement(ProgressBar, {
      label: "Lake circuits",
      value: 6,
      max: 6
    }))), /*#__PURE__*/React.createElement(AtlasPanel, {
      title: "Missing nearby",
      action: /*#__PURE__*/React.createElement(Badge, {
        variant: "gold"
      }, "+ up to 380 pts")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10
      }
    }, missing.slice(0, 4).map(p => /*#__PURE__*/React.createElement(CollectibleItem, {
      key: p.name,
      name: p.name,
      meta: /*#__PURE__*/React.createElement("b", null, p.m, "m"),
      image: p.img,
      collected: p.got,
      icon: M('mountain', 28)
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      block: true,
      onClick: () => onNav('map')
    }, "Show all 93 gaps")))));
  }
  window.WebRegion = WebRegion;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Region.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Shell.jsx
try { (() => {
/* Atlas web · shared chrome (sidebar + topbar) and data re-use.
   Exports to window: AtlasWebShell, AtlasPanel */
(function () {
  const DS = window.AtlasDesignSystem_e1d28e;
  const {
    Icon,
    Avatar,
    Badge
  } = DS;
  const NAV = [{
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'layout-dashboard'
  }, {
    id: 'map',
    label: 'Exploration Map',
    icon: 'map'
  }, {
    id: 'collections',
    label: 'Collections',
    icon: 'layout-grid'
  }, {
    id: 'regions',
    label: 'Regions',
    icon: 'mountain-snow'
  }, {
    id: 'achievements',
    label: 'Achievements',
    icon: 'trophy'
  }];
  const NAV2 = [{
    id: 'stats',
    label: 'Statistics',
    icon: 'bar-chart-3'
  }, {
    id: 'sources',
    label: 'Connected sources',
    icon: 'plug'
  }];
  function NavItem({
    item,
    active,
    onClick
  }) {
    const on = active === item.id;
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => onClick(item.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        width: '100%',
        textAlign: 'left',
        padding: '9px 12px',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        border: '1px solid ' + (on ? 'var(--border-gold)' : 'transparent'),
        background: on ? 'var(--accent-soft)' : 'transparent',
        color: on ? 'var(--text-accent)' : 'var(--text-secondary)',
        font: 'var(--type-body-sm)',
        fontWeight: on ? 600 : 500,
        fontSize: 14,
        transition: 'var(--t-colors)'
      },
      onMouseEnter: e => {
        if (!on) e.currentTarget.style.background = 'var(--surface-raised)';
      },
      onMouseLeave: e => {
        if (!on) e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: item.icon,
      size: 18,
      strokeWidth: on ? 2.3 : 2
    }), item.label);
  }
  function AtlasWebShell({
    active,
    onNav,
    children
  }) {
    const {
      user
    } = window.AtlasData;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        height: '100%',
        background: 'var(--bg-app)'
      }
    }, /*#__PURE__*/React.createElement("aside", {
      style: {
        width: 250,
        flex: '0 0 250px',
        borderRight: '1px solid var(--border-subtle)',
        background: 'var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 8px 22px'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/atlas-mark.svg",
      height: "28",
      alt: ""
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 20,
        letterSpacing: '.06em',
        color: 'var(--text-primary)'
      }
    }, "ATLAS")), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }
    }, NAV.map(n => /*#__PURE__*/React.createElement(NavItem, {
      key: n.id,
      item: n,
      active: active,
      onClick: onNav
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'var(--border-subtle)',
        margin: '16px 8px'
      }
    }), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }
    }, NAV2.map(n => /*#__PURE__*/React.createElement(NavItem, {
      key: n.id,
      item: n,
      active: active,
      onClick: onNav
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 'auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      src: user.avatar,
      name: user.name,
      level: user.level,
      size: 36,
      ring: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, user.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--gold-400)'
      }
    }, user.score.toLocaleString(), " pts"))))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    }, children));
  }
  function AtlasPanel({
    title,
    action,
    children,
    style = {},
    bodyStyle = {}
  }) {
    return /*#__PURE__*/React.createElement("section", {
      style: {
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm), var(--ring-top)',
        ...style
      }
    }, (title || action) && /*#__PURE__*/React.createElement("header", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 18px',
        borderBottom: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        font: 'var(--type-h3)',
        fontSize: 16,
        color: 'var(--text-primary)',
        margin: 0
      }
    }, title), action), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 18,
        ...bodyStyle
      }
    }, children));
  }
  Object.assign(window, {
    AtlasWebShell,
    AtlasPanel
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/data.js
try { (() => {
/* Atlas mobile · shared mock data + tiny helpers.
   Exposed on window.AtlasData for all mobile screens. */
(function () {
  const M = (name, size = 24) => ({
    __icon: name,
    size
  });

  // Stock placeholders (Unsplash) — swap for owned imagery later.
  const PHOTO = (id, w = 320) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
  const user = {
    name: 'Maya Okonkwo',
    handle: '@mayaventures',
    level: 24,
    score: 14820,
    levelProgress: 62,
    toNext: '680 pts to Level 25',
    avatar: PHOTO('1494790108377-be9c29b29330', 160),
    home: 'Ambleside, Cumbria',
    summits: 312,
    distanceKm: 4109,
    daysOut: 186,
    countries: 4
  };
  const collections = [{
    id: 'wainwrights',
    title: 'Wainwrights',
    type: 'Peaks',
    value: 121,
    max: 214,
    icon: 'mountain',
    img: PHOTO('1486870591958-9b9d0d1dda99', 160)
  }, {
    id: 'munros',
    title: 'Munros',
    type: 'Peaks',
    value: 43,
    max: 282,
    icon: 'mountain',
    img: PHOTO('1483728642387-6c3bdd6c93e5', 160)
  }, {
    id: 'county-tops',
    title: 'County Tops',
    type: 'Peaks',
    value: 39,
    max: 91,
    icon: 'triangle',
    img: PHOTO('1454496522488-7a8e488e8606', 160)
  }, {
    id: 'swcp',
    title: 'South West Coast Path',
    type: 'National Trail',
    value: 1014,
    max: 1014,
    icon: 'route',
    img: PHOTO('1505159940484-eb2b9f2588e2', 160)
  }, {
    id: 'pennine',
    title: 'Pennine Way',
    type: 'National Trail',
    value: 268,
    max: 431,
    icon: 'route',
    img: PHOTO('1551632811-561732d1e306', 160)
  }, {
    id: 'trigs',
    title: 'Trig Pillars',
    type: 'Landmarks',
    value: 88,
    max: 300,
    icon: 'triangle',
    img: PHOTO('1464822759023-fed622ff2c3b', 160)
  }, {
    id: 'bothies',
    title: 'Bothies',
    type: 'Landmarks',
    value: 12,
    max: 81,
    icon: 'tent',
    img: PHOTO('1478131143081-80f7f84ca84d', 160)
  }, {
    id: 'waterfalls',
    title: 'Waterfalls',
    type: 'Landmarks',
    value: 21,
    max: 64,
    icon: 'droplets',
    img: PHOTO('1432405972618-c60b0225b8f9', 160)
  }];
  const regions = [{
    id: 'lakes',
    name: 'Lake District',
    pct: 68,
    peaks: '121/214',
    trails: 9,
    landmarks: 54
  }, {
    id: 'snowdonia',
    name: 'Snowdonia',
    pct: 42,
    peaks: '38/90',
    trails: 4,
    landmarks: 22
  }, {
    id: 'peak',
    name: 'Peak District',
    pct: 55,
    peaks: '24/55',
    trails: 6,
    landmarks: 31
  }, {
    id: 'cairngorms',
    name: 'Cairngorms',
    pct: 23,
    peaks: '12/55',
    trails: 2,
    landmarks: 9
  }];
  const achievements = [{
    id: 'skyliner',
    title: 'Skyliner',
    desc: 'Climb three 800m summits in one day',
    tier: 'gold',
    points: 500,
    unlocked: true,
    icon: 'mountain',
    cat: 'Summits',
    rarity: 6.2,
    date: 'Apr 2026'
  }, {
    id: 'first-k',
    title: 'Into Thin Air',
    desc: 'Reach your first 1000m summit',
    tier: 'silver',
    points: 250,
    unlocked: true,
    icon: 'flag',
    cat: 'Summits',
    rarity: 41.0,
    date: 'Jun 2023'
  }, {
    id: 'trail-done',
    title: 'End to End',
    desc: 'Complete a National Trail',
    tier: 'gold',
    points: 500,
    unlocked: true,
    icon: 'route',
    cat: 'Trails',
    rarity: 8.7,
    date: 'Sep 2025'
  }, {
    id: 'fifty-k',
    title: 'The Long Way',
    desc: 'Hike 50km in a single day',
    tier: 'platinum',
    points: 750,
    unlocked: true,
    icon: 'footprints',
    cat: 'Endurance',
    rarity: 1.4,
    date: 'Aug 2025'
  }, {
    id: 'early-riser',
    title: 'Dawn Patrol',
    desc: 'Log five sunrise summits',
    tier: 'silver',
    points: 250,
    unlocked: true,
    icon: 'sunrise',
    cat: 'Summits',
    rarity: 19.3,
    date: 'Jul 2024'
  }, {
    id: 'cartographer',
    title: 'Cartographer',
    desc: 'Visit 25 trig pillars',
    tier: 'bronze',
    points: 100,
    unlocked: true,
    icon: 'triangle',
    cat: 'Landmarks',
    rarity: 33.5,
    date: 'Feb 2024'
  }, {
    id: 'centurion',
    title: 'Centurion',
    desc: 'Visit 100 unique summits',
    tier: 'silver',
    points: 250,
    unlocked: false,
    icon: 'mountain',
    cat: 'Summits',
    progress: {
      value: 78,
      max: 100
    },
    rarity: 14.8
  }, {
    id: 'region-90',
    title: 'Local Legend',
    desc: 'Explore 90% of a single region',
    tier: 'gold',
    points: 500,
    unlocked: false,
    icon: 'compass',
    cat: 'Coverage',
    progress: {
      value: 68,
      max: 90
    },
    rarity: 5.1
  }, {
    id: 'all-weather',
    title: 'All Weather',
    desc: 'Summit in snow, rain and sun',
    tier: 'bronze',
    points: 100,
    unlocked: false,
    icon: 'cloud-rain',
    cat: 'Summits',
    progress: {
      value: 2,
      max: 3
    },
    rarity: 22.0
  }, {
    id: 'collector',
    title: 'Completionist',
    desc: 'Finish an entire collection',
    tier: 'platinum',
    points: 750,
    unlocked: false,
    icon: 'award',
    cat: 'Coverage',
    progress: {
      value: 1,
      max: 3
    },
    rarity: 2.3
  }, {
    id: 'nightfall',
    title: 'Nightfall',
    desc: 'Complete a walk after dark',
    tier: 'bronze',
    points: 100,
    unlocked: false,
    icon: 'moon',
    cat: 'Endurance',
    progress: null,
    rarity: 28.9
  }, {
    id: 'globetrotter',
    title: 'Globetrotter',
    desc: 'Summit peaks in five countries',
    tier: 'gold',
    points: 500,
    unlocked: false,
    icon: 'globe',
    cat: 'Coverage',
    progress: {
      value: 4,
      max: 5
    },
    rarity: 3.6
  }];

  // peaks within the Wainwrights collection (Pokédex grid)
  const peaks = [{
    name: 'Scafell Pike',
    m: 978,
    got: true,
    visits: 3,
    img: PHOTO('1464822759023-fed622ff2c3b', 240)
  }, {
    name: 'Helvellyn',
    m: 950,
    got: true,
    visits: 5,
    img: PHOTO('1454496522488-7a8e488e8606', 240)
  }, {
    name: 'Skiddaw',
    m: 931,
    got: true,
    visits: 2,
    img: PHOTO('1483728642387-6c3bdd6c93e5', 240)
  }, {
    name: 'Great Gable',
    m: 899,
    got: true,
    visits: 1,
    img: PHOTO('1486870591958-9b9d0d1dda99', 240)
  }, {
    name: 'Blencathra',
    m: 868,
    got: false,
    img: PHOTO('1469474968028-56623f02e42e', 240)
  }, {
    name: 'Bowfell',
    m: 902,
    got: true,
    visits: 1,
    img: PHOTO('1458668383970-8ddd3927deed', 240)
  }, {
    name: 'Pillar',
    m: 892,
    got: false,
    img: PHOTO('1426604966848-d7adac402bff', 240)
  }, {
    name: 'Fairfield',
    m: 873,
    got: true,
    visits: 2,
    img: PHOTO('1472791108553-c9405341e398', 240)
  }, {
    name: 'Crinkle Crags',
    m: 859,
    got: false,
    img: PHOTO('1519681393784-d120267933ba', 240)
  }, {
    name: 'Old Man of Coniston',
    m: 803,
    got: true,
    visits: 4,
    img: PHOTO('1464822759023-fed622ff2c3b', 240)
  }, {
    name: 'Catbells',
    m: 451,
    got: true,
    visits: 6,
    img: PHOTO('1454496522488-7a8e488e8606', 240)
  }, {
    name: 'Haystacks',
    m: 597,
    got: false,
    img: PHOTO('1483728642387-6c3bdd6c93e5', 240)
  }];
  const suggestions = [{
    title: 'Blencathra',
    detail: '2 peaks from your next Wainwright badge',
    meta: '868m · 11km from home',
    icon: 'mountain',
    tag: '+120 pts'
  }, {
    title: 'Finish the Pennine Way',
    detail: '12 sections remaining',
    meta: '163km left',
    icon: 'route',
    tag: '+500 pts'
  }, {
    title: 'Aira Force',
    detail: 'Waterfall · never visited',
    meta: 'Lake District · 9km',
    icon: 'droplets',
    tag: '+40 pts'
  }];
  const feed = [{
    title: 'Skyliner',
    sub: 'Gold achievement unlocked',
    tier: 'gold',
    when: '2d ago',
    points: 500
  }, {
    title: 'Fairfield',
    sub: 'New Wainwright collected',
    tier: null,
    when: '2d ago',
    points: 60
  }, {
    title: 'Level 24 reached',
    sub: 'Outdoor Score 14,300',
    tier: null,
    when: '1w ago',
    points: 0
  }];

  // Lake District region hero photography
  const regionHero = PHOTO('1506905925346-21bda4d32df4', 1280);
  window.AtlasData = {
    user,
    collections,
    regions,
    achievements,
    peaks,
    suggestions,
    feed,
    regionHero
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/data.js", error: String((e && e.message) || e) }); }

__ds_ns.AchievementBadge = __ds_scope.AchievementBadge;

__ds_ns.CollectibleItem = __ds_scope.CollectibleItem;

__ds_ns.CollectionCard = __ds_scope.CollectionCard;

__ds_ns.ScoreMeter = __ds_scope.ScoreMeter;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.HeatGrid = __ds_scope.HeatGrid;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.ProgressRing = __ds_scope.ProgressRing;

__ds_ns.StatBlock = __ds_scope.StatBlock;

})();
