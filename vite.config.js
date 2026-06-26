import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const manifest = {
  name: 'Little Heartbeat',
  short_name: 'Heartbeat',
  description: 'AI-powered pregnancy safety companion with real-time emergency alerts and health tracking',
  start_url: '/',
  display: 'standalone',
  background_color: '#FFF8FA',
  theme_color: '#E8517A',
  orientation: 'portrait-primary',
  scope: '/',
  lang: 'en',
  categories: ['health', 'medical', 'lifestyle'],
  icons: [
    { src: '/assets/images/icon-72.png', sizes: '72x72', type: 'image/png', purpose: 'maskable any' },
    { src: '/assets/images/icon-96.png', sizes: '96x96', type: 'image/png', purpose: 'maskable any' },
    { src: '/assets/images/icon-128.png', sizes: '128x128', type: 'image/png', purpose: 'maskable any' },
    { src: '/assets/images/icon-144.png', sizes: '144x144', type: 'image/png', purpose: 'maskable any' },
    { src: '/assets/images/icon-152.png', sizes: '152x152', type: 'image/png', purpose: 'maskable any' },
    { src: '/assets/images/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
    { src: '/assets/images/icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'maskable any' },
    { src: '/assets/images/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' },
  ],
  shortcuts: [
    {
      name: 'My Medicines',
      short_name: 'Care',
      description: 'View today\'s medications',
      url: '/care',
      icons: [{ src: '/assets/images/icon-96.png', sizes: '96x96' }],
    },
    {
      name: 'Emergency SOS',
      short_name: 'SOS',
      description: 'Call emergency services',
      url: '/sos',
      icons: [{ src: '/assets/images/icon-96.png', sizes: '96x96' }],
    },
  ],
};

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
      manifest,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'supabase-cache', expiration: { maxEntries: 50, maxAgeSeconds: 300 } },
          },
          {
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'maps-cache', expiration: { maxEntries: 30, maxAgeSeconds: 3600 } },
          },
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
  resolve: {
    alias: { '@': '/frontend/src' },
  },
  esbuild: {
    loader: 'jsx',
    include: /frontend\/src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
