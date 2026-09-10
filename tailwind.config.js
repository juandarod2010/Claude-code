/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0d1b2a',
        brand: {
          50: '#eef4ff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        alert: '#b91c1c',
      },
    },
  },
  plugins: [],
};
