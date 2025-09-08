import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: __dirname, // tells Vite that index.html is in popup/
  base: './',  
  build: {
    outDir: '../dist/popup',
    emptyOutDir: true,
  },
});
