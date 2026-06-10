# Slice 4 — B8 timeline 中卡

## What to build

B8 `timeline` 的中卡——"agent 调 tool 造图"这一拍。推进到 `timeline` step(点亮 Tool 节点)时,中卡呈现 `TIMELINE` fixture 的里程碑,按 `when` 时序排列:

- Connector core(Slack + GitHub ingest) — Thu — **replanned**
- Connector ↔ Acme hookup — Thu pm — **replanned**
- Acme UAT — Fri am — **planned**
- Ship core — Fri — **held**（← 主方案胜点）
- Event dedupe — Next week — **deferred**
- Slip to Tue — Tue — **conditional**（仅当 Slack rate-limit 周四前解不掉才触发）

四态(held / replanned / deferred / conditional)视觉可区分,突出"**保周五** + Tue **条件兜底**"的故事口径。

## Acceptance criteria

- [ ] 推进到 `timeline`,中卡显示 6 个里程碑,按 `when` 时序排列
- [ ] held / replanned / deferred / conditional 四态视觉可区分,"Ship core Fri (held)" 为焦点
- [ ] conditional 的 Tue slip 明确标为兜底(绑定 rate-limit 变数),不与主方案混淆
- [ ] 内容取自 `TIMELINE` fixture
- [ ] `npm run build` 过

## Blocked by

- Slice 1（Nexus 放射画布骨架）
