/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        },
        accent: '#f59e0b',
        'cell-x': '#ef4444',
        'cell-o': '#3b82f6',
      },
      animation: {
        'bounce-in': 'bounceIn 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'pulse-win': 'pulseWin 0.6s ease-in-out infinite',
      },
      keyframes: {
        bounceIn: {
          '0%':   { transform: 'scale(0)', opacity: '0' },
          '60%':  { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseWin: {
          '0%, 100%': { backgroundColor: 'rgba(99,102,241,0.2)' },
          '50%':      { backgroundColor: 'rgba(99,102,241,0.5)' },
        },
      },
    },
  },
  plugins: [],
};
