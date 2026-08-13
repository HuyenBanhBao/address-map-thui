import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages needs the repository path; Android loads bundled assets relatively.
  base: mode === 'android' ? './' : '/address-map-thui/',
  plugins: [react()],
}))
