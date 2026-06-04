# P3-04 · Capabilities sell 页（B4 drill-in）

类型：**AFK** · Blocked by：**None — 可立即开始**

## What to build

把 `CapabilitiesScene` 做成**产品页 + moat banner**（register B，非营销 keynote 页——保持与其余 scene 的 ambient/spatial 视觉一致，让「agent 自动引用 Capabilities」这条产品内因果不断）。静态恒显，不按 thread 高亮（ADR-0005）。吃既有 `CAPABILITIES` fixture。

构成：
1. **顶部 moat banner**：`Proprietary vertical playbooks · Subscription · Auto-cited in every recommendation`（呼应 CONTEXT 里 Capabilities 的「第二条腿」定义）。
2. **`CAPABILITIES` 按 `domain` 分组**渲染（Project Ops / HR …），每张卡 `title + gist` + 静态 `Auto-cited` / `Proprietary` badge。
3. 一句接回 pitch 命题的 framing：`Company facts say what happened; Capabilities say how to judge it.`
4. `← Back` 走 `back()`（可复用 P3-01 的 `DetailShell`，但非强制依赖——也可自带 back 按钮，二选一不阻塞）。

## Acceptance criteria

- [ ] 顶部 moat banner 含 proprietary / subscription / auto-cited 三点。
- [ ] `CAPABILITIES` 按 domain 分组，每卡含 title + gist + badge。
- [ ] 视觉沿用其余 scene 语汇（非断开的营销页）。
- [ ] 静态——不读 `thread`、不按"agent 刚引用了哪条"做高亮。
- [ ] `← Back` 调 `back()`。
- [ ] 不扩 store。`npm run build` 过。

## Blocked by

None — 可立即开始（与 P3-01 独立，可并行）。若想复用 `DetailShell` 则软依赖 P3-01，但不强制。
