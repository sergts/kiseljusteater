/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // The logo red (#da0c16) is the site's red: every red-* class derives from it.
        red: {
          300: '#f09ea2',
          400: '#ff6b72', // the logo red lightened for small text on black (4.5:1 contrast)
          500: '#da0c16',
          600: '#da0c16',
          700: '#b00a12',
        },
        theater: {
          black: '#0a0a0a',
          red: '#da0c16',
          white: '#ffffff',
          dark: '#141414',
          card: '#18181b',
        }
      },
      fontFamily: {
        // Self-hosted (@fontsource-variable). Space Grotesk has no Cyrillic, so Inter covers the Russian text.
        sans: ['Space Grotesk Variable', 'Inter Variable', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
};
