import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base: the built site resolves assets from its own directory, so
  // it works at a domain root (Vercel) AND under a subpath (GitHub Pages
  // project site). Absolute '/' paths would 404 everywhere except root.
  base: './',
  build: {
    // three.js minifies to ~725KB (185KB over the wire) — that is the floor
    // for the library itself, already lazy-loaded after first paint, so the
    // default 500KB warning would nag on every build with nothing actionable.
    // Threshold set just above it: anything else ballooning still warns.
    chunkSizeWarningLimit: 800,
    // Split the 1.2MB single chunk: vendor libraries cache independently of
    // app code, so repeat visits re-download only what changed. Uses
    // rolldown's native advancedChunks — the legacy manualChunks object form
    // is rejected outright, and its function form silently merges `three`
    // back into the drei chunk.
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'three', test: /node_modules\/three\// },
            { name: 'react-three', test: /node_modules\/@react-three\// },
            { name: 'motion', test: /node_modules\/gsap\// },
          ],
        },
      },
    },
  },
})
