import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// While developing, /api and /uploads go to the Node backend (npm run server).
// changeOrigin must stay false: the backend checks that the request really
// comes from the same website address (protection against fake requests).
const backend = { target: 'http://localhost:3001', changeOrigin: false }

// After the build, the CSS file is copied INTO index.html (<style>).
// The page then does not wait for a second file before it can show anything (faster first paint).
function inlineCss() {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html, context) {
      const bundle = context.bundle
      if (!bundle) return html
      return html.replace(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g, (tag, href) => {
        const asset = bundle[href.replace(/^\//, '')]
        return asset && asset.type === 'asset' ? '<style>' + asset.source + '</style>' : tag
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), inlineCss()],
  server: {
    proxy: { '/api': backend, '/uploads': backend },
  },
})
