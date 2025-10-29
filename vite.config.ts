import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  ssr: {
    noExternal: ['@apollo/client'],
  },
  optimizeDeps: {
    include: ['@apollo/client'],
    exclude: [],
  },
  resolve: {
    dedupe: ['@apollo/client'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});