/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          50: '#fdf2f3',
          100: '#fbe4e6',
          200: '#f7c9cc',
          300: '#f09fa5',
          400: '#e36a74',
          500: '#b21c2c',
          600: '#941421',
          700: '#7a0e19',
          800: '#610a12',
          850: '#55080f',
          900: '#4f080e',
          950: '#2b0306'
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
