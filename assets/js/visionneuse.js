/* Visionneuse commune : un clic sur une photo (dans l'oculus, l'éventail, les blocs…) l'affiche en grand.
   Fermeture : grande croix, touche Échap, ou clic à côté de l'image. */
(function () {
  var SEL = '.visuel-img:not(.grav), .eventail .carte, .duo img, .arcade .baie, .fiche-carte .couv, figure img, article img, .page img, .carrousel-diapo img, .planche img';
  var css = document.createElement('style');
  css.textContent = [
    SEL.split(',').map(function (s) { return s.trim(); }).join(',') + '{cursor:zoom-in}',
    '.vz{position:fixed;inset:0;z-index:500;display:grid;place-items:center;padding:clamp(16px,4vw,48px);background:rgba(20,10,12,.94);opacity:0;visibility:hidden;transition:opacity .35s,visibility 0s .35s}',
    '.vz.ouverte{opacity:1;visibility:visible;transition:opacity .35s}',
    '.vz img{max-width:100%;max-height:calc(100svh - 7rem);border-radius:12px;object-fit:contain;transform:scale(.94);transition:transform .5s cubic-bezier(.22,1,.36,1)}',
    '.vz.ouverte img{transform:none}',
    '.vz p{position:absolute;left:0;right:0;bottom:18px;margin:0;text-align:center;color:#fff;font:500 1rem "Familjen Grotesk",Arial,sans-serif;opacity:.85;padding:0 70px}',
    '.vz button{position:absolute;top:14px;right:14px;width:64px;height:64px;padding:14px;border:0;background:none;color:#fff;cursor:pointer;transition:transform .35s}',
    '.vz button:hover{transform:rotate(90deg)}',
    '.vz button svg{width:100%;height:100%}'
  ].join('');
  document.head.appendChild(css);
  var vz = document.createElement('div'); vz.className = 'vz'; vz.setAttribute('role', 'dialog'); vz.setAttribute('aria-modal', 'true');
  vz.innerHTML = '<img alt=""><p></p><button type="button" aria-label="Fermer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M4 4l16 16M20 4L4 20"/></svg></button>';
  document.body.appendChild(vz);
  var img = vz.querySelector('img'), leg = vz.querySelector('p');
  function source(el) {
    if (el.tagName === 'IMG') return el.currentSrc || el.src;
    var m = getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/); return m ? m[1] : '';
  }
  function ouvre(el) {
    var src = source(el).replace(/-p\.jpg$/, '.jpg'); if (!src) return;
    img.src = src; img.alt = el.getAttribute('aria-label') || el.alt || '';
    var l = el.getAttribute('aria-label') || el.alt || '';
    var cap = el.closest('figure, .visuel'); var c = cap && cap.querySelector('figcaption, .visuel-leg');
    leg.textContent = c ? c.textContent : l;
    vz.classList.add('ouverte'); document.body.style.overflow = 'hidden';
  }
  function ferme() { vz.classList.remove('ouverte'); document.body.style.overflow = ''; }
  document.addEventListener('click', function (e) {
    var el = e.target.closest(SEL);
    if (el && !vz.contains(el) && !el.closest('a, button, nav, .lb, .vision, .lightbox')) {
      ouvre(el);
    }
  });
  vz.addEventListener('click', function (e) { if (e.target !== img) ferme(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') ferme(); });
})();
