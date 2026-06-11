# P6-07 · rail 三幕集成 + title card 浮层 + close→reopen 收束拍

类型：**AFK** · Blocked by：**P6-02 · P6-03 · P6-04 · P6-05 · P6-06**

## What to build

ADR-0013 决策 8–9：把全部新能力编进 Venus pitch 的三幕 SCRIPT（约 +8–10 步，~2 分钟）。

- **title card 浮层 = rail chrome**：屏幕居中、低调的 demo-only 引导卡（如 `Use case: Bill & the Acme pilot`）；由 SCRIPT step 元数据驱动、渲染在 `DemoControls` 层——**不进 `canvasStore`**，删 rail 即删 title card（守 ADR-0003）。
- **Act 1**（bill/acme，原样 + 两处）：开头加 title card；B9 structured-output 后加 **follow-up 拍**（调 `askFollowUp(bill/acme 段问题)`，P6-03 内容）。B10 briefing regen 留在 Act 1 末尾不动。
- **Act 2**（daily driver，全程 Nexus 内）：title card（web-search）→ 开 thread + 短链推进拍 → follow-up 拍 → title card（email）→ 开 thread + 推进拍 →（Send 现场手点，**不进 SCRIPT**）→ follow-up 拍 → **收束拍：`closeThread`(email) + `openThread`(bill/acme)**——hero report 回屏，给 Act 3 递话。
- **Act 3**：B11 Capabilities 收尾原样（守 ADR-0007）。
- 每步守 ADR-0006：幂等 / append 序确定；`seek` 任意 index 自洽（含跨 case 倒带）。

## Acceptance criteria

- [ ] 键盘 0→end 全程走完三幕，每拍一个视觉瞬间，无双触发 / 漂移。
- [ ] title card 只随 rail 存在：隐藏 rail（toggleHidden）或删 rail 层即无 title card；core 行为零损失。
- [ ] Act 2 收束拍后画面 = bill/acme report（含 alternatives follow-up 卡）在屏，下一拍即 Capabilities。
- [ ] `seek` 到任意 index（含 Act 2 中段、收束拍前后）replay-safe。
- [ ] Send / dispatch 不在 SCRIPT；title card 文案就地标 `⚠ 待 Danny 审字`。
- [ ] `npm run build` 过；全程断网可演。

## Blocked by

[P6-02](./P6-02-thread-chrome-tabs-history.md) · [P6-03](./P6-03-follow-up-machinery-billacme.md) · [P6-04](./P6-04-context-window-hud.md) · [P6-05](./P6-05-web-search-errand-case.md) · [P6-06](./P6-06-email-errand-case.md)。**独占 `railStore.ts`（SCRIPT）+ `DemoControls`，必须最后。**
