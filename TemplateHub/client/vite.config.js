import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Use IIFE format for theme.min.js
        format: 'iife',
        // Ensures all dependencies are bundled together
        inlineDynamicImports: true,
        // Global variable name for your bundle
        name: 'ThemeBundle'
      }
    },
    // Output directory
    outDir: 'dist',
    // Assets directory
    assetsDir: 'assets'
  }
})
