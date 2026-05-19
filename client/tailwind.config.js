/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#022c22',
          900: '#064e3b',
          800: '#065f46',
          700: '#0f766e',
          600: '#0d9488',
          500: '#14b8a6',
          50: '#f0fdfa'
        },
        gold: {
          50: '#fefdf6',
          100: '#fdfce7',
          200: '#faf7c3',
          300: '#f5ef92',
          400: '#ebd94e',
          500: '#d4af37', // Brand Gold
          600: '#b28e28', // Darker Gold
          700: '#8e6c1e',
          800: '#70521c',
          900: '#543d1a'
        },
        cream: {
          50: '#fdfbf7',
          100: '#faf6ee',
          200: '#f3ead8',
          300: '#ebdbc1',
          400: '#debd98'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Outfit"', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
