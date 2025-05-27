AIAmigo™ PWA-tilføjelser

Placering:
- manifest.json       → /public/
- service-worker.js   → /public/
- icons/              → /public/icons/

Tilføj til src/index.js:
---------------------------------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
---------------------------------

Ikoner skal være i PNG-format, 192x192 og 512x512.

Husk at hoste via HTTPS.
