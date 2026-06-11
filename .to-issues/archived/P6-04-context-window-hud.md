# P6-04 · context-window HUD（Context % · Step x/x，每 thread 独立）

类型：**AFK** · Blocked by：**P6-01**

## What to build

ADR-0013 决策 7：Nexus 顶部居中 brief 行追加 **`Context 42% · Step 3/6`**。目标观众懂 context window——**醒目、不低调**，是讲点不是装饰。

- 数值 = active thread `steps.length` 的**纯函数**：case 定义携带每步脚本化 %（bill/acme 主段 8 → 19 → 31 → 47 → 58 → 71，follow-up 段推到 ~80；errand case 的低值由 P6-05/06 在各自 case 定义里给，~15% 量级——本 slice 定数据形与渲染）。
- `Step x/x` 分母 = 主段 + 已追加 follow-up 段的总步数，分子随 `steps.length`。
- **每 thread 独立**：切 tab（P6-02）数字跟着换——"thread 是真实会话边界"由此可见。
- **安全阈值语义**：一条可见阈值（如 85%），接近时数字变调（amber）；demo 里永不越线，阈值的存在本身就是叙事（"thread 要守在安全线下"）。
- 挂在既有 nexus-brief HUD 行内，不开新浮窗（守 ADR-0012 HUD 纪律）。

## Acceptance criteria

- [ ] 数值纯派生自 `steps.length` × active case 数据，store 零新增字段；`seek` 后自洽。
- [ ] bill/acme 走完主段显示 ~71%，follow-up 后 ~80%，Step 分母随段追加更新。
- [ ] 阈值可见、近阈值变调；正常态清晰可读（字号不小于 brief 正文）。
- [ ] 位置：顶部居中 HUD brief 行内，viewport-fixed。
- [ ] CSS 入 `/* P6 */` banner；`npm run build` 过。

## Blocked by

[P6-01](./P6-01-contract-pass-multithread-case-shape.md)。**与 P6-02 / P6-03 同改 `NexusScene.tsx` HUD 区**——留意 merge。
