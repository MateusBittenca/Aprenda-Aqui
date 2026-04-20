/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f5f7f9',
        background: '#f5f7f9',
        'on-surface': '#2c2f31',
        'on-surface-variant': '#595c5e',
        primary: '#0055c5',
        'primary-dim': '#004aad',
        'primary-container': '#739eff',
        secondary: '#2a6900',
        'secondary-container': '#84fb42',
        'on-secondary-container': '#245c00',
        tertiary: '#8319da',
        'tertiary-dim': '#7500c8',
        'tertiary-container': '#cd9bff',
        'on-tertiary': '#fbefff',
        'surface-container-low': '#eef1f3',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#dfe3e6',
        'surface-container-highest': '#d9dde0',
        'secondary-fixed': '#84fb42',
        'tertiary-fixed': '#cd9bff',
        outline: '#747779',
        error: '#b31b25',
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        headline: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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
        elevated: '0 20px 40px rgba(44, 47, 49, 0.06)',
        card: '0 20px 40px rgba(44, 47, 49, 0.04)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
