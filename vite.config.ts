import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // 相対パス出力にすることで、院内サーバーのサブディレクトリ配信でも
  // file:// でのUSBメモリ運用でもそのまま動作する。
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    outDir: 'dist',
    // 院内LANのみ・オフライン運用を前提とするため、外部CDNへの依存を持たない。
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1500,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
