import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Vite ko ortho tiles aur map data watch karne se roko
      ignored: ['**/public/ortho_data/**']
    }
  }
})