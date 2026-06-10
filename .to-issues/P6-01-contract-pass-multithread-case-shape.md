# P6-01 · contract pass：多 thread store + per-case 定义数据形（行为零变）

类型：**AFK** · Blocked by：**None — 可立即开始（但本 wave 其余 issue 全部等它）**

## What to build

ADR-0013 决策 1–2 的一次性 contract pass：解冻 `canvasStore` → 重塑 → 重新冻结。**本 slice 行为零变**——落地后 demo 跑起来与今天逐拍一致，只是机器被泛化。

- `canvasStore`：`thread` → `threads`（按 caseId 键）+ `activeCaseId`；Thread 增加 `caseId` / `isOpen`。新 action：`openThread(caseId)`（开/重开 + 置 active，幂等）、`closeThread(caseId)`（只翻 `isOpen`，**状态全保留**）、`askFollowUp(text)`（把 active case 的 follow-up 段追加进该 thread 步骤表；文本作为显示的 follow-up 问题）、`sendEmail()`（dedupe-guarded，P6-06 用）。`askQuestion` 变 case-aware（hero 问题 → bill/acme case 的 thread）。`runAgent()` **保持无参**，从 active case 的编排表（主段 + 已追加的 follow-up 段）按 `steps.length` 取下一步。
- 新建 **per-case 定义数据形**（如 `src/data/cases.ts`）：每个 case 自带节点 + 边拓扑（lane/row 公式坐标）、编排步骤表、Manifest 堆叠、follow-up 段（问题文本、追加步骤、chip 锚定的 manifest、新 manifest）、每步 context-%、step labels。
- **bill/acme 迁移为第一个 case**：`nexusLayout.ts` 的 `NEXUS_NODES / NEXUS_EDGES / NEXUS_POS / MANIFEST_STACK` 与 store 的 `ORCHESTRATION`、`NexusScene` 的 `STEP_LABELS` 全部移入其 case 定义；`NexusScene` 改读 active case。
- rail 不动：`SCRIPT` 本 slice 零修改；`useRail` 的 pristine 快照 + replay-to-target 照常工作。
- 重新冻结：在 store 顶部注释更新契约说明（指向 ADR-0013），后续 issue 不得再扩。

## Acceptance criteria

- [ ] 整条 rail 0→end 键盘走完，每拍画面与改动前一致（行为零变）。
- [ ] free-click 路径（composer ask、advance、dispatch、tag/focus）全部照旧。
- [ ] `seek` 任意 index replay-safe（倒带 + replay 后 threads/activeCaseId 自洽）。
- [ ] `openThread` / `closeThread` 幂等；`closeThread` 后该 thread 的 steps/manifest 数据原样保留。
- [ ] `askFollowUp` 确定性追加（同文本重放结果相同）；`sendEmail` 有 dedupe guard。
- [ ] bill/acme 的节点/边/卡全部来自 case 定义，`nexusLayout.ts` 不再有 case 专属常量（或仅作转发壳）。
- [ ] store 契约注释更新、引用 ADR-0013；`npm run build` 过。

## Blocked by

None — 可立即开始。**动面最大（store + nexusLayout + NexusScene），本 wave 其余 issue 全部 block 在它后面，独占进行。**
