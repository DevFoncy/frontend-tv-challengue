import { defineConfig } from 'vitest/config';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';

// Oldest engine we ship to: the Tizen 4.0 web engine (2018 Samsung TVs) is Chromium 56.
const LEGACY_TARGETS = ['chrome >= 56'];

export default defineConfig({
  plugins: [
    react(),
    // Modern browsers keep the native ES-module bundle. Browsers without module
    // support (Chromium < 61) load a transpiled `nomodule` bundle plus the core-js
    // polyfills detected from actual usage.
    legacy({ targets: LEGACY_TARGETS }),
  ],
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
  build: {
    // plugin-legacy owns `build.target`. The CSS is shared by both bundles, so it is
    // lowered for the oldest engine (e.g. no #RRGGBBAA colours, which need Chrome 62).
    cssTarget: 'chrome56',
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
  },
});
