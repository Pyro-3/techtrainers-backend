import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker'; // optional for type safety

export default defineConfig({
  plugins: [
    react(),
    checker({ typescript: true }) // optional: gives live type errors in browser
  ],
  resolve: {
    preserveSymlinks: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
