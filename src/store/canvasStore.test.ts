import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// P6 issue (dashboard-radial-recompose):
//   B7 — canvasStore 不扩 (P5 铁律: 镜头/pan/zoom 交互态不进 store)。
//        用 text-parse 静态扫描,确保 store 文件内没出现新的
//        "镜头/pan/zoom/transform/scale" 字段类型或初始值 ——
//        这守住 P5 以来一直坚持的"派生不进 store"边界。
//
//   这是 text-parse + structural assertion(非可执行 artifact 的 TDD 模式,
//   类似 migration 文件测试)：保证 store 内容真的没改,而不是符号 import 漏掉。
//
//   限制(注释在测试头,不在 CI 噪声):只扫字段名匹配,无法判断运行时行为。

const STORE_PATH = join(process.cwd(), 'src', 'store', 'canvasStore.ts')
const source = readFileSync(STORE_PATH, 'utf8')

describe('canvasStore — P5 invariant: no camera / pan / zoom state (B7)', () => {
  it('does not introduce new "scale" / "zoom" / "pan" / "position" / "transform" fields', () => {
    // 找一个看起来像字段的写法: `fieldName:` 出现在 CanvasState interface
    // 我们抽 interface body,然后逐行扫。
    const interfaceMatch = source.match(/interface\s+CanvasState\s*\{([\s\S]*?)\n\}/)
    expect(interfaceMatch, 'CanvasState interface should exist in canvasStore.ts').toBeTruthy()
    const body = interfaceMatch![1]

    // 字段 = `name:`  (允许 `?` / 普通)
    const fieldRegex = /^\s*([a-zA-Z_$][\w$]*)\s*\??\s*:/gm
    const fields: string[] = []
    let m: RegExpExecArray | null
    while ((m = fieldRegex.exec(body)) !== null) fields.push(m[1])

    const banned = new Set(['scale', 'zoom', 'pan', 'position', 'positionX', 'positionY', 'transform'])
    const offenders = fields.filter((f) => banned.has(f))
    expect(offenders, `CanvasState must not contain camera/pan/zoom fields, found: ${offenders.join(', ')}`).toEqual([])
  })

  it('does not import from useRailCamera or react-zoom-pan-pinch (镜头/pan/zoom 不进 store)', () => {
    // store 不依赖镜头库 — store 是 dumb state 容器,镜头是派生计算 (useRailCamera)。
    expect(source).not.toMatch(/from\s+['"]\.\.?\/.*useRailCamera/)
    expect(source).not.toMatch(/from\s+['"]react-zoom-pan-pinch['"]/i)
  })

  it('store still has the 5 P5 actions: goScene / setFocus / openDetail / back / askQuestion', () => {
    // 反向锁: P5 已定的 action 签名没被破坏(确保没误删 + 守约)
    const expectedActions = ['goScene', 'setFocus', 'openDetail', 'back', 'askQuestion']
    for (const action of expectedActions) {
      const re = new RegExp(`\\b${action}\\s*[:(]`)
      expect(source, `action ${action} should still exist in canvasStore.ts`).toMatch(re)
    }
  })
})
