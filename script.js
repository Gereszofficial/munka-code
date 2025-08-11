document.addEventListener('DOMContentLoaded', () => {
  const yearSpan         = document.getElementById('year');
  const viewButton       = document.getElementById('viewButton');
  const heroSection      = document.getElementById('hero');
  const dynamicContainer = document.getElementById('dynamicContent');
  const footer           = document.getElementById('footer');

  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // === Navbar behavior ===
  const headerEl = document.querySelector('header.navbar');
  const brandName = headerEl?.dataset?.brand || 'BondiCars';

  // update initial title
  document.title = brandName + ' – Kezdőlap';

  // Segédfüggvény: oldal cím beállítása
  function setPageTitle(suffix) {
    document.title = brandName + (suffix ? ' – ' + suffix : '');
  }

  // Segédfüggvény: dinamikus tartalom betöltése
  async function setDynamicContent(html) {
    if (!window.playTransition || !dynamicContainer) {
      dynamicContainer.innerHTML = html;
      return;
    }
    await window.playTransition(() => { dynamicContainer.innerHTML = html; });
  }

  // Szolgáltatásaink betöltése
  async function loadServices() {
    try {
      const response = await fetch('services.html', { cache: 'no-cache' });
      if (!response.ok) throw new Error();
      const html = await response.text();
      await setDynamicContent(html);
    } catch {
      const template = document.getElementById('servicesTemplate');
      if (template) await setDynamicContent(template.innerHTML);
    } finally {
      dynamicContainer.classList.remove('hidden');
      heroSection.classList.add('hidden');
      footer.classList.remove('hidden');
      initServiceAnimations();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // LANDING fade-up
  async function loadLanding() {
    const targetY = dynamicContainer ? dynamicContainer.offsetTop : 0;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    await delay(500);

    let loaded = false;
    try {
      const resp = await fetch('landing.html', { cache: 'no-cache' });
      if (!resp.ok) throw new Error();
      const html = await resp.text();
      await setDynamicContent(html);

      setPageTitle('Rólunk');
      setActiveNav('[data-nav="rolunk"]');
      loaded = true;
    } catch {
      const tpl = document.getElementById('LandingTemplate');
      if (tpl) {
        await setDynamicContent(tpl.innerHTML);
        loaded = true;
      }
    }
    if (!loaded) return;

    if (!document.querySelector('link[href="landing.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'landing.css';
      document.head.appendChild(link);
    }

    dynamicContainer.classList.remove('hidden');
    heroSection.classList.add('hidden');
    footer.classList.remove('hidden');

    dynamicContainer.classList.remove('fade-in-up');
    void dynamicContainer.offsetWidth;
    dynamicContainer.classList.add('fade-in-up');

    activateLandingPremium(dynamicContainer);
  }

  // HERO vissza
  async function showHero() {
    dynamicContainer.classList.remove('fade-in-up');
    dynamicContainer.classList.add('hidden');
    await setDynamicContent('');
    heroSection.classList.remove('hidden');
    footer.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPageTitle('Kezdőlap');
  }

  // Service animáció
  function initServiceAnimations() {
    const sections = document.querySelectorAll('.service-section');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    sections.forEach(section => observer.observe(section));
  }

  // Prémium scroll reveal
  function activateLandingPremium(root = document) {
    const landing = root.querySelector('.landing-page');
    if (!landing) return;

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.animationPlayState = 'running';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    landing.querySelectorAll(
      '.feature, .landing-header h2, .landing-header h1, .landing-header .intro'
    ).forEach(el => {
      el.style.animationPlayState = 'paused';
      io.observe(el);
    });
  }

  function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  // ESEMÉNYEK
  if (viewButton) {
    viewButton.addEventListener('click', (e) => {
      e.preventDefault();
      loadLanding();
    });
  }

  // Async click handler
  document.body.addEventListener('click', async (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    const nav  = anchor.dataset.nav;

    if (href === '#hero') {
      e.preventDefault();
      await showHero();
      setActiveNav('.nav-item a[href="#hero"]');
      return;
    }

    if (nav === 'rolunk') {
      e.preventDefault();
      await loadLanding();
      return;
    }

    if (nav === 'szolgaltatasaink') {
      e.preventDefault();
      await loadServices();
      return;
    }

    if (nav === 'kapcsolat') {
      e.preventDefault();
      try {
        const r = await fetch('contact.html', { cache: 'no-cache' });
        if (!r.ok) throw new Error();
        const h = await r.text();
        await setDynamicContent(h);
        if (!document.querySelector('link[href="contact.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'contact.css';
          document.head.appendChild(link);
        }
        setPageTitle('Kapcsolat');
        setActiveNav('[data-nav="kapcsolat"]');
      } catch {
        await setDynamicContent('<section class="section shell"><h2>Kapcsolat</h2><p>Hiba történt a betöltéskor.</p></section>');
        setPageTitle('Kapcsolat');
        setActiveNav('[data-nav="kapcsolat"]');
      }
      return;
    }
  });
});

// Aktív menüpont kiemelése
function setActiveNav(selector) {
  document.querySelectorAll('.nav-item a').forEach(a => a.classList.remove('active'));
  if (selector) {
    const link = document.querySelector(selector);
    if (link) link.classList.add('active');
  }
}
