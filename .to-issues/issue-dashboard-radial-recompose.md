# Issue — 重新取景 Dashboard 放射构图：briefing-as-nucleus + 可读的 calm 框景

**Repo:** `D:\TeamMaster-Prototype-2.0` · TeamMaster 投资人 demo（Vite + React 18 + framer-motion + zustand）
**Scope:** 纯**视觉构图**修复。④⑤⑥ 的画板地基已落地且**机制正确**——这条 issue 不重做地基，只把它**对准正确的取景目标**。
**前置阅读:** `docs/adr/0012-pannable-zoomable-canvas-rail-derived-camera.md`（架构决策，已定）。本 issue 补的是 ADR 没写的"静息构图"。

---

## 0 · 背景（为什么要做）

④⑤⑥ 落地后，Dashboard 静息态视觉崩了（pan/zoom/focus/camera/公式坐标都 work，但画面不对）。两个根因，**都是 spec 漏写、不是执行 bug**：

1. **briefing ↔ hub 中心打架**：`.briefing-layer` 一直钉在视口正中心（`top:50%;left:50%`，460px 不透明盒），而 ⑤ 把 `You` 放在 board 正中心当 hub → `centerOnInit` 让两者重叠，briefing 压住 hub + 内环。
2. **calm = fit 全图 → 缩到 ~0.28**：`useRailCamera` 静息态用 `wholeMap`（21 点）fit 进视口，board 2600 + 环 600/1020 → 节点缩成原大小 1/3 的小点。违背 ADR-0010「2 秒读懂全员的 HUD」与 CONTEXT 的 Calm = 可读地图。

本 issue 用两个已定决策填这两个洞。

---

## 1 · 🚫 不要动（地基是对的，别重做）

- **不碰** pan/zoom 基座（`PanZoomCanvas` / `react-zoom-pan-pinch`）、chrome/canvas 分层、board 像素坐标系、派生镜头机制（`useRailCamera`）、公式驱动几何的**思路**。这些都对。
- **不扩** `src/store/canvasStore.ts`（P5 铁律）。镜头/pan/zoom 交互态不进 store。
- **replay-safe**（ADR-0006）：镜头仍派生自 `focus`/`thread.steps`。
- 坐标仍**公式算**，不手摆像素（memory: `prefer-runtime-navigation-over-handtuned-layout`）。

---

## 2 · 已定决策（直接实现，不要重新讨论）

### A1 — briefing 即 nucleus，放射绕它转
- 视口居中的 **briefing 就是放射中心**（"组织天气 / 你" = 太阳）。
- **取消 `You = 正中心 hub` 的特例**（这是被 A1 推翻的旧决策）：board 几何中心**留空给 briefing**，**没有节点落在中心**。
- `You`(`u_you`) **降为内环普通一员**，跟其他人一样按 team 排进内环（Founders 队，和 Wang 相邻）。
  - 连带：`You` 进环后有了真实环角，`p_pitch`（You own）外环节点就**对齐 You 的环角**做放射辐条 → **删掉 `PITCH_ANGLE_DEG` 的 -90 特例**（不再需要给无角的 hub 保留顶部角）。
- **内环半径必须让人环清开 briefing 盒**：内环节点在静息缩放下，到中心的屏幕距离要 > briefing 半宽/半高 + 余白，**任何人卡都不压 briefing**。

### B — 可读的 calm 框景（不要 fit 全图）
- 静息态（无 focus）镜头框 **内环（人）+ 中心 briefing**，缩放**可读**（目标 scale ≈ **0.8–1.0**，人卡名字 + HP/MP 清晰）。
- **外环（项目）允许溢出视口**，靠 pan/zoom 探出；缩小可看全局。
- 实现：把 Dashboard 的静息 `cameraPoints` 从 `wholeMap` 改为**内环人节点的 bbox**（或一个以 nucleus 为中心、scale≈0.9 的固定 "home" transform）。给 calm scale 设下限，保证可读。
- focus 态镜头不变（框 primary + 关联簇），清空 focus 回到 calm home。

---

## 3 · 起步参数（**仅起点，必须在浏览器里调**）

> 上一轮就是因为闭眼定死参数翻车。下面给约束 + 起点，**真值靠 `npm run dev` 肉眼调**。

- board：从 2600 缩到 **~1700–1900**（不再 fit 全图，不需要那么大）。
- `R_INNER`：让内环在 calm scale≈0.9 下，屏幕半径 ~300–340px（清开 460px 宽 briefing），起点 **~560**。
- `R_OUTER`：> R_INNER + 一张项目卡宽 + 余白，起点 **~920**。
- calm 目标 scale ≈ **0.9**（cap 上限 ~1.0、下限保证可读）。
- 验收以"人卡是否清晰可读 + 不压 briefing"为准，不以这些数字为准。

---

## 4 · 验收标准（在 `npm run dev` 里逐条确认）

1. **静息可读**：无 focus 时人卡完整可读（名字 + HP/MP 条清楚，≈ 自然大小，scale ≥ ~0.8），**没有小点/鸟瞰缩成一团**。
2. **中心不打架**：briefing 居中，**无任何节点压在它上面**；内环绕它一圈、留清晰余白。
3. **层级清楚**：人 = 可读**内环**，项目 = 明显**外环**；owner→project 辐条短、放射、不交叉。
4. **可延展**：外环项目可超出视口，**pan/zoom 能探出**；缩小能看到全图。
5. **focus 不回归**：点节点 → 镜头框该簇；清空 focus → 回到 calm home 框景。
6. **无回归**：chrome 仍视口固定；rail/replay 仍 work；未扩 `canvasStore`；`npm run typecheck` + `npm run build` 全绿。

---

## 5 · 关键文件

| 文件 | 改什么 |
|---|---|
| `src/data/layout.ts` | board 尺寸、`R_INNER`/`R_OUTER`；**删 `You=CENTER` 特例**（You 进 `ringPeople`）；**删 `PITCH_ANGLE_DEG` 特例**（pitch 对齐 You 环角）；保持公式 |
| `src/components/scenes/DashboardScene.tsx` | calm `cameraPoints`：`wholeMap` → 内环 bbox / nucleus home transform；calm scale 目标 |
| `src/lib/useRailCamera.ts` | 如需"home"取景或 calm scale cap，在此调（仍纯派生、不入 store）|
| `src/styles/global.css` | 如需微调 briefing 与节点的 z 关系 / 内环余白 |

---

## 6 · 顺带（次要，别让它喧宾夺主）

- **Nexus 同病排查**：Nexus board 1640，确认静息/默认镜头下 flow 节点**也是可读的**（不是 fit 全图缩成小点）。`nexus-brief` 在左上、不在中心，所以**无中心打架**，只需保证可读。若已可读则不动。

---

## 7 · 验证 & 建议技能

- 这是**高度视觉**的活，**每改一块就 `npm run dev` 在浏览器里对照 §4 验收**——别靠推理（上一轮教训：agent 判断不了构图，必须真跑）。建议用 `run` / `verify` 技能。
- 卡顿/错位 → `diagnose`（先 instrument 再改）。
- 收尾 `npm run typecheck` + `npm run build` 必须绿。
- **不要** `/grill-with-docs`——决策已定，这是执行。

---

## 8 · 完成后

改完回到主对话交 review（对照 §4 逐条）。工作树继续脏放着、不要 commit（由人决定何时提交）。
