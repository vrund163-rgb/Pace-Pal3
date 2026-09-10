/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        turf: {
          950: '#0D1310',
          900: '#121A15',
          800: '#1A251E',
          700: '#243428',
          600: '#324A38',
          500: '#4C7A3F',
        },
        chalk: {
          100: '#F5F1E7',
          300: '#DAD4C4',
          500: '#A8A192',
        },
        seam: {
          600: '#8C2A22',
          500: '#B33027',
          400: '#C7473B',
        },
        amber: {
          500: '#D9A441',
        },
        slateg: {
          400: '#7C8680',
          500: '#6B7680',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
