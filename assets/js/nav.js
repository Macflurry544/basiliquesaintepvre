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

  var mobileItems = MOBILE_LINKS.map(function (l) {
    return '<a href="' + l.href + '">' + l.label + '</a>';
  }).join('');

  var navHTML =
    '<nav class="nav" id="nav" aria-label="Navigation principale">' +
      '<a href="/" class="nav-logo">Basilique Saint-Epvre</a>' +
      '<ul class="nav-links">' + desktopItems + '</ul>' +
      '<button class="nav-burger" id="burger" aria-label="Menu" aria-expanded="false">' +
        '<span></span><span></span><span></span>' +
      '</button>' +
    '</nav>' +
    '<div class="nav-mobile" id="navMobile" aria-hidden="true">' +
      mobileItems +
    '</div>';

  document.body.insertAdjacentHTML('afterbegin', navHTML);

  var nav      = document.getElementById('nav');
  var burger   = document.getElementById('burger');
  var navMobile = document.getElementById('navMobile');

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

  // Burger toggle
  burger.addEventListener('click', function () {
    var open = navMobile.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    navMobile.setAttribute('aria-hidden', String(!open));
  });

  // Fermer le menu mobile au clic sur un lien
  navMobile.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navMobile.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      navMobile.setAttribute('aria-hidden', 'true');
    });
  });
})();
