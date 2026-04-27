import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      // Pitfall B-1: do NOT auto-update; SW reload mid-survey kills draft session.
      // 'prompt' surfaces an update banner the user can defer until after the survey.
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['practice.json', 'icons/*.png'],
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest,json}'],
        // Never proxy IndexedDB or fetch the practice.json from cache (allow per-request override)
        navigateFallbackDenylist: [/^\/api/],
      },
      manifest: {
        name: 'vqol. VEINES-QOL/Sym tracker',
        short_name: 'vqol',
        description:
          'Patient-owned VEINES-QOL/Sym tracker. Local-only, no telemetry, MIT-licensed.',
        theme_color: '#2a5a8a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  base: './',
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
