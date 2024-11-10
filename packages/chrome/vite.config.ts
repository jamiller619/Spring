import { defineConfig } from 'vite'
import cp from 'vite-plugin-cp'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  root: './',
  envPrefix: 'PUBLIC',
  envDir: '../../',
  plugins: [
    viteSingleFile({
      removeViteModuleLoader: true,
    }),
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
