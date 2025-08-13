import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  build: {
    outDir: resolve(__dirname, '../dist/options'),
    emptyOutDir: true,
  },
  plugins: [react()],
});
