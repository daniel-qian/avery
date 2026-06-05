# P5-04 · #5 rail Act1 前置 drill + Act3 警告解除落点

类型：**AFK** · Blocked by：**P5-03**

## What to build

用 rail 演出**三幕叙事**——前戏段新增 Nexus 前 drill（看现状），B9b 成 Act3 警告解除落点（[ADR-0009](../docs/adr/0009-state-aware-detail-pages-supersedes-0005.md)）。依赖 P5-03 的 believed/grown phase 机制。

- **Act1（前戏段，B0–B3 区间）**新增 drill beats：`openDetail('project','p_acme')` + `openDetail('employee','u_bill')`（此时 `thread.steps` 空 → **believed 态**，零剧透），让 Venus 先看现状，再 `goScene('nexus')` / 继续 ask 飞进 Nexus。插入顺序参 demo-brief：focus Acme → drill Acme → drill Bill → ask。
- **Act2** = 现有 Nexus 思考流（不变）。
- **Act3** = B9b 的 `openDetail('project','p_acme')`：此时 output 已产出 → **grown 态** = 警告解除（handoffs 落地 + 「已诊断 + 已派活、周五保住」）。

**守约**：drill beats 幂等；钻入返回一律 `goScene('nexus')` 不用 `back()`；`seek` 倒带后 believed/grown 由当下 steps 正确派生（Act1 在 ask 前 → believed；B9b 在 output 后 → grown），replay-safe。

## Acceptance criteria

- [ ] rail 在 Nexus 前能 drill Bill + Acme（**believed，零剧透**），再飞进 Nexus。
- [ ] B9b drill Acme 显 **grown**（handoffs 落地 + warning 解除）。
- [ ] 同一页在 Act1 与 Act3 **视觉明显不同**（believed ≠ grown）= 三幕 payoff 成立。
- [ ] free-click litmus：每个新 drill beat 自由点击可复现。
- [ ] 不扩 `canvasStore`；`seek` / replay 全程稳定无闪。
- [ ] `npm run build` 过。

## Blocked by

P5-03（需 believed/grown phase 机制就位）。**注意与 P5-01 同改 `railStore` SCRIPT**，串行或留意 merge。
