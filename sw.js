// Garde la vidéo d'accueil en cache : elle n'est téléchargée qu'une fois.
// Changer VERSION si la vidéo est remplacée.
const VERSION = 'video-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || !url.pathname.startsWith('/assets/video/')) return;
  e.respondWith(serveVideo(e.request, url.pathname));
});

async function serveVideo(request, path) {
  const cache = await caches.open(VERSION);
  let res = await cache.match(path);
  if (!res) {
    res = await fetch(path);
    if (!res.ok) return res;
    await cache.put(path, res.clone());
  }
  const range = request.headers.get('range');
  if (!range) return res;

  // Safari lit les vidéos par plages (206) : on découpe la copie en cache.
  const blob = await res.blob();
  const [, s, e] = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const start = Number(s) || 0;
  const end = e ? Math.min(Number(e), blob.size - 1) : blob.size - 1;
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'video/mp4',
      'Content-Range': `bytes ${start}-${end}/${blob.size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}
