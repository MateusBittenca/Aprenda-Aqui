import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    /** Acesso pelo IP local ou por túnel (ngrok, etc.). */
    host: true,
    /**
     * Sem isso, o Vite responde 403 / bloqueia quando o Host é *.ngrok-free.app.
     * Só afeta o servidor de desenvolvimento.
     */
    allowedHosts: true,
    /** Evita que o navegador sirva JS/CSS antigos no F5 (sem precisar Ctrl+F5). */
    headers: {
      'Cache-Control': 'no-store',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    headers: {
      'Cache-Control': 'no-store',
    },
  },
})
