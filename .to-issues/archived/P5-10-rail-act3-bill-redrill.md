# P5-10 · rail Act3 Bill re-drill

类型：**AFK** · Blocked by：**P5-09**

## What to build

在 rail 的 Act3 落点里，镜像 Act1 的 drill 顺序：B9b 先 drill Acme，展示重排计划 + handoffs 落地 = 交付保住；随后再 drill Bill，展示 HR analysis + no personnel judgment = 护人。依据 [ADR-0011](../docs/adr/0011-detail-pages-static-shell-content-grows-amends-0009.md)。

这一步只改 rail script 行为：在 Acme grown drill 后追加 Bill grown re-drill，使用已锁 action，保持每步幂等、append 顺序确定、`seek` = 倒带 + 同步 replay。不要扩 `canvasStore`；phase 仍由 `thread.steps` 派生。

## Acceptance criteria

- [ ] rail 跑到 Act3 时，Acme grown drill 后会继续 drill Bill grown。
- [ ] Bill grown 页清楚闭合人物弧：interrupt load / no personnel judgment / actions in flight，而不是 performance judgment。
- [ ] Act3 Acme + Bill 两个 re-drill 都只在 Nexus 诊断后出现 grown 内容；倒带到 Act1 时仍是 believed 症状内容。
- [ ] 新 rail step 幂等；`seek` 到前后相邻 beat 不重复追加、不漏 step、无 believed/grown 闪烁。
- [ ] 不扩 `canvasStore`；`npm run build` 过。

## Blocked by

P5-09（需要 static shell + symptom/grown 内容模型先就位）。
