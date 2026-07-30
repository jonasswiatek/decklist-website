import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  plugins: [react(), tailwindcss(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    proxy: {
      '/api': {
        target: 'https://decklist.lol',
        //target: 'http://localhost:5290',
        changeOrigin: true,
      },
    },
  },
})
