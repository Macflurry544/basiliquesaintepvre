/* Balade en drone dans le nuage de points LiDAR de la basilique Saint-Epvre.
   Données : /assets/3d/basilique.ply (binaire : x est, y nord, z hauteur au-dessus de la place, classe, intensité).
   Repère three.js : x = est, y = hauteur, z = -nord. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const balade = document.getElementById('balade');
const scene3 = document.getElementById('scene');
const charg = document.getElementById('chargement');
const chargTxt = document.getElementById('chargement-txt');
const chargBarre = document.getElementById('chargement-barre');
const jauge = document.getElementById('jauge');
const chapitres = [...document.querySelectorAll('.chap')];
const libre = document.getElementById('libre');

/* ---- Repères mesurés dans le nuage (est, nord, hauteur) ---- */
const REPERES = [
  { xyz: [-16.17, 32.70, 81.56], t: 'Sommet de la flèche', s: '81,6 m mesurés', chap: [2, 5] },
  { xyz: [-3.25, 6.74, 32.84], t: 'Faîte de la nef', s: '33 m', chap: [6, 7] },
  { xyz: [6.09, -12.62, 32.79], t: 'Croisée du transept', s: '40 × 27 m', chap: [8, 9] },
  { xyz: [14.97, -31.01, 21.81], t: 'Chevet', s: 'abside à cinq pans', chap: [11, 12] },
  { xyz: [-9.31, -20.06, 34.07], t: 'Bras nord', s: '', chap: [9, 10] },
  { xyz: [21.53, -5.17, 32.03], t: 'Bras sud', s: '', chap: [9, 9] },
];
const V = (e, n, h) => new THREE.Vector3(e, h, -n);

/* ---- Trajet du drone : positions et cibles (est, nord, hauteur), un point par chapitre ---- */
const TRAJET = [
  { p: V(-175, -60, 6), c: V(-16, 33, 30) },      // 0 la place : départ au ras du sol, loin au sud-ouest
  { p: V(-62, 22, 7), c: V(-20, 36, 9) },         // 1 le portail, à hauteur d’homme
  { p: V(-74, 2, 16), c: V(-16, 33, 22) },        // 2 le pied de la tour et l’escalier
  { p: V(-56, 48, 40), c: V(-16, 33, 42) },       // 3 le beffroi
  { p: V(-40, 60, 64), c: V(-16, 33, 62) },       // 4 les clochetons
  { p: V(-34, 48, 96), c: V(-16, 33, 82) },       // 5 au-dessus de la flèche
  { p: V(24, 32, 18), c: V(4, 10, 20) },          // 6 le flanc sud : arcs-boutants
  { p: V(-14, 22, 46), c: V(-2, -4, 33) },        // 7 le toit de la nef vers le chœur
  { p: V(-2, -2, 60), c: V(6, -13, 40) },         // 8 le campanile de la croisée
  { p: V(16, -4, 44), c: V(6, -13, 33) },         // 9 la croisée du transept
  { p: V(-40, -36, 16), c: V(-10, -21, 24) },     // 10 le bras nord et sa rose
  { p: V(44, -46, 28), c: V(15, -31, 22) },       // 11 le chevet, vu du sud-est
  { p: V(30, -58, 12), c: V(14, -32, 18) },       // 12 les pinacles des chapelles
  { p: V(0, -95, 20), c: V(0, -10, 22) },         // 13 on contourne par l’est
  { p: V(-120, -40, 40), c: V(-6, 0, 24) },       // 14 on reprend du champ
  { p: V(0.5, 0.5, 175), c: V(0, 0, 0) },         // 15 à la verticale : le plan en croix latine
];
const courbeP = new THREE.CatmullRomCurve3(TRAJET.map(k => k.p), false, 'centripetal', .4);
const courbeC = new THREE.CatmullRomCurve3(TRAJET.map(k => k.c), false, 'centripetal', .4);

/* ---- Scène ---- */
const FOND = 0x213448;
const scene = new THREE.Scene();
scene.background = new THREE.Color(FOND);
scene.fog = new THREE.Fog(FOND, 170, 380);
const camera = new THREE.PerspectiveCamera(60, 1, .5, 900);
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
scene3.insertBefore(renderer.domElement, scene3.firstChild);

const grille = new THREE.GridHelper(300, 30, 0x3a5070, 0x2b4160);
grille.position.y = -.4; grille.material.transparent = true; grille.material.opacity = .22;
scene.add(grille);

