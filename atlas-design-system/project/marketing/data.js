/* Atlas landing page — content, numbers, and ridgeline geometry.
   Plain JS, attached to window for the babel component scripts. */
(function () {
  // ---- seeded RNG so ridge shapes are stable across renders ----
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Sample a mountain ridgeline across [0..W]. Sum of two sines + seeded jitter.
  function ridgePoints(W, baseY, amp, rough, seed, step) {
    const rnd = mulberry32(seed);
    step = step || 26;
    const n = Math.ceil(W / step);
    const f1 = 0.6 + rnd() * 0.5, f2 = 1.7 + rnd() * 1.1, ph = rnd() * 6.28;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * W;
      const t = (i / n) * Math.PI * 2;
      const y = baseY
        - Math.sin(t * f1 + ph) * amp
        - Math.sin(t * f2 + ph * 1.7) * amp * 0.34
        - (rnd() - 0.5) * amp * rough;
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
    mulberry32, ridgePath, ridgePoints, pathFromPoints,

    sources: [
      { name: "Strava", color: "var(--coral-400)" },
      { name: "Garmin", color: "var(--sky-400)" },
      { name: "Komoot", color: "var(--spruce-400)" },
      { name: "AllTrails", color: "var(--spruce-300)" },
      { name: "Apple Health", color: "var(--ink-200)" },
      { name: "GPX & FIT files", color: "var(--gold-400)" },
    ],

    stats: [
      { label: "PEAKS LOGGED",       to: 1248000, fmt: "compact", color: "var(--gold-400)" },
      { label: "TRAILS COLLECTED",   to: 4920000, fmt: "compact", color: "var(--sky-400)" },
      { label: "EXPLORERS",          to: 92400,   fmt: "compact", color: "var(--spruce-400)" },
      { label: "COLLECTIONS DONE",   to: 318000,  fmt: "compact", color: "var(--gold-400)" },
    ],

    collections: [
      { title: "Wainwrights", type: "FELLS · LAKE DISTRICT", value: 156, max: 214, icon: "mountain" },
      { title: "Munros", type: "SUMMITS · SCOTLAND", value: 43, max: 282, icon: "triangle" },
      { title: "National Trails", type: "LONG-DISTANCE PATHS", value: 9, max: 16, icon: "route" },
      { title: "Coastal Bothies", type: "SHELTERS", value: 12, max: 12, icon: "tent" },
    ],

    achievements: [
      { title: "Skyliner", description: "Climb three 800m summits in one day.", tier: "gold", points: 500, unlocked: true, icon: "mountain" },
      { title: "First Light", description: "Summit before sunrise.", tier: "silver", points: 150, unlocked: true, icon: "sunrise" },
      { title: "Completionist", description: "Finish an entire named collection.", tier: "platinum", points: 1000, unlocked: true, icon: "trophy" },
      { title: "Trailblazer", description: "Log 1,000 km of distinct trail.", tier: "gold", points: 400, unlocked: true, icon: "footprints" },
      { title: "County Tops", description: "Reach the highest point of 10 counties.", tier: "silver", points: 250, unlocked: false, progress: { value: 7, max: 10 }, icon: "flag" },
      { title: "Round the Lakes", description: "Visit all 16 bodies of water in a region.", tier: "bronze", points: 120, unlocked: false, progress: { value: 11, max: 16 }, icon: "droplets" },
    ],

    steps: [
      { icon: "plug", n: "STEP 01", title: "Connect a source", body: "Link Strava, Garmin, Komoot, AllTrails or drop a folder of GPX files. Read-only — we never touch your accounts or post anything." },
      { icon: "sparkles", n: "STEP 02", title: "We import your history", body: "Atlas reads every activity you've ever recorded and matches it against peaks, trails, landmarks and regions worldwide. Years of adventures, mapped in minutes." },
      { icon: "trophy", n: "STEP 03", title: "Collect, complete, climb", body: "Watch collections fill, achievements unlock and your Outdoor Score rise. See exactly what's left — and what's closest to done." },
    ],

    quotes: [
      { body: "I'd done 60 Wainwrights and never knew. Atlas found them all in my Strava history and suddenly I had a checklist I couldn't stop chasing.", name: "Maya Holloway", meta: "156 / 214 WAINWRIGHTS", initials: "MH", color: "var(--gold-500)" },
      { body: "It's the trophy case I didn't know I wanted. Ten years of hiking finally feels like one connected record instead of scattered files.", name: "Tomas Reier", meta: "OUTDOOR SCORE 14,820", initials: "TR", color: "var(--sky-400)" },
      { body: "The coverage map is dangerous. Seeing a region at 68% explored is the most motivated I've ever been to drive three hours for one hill.", name: "Priya Anand", meta: "GOLD · COMPLETIONIST", initials: "PA", color: "var(--spruce-400)" },
    ],

    faqs: [
      { q: "Does Atlas plan routes or navigate?", a: "No — and that's deliberate. Atlas is a lifetime record and a trophy case, not a route planner or a GPS. It sits on top of the tools you already use and turns your history into collections, coverage and achievements." },
      { q: "Which sources can I connect?", a: "Strava, Garmin Connect, Komoot, AllTrails and Apple Health, plus direct GPX and FIT file imports. Connections are read-only: Atlas never posts, edits or deletes anything in your accounts." },
      { q: "Where do collections come from?", a: "Atlas ships with thousands of curated, real-world lists — Wainwrights, Munros, county tops, national trails, waterfalls, bothies and more — and adds new regions every month. You can also build private custom collections." },
      { q: "What's the Outdoor Score?", a: "One number for a lifetime outdoors. Every peak, trail, landmark and achievement awards points; tiers from Bronze to Platinum are worth more. It's the Gamerscore of the outdoors — a single figure that only ever goes up." },
      { q: "Is my data private?", a: "Yes. Your record is private by default. You choose what — if anything — to share, and you can export or delete everything at any time. We don't sell data, ever." },
      { q: "Can I cancel anytime?", a: "Anytime, in one click. If you cancel Pro you keep your full record and drop back to the free tier — nothing you've collected is ever taken away." },
    ],

    proFeatures: [
      "Unlimited collections & custom lists",
      "Full worldwide coverage maps & heatmaps",
      "Every achievement tier & the Outdoor Score",
      "Closest-to-completion & missing-nearby nudges",
      "All sources, unlimited history import",
      "Yearly Wrapped & shareable trophy cards",
    ],
    freeFeatures: [
      "3 active collections",
      "Lifetime history import",
      "Regional coverage (1 region)",
      { t: "Achievements & Outdoor Score", off: true },
      { t: "Worldwide maps & heatmaps", off: true },
    ],
  };
})();
