// @ts-check
import { defineConfig } from 'astro/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const lineIconsEsm = path.resolve(
  rootDir,
  'node_modules/@lineiconshq/free-icons/dist/index.esm.js',
);
// https://astro.build/config
export default defineConfig({
  site: 'https://imgify.com',
  output: 'static',
  integrations: [react(), sitemap()],
  adapter: cloudflare({
    // Use Node for prerender during dev — workerd breaks CJS deps like React
    prerenderEnvironment: 'node',
  }),
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@lineiconshq/free-icons': lineIconsEsm,
      },
      dedupe: ['react', 'react-dom'],
    },
    environments: {
      client: {
        optimizeDeps: {
          // Avoid Cloudflare + React dev race that breaks react-dom/client hydration.
          noDiscovery: true,
          include: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            'react-dom/client',
            '@lineiconshq/free-icons',
            'jszip',
          ],
        },
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-dom/client',
        'jszip',
      ],
    },
    ssr: {
      noExternal: ['@lineiconshq/free-icons'],
    },
  },
});