import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 纯静态 demo（ADR-0001 demo-only / ADR-0002 stack）。无 backend / 无 SSR。
export default defineConfig({
  plugins: [react()],
})
