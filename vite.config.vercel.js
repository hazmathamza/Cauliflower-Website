// Simple Vite configuration for Vercel
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Set environment variable to indicate we're in Vercel
process.env.VERCEL = 'true';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  build: {
    rollupOptions: {
      external: [
        '@babel/parser',
        '@babel/traverse',
        '@babel/generator',
        '@babel/types'
      ]
    },
    chunkSizeWarningLimit: 1600,
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});