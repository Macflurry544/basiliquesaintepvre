/* ══ PAGES DE LECTURE — animations, sommaire, ornements, easter eggs ══
   Chargé sur les pages de texte (pas l'accueil), après nav.js.
   ─────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vh = window.innerHeight;
  var body = document.body;
  body.classList.add('lecture');

  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }

  /* ── Ornements SVG ─────────────────────────────────────────────── */
  // Croix de Lorraine entre deux barres
  var ORNEMENT =
    '<svg viewBox="0 0 400 66" aria-hidden="true">'
    + '<line x1="40" y1="34" x2="168" y2="34"/>'
    + '<g class="croix"><line x1="200" y1="12" x2="200" y2="60"/>'
    + '<line x1="190" y1="28" x2="210" y2="28"/>'
    + '<line x1="184" y1="40" x2="216" y2="40"/></g>'
    + '<line x1="232" y1="34" x2="360" y2="34"/>'
    + '</svg>';

  /* ── Barre de progression ──────────────────────────────────────── */
  var progress = el('div', 'l-progress');
  body.appendChild(progress);

  /* ── Titres découpés mot par mot ───────────────────────────────── */
  function decouper(h, base) {
    if (h.dataset.wr) return;
    h.dataset.wr = '1';
    var i = 0;
    (function walk(node) {
            Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = el('span', 'w');
            var inner = el('i');
            inner.textContent = part;
            inner.style.setProperty('--i', i++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && n.tagName !== 'SUP') {
          walk(n);
        }
      });
    })(h);
    h.classList.add('wr');
    if (base) h.style.setProperty('--base', base);
  }

  /* ── Observateur d'apparition ──────────────────────────────────── */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }) : null;

  function sousLaLigne(e) { return e.getBoundingClientRect().top > vh * 0.92; }

  function animer(e, cls, delai) {
    if (!io || reduit) { e.classList.add('in'); return; }
    if (cls) e.classList.add(cls);
    if (delai) e.style.setProperty('--d', delai + 's');
    if (sousLaLigne(e)) io.observe(e);
    else requestAnimationFrame(function () { requestAnimationFrame(function () { e.classList.add('in'); }); });
  }

  // h1 : mot par mot dès l'arrivée
  var h1 = document.querySelector('h1');
  if (h1 && !reduit) { decouper(h1, '150ms'); animer(h1); }

  // h2 : mot par mot au scroll
  $$('main h2, article h2, section h2, .chapitre h2').forEach(function (h) {
    if (h.closest('.l-sheet, .egg-carte')) return;
    if (!reduit) decouper(h);
    animer(h);
  });

  // Textes, cartes, citations : montée douce, en cascade dans un même bloc
  var vus = new Set();
  $$('article p, article li, article blockquote, .intro, .epoque-carte, .jalon, .mesures > div, .doc-titre, .schedule-day, figure, .section-entete > span, .chapitre-tete > *:not(h2)').forEach(function (e) {
    if (vus.has(e) || e.closest('.hero, .nav, .nav-fullscreen')) return;
    vus.add(e);
    var freres = e.parentElement ? $$(':scope > *', e.parentElement) : [];
    var rang = Math.max(0, freres.indexOf(e));
    animer(e, 'rv', Math.min(rang, 5) * 0.08);
  });

  // Images de contenu : rideau qui se lève
  $$('article img, figure img, .immersif-non img').forEach(function (img) {
    if (img.closest('.hero, .immersif')) return;
    var cible = img.parentElement && img.parentElement.children.length === 1 && img.parentElement.tagName !== 'ARTICLE' ? img.parentElement : img;
    if (cible === img.parentElement) cible.style.overflow = 'hidden';
    animer(cible, 'rv-img');
  });

  // Surligneur pastel sur les mots importants, comme passé au feutre
  var surlignes = [];
  var PASTELS = ['#f7e3a1', '#cfe6f5', '#d9eccd', '#f6d3dc', '#e2d7f3'];
  $$('article strong, article b, .timeline strong, .frise strong, .intro strong, main p strong').forEach(function (m, k) {
    if (m.closest('h1, h2, h3, .hero, .nav, .l-sheet') || m.classList.contains('l-surligne')) return;
    m.classList.add('l-surligne');
    if (clair(getComputedStyle(m).color)) m.classList.add('sur-fonce');
    m.style.setProperty('--sl', PASTELS[k % PASTELS.length]);
    surlignes.push(m);
  });

  // Compteurs : 1576, 87 m, ~1 570 kg…
  $$('.hero-chiffre-val, .mesures b').forEach(function (n) {
    if (reduit || n.children.length) return;
    var m = n.textContent.match(/^(\D*?)(\d[\d\s  ]*)(.*)$/);
    if (!m) return;
    var cible = parseInt(m[2].replace(/\D/g, ''), 10);
    if (!cible || cible < 3) return;
    var avant = m[1], apres = m[3], groupe = /\s| | /.test(m[2]);
    var fmt = function (v) { var s = String(v); return groupe ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : s; };
    var depart = cible > 1000 && cible < 2100 && !groupe ? cible - 400 : 0; // les années défilent, elles ne partent pas de 0
    n.textContent = avant + fmt(depart) + apres;
    var lance = function () {
      var t0 = performance.now(), duree = 1800;
      (function pas(t) {
        var p = Math.min(1, (t - t0) / duree);
        var v = Math.round(depart + (cible - depart) * (1 - Math.pow(1 - p, 4)));
        n.textContent = avant + fmt(v) + apres;
        if (p < 1) requestAnimationFrame(pas);
      })(t0);
    };
    if (!io) { lance(); return; }
    var o = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { o.disconnect(); setTimeout(lance, 400); } }, { threshold: 0.4 });
    o.observe(n);
  });

  /* ── Ornements entre les sections ──────────────────────────────── */
  var sections = $$('article.section, article.article, article.anecdote, .chapitre');
  sections.forEach(function (s, i) {
    if (i === 0) return;
    var orn = el('div', 'l-orn', ORNEMENT);
    s.parentNode.insertBefore(orn, s);
    $$('path, line, circle', orn).forEach(function (p) {
      var len = p.getTotalLength ? Math.ceil(p.getTotalLength()) + 2 : 400;
      p.style.setProperty('--len', len);
    });
    animer(orn);
  });

  /* ── Hero : rosace + parallaxe forte ───────────────────────────── */
  var hero = document.querySelector('.hero');
  var heroImg = hero && hero.querySelector('.hero-photo, img');
  var heroContenu = hero && hero.querySelector('.hero-contenu, .hero-content, h1');
  var immersifs = $$('.immersif img');

  /* ── Sommaire ──────────────────────────────────────────────────── */
  var titres = $$('article h2, .chapitre h2, section.editorial h2, section.archive h2').filter(function (h) {
    return !h.closest('.hero, .l-sheet');
  });
  var entrees = titres.map(function (h, k) {
    var bloc = h.closest('article, section, .chapitre') || h;
    if (!bloc.id) bloc.id = 'partie-' + (k + 1);
    var copie = h.cloneNode(true);
    $$('br', copie).forEach(function (b) { b.replaceWith(' '); });
    var texte = copie.textContent.replace(/\s+/g, ' ').trim();
    return { bloc: bloc, id: bloc.id, texte: texte };
  });

  var toc, tocLiens = [], fill, sheet, veil;
  if (entrees.length >= 3) {
    toc = el('nav', 'l-toc');
    toc.setAttribute('aria-label', 'Sommaire de la page');
    var panel = el('div', 'l-toc-panel');
    var ol = el('ol');
    fill = el('span', 'l-toc-fill');
    ol.appendChild(fill);
    entrees.forEach(function (e) {
      var li = el('li'), a = el('a');
      a.href = '#' + e.id;
      a.innerHTML = '<span></span>';
      a.firstChild.textContent = e.texte;
      li.appendChild(a); ol.appendChild(li); tocLiens.push(a);
    });
    panel.appendChild(ol); toc.appendChild(panel); body.appendChild(toc);

  }
  function fermerSheet() { if (sheet) { sheet.classList.remove('open'); veil.classList.remove('open'); } }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fermerSheet(); });

  // Défilement doux vers les ancres, sous la barre de navigation
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    var cible = document.getElementById(a.getAttribute('href').slice(1));
    if (!cible) return;
    e.preventDefault();
    window.scrollTo({ top: cible.getBoundingClientRect().top + window.scrollY - 90, behavior: reduit ? 'auto' : 'smooth' });
  });

  /* ── Sommaire des pages : grands numéros détourés ─────────────── */
  $$('.sommaire').forEach(function (som) {
    som.classList.add('l-som');
    $$('li', som).forEach(function (li, k) {
      var a = li.querySelector('a'), num = li.querySelector('.num');
      if (!a) return;
      var titre = a.innerHTML;
      a.innerHTML = '<i>' + (num ? num.textContent.trim() : String(k + 1).padStart(2, '0')) + '</i><em>' + titre + '</em><b aria-hidden="true">→</b>';
      if (!a.getAttribute('href')) a.setAttribute('href', '#' + (a.dataset.cible || ''));
      if (num) num.remove();
      li.style.setProperty('--k', k);
    });
    if (io && !reduit) io.observe(som); else som.classList.add('in');
  });

  /* ── Filtres de la page Vitraux : onglets soulignés ─────────────── */
  $$('.filtres').forEach(function (barre) {
    var rail = el('div', 'filtres-rail');
    barre.parentNode.insertBefore(rail, barre);
    rail.appendChild(barre);
    var ink = el('span', 'filtres-ink');
    barre.appendChild(ink);
    var suite = el('div', 'filtres-suite', '<button type="button" aria-label="Voir les zones suivantes">→</button>');
    rail.appendChild(suite);
    suite.querySelector('button').addEventListener('click', function () {
      interagi = true;
      barre.scrollBy({ left: barre.clientWidth * 0.7, behavior: reduit ? 'auto' : 'smooth' });
    });
    function placer() {
      var b = barre.querySelector('.filtre-btn.actif') || barre.querySelector('.filtre-btn');
      if (!b) return;
      ink.style.width = b.offsetWidth + 'px';
      ink.style.transform = 'translateX(' + b.offsetLeft + 'px)';
    }
    function bords() {
      var max = barre.scrollWidth - barre.clientWidth;
      rail.classList.toggle('fin', barre.scrollLeft >= max - 4);
      rail.classList.toggle('debut-cache', barre.scrollLeft > 4);
    }
    var interagi = false;
    rail.addEventListener('pointerdown', function () { interagi = true; });
    barre.addEventListener('click', function (e) {
      interagi = true;
      var b = e.target.closest('.filtre-btn');
      if (!b) return;
      // laisse la page appliquer le filtre, puis déplace le trait et amène l'onglet à gauche, hors de la flèche
      setTimeout(function () {
        placer();
        barre.scrollTo({ left: Math.max(0, b.offsetLeft - 12), behavior: reduit ? 'auto' : 'smooth' });
      }, 0);
    });
    barre.addEventListener('scroll', bords, { passive: true });
    window.addEventListener('resize', function () { placer(); bords(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placer(); bords(); });
    placer(); bords();

    // Au premier affichage, la barre glisse un peu vers la droite puis revient : on comprend qu'il y a une suite
    if (!reduit && barre.scrollWidth > barre.clientWidth + 4 && io) {
      var vu = new IntersectionObserver(function (e) {
        if (!e[0].isIntersecting) return;
        vu.disconnect();
        setTimeout(function () {
          if (interagi) return;
          barre.scrollTo({ left: 90, behavior: 'smooth' });
          setTimeout(function () { if (!interagi) barre.scrollTo({ left: 0, behavior: 'smooth' }); }, 700);
        }, 600);
      }, { threshold: 0.6 });
      vu.observe(barre);
    }
  });

  /* ── Liquid glass sur les blocs carrés ─────────────────────────── */
  function clair(rgb) {
    var m = rgb.match(/\d+(\.\d+)?/g); if (!m) return false;
    return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) > 150;
  }
  function fonce(rgb) {
    var m = rgb.match(/\d+(\.\d+)?/g); if (!m) return false;
    var alpha = m.length > 3 ? parseFloat(m[3]) : 1;
    return alpha > 0.5 && !clair(rgb);
  }
  $$('.page *, main *, article, section *').forEach(function (e) {
    if (e.closest('.r-ouverture, .pied, .page-closing, article.section, article.anecdote, article.article, section.chapitre, .hero, .mesures, .sommaire, .filtres-wrapper, .credits, .h-mercredi, .h-info, .h-etat, .nav, .nav-fullscreen, .l-toc, .l-sheet, .egg-carte, .l-orn') || /^(IMG|SVG|INPUT|TEXTAREA|SELECT|BUTTON|A|LI|SPAN|SUP|BR|PATH|LINE|CIRCLE|IFRAME|VIDEO|HR)$/i.test(e.tagName)) return;
    var cs = getComputedStyle(e);
    var bords = ['Top', 'Right', 'Bottom', 'Left'].filter(function (c) { return parseFloat(cs['border' + c + 'Width']) > 0 && cs['border' + c + 'Style'] !== 'none'; }).length;
    var r = e.getBoundingClientRect();
    var fond = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent' && cs.backgroundImage === 'none';
    if (bords < 3 && !fond) return;
    if (parseFloat(cs.borderTopLeftRadius) > 6 || r.width < 60 || r.height < 40 || r.width > window.innerWidth * 0.94) return;
    if (e.closest('.l-glass')) return;
    // Fond d'origine foncé ou texte clair : verre teinté sombre, pour garder le texte lisible
    // (lu avant d'ajouter la classe, car getComputedStyle suit les changements)
    var sombre = (fond && fonce(cs.backgroundColor)) || clair(cs.color);
    e.classList.add('l-glass');
    if (sombre) e.classList.add('sombre');
  });

  /* ── Rail le long des sections (même effet que la frise) ────────── */
  var rails = sections.filter(function (s) { return !s.classList.contains('chapitre'); }).map(function (s) {
    var h = s.querySelector('h2');
    if (!h) return null;
    s.classList.add('l-rail');
    var sr = s.getBoundingClientRect(), hr = h.getBoundingClientRect();
    // Le rail passe à gauche de tout le contenu (titre, texte, encadrés), jamais dessus
    var gauche = hr.left;
    $$('p, blockquote, figure, ul, ol, table, div', s).forEach(function (c) {
      var r = c.getBoundingClientRect();
      if (r.width > 0 && r.width < sr.width - 4) gauche = Math.min(gauche, r.left);
    });
    var marge = gauche - sr.left;
    if (marge < 40) {
      s.style.paddingLeft = (parseFloat(getComputedStyle(s).paddingLeft) + 44 - marge) + 'px';
      marge = 44;
    }
    s.style.setProperty('--rx', Math.round(marge - 22) + 'px');
    s.style.setProperty('--ry', Math.max(8, hr.top - sr.top + 14) + 'px');
    var ligne = el('span', 'l-rail-ligne'), fillR = el('span', 'l-rail-fill'), point = el('span', 'l-rail-point');
    s.appendChild(ligne); s.appendChild(fillR); s.appendChild(point);
    if (io && !reduit) io.observe(s); else s.classList.add('in');
    return { s: s, f: fillR };
  }).filter(Boolean);

  /* ── Chronologie des cloches ───────────────────────────────────── */
  var CLOCHE_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">'
    + '<path class="onde" d="M3 6 Q1 11 3 16"/><path class="onde" d="M21 6 Q23 11 21 16"/>'
    + '<path d="M12 2.5 v1.5"/><path d="M6 17 C6 9 8 5 12 5 C16 5 18 9 18 17 Z" fill="currentColor" fill-opacity="0.12"/>'
    + '<path d="M4.5 17.2 h15"/><circle cx="12" cy="19.6" r="1.6" fill="currentColor"/></svg>';
  var tlFills = $$('.timeline').map(function (tl) {
    var titre = tl.parentElement && tl.parentElement.querySelector('.timeline-titre');
    if (titre) {
      titre.insertAdjacentHTML('afterbegin', CLOCHE_SVG.replace(/class="onde"/g, 'class="onde" style="display:none"'));
      animer(titre);
    }
    var f = el('span', 'tl-fill'); tl.insertBefore(f, tl.firstChild);
    $$('.timeline-item', tl).forEach(function (it, k) {
      var b = el('button', 'tl-cloche', CLOCHE_SVG);
      b.type = 'button';
      var date = it.querySelector('.timeline-date');
      b.setAttribute('aria-label', 'Faire sonner la cloche' + (date ? ' — ' + date.textContent : ''));
      it.insertBefore(b, it.firstChild);
      b.addEventListener('click', function () {
        // Plus l'événement est ancien, plus la cloche est grave
        cloche(it.classList.contains('majeur') ? 174.6 : 220 + k * 22);
        b.classList.remove('sonne'); void b.offsetWidth; b.classList.add('sonne');
      });
      if (!io || reduit) it.classList.add('in'); else io.observe(it);
    });
    return { ol: tl, t: f };
  });

  /* ── Frise : trait qui avance ──────────────────────────────────── */
  var frises = $$('.jalons').map(function (ol) {
    var t = el('span', 'trait'); ol.insertBefore(t, ol.firstChild); return { ol: ol, t: t };
  }).concat(tlFills);

  /* ── Boucle de scroll unique ───────────────────────────────────── */
  var tick = false;
  function auScroll() {
    tick = false;
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - vh;
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';

    if (!reduit) {
      if (heroImg && y < vh * 1.4) {
        heroImg.style.transform = 'translate3d(0,' + (y * 0.45).toFixed(1) + 'px,0) scale(' + (1.08 + y / vh * 0.12).toFixed(3) + ')';
        if (heroContenu) {
          heroContenu.style.transform = 'translate3d(0,' + (y * -0.18).toFixed(1) + 'px,0)';
          heroContenu.style.opacity = String(Math.max(0, 1 - y / (vh * 0.75)));
        }
      }
      immersifs.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.transform = 'translate3d(0,' + (p * -22).toFixed(2) + '%,0) scale(1.05)';
      });
    }

    // Surligneur piloté par le scroll : le trait avance quand le mot monte de 88 % à 55 % de l'écran
    surlignes.forEach(function (m) {
      var t = m.getBoundingClientRect().top;
      var p = reduit ? 1 : Math.max(0, Math.min(1, (vh * 0.88 - t) / (vh * 0.33)));
      m.style.backgroundSize = (p * 100).toFixed(1) + '% 100%';
      m.classList.toggle('in', p > 0.6);
    });
    rails.forEach(function (r) {
      var b = r.s.getBoundingClientRect();
      var top = parseFloat(r.s.style.getPropertyValue('--ry')) || 10;
      r.f.style.height = Math.max(0, Math.min(b.height - top, vh * 0.6 - b.top - top)) + 'px';
    });
    frises.forEach(function (f) {
      var r = f.ol.getBoundingClientRect();
      var h = Math.max(0, Math.min(r.height, vh * 0.6 - r.top));
      f.t.style.height = h + 'px';
    });

    if (toc) {
      var actif = -1;
      entrees.forEach(function (e, k) { if (e.bloc.getBoundingClientRect().top < vh * 0.4) actif = k; });
      var debut = entrees[0].bloc.getBoundingClientRect().top;
      var montrer = debut < vh * 0.8;
      toc.classList.toggle('on', montrer);
      tocLiens.forEach(function (a, k) { a.classList.toggle('on', k === actif); a.classList.toggle('lu', k < actif); });
      var k = Math.max(0, actif);
      if (tocLiens[k]) {
        var li = tocLiens[k];
        fill.style.height = Math.max(0, li.offsetTop + li.offsetHeight / 2 - 10) + 'px';
      }
    }
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(auScroll); } }, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; auScroll(); });
  auScroll();

  /* ═════════════════════════════════════════════════════════════════
     EASTER EGGS
     · « ding » au clavier, ou 5 touches rapides sur le titre (Cloches)
     · « merklin » au clavier, ou 5 touches sur le titre (Grandes Orgues)
     · Vitraux : survoler le titre 3 s, ou le toucher 5 fois
     · Code Konami, ou 3 touches sur une croix de Lorraine
     ═════════════════════════════════════════════════════════════════ */
  var audio = null;
  function ctx() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audio) audio = new AC();
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }

  var toast = el('div', 'egg-toast');
  toast.setAttribute('role', 'status');
  body.appendChild(toast);
  var toastT;
  function annoncer(txt) {
    toast.textContent = txt;
    toast.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toast.classList.remove('on'); }, 3600);
  }

  // Cloche : partiels inharmoniques d'une cloche de bronze (hum, fondamentale, tierce mineure, quinte, octave…)
  function cloche(freq, quand) {
    var c = ctx(); if (!c) return;
    var t = c.currentTime + (quand || 0);
    var sortie = c.createGain(); sortie.gain.value = 0.22; sortie.connect(c.destination);
    [[0.5, 0.9, 9], [1, 1, 6], [1.183, 0.55, 4.5], [1.506, 0.45, 3.5], [2, 0.5, 3], [2.514, 0.25, 2], [3.011, 0.18, 1.6], [4.166, 0.1, 1.1]]
      .forEach(function (p) {
        var o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = freq * p[0];
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(p[1], t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + p[2]);
        o.connect(g); g.connect(sortie); o.start(t); o.stop(t + p[2] + 0.1);
      });
  }
  function sonnerCloches() {
    // Volée de trois cloches, du bourdon à la plus aiguë
    [[196, 0], [261.6, 0.7], [329.6, 1.25], [196, 1.9], [261.6, 2.5]].forEach(function (n) { cloche(n[0], n[1]); });
    if (h1) { h1.classList.remove('egg-swing'); void h1.offsetWidth; h1.classList.add('egg-swing'); }
    annoncer('Les cloches de Saint-Epvre sonnent la volée');
  }

  // Orgue : jeux de fonds (8′ + 4′ + 2′), léger tremblant, et les tuyaux s'allument
  function orgue() {
    var c = ctx(); if (!c) return;
    var tuyaux = el('div', 'egg-orgue');
    var hauteurs = [70, 96, 128, 160, 196, 230, 196, 160, 128, 96, 70];
    hauteurs.forEach(function (h) { var i = el('i'); i.style.height = h + 'px'; tuyaux.appendChild(i); });
    body.appendChild(tuyaux);
    requestAnimationFrame(function () { tuyaux.classList.add('on'); });
    var accords = [[130.8, 164.8, 196, 261.6], [110, 130.8, 164.8, 220], [116.5, 146.8, 174.6, 233.1], [130.8, 164.8, 196, 261.6]];
    var sortie = c.createGain(); sortie.gain.value = 0.06; sortie.connect(c.destination);
    var trem = c.createOscillator(), tremG = c.createGain();
    trem.frequency.value = 5.2; tremG.gain.value = 0.012; trem.connect(tremG); tremG.connect(sortie.gain); trem.start();
    var t0 = c.currentTime + 0.05, d = 1.6;
    accords.forEach(function (acc, k) {
      var t = t0 + k * d;
      acc.forEach(function (f, j) {
        [1, 2, 4].forEach(function (mult, m) {
          var o = c.createOscillator(), g = c.createGain();
          o.type = m === 0 ? 'triangle' : 'sine';
          o.frequency.value = f * mult;
          var v = [1, 0.45, 0.2][m];
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(v, t + 0.08);
          g.gain.setValueAtTime(v, t + d - 0.05);
          g.gain.linearRampToValueAtTime(0, t + d + (k === accords.length - 1 ? 1.4 : 0.05));
          o.connect(g); g.connect(sortie); o.start(t); o.stop(t + d + 1.5);
        });
      });
      setTimeout(function () {
        $$('i', tuyaux).forEach(function (p, n) { p.classList.toggle('joue', (n + k) % 3 === 0); });
      }, (t - c.currentTime) * 1000);
    });
    var fin = (accords.length * d + 1.6) * 1000;
    setTimeout(function () { tuyaux.classList.remove('on'); trem.stop(); }, fin);
    setTimeout(function () { tuyaux.remove(); }, fin + 700);
    annoncer('Les grandes orgues Merklin vous saluent');
  }

  // Vitrail : le titre devient verre coloré, des taches de lumière traversent la page
  var vitrailFait = false;
  function vitrail() {
    if (!h1) return;
    h1.classList.add('egg-vitrail');
    if (!vitrailFait) {
      vitrailFait = true;
      var l = el('div', 'egg-lumiere');
      ['#1d4fa0', '#b3261e', '#e6b422', '#2f7d4a', '#6b2fa0'].forEach(function (c, i) {
        var t = el('i');
        t.style.background = c;
        t.style.left = (i * 19 - 10) + 'vw';
        t.style.top = ((i * 37) % 70 - 10) + 'vh';
        t.style.animationDelay = (-i * 1.7) + 's';
        l.appendChild(t);
      });
      body.appendChild(l);
      requestAnimationFrame(function () { l.classList.add('on'); });
      setTimeout(function () { l.classList.remove('on'); }, 9000);
    }
    annoncer('La lumière des vitraux de Geyling traverse la nef');
  }

  // Carte de l'abbé Trouillet
  function trouillet() {
    if (document.querySelector('.egg-carte')) return;
    var carte = el('div', 'egg-carte',
      '<div role="dialog" aria-label="Mgr Joseph Trouillet">'
      + '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">'
      + '<line x1="32" y1="4" x2="32" y2="60"/><line x1="22" y1="16" x2="42" y2="16"/><line x1="16" y1="28" x2="48" y2="28"/>'
      + '<circle cx="32" cy="32" r="29" stroke-width="0.8"/></svg>'
      + '<h3>Joseph Trouillet</h3>'
      + '<p>Vous avez trouvé le curé bâtisseur. À partir de 1865, il quête sans relâche pour sa nouvelle église : l\'empereur François-Joseph, Napoléon III et le pape Pie IX figurent parmi les donateurs.</p>'
      + '<button type="button">Refermer</button></div>');
    body.appendChild(carte);
    requestAnimationFrame(function () { carte.classList.add('on'); });
    var fermer = function () { carte.classList.remove('on'); setTimeout(function () { carte.remove(); }, 400); };
    carte.querySelector('button').addEventListener('click', fermer);
    carte.addEventListener('click', function (e) { if (e.target === carte) fermer(); });
    carte.querySelector('button').focus();
  }

  // Mots tapés au clavier + code Konami
  var tape = '', konami = 'ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a', touches = [];
  document.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input, textarea, [contenteditable]')) return;
    touches.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    touches = touches.slice(-10);
    if (touches.join(' ') === konami) { touches = []; trouillet(); return; }
    if (e.key.length !== 1) return;
    tape = (tape + e.key.toLowerCase()).slice(-12);
    if (/ding$/.test(tape)) { tape = ''; sonnerCloches(); }
    else if (/merklin$/.test(tape)) { tape = ''; orgue(); }
    else if (/vitrail$/.test(tape)) { tape = ''; vitrail(); }
  });

  // Touches répétées sur le titre de la page
  var page = location.pathname;
  function actionTitre() {
    if (/orgues/.test(page)) return orgue;
    if (/vitraux/.test(page)) return vitrail;
    if (/trouillet/.test(page)) return trouillet;
    return sonnerCloches;
  }
  if (h1) {
    var n = 0, nT;
    h1.addEventListener('click', function () {
      n++; clearTimeout(nT);
      nT = setTimeout(function () { n = 0; }, 900);
      if (n >= 5) { n = 0; actionTitre()(); }
    });
    if (/vitraux/.test(page)) {
      var survol;
      h1.addEventListener('mouseenter', function () { survol = setTimeout(vitrail, 3000); });
      h1.addEventListener('mouseleave', function () { clearTimeout(survol); });
    }
  }

  // Trois touches sur une croix de Lorraine
  var nc = 0, ncT;
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.l-orn')) return;
    nc++; clearTimeout(ncT);
    ncT = setTimeout(function () { nc = 0; }, 900);
    if (nc >= 3) { nc = 0; trouillet(); }
  });
})();
