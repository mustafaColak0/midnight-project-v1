import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as wasmModule from 'vite-plugin-wasm'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const wasm =
  (wasmModule as unknown as { default?: () => any }).default ??
  (wasmModule as unknown as () => any)

export default defineConfig({
  plugins: [
    react(),
    wasm(),
  ],

  resolve: {
    alias: {
      /**
 * One of the Midnight dependencies relies on Node's EventEmitter.
 * This alias prevents Vite from externalizing the "events" module.
 */
      events: require.resolve('events/'),
    },

    dedupe: [
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/onchain-runtime-v3',
      '@midnight-ntwrk/midnight-js-protocol',
      'events',
    ],
  },

  optimizeDeps: {
    exclude: [
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/onchain-runtime-v3',
    ],

    include: [
      'object-inspect',
      'buffer',
      'cross-fetch',
      'events',
    ],

    esbuildOptions: {
      target: 'esnext',

      supported: {
        'top-level-await': true,
      },
    },
  },

  server: {
    proxy: {
      '/midnight-proof': {
        target:
          'https://solid-space-journey-p7gxj6rjgjp3rwgj-6300.app.github.dev',
        changeOrigin: true,
        secure: true,
        rewrite: (path) =>
          path.replace(/^\/midnight-proof/, ''),
      },
    },
  },

  build: {
    target: 'esnext',

    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})