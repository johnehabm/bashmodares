/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Cairo"', 'system-ui', 'sans-serif'],
        display: ['"Tajawal"', '"Cairo"', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        900: '900',
      },
      colors: {
        brand: {
          50: '#eefbf3',
          100: '#d6f5e1',
          200: '#aeeac4',
          300: '#7ad9a3',
          400: '#43c07d',
          500: '#1ea35f',
          600: '#12834b',
          700: '#0f693d',
          800: '#105433',
          900: '#0d452b',
          950: '#042717',
        },
        gold: {
          50: '#fbf7ee',
          100: '#f5ecd0',
          200: '#ebd7a0',
          300: '#dfbd6a',
          400: '#d4a443',
          500: '#c08a2e',
          600: '#a56d24',
          700: '#835121',
          800: '#6c4121',
          900: '#5b3820',
          950: '#341e0f',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b0b8c9',
          400: '#8591aa',
          500: '#667390',
          600: '#515c77',
          700: '#434b60',
          800: '#3a4151',
          900: '#343945',
          950: '#22252e',
        },
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(0,0,0,0.08), 0 8px 24px -8px rgba(0,0,0,0.12)',
        glow: '0 0 0 1px rgba(30,163,95,0.25), 0 8px 32px -8px rgba(30,163,95,0.35)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
