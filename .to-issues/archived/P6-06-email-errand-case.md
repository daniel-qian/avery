# P6-06 · email errand case（memo 照片 → 草稿 → email tool → Send）

类型：**AFK** · Blocked by：**P6-01 · P6-03**

## What to build

ADR-0013 决策 4：第二个 errand case——"人扣扳机"的经人确认 beat。

- **case 定义**：question 节点带 **memo 照片附件 chip**（占位图资产入 `public/`，路径集中可换——Danny 后换真实照片，见 P6-08）。短链：question → agent → **doc-reader tool 节点** → **email tool 节点**（均产出圆语法）。问题文本类 `"Turn this memo draft into an email and send it to everyone in Engineering."`（`⚠ 待 Danny 审字`）。
- **Manifest ①：可编辑草稿卡**——文本编辑器卡，agent 邮件文本预填（`⚠ 待 Danny 审字`）；现场可改，**编辑为本地态、不入 replay**（ADR-0006 决策 5 口径），编辑实时流入 ② 的 body。
- **Manifest ②：email-tool 卡**——To: 全部 Eng 6 人（地址由 PEOPLE fixture 生成，如 `bill.h@…`）、subject/body 已填、**Send 按钮待命**。点 Send → `sendEmail()`（store action，dedupe-guarded）→ 卡翻 `Sent ✓ to 6 people`。**Send 不进 rail SCRIPT**——现场 Danny 亲手点（同 `dispatchTask` 先例）；rail seek 重置已点状态，接受。
- **follow-up**（复用 P6-03 机器）：chip 锚在 email-tool 卡，`"Also post a short version to #eng in Slack"` → 小 **Slack-message Manifest**（`⚠ 待 Danny 审字`）。

## Acceptance criteria

- [ ] free-click 全程：提问 → 链显形 → 草稿卡可编辑、编辑流入 email-tool 卡 body → Send 翻 Sent ✓（重复点不重复发）→ chip → Slack Manifest。
- [ ] `sendEmail` 不出现在 SCRIPT；seek 后回到待发态（接受口径，写注释说明）。
- [ ] 草稿编辑是组件本地态，store 零额外字段。
- [ ] memo 占位图路径集中一处、注释标注"Danny 换真照片"。
- [ ] 切 thread 后回来，草稿编辑丢失可接受、其余（steps/Manifest）完整。
- [ ] `seek` replay-safe；copy 全部就地标 `⚠ 待 Danny 审字`；CSS 入 `/* P6 */` banner；`npm run build` 过。

## Blocked by

[P6-01](./P6-01-contract-pass-multithread-case-shape.md) · [P6-03](./P6-03-follow-up-machinery-billacme.md)。与 P6-05 大体并行，同登记 case 注册表——留意小 merge。
