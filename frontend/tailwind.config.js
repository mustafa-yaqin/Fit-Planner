export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f5f4ef',    // page background
        sky: '#e4eef2',      // soft section background
        teal: '#8fbccb',     // main blue-teal from the reference
        tealDark: '#245566', // readable teal for text and links
        navy: '#1b2f45',     // text, buttons, footer
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
