/* Portfolio interactions: typewriter, navbar shadow, scroll-spy,
   reveal-on-scroll, animated counters, GitHub stats. */
(function () {

  // ---------- Typewriter ----------
  const typeEl = document.querySelector('.type-out');
  if (typeEl) {
    const phrases = [
      'AI Engineer · Quant Researcher',
      'Building at the ML × finance edge',
      'IIT Gandhinagar · Class of 2027',
      'SEBI Certified NISM Research Analyst'
    ];
    let pi = 0, ci = 0, deleting = false;
    function tick() {
      const p = phrases[pi];
      typeEl.textContent = p.slice(0, ci);
      if (!deleting) {
        if (ci < p.length) { ci++; setTimeout(tick, 55); }
        else { deleting = true; setTimeout(tick, 1800); }
      } else {
        if (ci > 0) { ci--; setTimeout(tick, 28); }
        else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 280); }
      }
    }
    tick();
  }

  // ---------- Navbar scroll state + mobile toggle ----------
  const nav = document.querySelector('.ai-nav');
  const navList = document.querySelector('.ai-nav ul');
  const navBtn = document.querySelector('.ai-nav .menu-btn');
  if (navBtn && navList) {
    navBtn.addEventListener('click', () => navList.classList.toggle('open'));
    navList.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navList.classList.remove('open'))
    );
  }
  window.addEventListener('scroll', () => {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });

  // ---------- Scroll-spy ----------
  const links = document.querySelectorAll('.ai-nav ul a[href^="#"]');
  const sections = Array.from(links).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function spy() {
    const y = window.scrollY + 120;
    let active = sections[0];
    for (const s of sections) {
      if (s.offsetTop <= y) active = s;
    }
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + active.id));
  }
  if (sections.length) {
    window.addEventListener('scroll', spy);
    spy();
  }

  // ---------- Reveal-on-scroll ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ---------- Animated counters ----------
  function animateCount(el) {
    const target = +el.dataset.count || 0;
    const dur = 1400;
    const start = performance.now();
    function tick(t) {
      const p = Math.min(1, (t - start) / dur);
      const v = Math.floor(p * target);
      el.textContent = v;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        animateCount(en.target);
        countIO.unobserve(en.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

  // ---------- GitHub live stats ----------
  async function loadGitHub() {
    const stars = document.querySelector('[data-gh-stars]');
    const repos = document.querySelector('[data-gh-repos]');
    if (!stars && !repos) return;
    try {
      const r = await fetch('https://api.github.com/users/xsinh19');
      if (!r.ok) return;
      const u = await r.json();
      if (repos) repos.textContent = u.public_repos ?? '';
      // total stars: sum across repos
      const rr = await fetch('https://api.github.com/users/xsinh19/repos?per_page=100');
      if (!rr.ok) return;
      const list = await rr.json();
      const total = list.reduce((a, x) => a + (x.stargazers_count || 0), 0);
      if (stars) stars.textContent = total;
    } catch (e) {
      // silent
    }
  }
  loadGitHub();

  // ---------- Year ----------
  const y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

})();
