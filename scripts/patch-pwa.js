// Script para garantir que o dist/index.html contenha as tags de PWA
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');

  const pwaTags = `
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#0F172A" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="CRUX" />
    <link rel="apple-touch-icon" href="/icon.png" />
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js').catch(function(err) {
            console.log('SW registration failed:', err);
          });
        });
      }
    </script>
  </head>`;

  if (!html.includes('rel="manifest"')) {
    html = html.replace('</head>', pwaTags);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('✓ PWA tags e Service Worker injetados com sucesso em dist/index.html');
  }
}
