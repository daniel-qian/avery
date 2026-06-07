import { defineConfig } from 'vitest/config'

// P6 issue: vitest 0 → 1,只测纯函数(几何/相机/store 不变量),不测组件渲染
// (组件渲染对视觉验收无增量,且需 jsdom/happy-dom — 这里不需要)。
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
})
