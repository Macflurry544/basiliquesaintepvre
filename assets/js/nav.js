(function () {
  'use strict';

  var LINKS = [
    { href: '/',                     label: 'Accueil' },
    { href: '/histoire/',            label: 'Histoire' },
    { href: '/les-grandes-orgues/', label: 'Grandes Orgues' },
    { href: '/les-vitraux/',         label: 'Vitraux' },
    { href: '/les-cloches/',         label: 'Cloches' },
    { href: '/photos/',              label: 'Photos' },
    { href: '/horaires-douverture/', label: 'Horaires' },
    { href: '/contact/',             label: 'Contact' },
  ];

  /* Menu mobile : 3 rubriques, une seule affichée à la fois */
  var MOBILE_GROUPS = [
    { title: 'Découvrir', links: [
      { href: '/histoire/',           label: 'Histoire' },
      { href: '/les-grandes-orgues/', label: 'Grandes Orgues' },
      { href: '/les-vitraux/',        label: 'Vitraux' },
      { href: '/les-cloches/',        label: 'Cloches' },
      { href: '/photos/',             label: 'Photos' },
    ]},
    { title: 'Visiter', links: [
      { href: '/',                     label: 'Accueil' },
      { href: '/horaires-douverture/', label: "Horaires d'ouverture" },
      { href: '/carte/',               label: 'Carte' },
      { href: '/contact/',             label: 'Contact' },
    ]},
    { title: 'Patrimoine', links: [
      { href: '/joseph-trouillet/',           label: 'Joseph Trouillet' },
      { href: '/histoire/archives/',          label: 'Archives' },
      { href: '/sauvegarde-et-restauration/', label: 'Sauvegarde' },
      { href: '/presse/',                     label: 'Presse' },
      { href: '/bibliographie/',              label: 'Bibliographie' },
    ]},
  ];

  var path = window.location.pathname;

  function isActive(href) {
    if (href === '/') return path === '/' || path === '/index.html';
    return path.indexOf(href) === 0;
  }

  /* ── HTML ─────────────────────────────────────────────────────── */

  var desktopItems = LINKS.map(function (l) {
    var cls = isActive(l.href) ? ' class="active"' : '';
    return '<li><a href="' + l.href + '"' + cls + '>' + l.label + '</a></li>';
  }).join('');

  /* Le lien actif le plus précis gagne (/histoire/archives/ plutôt que /histoire/) */
  var activeHref = '';
  MOBILE_GROUPS.forEach(function (g) {
    g.links.forEach(function (l) {
      if (isActive(l.href) && l.href.length > activeHref.length) activeHref = l.href;
    });
  });
  /* Menu mobile : une seule liste, dans l'ordre des rubriques */
  var mobileItems = [];
  MOBILE_GROUPS.forEach(function (g) { g.links.forEach(function (l) { mobileItems.push(l); }); });
  mobileItems.sort(function (a, b) { return a.href === '/' ? -1 : b.href === '/' ? 1 : 0; });
  var mobileList = mobileItems.map(function (l, j) {
    var cls = l.href === activeHref ? ' class="active"' : '';
    return '<a href="' + l.href + '"' + cls + ' style="--k:' + j + '"><span>' + l.label + '</span></a>';
  }).join('');

  /* Police grotesque du menu, chargée une seule fois */
  if (!document.querySelector('link[href*="Familjen+Grotesk"]')) {
    var lf = document.createElement('link'); lf.rel = 'stylesheet';
    lf.href = 'https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600&display=swap';
    document.head.appendChild(lf);
  }

  var closeSVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">'
    + '<line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>';
  var chevron = '<svg class="nm-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 8q8 0 8 9q0-9 8-9"/></svg>';
  var ext = '<svg class="nm-ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg>';

  /* Grandes rubriques : un titre géant qui déplie ses pages */
  var groupsHTML = MOBILE_GROUPS.map(function (g, i) {
    var sous = g.links.map(function (l) {
      return '<a href="' + l.href + '"' + (l.href === activeHref ? ' class="active"' : '') + '>' + l.label + '</a>';
    }).join('');
    return '<div class="nm-groupe" style="--k:' + i + '">'
      + '<button class="nm-titre" aria-expanded="false"><span>' + g.title + '</span>' + chevron + '</button>'
      + '<div class="nm-sous"><div>' + sous + '</div></div></div>';
  }).join('');

  var navHTML =
    '<nav class="nav" id="nav" aria-label="Navigation principale">'
    +   '<a href="/" class="nav-logo">Basilique Saint-Epvre</a>'
    +   '<span class="nav-sep" aria-hidden="true"></span>'
    +   '<ul class="nav-links" role="list">' + desktopItems + '</ul>'
    +   '<button class="nav-burger" id="navBurger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="navFullscreen">'
    +     '<span></span><span></span><span></span>'
    +   '</button>'
    + '</nav>'
    + '<div class="nav-voile" id="navVoile" aria-hidden="true"></div>'
    + '<div class="nav-fullscreen" id="navFullscreen" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true">'
    +   '<div class="nm-haut">'
    +     '<a class="nm-heure" href="/horaires-douverture/">Ouverte le samedi 16h30–18h30 <span>→</span></a>'
    +     '<a class="nm-logo" href="/"><span class="nm-rosace" aria-hidden="true"></span>Basilique<br>Saint-Epvre</a>'
    +     '<button class="nav-fullscreen-close" id="navClose" aria-label="Fermer le menu">' + closeSVG + '</button>'
    +   '</div>'
    +   '<nav class="nm-groupes" aria-label="Sommaire">' + groupsHTML + '</nav>'
    +   '<div class="nm-second"><a href="/contact/">Contact</a><a href="/carte/">Venir</a><a href="/bibliographie/">Bibliographie</a></div>'
    +   '<div class="nm-bas">'
    +     '<a href="https://www.oratoire-nancy.org/messes-et-offices-a-st-epvre/" target="_blank" rel="noopener">Messes et offices' + ext + '</a>'
    +     '<a href="https://www.oratoire-nancy.org/" target="_blank" rel="noopener">L\'Oratoire de Nancy' + ext + '</a>'
    +   '</div>'
    + '</div>';

  document.body.insertAdjacentHTML('afterbegin', navHTML);

  var nav      = document.getElementById('nav');
  var burger   = document.getElementById('navBurger');
  var menu     = document.getElementById('navFullscreen');
  var closeBtn = document.getElementById('navClose');
  var voile    = document.getElementById('navVoile');
  var hasHero  = !!document.querySelector('.hero');

  /* ── État initial ─────────────────────────────────────────────── */
  if (!hasHero) nav.classList.add('scrolled');

  /* ═══════════════════════════════════════════════════════════════
     SCROLL — 4 états déterministes : TOP / IDLE / DOWN / UP
     Règles :
       • scrollY = 0          → toujours visible (TOP)
       • direction = DOWN      → cacher (sauf menu ouvert)
       • direction = UP        → montrer
       • inactivité ≥ 800ms   → IDLE, garder dernier état (rien changer)
     ═══════════════════════════════════════════════════════════════ */

  /* ═══════════════════════════════════════════════════════════════
     SCROLL — compact ↔ étendu, jamais invisible
     • TOP PAGE        → étendu
     • Scroll DOWN     → compact
     • Scroll UP       → étendu
     • IDLE ≥ 800ms    → garder état courant
     ═══════════════════════════════════════════════════════════════ */

  var lastScrollY   = window.scrollY;
  var lastDirection = 'up';
  var idleTimer     = null;
  var ticking       = false;

  function compactNav() {
    nav.classList.add('compact');
  }

  function expandNav() {
    nav.classList.remove('compact');
  }

  function onScroll() {
    var currentY  = window.scrollY;
    var direction = currentY > lastScrollY ? 'down' : 'up';

    /* Fond opaque sur pages avec hero */
    if (hasHero) {
      nav.classList.toggle('scrolled', currentY > 60);
    }

    /* TOP PAGE → étendu absolu */
    if (currentY === 0) {
      expandNav();
      lastScrollY   = currentY;
      lastDirection = direction;
      ticking       = false;
      return;
    }

    /* Direction prime, sauf si menu ouvert */
    if (!menu.classList.contains('open')) {
      if (direction === 'down') {
        compactNav();
      } else if (direction === 'up') {
        expandNav();
      }
    }

    lastDirection = direction;
    lastScrollY   = currentY;
    ticking       = false;

    /* IDLE : conserver l'état sans rien changer */
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { /* état stable */ }, 800);
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  /* ── Menu fullscreen ──────────────────────────────────────────── */
  function openMenu() {
    menu.classList.add('open');
    voile.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var firstLink = menu.querySelector('.nm-titre');
    if (firstLink) setTimeout(function () { firstLink.focus(); }, 40);
  }

  function closeMenu() {
    menu.classList.remove('open');
    voile.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    burger.focus();
  }

  burger.addEventListener('click', function () {
    if (menu.classList.contains('open')) closeMenu(); else openMenu();
  });
  // Toucher en dehors de la liste la referme
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('open') && !menu.contains(e.target) && !burger.contains(e.target)) closeMenu();
  });
  closeBtn.addEventListener('click', closeMenu);

  /* Rubriques dépliantes : une seule ouverte ; celle de la page en cours est ouverte d'office */
  var groupes = menu.querySelectorAll('.nm-groupe');
  groupes.forEach(function (g) {
    var b = g.querySelector('.nm-titre');
    if (g.querySelector('a.active')) { g.classList.add('ouvert'); b.setAttribute('aria-expanded', 'true'); }
    b.addEventListener('click', function () {
      var ouvrir = !g.classList.contains('ouvert');
      groupes.forEach(function (x) { x.classList.remove('ouvert'); x.querySelector('.nm-titre').setAttribute('aria-expanded', 'false'); });
      if (ouvrir) { g.classList.add('ouvert'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
})();
