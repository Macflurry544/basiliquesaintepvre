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

  var MOBILE_LINKS = [
    { href: '/',                              label: 'Accueil' },
    { href: '/histoire/',                     label: 'Histoire' },
    { href: '/les-grandes-orgues/',          label: 'Grandes Orgues' },
    { href: '/les-vitraux/',                  label: 'Vitraux' },
    { href: '/les-cloches/',                  label: 'Cloches' },
    { href: '/photos/',                       label: 'Photos' },
    { href: '/joseph-trouillet/',             label: 'Joseph Trouillet' },
    { href: '/presse/',                       label: 'Presse' },
    { href: '/carte/',                        label: 'Carte' },
    { href: '/sauvegarde-et-restauration/',   label: 'Sauvegarde' },
    { href: '/horaires-douverture/',          label: "Horaires d'ouverture" },
    { href: '/contact/',                      label: 'Contact' },
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

  var mobileItems = MOBILE_LINKS.map(function (l) {
    var cls = isActive(l.href) ? ' class="active"' : '';
    return '<a href="' + l.href + '"' + cls + '>' + l.label + '</a>';
  }).join('');

  var closeSVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">'
    + '<line x1="5" y1="5" x2="19" y2="19"/>'
    + '<line x1="19" y1="5" x2="5" y2="19"/>'
    + '</svg>';

  var navHTML =
    '<nav class="nav" id="nav" aria-label="Navigation principale">'
    +   '<a href="/" class="nav-logo">Basilique Saint-Epvre</a>'
    +   '<span class="nav-sep" aria-hidden="true"></span>'
    +   '<ul class="nav-links" role="list">' + desktopItems + '</ul>'
    +   '<button class="nav-burger" id="navBurger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="navFullscreen">'
    +     '<span></span><span></span><span></span>'
    +   '</button>'
    + '</nav>'
    + '<div class="nav-fullscreen" id="navFullscreen" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true">'
    +   '<button class="nav-fullscreen-close" id="navClose" aria-label="Fermer le menu">' + closeSVG + '</button>'
    +   '<nav class="nav-fullscreen-links" aria-label="Menu mobile">' + mobileItems + '</nav>'
    + '</div>';

  document.body.insertAdjacentHTML('afterbegin', navHTML);

  var nav      = document.getElementById('nav');
  var burger   = document.getElementById('navBurger');
  var menu     = document.getElementById('navFullscreen');
  var closeBtn = document.getElementById('navClose');
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
    menu.setAttribute('aria-hidden', 'false');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var firstLink = menu.querySelector('a');
    if (firstLink) setTimeout(function () { firstLink.focus(); }, 40);
  }

  function closeMenu() {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    burger.focus();
  }

  burger.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);

  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
})();
