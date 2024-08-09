import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
    }
  },
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        //target: 'https://decklist.lol',
        target: 'http://localhost:5156',
        changeOrigin: true,
      },
    },
  },
})
