/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F7F5F0',
        card: '#FFFFFF',
        ink: '#1B1B18',
        sub: '#6E6B62',
        line: '#E4E0D5',
        accent: '#C8102E',
        'accent-dim': '#F4DDDF',
        ok: '#2F6B4F',
        'ok-bg': '#E5F1EA'
      },
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif']
      }
    }
  },
  plugins: []
};
