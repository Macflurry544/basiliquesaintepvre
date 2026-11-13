(function () {
  'use strict';

  var LINKS = [
    { href: '/',                     label: 'Accueil' },
    { href: '/histoire/',            label: 'Histoire' },
    { href: '/les-grandes-orgues/', label: 'Grandes Orgues' },
    { href: '/les-vitraux/',         label: 'Vitraux' },
    { href: '/les-cloches/',         label: 'Cloches' },
    { href: '/musee-virtuel/',       label: 'Musée virtuel' },
    { href: '/inventaire/',          label: 'Inventaire' },
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
      { href: '/musee-virtuel/',      label: 'Musée virtuel' },
      { href: '/inventaire/',         label: 'Inventaire' },
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
    +   '<button class="nav-langue" id="navLangue" aria-label="Traduire la page" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.8 2.6 15.2 0 18M12 3c-2.6 2.8-2.6 15.2 0 18"/></svg></button>'
    +   '<button class="nav-burger" id="navBurger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="navFullscreen">'
    +     '<span></span><span></span><span></span>'
    +   '</button>'
    + '</nav>'
    + '<div class="nav-langues" id="navLangues" hidden><span>Traduire la page</span>'
    +   [['en','English'],['de','Deutsch'],['es','Español'],['it','Italiano'],['pl','Polski'],['nl','Nederlands']].map(function (l) {
          return '<a href="https://translate.google.com/translate?sl=fr&tl=' + l[0] + '&u=' + encodeURIComponent(location.href) + '" rel="noopener">' + l[1] + '</a>';
        }).join('')
    + '</div>'
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
  // le cercle du menu part du bouton rond : position recalculée au chargement, au redimensionnement et au défilement
  function placeOrigine() {
    var r = burger.getBoundingClientRect();
    menu.style.setProperty('--ox', (r.left + r.width / 2) + 'px'); menu.style.setProperty('--oy', (r.top + r.height / 2) + 'px');
  }
  placeOrigine();
  window.addEventListener('resize', placeOrigine);
  window.addEventListener('scroll', function () { if (!menu.classList.contains('open')) placeOrigine(); }, { passive: true });

  function openMenu() {
    placeOrigine();
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

  // Bouton Traduire : petite liste de langues (traduction automatique de Google Traduction)
  var lb = document.getElementById('navLangue'), lp = document.getElementById('navLangues');
  lb.addEventListener('click', function (e) {
    e.stopPropagation();
    var r = lb.getBoundingClientRect();
    lp.style.top = (r.bottom + 10) + 'px'; lp.style.right = Math.max(12, innerWidth - r.right - 40) + 'px';
    lp.hidden = !lp.hidden; lb.setAttribute('aria-expanded', !lp.hidden);
  });
  document.addEventListener('click', function (e) { if (!lp.hidden && !lp.contains(e.target)) { lp.hidden = true; lb.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lp.hidden = true; });

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

  /* Grande flèche de retour à l'accueil, juste avant le pied de page (toutes les pages sauf l'accueil) */
  (function () {
    var pied = document.querySelector('footer.pied');
    if (!pied || location.pathname === '/' || location.pathname === '/index.html') return;
    var st = document.createElement('style');
    st.textContent = [
      '.retour-accueil{display:block;max-width:1240px;margin:0 auto;padding:3.4rem max(22px,env(safe-area-inset-left,0px)) 4.4rem;text-decoration:none;color:#4a1518;font-family:"Familjen Grotesk","Helvetica Neue",Arial,sans-serif}',
      '.retour-accueil .ra-filet{display:block;border-top:1px solid rgba(33,52,72,.18);margin-bottom:2.4rem}',
      '.retour-accueil .ra-lab{display:block;font-weight:600;font-size:.78rem;letter-spacing:.24em;text-transform:uppercase;color:#59626e;margin-bottom:1rem}',
      '.retour-accueil .ra-ligne{display:flex;align-items:center;gap:clamp(1rem,3vw,2.4rem)}',
      '.retour-accueil svg{flex:none;width:clamp(90px,16vw,230px);height:auto;overflow:visible;transition:transform .5s cubic-bezier(.22,1,.36,1)}',
      '.retour-accueil b{font-weight:500;font-size:clamp(2.4rem,7.5vw,6.2rem);line-height:.9;letter-spacing:-.045em;text-transform:uppercase}',
      '.retour-accueil:hover svg,.retour-accueil:focus-visible svg{transform:translateX(-14px)}',
      '@media (prefers-reduced-motion:reduce){.retour-accueil svg{transition:none}}'
    ].join('');
    document.head.appendChild(st);
    var a = document.createElement('a');
    a.className = 'retour-accueil'; a.href = '/';
    a.innerHTML = '<span class="ra-filet" aria-hidden="true"></span><span class="ra-lab">Basilique Saint-Epvre</span>'
      + '<span class="ra-ligne"><svg viewBox="0 0 230 60" aria-hidden="true"><path d="M228 30H8M34 4 6 30l28 26" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="square"/></svg><b>Retour à l’accueil</b></span>';
    var avant = document.querySelector('.cul-de-lampe') && document.querySelector('.cul-de-lampe').nextElementSibling === pied ? document.querySelector('.cul-de-lampe') : pied;
    pied.parentNode.insertBefore(a, avant);
  })();

  /* Petite flèche de retour en haut à gauche : courte, épaisse, attirée par la souris */
  (function () {
    if (location.pathname === '/' || location.pathname === '/index.html' || /^\/carte\//.test(location.pathname)) return;
    var st = document.createElement('style');
    st.textContent = [
      '.retour-haut{position:absolute;z-index:60;top:calc(18px + env(safe-area-inset-top,0px));left:max(18px,env(safe-area-inset-left,0px));display:flex;align-items:center;gap:.55rem;padding:.55rem .7rem;text-decoration:none;font:600 .78rem/1 "Familjen Grotesk","Helvetica Neue",Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#fff;transition:transform .35s cubic-bezier(.22,1,.36,1),opacity .3s}',
      '.retour-haut.clair{color:#4a1518}',
      '.retour-haut svg{width:34px;height:22px;overflow:visible}',
      '.retour-haut span{opacity:.85}',
      '@media (max-width:700px){.retour-haut span{display:none}.retour-haut{top:calc(22px + env(safe-area-inset-top,0px))}}'
    ].join('');
    document.head.appendChild(st);
    var a = document.createElement('a');
    a.className = 'retour-haut'; a.href = '/'; a.setAttribute('aria-label', 'Retour à l’accueil');
    a.innerHTML = '<svg viewBox="0 0 34 22" aria-hidden="true"><path d="M32 11H5M14 2 4 11l10 9" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="square"/></svg><span>Accueil</span>';
    document.body.appendChild(a);
    // couleur selon le fond derrière : blanc sur bordeaux ou bleu, bordeaux sur papier
    function teinte() {
      a.style.visibility = 'hidden'; var r = a.getBoundingClientRect(), el = document.elementFromPoint(r.left + 10, r.top + r.height / 2 + scrollY - scrollY); a.style.visibility = '';
      var bg = 'rgba(0, 0, 0, 0)'; while (el && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) { bg = getComputedStyle(el).backgroundColor; el = el.parentElement; }
      var m = bg.match(/\d+/g) || [255, 255, 255], lum = (+m[0] * .3 + +m[1] * .59 + +m[2] * .11);
      a.classList.toggle('clair', lum > 160);
    }
    addEventListener('load', teinte); teinte();
    // attirée par la souris, sans jamais trop s'éloigner
    if (matchMedia('(hover: hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      addEventListener('mousemove', function (e) {
        var r = a.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy);
        if (d < 150) { var f = (1 - d / 150) * .35; a.style.transform = 'translate(' + (dx * f).toFixed(1) + 'px,' + (dy * f).toFixed(1) + 'px)'; }
        else if (a.style.transform) a.style.transform = '';
      }, { passive: true });
    }
  })();
})();
