import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

// Registra suporte PWA (Manifest e Service Worker para instalação e uso offline na Web)
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);
  }
  if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#0F172A';
    document.head.appendChild(meta);
  }
  if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
    const appleMeta = document.createElement('meta');
    appleMeta.name = 'apple-mobile-web-app-capable';
    appleMeta.content = 'yes';
    document.head.appendChild(appleMeta);
  }
  if ('serviceWorker' in navigator && typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('SW registration error:', err);
      });
    });
  }
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
