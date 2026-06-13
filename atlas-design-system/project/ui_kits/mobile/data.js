/* Atlas mobile · shared mock data + tiny helpers.
   Exposed on window.AtlasData for all mobile screens. */
(function () {
  const M = (name, size = 24) => ({ __icon: name, size });

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
    countries: 4,
  };

  const collections = [
    { id: 'wainwrights', title: 'Wainwrights', type: 'Peaks', value: 121, max: 214, icon: 'mountain', img: PHOTO('1486870591958-9b9d0d1dda99', 160) },
    { id: 'munros', title: 'Munros', type: 'Peaks', value: 43, max: 282, icon: 'mountain', img: PHOTO('1483728642387-6c3bdd6c93e5', 160) },
    { id: 'county-tops', title: 'County Tops', type: 'Peaks', value: 39, max: 91, icon: 'triangle', img: PHOTO('1454496522488-7a8e488e8606', 160) },
    { id: 'swcp', title: 'South West Coast Path', type: 'National Trail', value: 1014, max: 1014, icon: 'route', img: PHOTO('1505159940484-eb2b9f2588e2', 160) },
    { id: 'pennine', title: 'Pennine Way', type: 'National Trail', value: 268, max: 431, icon: 'route', img: PHOTO('1551632811-561732d1e306', 160) },
    { id: 'trigs', title: 'Trig Pillars', type: 'Landmarks', value: 88, max: 300, icon: 'triangle', img: PHOTO('1464822759023-fed622ff2c3b', 160) },
    { id: 'bothies', title: 'Bothies', type: 'Landmarks', value: 12, max: 81, icon: 'tent', img: PHOTO('1478131143081-80f7f84ca84d', 160) },
    { id: 'waterfalls', title: 'Waterfalls', type: 'Landmarks', value: 21, max: 64, icon: 'droplets', img: PHOTO('1432405972618-c60b0225b8f9', 160) },
  ];

  const regions = [
    { id: 'lakes', name: 'Lake District', pct: 68, peaks: '121/214', trails: 9, landmarks: 54 },
    { id: 'snowdonia', name: 'Snowdonia', pct: 42, peaks: '38/90', trails: 4, landmarks: 22 },
    { id: 'peak', name: 'Peak District', pct: 55, peaks: '24/55', trails: 6, landmarks: 31 },
    { id: 'cairngorms', name: 'Cairngorms', pct: 23, peaks: '12/55', trails: 2, landmarks: 9 },
  ];

  const achievements = [
    { id: 'skyliner', title: 'Skyliner', desc: 'Climb three 800m summits in one day', tier: 'gold', points: 500, unlocked: true, icon: 'mountain' },
    { id: 'first-k', title: 'Into Thin Air', desc: 'Reach your first 1000m summit', tier: 'silver', points: 250, unlocked: true, icon: 'flag' },
    { id: 'trail-done', title: 'End to End', desc: 'Complete a National Trail', tier: 'gold', points: 500, unlocked: true, icon: 'route' },
    { id: 'fifty-k', title: 'The Long Way', desc: 'Hike 50km in a single day', tier: 'platinum', points: 750, unlocked: true, icon: 'footprints' },
    { id: 'centurion', title: 'Centurion', desc: 'Visit 100 unique summits', tier: 'silver', points: 250, unlocked: false, icon: 'lock', progress: { value: 78, max: 100 } },
    { id: 'region-90', title: 'Local Legend', desc: 'Explore 90% of a single region', tier: 'gold', points: 500, unlocked: false, icon: 'lock', progress: { value: 68, max: 90 } },
    { id: 'dawn', title: 'First Light', desc: 'Summit before sunrise', tier: 'bronze', points: 100, unlocked: false, icon: 'lock', progress: null },
    { id: 'all-weather', title: 'All Weather', desc: 'Summit in snow, rain and sun', tier: 'bronze', points: 100, unlocked: false, icon: 'lock', progress: { value: 2, max: 3 } },
  ];

  // peaks within the Wainwrights collection (Pokédex grid)
  const peaks = [
    { name: 'Scafell Pike', m: 978, got: true, visits: 3, img: PHOTO('1464822759023-fed622ff2c3b', 240) },
    { name: 'Helvellyn', m: 950, got: true, visits: 5, img: PHOTO('1454496522488-7a8e488e8606', 240) },
    { name: 'Skiddaw', m: 931, got: true, visits: 2, img: PHOTO('1483728642387-6c3bdd6c93e5', 240) },
    { name: 'Great Gable', m: 899, got: true, visits: 1, img: PHOTO('1486870591958-9b9d0d1dda99', 240) },
    { name: 'Blencathra', m: 868, got: false, img: PHOTO('1469474968028-56623f02e42e', 240) },
    { name: 'Bowfell', m: 902, got: true, visits: 1, img: PHOTO('1458668383970-8ddd3927deed', 240) },
    { name: 'Pillar', m: 892, got: false, img: PHOTO('1426604966848-d7adac402bff', 240) },
    { name: 'Fairfield', m: 873, got: true, visits: 2, img: PHOTO('1472791108553-c9405341e398', 240) },
    { name: 'Crinkle Crags', m: 859, got: false, img: PHOTO('1519681393784-d120267933ba', 240) },
    { name: 'Old Man of Coniston', m: 803, got: true, visits: 4, img: PHOTO('1464822759023-fed622ff2c3b', 240) },
    { name: 'Catbells', m: 451, got: true, visits: 6, img: PHOTO('1454496522488-7a8e488e8606', 240) },
    { name: 'Haystacks', m: 597, got: false, img: PHOTO('1483728642387-6c3bdd6c93e5', 240) },
  ];

  const suggestions = [
    { title: 'Blencathra', detail: '2 peaks from your next Wainwright badge', meta: '868m · 11km from home', icon: 'mountain', tag: '+120 pts' },
    { title: 'Finish the Pennine Way', detail: '12 sections remaining', meta: '163km left', icon: 'route', tag: '+500 pts' },
    { title: 'Aira Force', detail: 'Waterfall · never visited', meta: 'Lake District · 9km', icon: 'droplets', tag: '+40 pts' },
  ];

  const feed = [
    { title: 'Skyliner', sub: 'Gold achievement unlocked', tier: 'gold', when: '2d ago', points: 500 },
    { title: 'Fairfield', sub: 'New Wainwright collected', tier: null, when: '2d ago', points: 60 },
    { title: 'Level 24 reached', sub: 'Outdoor Score 14,300', tier: null, when: '1w ago', points: 0 },
  ];

  // Lake District region hero photography
  const regionHero = PHOTO('1506905925346-21bda4d32df4', 1280);

  window.AtlasData = { user, collections, regions, achievements, peaks, suggestions, feed, regionHero };
})();
