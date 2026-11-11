/* Refonte commune : regroupe l'en-tête des pages de texte dans une bande bordeaux,
   et, sur écran tactile, anime la ligne de sommaire qui passe au milieu de l'écran. */
(function () {
  var h1 = document.querySelector('h1.titre-page, h1.page-title');
  if (h1 && !h1.closest('.hero')) {
    var bande = document.createElement('div'); bande.className = 'r-ouverture';
    var avant = h1.previousElementSibling, apres = h1.nextElementSibling;
    h1.parentNode.insertBefore(bande, h1);
    if (avant && /surtitre|eyebrow|label/.test(avant.className)) bande.appendChild(avant);
    bande.appendChild(h1);
    while (apres && /sous-titre|subtitle|trait|title-rule|page-sub|chapeau/.test(apres.className)) { var n = apres.nextElementSibling; bande.appendChild(apres); apres = n; }
  }
  if (matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('actif', e.isIntersecting); }); }, { rootMargin: '-42% 0px -42% 0px' });
    document.querySelectorAll('nav.sommaire li').forEach(function (l) { io.observe(l); });
  }
})();
