# P6-05 · web-search errand case（Apple 政策 + 浏览器预览 + gist）

类型：**AFK** · Blocked by：**P6-01 · P6-03**

## What to build

ADR-0013 决策 3：第一个 errand case——短链证"日常主力"，与 hero 长链形成画板上的可见对比。

- **case 定义**：问题绑故事世界——`"We're shipping the Acme companion app — what's Apple's policy on expedited App Review?"`（`⚠ 待 Danny 审字`）。短链：question → agent → **web tool 节点**（产出圆语法）。每步 context-% 低值（~15% 收尾）。
- **Manifest ①：浏览器预览卡**——卡片样式 = 迷你浏览器窗（URL 栏显示真实 `developer.apple.com/...` 地址 + padlock + Apple expedited-review / App Review 页面的高清**截图资产**，卡内可滚动看长图）。**fixture 截图，非 live iframe**（Apple 发 `X-Frame-Options`/CSP 拒绝被框 + 会场断网风险）；零运行时网络依赖。
- **Manifest ②：policy gist 卡**——agent 的实际回答：guideline 要点引文 + 回链 URL 引用（是 agent 不是搜索引擎的证据；`⚠ 待 Danny 审字`）。
- **follow-up**（复用 P6-03 机器）：chip 锚在 gist 卡，`"Does our current Acme companion build comply with this?"` → 短**合规判定 Manifest**（2–3 bullet 结论 + guideline 引用；`⚠ 待 Danny 审字`）。
- 截图资产：抓取 Apple 官方 expedited review 申请页或 App Review guidelines 页高清长图入 `public/`。

## Acceptance criteria

- [ ] free-click：composer 提问（或 thread chrome 新开）→ 短链逐步显形 → 两张 Manifest 落列 → gist 卡 chip → 合规 Manifest。
- [ ] 预览卡 URL 栏地址真实可核；断网状态下 demo 全程正常。
- [ ] 链 / 卡 / 坐标全部来自该 case 定义，零 bill/acme 串扰；切回 bill/acme thread 一切照旧。
- [ ] context HUD 显示该 thread 自己的低 %（与 hero 的 ~71% 成对比）。
- [ ] `seek` replay-safe；新英文 copy 全部就地标 `⚠ 待 Danny 审字`；CSS 入 `/* P6 */` banner；`npm run build` 过。

## Blocked by

[P6-01](./P6-01-contract-pass-multithread-case-shape.md) · [P6-03](./P6-03-follow-up-machinery-billacme.md)（chip/follow-up 模式）。与 P6-06 大体并行，同登记 case 注册表——留意小 merge。
