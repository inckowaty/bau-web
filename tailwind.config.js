// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,mdx}',   // obejmuje KAŻDY plik w src/
  ],
  theme: {
    extend: {
      colors: {
        primary: { 900: '#12111f', 700: '#1e1d2d' },
        accent:  { 500: '#feb81a', 300: '#ffd564' },
        neutral: {  50: '#ffffff', 100: '#f7f7f9', 400: '#d1d2d6' },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
};
