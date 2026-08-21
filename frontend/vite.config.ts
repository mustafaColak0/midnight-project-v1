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
      /*
       * Midnight dependency'lerinden biri Node EventEmitter kullanıyor.
       * Vite'ın "events" modülünü externalize etmesini engelliyoruz.
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

        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin')
            proxyReq.removeHeader('referer')
          })

          proxy.on('error', (error) => {
            console.error(
              '[Vite Proxy] Proof server error:',
              error,
            )
          })

          proxy.on('proxyRes', (proxyRes, req) => {
            console.log(
              '[Vite Proxy]',
              req.method,
              req.url,
              '->',
              proxyRes.statusCode,
            )
          })
        },
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