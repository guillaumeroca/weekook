import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
/// <reference types="vitest" />

// Configuration générée automatiquement
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react', '@prisma/client'],
  },
  build: {
    rollupOptions: {
      external: ['@prisma/client', 'bcryptjs'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          auth: ['./src/contexts/AuthContext', './src/lib/auth', './src/api/auth'],
          ui: ['lucide-react', 'sonner', 'framer-motion'],
          forms: ['react-hook-form', 'react-day-picker', '@internationalized/date'],
          utils: ['date-fns']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  }
});
