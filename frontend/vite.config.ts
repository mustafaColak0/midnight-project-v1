import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as wasmModule from 'vite-plugin-wasm'

const wasm =
  (wasmModule as unknown as { default?: () => any }).default ??
  (wasmModule as unknown as () => any)

export default defineConfig({
  plugins: [
    react(),
    wasm(),
  ],

  build: {
    target: 'esnext',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  optimizeDeps: {
  
    exclude: [
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/onchain-runtime-v3',
      '@midnight-ntwrk/midnight-js-protocol',
      '@midnight-ntwrk/midnight-js-contracts',
    ],
  },
})