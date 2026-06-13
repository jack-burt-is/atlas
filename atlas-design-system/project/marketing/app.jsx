/* Atlas LP — app shell: theme, reveal observer, icon refresh, composition. */
(function () {
function App() {
  const [theme, setTheme] = React.useState(() => {
    try { return localStorage.getItem('atlas-lp-theme') || 'dark'; } catch (e) { return 'dark'; }
  });

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('atlas-lp-theme', theme); } catch (e) {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  // refresh lucide icons after each render
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  // global scroll-reveal observer
  React.useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll('[data-reveal]');
    if (reduced) { els.forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });

  return (
    <React.Fragment>
      <window.LPNav theme={theme} toggleTheme={toggleTheme} />
      <window.LPHero theme={theme} />
      <window.LPSourceBand />
      <window.LPStatBand />
      <window.LPFeatures />
      <window.LPCoverage />
      <window.LPHow />
      <window.LPAchievements />
      <window.LPTestimonials />
      <window.LPPricing />
      <window.LPFAQ />
      <window.LPFinalCTA />
      <window.LPFooter theme={theme} />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
