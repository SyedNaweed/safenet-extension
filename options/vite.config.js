import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  base: './',  
  build: {
    outDir: resolve(__dirname, '../dist/options'),
    emptyOutDir: true,
  },
  plugins: [react()],
});
