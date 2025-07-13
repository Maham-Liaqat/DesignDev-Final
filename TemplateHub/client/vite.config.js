import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // ✅ IMPORTANT: Fixes routing & asset 404s on Vercel
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        name: 'ThemeBundle'
      }
    },
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
