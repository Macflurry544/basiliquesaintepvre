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

  var DRAWER_LINKS = [
    { href: '/',                                       label: 'Accueil' },
    { href: '/histoire/',                              label: 'Histoire' },
    { href: '/les-grandes-orgues/',                   label: 'Grandes Orgues' },
    { href: '/les-vitraux/',                           label: 'Vitraux' },
    { href: '/les-cloches/',                           label: 'Cloches' },
    { href: '/photos/',                                label: 'Photos' },
    { href: '/joseph-trouillet/',                      label: 'Joseph Trouillet' },
    { href: '/presse/',                                label: 'Presse' },
    { href: '/carte/',                                 label: 'Carte' },
    { href: '/sauvegarde-et-restauration/',            label: 'Sauvegarde' },
    { href: '/horaires-douverture/',                   label: "Horaires d'ouverture" },
    { href: '/contact/',                               label: 'Contact' },
  ];

  var path = window.location.pathname;

  function isActive(href) {
    if (href === '/') return path === '/' || path === '/index.html';
    return path.indexOf(href) === 0;
  }

  var desktopItems = LINKS.map(function (l) {
    var active = isActive(l.href) ? ' class="active"' : '';
    return '<li><a href="' + l.href + '"' + active + '>' + l.label + '</a></li>';
  }).join('');

  var drawerItems = DRAWER_LINKS.map(function (l) {
    var active = isActive(l.href) ? ' active' : '';
    return '<a href="' + l.href + '" class="' + active.trim() + '">' + l.label + '</a>';
  }).join('');

  var closeSVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square">' +
      '<line x1="4" y1="4" x2="20" y2="20"/>' +
      '<line x1="20" y1="4" x2="4" y2="20"/>' +
    '</svg>';

  var navHTML =
    '<nav class="nav" id="nav" aria-label="Navigation principale">' +
      '<a href="/" class="nav-logo">Basilique Saint-Epvre</a>' +
      '<ul class="nav-links">' + desktopItems + '</ul>' +
      '<button class="nav-burger" id="navBurger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="navDrawer">' +
        '<span></span><span></span><span></span>' +
      '</button>' +
    '</nav>' +
    '<div class="nav-overlay" id="navOverlay" aria-hidden="true"></div>' +
    '<div class="nav-drawer" id="navDrawer" role="dialog" aria-modal="true" aria-label="Menu de navigation" aria-hidden="true">' +
      '<div class="nav-drawer-header">' +
        '<a href="/" class="nav-drawer-logo">Basilique Saint-Epvre</a>' +
        '<button class="nav-drawer-close" id="navDrawerClose" aria-label="Fermer le menu">' +
          closeSVG +
        '</button>' +
      '</div>' +
      '<nav class="nav-drawer-links">' + drawerItems + '</nav>' +
    '</div>';

  document.body.insertAdjacentHTML('afterbegin', navHTML);

  var nav        = document.getElementById('nav');
  var burger     = document.getElementById('navBurger');
  var overlay    = document.getElementById('navOverlay');
  var drawer     = document.getElementById('navDrawer');
  var drawerClose = document.getElementById('navDrawerClose');

  // Pages sans section .hero → nav opaque dès le chargement
  if (!document.querySelector('.hero')) {
    nav.classList.add('scrolled');
  }

  // Scroll → basculer fond opaque
  window.addEventListener('scroll', function () {
    if (document.querySelector('.hero')) {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }
  }, { passive: true });

  // Ouvrir / fermer le drawer
  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Fermer au clic sur un lien du drawer
  drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeDrawer);
  });

  // Fermer avec Échap
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });
})();
