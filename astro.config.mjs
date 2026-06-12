// @ts-check
import { defineConfig, sessionDrivers } from 'astro/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { BRAND_URL } from './src/lib/brand.ts';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const lineIconsEsm = path.resolve(
  rootDir,
  'node_modules/@lineiconshq/free-icons/dist/index.esm.js',
);

const SERVER_OPTIMIZE_DEPS = [
  'react',
  'react-dom',
  'react-dom/server',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
];

/** Pre-bundle React for Cloudflare workerd SSR — avoids lazy dep discovery splitting React. */
function optimizeServerDeps() {
  return {
    name: 'optimize-server-deps',
    configEnvironment(name) {
      if (name !== 'client') {
        return { optimizeDeps: { include: SERVER_OPTIMIZE_DEPS } };
      }
    },
  };
}

export default defineConfig({
  site: BRAND_URL,
  output: 'static',
  integrations: [react(), sitemap()],
  // Static site — no server sessions; avoids Cloudflare KV auto-provisioning on deploy
  session: {
    driver: sessionDrivers.lruCache({ max: 100 }),
  },
  adapter: cloudflare({
    // Do not set prerenderEnvironment: 'node' — it creates a separate Vite
    // deps_prerender cache for React, so client hydration loads a different
    // React copy than the island component and hooks crash (Invalid hook call).
    imageService: { build: 'compile', runtime: 'passthrough' },
  }),
  vite: {
    plugins: [tailwindcss(), optimizeServerDeps()],
    resolve: {
      alias: {
        '@lineiconshq/free-icons': lineIconsEsm,
      },
      dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom/client',
        '@astrojs/react/client.js',
        '@lineiconshq/free-icons',
        'jszip',
      ],
    },
    ssr: {
      noExternal: ['@lineiconshq/free-icons', 'react', 'react-dom'],
    },
  },
});