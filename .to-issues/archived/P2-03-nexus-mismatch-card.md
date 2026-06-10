# Slice 3 — B5 cross-check mismatch 中央对撞卡（killer beat）

## What to build

B5 `cross-check` 的 reality-gap 揭示——demo 的 killer beat。推进到 `cross-check` step 时,弹出**偏中央的醒目 mismatch 卡**(`.mismatch-card`,写进 P2 banner 区),左右对撞布局呈现 `MISMATCH` fixture:

- **左**:reported "On track (Monday standup)"（`s_report` 自报）
- **右**:signals say "At risk"（证据 `s_pr` / `s_blocker` / `s_noupdate`）

画布上 **Evidence 节点 ⇄ self-report 之间高亮"对撞"连线**。卡片要让 Venus 一眼看到矛盾;弹出期间背景画布虚化/降权,卡片为视觉焦点(复用基座 backdrop-blur 语汇,与 Dashboard "briefing 居中 + 周围淡化"同构)。

只指证据矛盾、不做人身判断——`gapType` = "report mismatch"(术语见 CONTEXT.md 的 Reality gap)。

## Acceptance criteria

- [ ] 推进到 `cross-check`,中央 mismatch 卡弹出,reported ↔ signals 左右对撞清晰可读
- [ ] 卡片内容取自 `MISMATCH` fixture(reported / signalsSay / gapType + evidence 证据)
- [ ] Evidence ⇄ self-report 高亮连线可见
- [ ] 卡片弹出期间背景画布虚化/降权,卡片为视觉焦点
- [ ] 文案口径中性,无人身/绩效评价
- [ ] `npm run build` 过

## Blocked by

- Slice 1（Nexus 放射画布骨架）
