/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 1s infinite',
        'float-slow': 'float 8s ease-in-out 0.5s infinite',
      },
      boxShadow: {
        soft: '0 20px 50px -12px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
