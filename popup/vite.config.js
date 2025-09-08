import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// __dirname equivalent in ESM
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: __dirname,             // root folder is current folder (popup or options)
  base: './',                   // use relative paths for Chrome extension
  build: {
    outDir: path.resolve(__dirname, '../dist/popup'), // build output goes into "build" folder
    emptyOutDir: true,          // clean "build" before building
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'), // entry HTML
    },
  },
  plugins: [tailwindcss(),react()],
});
