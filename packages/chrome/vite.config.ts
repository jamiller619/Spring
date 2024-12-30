import { defineConfig } from 'vite'
import cp from 'vite-plugin-cp'
import { fileURLToPath } from 'node:url'

function root(path: string) {
  return fileURLToPath(new URL(path, import.meta.url))
}

export default defineConfig({
  root: './',
  envPrefix: 'PUBLIC',
  envDir: '../../',
  plugins: [
    cp({
      targets: [
        {
          src: './manifest.json',
          dest: '../../dist/chrome',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': root('./'),
      '@types': root('../../types'),
    },
  },
  build: {
    target: 'esnext',
    outDir: '../../dist/chrome',
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        options: 'options/index.html',
      },
    },
  },
})