/* Points ronds, blancs, taille selon la distance, sol en retrait */
const mat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uTaille: { value: 1.15 }, uEchelle: { value: 600 } },
  vertexShader: `
    attribute float poids; varying float vA;
    uniform float uTaille, uEchelle;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      float d = -mv.z;
      gl_PointSize = clamp(uTaille * uEchelle / d, 1.2, 6.5) * (poids < .5 ? .75 : 1.0);
      vA = (poids < .5 ? .22 : .42 + .4 * poids) * smoothstep(380.0, 90.0, d);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: `
    varying float vA;
    void main() {
      vec2 q = gl_PointCoord - .5; float r = dot(q, q);
      if (r > .25) discard;
      float a = vA * smoothstep(.25, .08, r);
      gl_FragColor = vec4(vec3(.98, .97, .95) * a, a);
    }`,
});

let geo = null, nb = 0, cls = null, inten = null;
async function charge() {
  try {
    const rep = await fetch('/assets/3d/basilique.ply');
    if (!rep.ok) throw new Error(rep.status);
    const total = +rep.headers.get('content-length') || 0;
    const lecteur = rep.body.getReader(); const morceaux = []; let recu = 0;
    for (;;) {
      const { done, value } = await lecteur.read(); if (done) break;
      morceaux.push(value); recu += value.length;
      if (total) chargBarre.style.width = Math.round(100 * recu / total) + '%';
      chargTxt.textContent = (recu / 1048576).toFixed(1) + ' Mo' + (total ? ' sur ' + (total / 1048576).toFixed(1) : '');
    }
    const buf = new Uint8Array(recu); let o = 0; for (const m of morceaux) { buf.set(m, o); o += m.length; }
    construit(buf.buffer);
  } catch (e) {
    charg.classList.add('erreur'); charg.firstChild.textContent = 'Le nuage n’a pas pu être chargé.'; chargTxt.textContent = 'Vérifiez la connexion puis rechargez la page.';
    console.error(e);
  }
}
function construit(ab) {
  const txt = new TextDecoder().decode(new Uint8Array(ab, 0, Math.min(ab.byteLength, 2048)));
  const fin = txt.indexOf('end_header\n'); const entete = txt.slice(0, fin);
  nb = +entete.match(/element vertex (\d+)/)[1];
  const dv = new DataView(ab, fin + 'end_header\n'.length); const pas = 14;
  const pos = new Float32Array(nb * 3); const poids = new Float32Array(nb); cls = new Uint8Array(nb); inten = new Uint8Array(nb);
  for (let i = 0; i < nb; i++) {
    const b = i * pas;
    pos[i * 3] = dv.getFloat32(b, true); pos[i * 3 + 2] = -dv.getFloat32(b + 4, true); pos[i * 3 + 1] = dv.getFloat32(b + 8, true);
    cls[i] = dv.getUint8(b + 12); inten[i] = dv.getUint8(b + 13);
    poids[i] = cls[i] === 2 ? 0 : .5 + .5 * inten[i] / 255;
  }
  geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('poids', new THREE.BufferAttribute(poids, 1));
  scene.add(new THREE.Points(geo, mat));
  document.body.classList.add('pret');
  boucle();
}

/* ---- Étiquettes ---- */
const etiquettes = REPERES.map(r => {
  const el = document.createElement('div'); el.className = 'rep';
  el.innerHTML = '<b></b><small></small>'; el.firstChild.textContent = r.t; el.lastChild.textContent = r.s;
  if (!r.s) el.lastChild.remove();
  scene3.appendChild(el); return { el, r, v: V(r.xyz[0], r.xyz[1], r.xyz[2] + 1.2) };
});
const proj = new THREE.Vector3();
function placeReperes(chap, tout) {
  const w = scene3.clientWidth, h = scene3.clientHeight;
  for (const e of etiquettes) {
    const actif = tout ? !!e.r.s : (chap >= e.r.chap[0] && chap <= e.r.chap[1]);
    proj.copy(e.v).project(camera);
    const px = (proj.x + 1) / 2 * w, py = (1 - proj.y) / 2 * h;
    const vu = actif && proj.z < 1 && px > 90 && px < w - 90 && py > 110 && py < h - 60;
    e.el.classList.toggle('vu', vu);
    if (vu) e.el.style.transform = 'translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px)';
  }
}

/* ---- Défilement → progression ---- */
let avancement = 0, lisse = 0, enLibre = false;
function mesure() {
  const r = balade.getBoundingClientRect(); const vh = innerHeight;
  avancement = Math.min(1, Math.max(0, -r.top / (r.height - vh)));
}
let dernierDefil = performance.now(), tween = null;
addEventListener('scroll', () => { mesure(); dernierDefil = performance.now(); if (!tween) continuer.classList.remove('vu'); }, { passive: true });
addEventListener('resize', mesure); mesure();

/* « Continuer l’expérience » : après quelques secondes sans défilement, un bouton emmène à l’étape suivante */
const continuer = document.getElementById('continuer');
function versEtape(k) {
  const r = balade.getBoundingClientRect(); const h = r.height - innerHeight; const debut = scrollY;
  const cible = scrollY + r.top + h * Math.min(1, k / (TRAJET.length - 1));
  const t0 = performance.now(), duree = 2600;
  cancelAnimationFrame(tween);
  (function pas(now) {
    const u = Math.min(1, (now - t0) / duree); const e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    scrollTo(0, debut + (cible - debut) * e);
    if (u < 1) tween = requestAnimationFrame(pas); else { tween = null; dernierDefil = performance.now(); }
  })(t0);
}
continuer.addEventListener('click', () => {
  continuer.classList.remove('vu');
  const seg = Math.floor(avancement * (TRAJET.length - 1) + 1e-6);
  versEtape(seg + 1);
});
function majContinuer() {
  const inactif = performance.now() - dernierDefil > 4500;
  const dansBalade = avancement > 0.005 && avancement < 0.985;
  continuer.classList.toggle('vu', inactif && dansBalade && !enLibre && !tween);
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = .07; controls.enabled = false;
controls.maxPolarAngle = Math.PI / 2 + .02; controls.minDistance = 12; controls.maxDistance = 320;
function modeLibre(on) {
  if (on === enLibre) return;
  enLibre = on; controls.enabled = on; document.body.classList.toggle('libre', on);
  if (on) { camera.up.set(0, 1, 0); camera.position.set(-110, 48, 70); controls.target.set(-4, 22, -6); controls.update(); }
}
libre.addEventListener('click', () => { modeLibre(true); scene3.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
document.getElementById('reprendre').addEventListener('click', () => { modeLibre(false); mesure(); });

/* ---- Rendu ---- */
const pPrec = new THREE.Vector3(), tmpP = new THREE.Vector3(), tmpC = new THREE.Vector3(), lateral = new THREE.Vector3(), avant = new THREE.Vector3(), croix = new THREE.Vector3();
let roulis = 0;
function taille() {
  const w = scene3.clientWidth, h = scene3.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 72 : 60; camera.updateProjectionMatrix();
  mat.uniforms.uEchelle.value = h * .9;
}
new ResizeObserver(taille).observe(scene3); taille();

let tPrec = performance.now();
function boucle() {
  requestAnimationFrame(boucle);
  const now = performance.now(); const dt = Math.min(.1, (now - tPrec) / 1000); tPrec = now;
  const nChap = chapitres.length;
  if (!enLibre) {
    lisse += (avancement - lisse) * (1 - Math.exp(-dt / .19));
    const t = Math.min(.9999, lisse);
    courbeP.getPointAt(t, tmpP); courbeC.getPointAt(t, tmpC);
    // roulis façon drone : on penche dans les virages
    avant.subVectors(tmpC, tmpP).normalize();
    lateral.subVectors(tmpP, pPrec); pPrec.copy(tmpP);
    const vir = lateral.length() > 1e-4 ? croix.crossVectors(avant, lateral.normalize()).y : 0;
    roulis += (THREE.MathUtils.clamp(-vir * 1.4, -.14, .14) - roulis) * .06;
    camera.position.copy(tmpP);
    camera.up.set(Math.sin(roulis), Math.cos(roulis), 0);
    camera.lookAt(tmpC);
    const seg = Math.min(nChap - 1, Math.floor(lisse * (TRAJET.length - 1) + .5));
    chapitres.forEach((c, i) => { c.classList.toggle('on', i === seg); if (i !== seg && c.classList.contains('ouvert')) { c.classList.remove('ouvert'); const b = c.querySelector('.lire-btn'); if (b) { b.setAttribute('aria-expanded', 'false'); b.firstChild.textContent = 'Lire '; } } });
    jauge.style.setProperty('--p', lisse);
    placeReperes(seg, false); majContinuer();
  } else {
    controls.update(); placeReperes(0, true);
  }
  renderer.render(scene, camera);
}

if (matchMedia('(prefers-reduced-motion: reduce)').matches) document.body.classList.add('sans-anim');

charge();
