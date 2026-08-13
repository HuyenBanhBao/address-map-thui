import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages publishes this project under /address-map-thui/.
  base: '/address-map-thui/',
  plugins: [react()],
})
