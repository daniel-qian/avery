# P6-03 · follow-up 机器 + bill/acme follow-up 内容

类型：**AFK** · Blocked by：**P6-01**

## What to build

ADR-0013 决策 5：回答观众必然的疑问——"能不能基于产出继续问/继续执行？"——用**演的**。

- **点 Manifest → 镜头飞向它**：任意 Manifest 卡可点，组件本地 `zoomToElement`（**不进 store**，守 ADR-0012；rail 下一拍照常收回镜头）。
- **follow-up chip**：case 定义里脚本化的那张 Manifest 上显出 suggested-follow-up chip；点 chip → `askFollowUp(text)`。
- **自由文本 composer 常驻** Nexus：任意文本被接受、作为显示的 follow-up 问题、走 active case 的脚本段（与 B3 `askQuestion` 同构，ADR-0001 demo-only 范围内诚实）。
- **follow-up 段执行**：步骤追加进同一 thread，链**重新点亮既有节点**（breathe glow，守修订 6 活跃语法），新 Manifest 卡落进 Manifest 列底部；数据形允许 case 声明新增节点，bill/acme **不加**。
- **bill/acme 内容**：chip 锚在 structured-output report 卡上，文本 `"I have a job for Jason — is there any alternative?"`；段：PM agent + project-ops cap 重新点亮 → 新 **alternatives Manifest 卡**（备选人选分析：余量/技能匹配/风险，引用 PEOPLE 数据；copy `⚠ 待 Danny 审字`）。

## Acceptance criteria

- [ ] 点任意 Manifest 卡，镜头飞向该卡（局部 bbox 语法）；手动 pan 后 rail 下一拍收回。
- [ ] chip 只出现在脚本锚定的卡上；点击触发 `askFollowUp`，链重亮 + 新卡显形。
- [ ] composer 输入任意文本 → 同一脚本段执行，输入文本显示为 follow-up 问题。
- [ ] follow-up 后 `thread.steps` 确定性追加，`seek` replay-safe。
- [ ] 镜头/chip 可见性均为组件本地态，store 零额外字段。
- [ ] 新英文 copy 就地标 `⚠ 待 Danny 审字`；CSS 入 `/* P6 */` banner；`npm run build` 过。

## Blocked by

[P6-01](./P6-01-contract-pass-multithread-case-shape.md)。**与 P6-02 / P6-04 同改 `NexusScene.tsx`**——留意 merge。P6-05 / P6-06 复用本 slice 的 chip/follow-up 模式。
