import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  root: 'src',
  plugins: [eslint()],
  build: {
    outDir: '../public',
  },
});
