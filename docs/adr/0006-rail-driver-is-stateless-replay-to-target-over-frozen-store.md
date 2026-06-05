# Demo rail = 冻结 store 之上的无状态 replay-to-target driver

## 背景

ADR-0003 把 rail 定为 free-click core 之上的可拆 driver；P0.5 contract pass 已把 `canvasStore` **冻结**（state/action 形状一次性定死，禁止再扩）。该 store 是 **forward-only**：`runAgent` append 一步、`askQuestion` 重置 thread、没有任何 un-step / seek / reset action。

但 P4 的现实是：**Danny 现场驱动、Venus 看**。现场必然会过冲、想回退一拍；且 rail 并非唯一驱动者——onboarding 的 4 个子步是**本地 `useState`**（不在 store）、Nexus 自己有 advance bar、structured-output 卡有 Dispatch 按钮，Danny 随时可能 in-scene 手点，造成 rail 指针与 store 实际状态**漂移**。

约束硬性：**不扩冻结的 store、零 `if(demoMode)` 分支**（ADR-0003 litmus：自由点击能复现每个 beat）。问题是：在这些约束下，如何实现可靠的 Prev + 抗漂移。

## 决策

1. **rail 状态独立**：新建 `useRail` store（`index` + `hidden`），**完全不碰 `canvasStore`**。删 rail = 删这个 store + `DemoControls` + `SCRIPT` + 撤一行挂载。

2. **统一 replay-to-target**：`Next` / `Prev` / 任意 jump 都走同一个 `seek(target)`：先把 store **倒带**回开局 pristine 快照，再**同步** replay step-actions `0..target`。`index` 是 rail 的**唯一真相**；in-scene 手点造成的漂移在下一次 rail 键按时**自愈**（replay 覆盖一切）。多个同步 `set` 被 React 批成一次 render，无闪烁。

3. **倒带原语**：reset 用 `useCanvas.setState(INITIAL, true)`（rail store 创建时抓一次 pristine，含稳定的 action 引用）。这是 rail **唯一**一处直接写 state；Venus 实际**看到**的每个状态仍由真 action 复现，故不破坏 litmus。

4. **SCRIPT = 扁平原子 step 列表**（16 step / 12 beat），beat 作 label；**一次 Next = 一个视觉瞬间**（否则 B4 的 Capabilities reveal、B6 的 Bill 页会在单次按键里被一闪而过）。`runAgent` step **不指定 kind**，靠调用次序对齐 store 里写死的 `ORCHESTRATION` 常量。

5. **本地态不进 replay**：onboarding 4 步、composer/search 文本、Capabilities 订阅开关、B9 的 dispatch——这些**非叙事必需**，scene 重挂自然重置或由 Danny 现场点。replay 不重建它们，一致接受。

## 被否的替代

- **增量 Next（只跑当前 step 的 action）**：更省，且对 append 型 `runAgent` 更自然。但 Danny 一旦 in-scene 手点（如点了 Nexus 自己的 advance），下一次 rail Next 会**双触发**、demo 漂移。要求"rail 激活时别碰 in-scene 控件"——脆弱，违背 free-click 一等公民。
- **每 beat 快照-恢复**（`setState(snapshot[n])`）：最快，无 replay 细节。但它**逐 beat 直接写 store、绕过 action API**，弱化 ADR-0003 litmus（"rail 只走 action"）。倒带原语只在每次 seek 写一次初始态，与之不同。
- **给 store 加 `reset` / `seek` action**：最直观，但**违反 P0.5 冻结契约**，且把一次性 demo 辅助的关注点漏进长期 product 的单一事实源。

## 后果

- SCRIPT 的每个 step 必须 **replay-safe**（幂等 / append-顺序确定）。现有 action 已满足：`dispatchTask` 有 dedupe guard、`regenBriefing` 幂等、`runAgent` 按 `steps.length` 取 `ORCHESTRATION`。
- `B7 human-loop` 在 `ORCHESTRATION` 里**删不掉**（P2 冻结），故即便叙事上是 nice-to-have，rail 也**必须**走这一步 `runAgent` 才能推进到后续。
- free-click 在 beat 之间的探索会被下一次 rail 键按重置——视为**特性**（rail 总把世界拨回已知良态再演下一拍）。
- 承 ADR-0003：上述每个 beat 自由点击仍可达；删 rail 零行为损失。
