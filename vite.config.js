import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'node:fs'

// Tự bump cache key trong dist/sw.js mỗi lần build — bỏ bước sửa tay dễ quên.
// public/sw.js giữ nguyên tên gốc; bản build thành 'qcf-v6-b<timestamp>'.
function swCacheBump() {
  return {
    name: 'sw-cache-bump',
    apply: 'build',
    closeBundle() {
      const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
      const sw = readFileSync('dist/sw.js', 'utf8')
      const bumped = sw.replace(/const CACHE = '([^']+)';/,
        (_, name) => `const CACHE = '${name}-b${stamp}';`)
      if (bumped === sw) throw new Error('sw-cache-bump: không tìm thấy const CACHE trong dist/sw.js')
      writeFileSync('dist/sw.js', bumped)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), swCacheBump()],
})
