/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        theater: {
          black: '#0a0a0a',
          red: '#e50914',
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
