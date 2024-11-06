import { defineConfig } from 'vite'
import cp from 'vite-plugin-cp'

export default defineConfig({
  root: './',
  envPrefix: 'PUBLIC',
  envDir: '../../',
  plugins: [
    cp({
      targets: [{
        src: './manifest.json',
        dest: '../../dist/chrome'
      }]
    })
  ],
  build: {
    target: 'esnext',
    outDir: '../../dist/chrome',
    emptyOutDir: true,
  },
})
