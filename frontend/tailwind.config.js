/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: '#c41e3a',
          green: '#165B33',
          gold: '#FFD700',
          darkRed: '#8B0000',
          lightGreen: '#228B22',
        }
      },
      fontFamily: {
        festive: ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
