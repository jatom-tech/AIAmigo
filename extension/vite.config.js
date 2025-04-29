import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: './src',
  build: {
    outDir: path.resolve(__dirname, 'public/assets'), // Brug absolut sti til output
    emptyOutDir: true, // Tøm output-mappen
    rollupOptions: {
      input: {
        content: path.resolve(__dirname, 'src/content.js'), // Brug absolut sti til content.js
        popup: path.resolve(__dirname, 'src/popup.js'), // Brug absolut sti til popup.js
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});