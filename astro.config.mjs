import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://kiseljusteater.ee',
  output: 'static',
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
  integrations: [react()]
});
