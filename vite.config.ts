import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

// BASE_PATH is set by the GitHub Pages workflow to "/<repository>/".
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Konjugator3000',
        short_name: 'Konjugator',
        description: 'Practise Spanish and Italian verb conjugation.',
        lang: 'en',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#0e1014',
        theme_color: '#0e1014',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Language data is split into its own chunks; cache everything so the app works offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        globIgnores: ['**/*-cyrillic*', '**/*-greek*', '**/*-vietnamese*']
      }
    })
  ],
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs']
  }
});
