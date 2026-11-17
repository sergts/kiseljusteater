/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // The logo red (#da0c16) is the site's red: every red-* class derives from it.
        red: {
          300: '#f09ea2',
          400: '#e8484f',
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
        sans: ['Space Grotesk', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['Cinzel', 'Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
};
