import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // VITE_BASE_PATH se define en .env.ghpages como /nombre-del-repo/
  const base = env.VITE_BASE_PATH ?? '/'

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': { target: 'http://localhost:8000', changeOrigin: true },
        '/ws':  { target: 'ws://localhost:8000',  ws: true },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            charts:  ['recharts'],
          },
        },
      },
    },
  }
})
