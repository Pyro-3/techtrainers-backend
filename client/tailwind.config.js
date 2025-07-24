/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#fef7f7',
          100: '#fdeef0',
          200: '#fbd5da',
          300: '#f8b3bd',
          400: '#f48fa3',
          500: '#ee6b85',
          600: '#e04968',
          700: '#c73650',
          800: '#a52a42',
          900: '#8b253a',
        },
        baby: {
          50: '#fefcfc',
          100: '#fef7f7',
          200: '#fdeef0',
          300: '#fbd5da',
          400: '#f8b3bd',
          500: '#f48fa3',
          600: '#ee6b85',
          700: '#e04968',
          800: '#c73650',
          900: '#a52a42',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};