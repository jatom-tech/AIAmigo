import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: './src', // Rodmappe for kildefiler
  publicDir: '../public', // Statiske filer som HTML og ikoner
  build: {
    outDir: path.resolve(__dirname, 'public/assets'), // Output til /public/assets
    emptyOutDir: true, // Slet gammel output ved nyt build
    rollupOptions: {
      input: {
        content: path.resolve(__dirname, 'src/content.js'), // Content script
        popup: path.resolve(__dirname, 'src/popup.js'),     // Popup script
        background: path.resolve(__dirname, 'src/background.js') // Background script
      },
      output: {
        entryFileNames: '[name].js',       // Gem som content.js, popup.js, background.js
        chunkFileNames: 'chunks/[name].js',// Chunks i undermappe
        assetFileNames: 'assets/[name].[ext]' // Andre assets (billeder, CSS osv.)
      }
    }
  }
});