# P5-05 · #1 composer 常驻 + 展开 + `+` 引用 picker

类型：**AFK** · Blocked by：**None — 可立即开始**

## What to build

Dashboard 的 Ask composer 在 focus 时不再下沉，点输入 / focus 实体时展开，加 `+` 引用 + 附件 affordance（grill #1）。Ask 是最常用入口，focus 人 / 项目时不该被藏。

- 删 `DashboardScene` composer-layer 的 `hasProjectPrimary` dim/sink（现 `opacity .22 / y+14`）——focus（人或项目）时 composer 保持可见可用。
- **展开态**：focus 实体 或 点进输入框 → composer 变高、露出 `+` 与 reference chips。**新行用 `opacity`/`transform` 淡入，不 tween 高度**（守 ADR-0002）。
- **focus 实体自动挂 reference chip**：focus Acme → composer 带一枚 `Acme` chip（由 `focus` 派生，零脚本改即收紧 B2→B3）。
- **`+` 菜单**：`Attach file`（插假 chip）/ `Reference person·project·capability`（真·filter `fixtures` 的 picker，选中加 chip）。
- references / attachments 是 composer **本地视觉态**（`useState`）；提交仍走 `askQuestion(string)`，**不改签名、不扩 store**（references 不改 thread 行为，demo 脚本化）。

## Acceptance criteria

- [ ] focus 项目 / 人时 composer 全程可见可用（无下沉调暗）。
- [ ] focus 实体 / 点输入框触发展开，`+` 与 chips 以 opacity/transform 淡入（非高度 tween）。
- [ ] focus Acme 自动带 `Acme` chip。
- [ ] `+` 的 person / project / capability picker 真·列 `fixtures` 实体；file 插假 chip。
- [ ] 不扩 `canvasStore`；hero flow（`askQuestion`）仍正常飞 Nexus。
- [ ] `prefers-reduced-motion` 下降级；`npm run build` 过。

## Blocked by

None — 可立即开始。**注意与 P5-06 同改 `DashboardScene.tsx`**，串行或留意 merge。
