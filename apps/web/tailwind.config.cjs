/**
 * Breakpoints (mobile-first; prefixo min-width):
 * - default / sm: 640px — celular amplo / “phablet” (ajustes finos sem mudar tablet)
 * - md: 768px — tablet (alinhado a padrão da indústria)
 * - lg: 1024px — desktop compacto
 * - xl: 1280px — (Tailwind default)
 * - wide: 1440px — desktop largo (extend; use wide:* para heróis e grids amplos)
 * Faixa < 768px não exige media query nomeada “320”: estilos base cobrem telefones estreitos.
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        /** Desktop largo — p.ex. max-width de landing e galerias */
        wide: '1440px',
      },
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
        /** Entrada suave com leve subida — ritmo iOS (spring curto).
         * 6px é o sweet spot: perceptível mas sem disparar scrollbar transitória. */
        'fade-up': {
          '0%': { opacity: '0', transform: 'translate3d(0, 6px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        /** Escala que “encaixa” (overshoot curto, estilo spring Apple). */
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '60%': { transform: 'scale(1.01)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        /** Pop de celebração (ex.: badge desbloqueada, streak batido). */
        pop: {
          '0%': { transform: 'scale(0.85)' },
          '50%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)' },
        },
        /** Shimmer contínuo para barras em progresso / skeletons. */
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        /** Slide-up de folha inferior (sheet iOS). */
        'sheet-up': {
          '0%': { opacity: '0', transform: 'translate3d(0, 24px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        /** Pulso anelar suave (presença/online). */
        'ring-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.45)' },
          '70%': { boxShadow: '0 0 0 6px rgba(16,185,129,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 1s infinite',
        'float-slow': 'float 8s ease-in-out 0.5s infinite',
        'fade-up': 'fade-up 420ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 300ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 360ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        pop: 'pop 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        shimmer: 'shimmer 2.4s linear infinite',
        'sheet-up': 'sheet-up 320ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'ring-pulse': 'ring-pulse 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      /** Curvas de easing estilo Apple, reutilizáveis em transition-timing. */
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ios-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'ios-in': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        soft: '0 20px 50px -12px rgba(15, 23, 42, 0.12)',
        elevated: '0 20px 40px rgba(44, 47, 49, 0.06)',
        card: '0 20px 40px rgba(44, 47, 49, 0.04)',
        /** Elevação mais presente em hover (lift Apple). */
        lifted: '0 24px 48px -18px rgba(30, 27, 75, 0.25)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
