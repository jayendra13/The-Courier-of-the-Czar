import { defineConfig } from 'vite';

export default defineConfig({
  base: '/The-Courier-of-the-Czar/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
  },
});
