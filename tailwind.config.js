/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF3E7',
        'brown-900': '#2B1810',
        'brown-700': '#4A2F1F',
        turmeric: '#D9A02C',
        chili: '#B4402A',
        curry: '#4C7A4E',
        clay: '#8C5A3C',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
