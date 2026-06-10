# P3-03 · Onboarding 4 步微流程（B0 prologue）

类型：**AFK** · Blocked by：**None — 可立即开始**

## What to build

把 `OnboardingScene` 从静态 stub 做成 **click-advance 4 步微流程**（B0：答 provenance + 首秀 Capabilities 护城河）。吃既有 `ONBOARDING` fixture（`sampleFiles / parsedInto / capabilitiesMatched / caption`）。

步骤（每步一个 `Continue` affordance 推进，**不 auto-play**——节奏交给 Danny 驱动的 rail；auto-play/动效留 P5）：
1. 4 个公司文件落入（`sampleFiles`）。
2. `Parsing…` → `parsedInto` 逐条浮现（Company profile / Team roster 14 / 7 projects / Recent signals）。
3. `Matching Capabilities…` → `capabilitiesMatched` 点亮（Project Ops / HR playbooks），强调 **auto-prioritized**。
4. `Company brain ready` → 时间跳到稳态 → 调 `goScene('dashboard')`。

分步状态用**组件本地 `useState`**——onboarding 步进是纯 UI，**不进 store、不扩 state 契约**。scene 经 `goScene('onboarding')` 可重入（守 free-click 可达）。

## Acceptance criteria

- [ ] 4 步按 `Continue` 顺序推进，每步只显当步内容（前序可保留为已完成态）。
- [ ] 第 3 步 Capabilities 点亮，视觉强调 auto-prioritized（护城河 tease）。
- [ ] 第 4 步结束调 `goScene('dashboard')`，进入稳态 Dashboard。
- [ ] 分步状态全在组件本地 `useState`，store 零改动、零新 action。
- [ ] `goScene('onboarding')` 可重新进入该流程（不卡在终态）。
- [ ] `npm run build` 过。

## Blocked by

None — 可立即开始（与 P3-01 独立，可并行）。
