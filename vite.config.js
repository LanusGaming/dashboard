import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { browserslistToTargets } from 'lightningcss'
import browserslist from 'browserslist'

export default defineConfig({
  plugins: [react()],
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(browserslist('> 0.5%, last 2 versions, not dead'))
    }
  },
  build: {
    cssMinify: 'lightningcss', // keep this consistent
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5087' // On WSL get the IP with: ip route show default | awk '{print $3}'
    }
  },
})