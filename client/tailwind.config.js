/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#090d16',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
