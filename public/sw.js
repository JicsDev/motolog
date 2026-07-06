// Service Worker básico para permitir a instalação do PWA
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Deixa o navegador fazer as requisições normais
});
