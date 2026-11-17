import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://kiseljusteater.ee',
  output: 'static',
  // Pages are folders (/et/afisha/index.html), so every link ends in a slash: no redirect from /et/afisha to /et/afisha/.
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  i18n: {
    defaultLocale: 'et',
    locales: ['et', 'ru', 'en'],
    routing: {
      prefixDefaultLocale: true,
      // / is the Estonian home page itself (src/pages/index.astro), so no "Redirecting…" screen.
      redirectToDefaultLocale: false
    }
  },
  // Pages are fetched when a link is hovered or touched, so navigation feels instant.
  prefetch: { prefetchAll: true },
  integrations: [react()]
});
