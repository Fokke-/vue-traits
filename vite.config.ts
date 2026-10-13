import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) =>
  // Library build (`vite build --mode lib`); type declarations come from tsconfig.lib.json
  mode === 'lib'
    ? {
        build: {
          lib: {
            entry: fileURLToPath(
              new URL('./src/entry-lib.ts', import.meta.url),
            ),
            formats: ['es'],
            fileName: 'vue-traits',
          },
          rolldownOptions: {
            external: ['vue'],
          },
          copyPublicDir: false,
          minify: false,
          sourcemap: true,
          emptyOutDir: true,
        },
      }
    : {
        plugins: [vue(), vueDevTools()],
        resolve: {
          alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
          },
        },
      },
)
