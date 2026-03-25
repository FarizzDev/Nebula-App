import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Capacitor butuh base '/'
  base: '/',
  build: {
    outDir: 'dist',
    // Sourcemap untuk debugging
    sourcemap: false,
  },
})
