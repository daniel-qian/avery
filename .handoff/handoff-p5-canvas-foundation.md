# Handoff — P5 ④⑤⑥: pannable/zoomable 画板地基 + Nexus 安全区 + Dashboard 同心环

**Repo:** `D:\TeamMaster-Prototype-2.0` · branch `main` · TeamMaster 投资人 demo 原型（Vite + React 18 + framer-motion + zustand）
**Your job:** 实现 P5 的 ④⑤⑥，严格按已写定的 **`docs/adr/0012-pannable-zoomable-canvas-rail-derived-camera.md`**。决策都谈定了，这是纯执行。

---

## 0 · READ FIRST（别跳过，决策不要重新发明）

1. **`docs/adr/0012-pannable-zoomable-canvas-rail-derived-camera.md`** — 本次工作的全部决策与否决项。**这份 handoff 不复述它的内容**，只补执行细节。
   - ⚠️ **先读该 ADR 的「修订 1」节**（第一版被 git reset 退回后写定）。修订 **取代了决策 2 的分层清单与决策 4 的镜头取景**；下方 §2 的步骤 A / 跨④⑤镜头段已按修订更新，但以 ADR 修订为准。五条契约速记：(1) world = 背景表面＋节点＋连线＋briefing＋nexus-brief＋Nexus 结果卡；HUD 只剩控件家具；(2) world 对象 **board px only**，禁 vw/视口%/clamp(…100%)；(3) calm 镜头 = 公式算全图 fit，不手设 initialScale；(4) step/focus 镜头 = 飞向局部 bbox（活跃簇＋该拍结果卡），与 calm 相反；(5) 镜头 fit 到 **HUD-safe 视口矩形**（视口减 HUD margin），退役 board-side gutter。
2. `CONTEXT.md`（repo 根）— glossary。Dashboard = ambient 空间式指挥中心 / 平静地图；Nexus = 放射编排画布；Calm/Focus 定义。**glossary 只放领域词，明确 _Avoid_ 把 "canvas" 当术语——别加。**
3. 相关 ADR：`0004`（Nexus 手摆放射坐标——被本 ADR 触及：坐标搬 board 空间，topology 不变）、`0006`（rail replay-to-target，无状态）、`0003`（rail 可删、free-click 是 core）、`0010`（地图层守 calm——这是 ⑤ 选 organic 而非团队扇区的原因）、`0001`（prototype/demo-only）。
4. 用户工作偏好 memory：`C:\Users\86139\.claude\projects\D--TeamMaster-Prototype-2-0\memory\prefer-runtime-navigation-over-handtuned-layout.md` — **别手摆像素坐标硬塞一屏；用公式算坐标 + 运行时 pan/zoom 导航。** 这正是 ④⑤⑥ 的全部动机。

---

## 1 · 三条铁律（违反即返工）

- **不扩 `src/store/canvasStore.ts`**（P5 铁律）。镜头 / pan / zoom 交互态走组件局部 state 或 rzpp 的 ref，**不进 store**。
- **replay-safe**（ADR-0006）：一切派生自 `thread.steps`（Nexus）/ `focus`（Dashboard）。镜头目标 = 当前 step 的纯函数；`seek` 倒带后自洽重算。
- **rail 可删**（ADR-0003）：pan/zoom 是 core 能力，删掉 rail（`railStore` + `DemoControls`）后仍可用。

---

## 2 · 执行计划（建议顺序：地基 → ④ → ⑤）

### 步骤 A — 画板地基（gate 住 ④⑤）
- 装依赖：`react-zoom-pan-pinch`（v3.4.3，React 18 OK）。
- 新建 `src/components/PanZoomCanvas.tsx`：包 `<TransformWrapper>` / `<TransformComponent>`，Dashboard 与 Nexus **共用**（强化 ADR-0004"同一产品两面"）。`forwardRef` 暴露 `ReactZoomPanPinchRef` 给镜头 hook。
- **world / HUD 分层**（最关键的一刀——已按 ADR 修订 1 重画，**勿用旧的"只有节点进画板"版本**）：
  - **放进 `<TransformComponent>`（world，随镜头 pan+zoom）**：① 一张 board 尺寸的**背景表面**（把 `canvas-grid` 搬进画板、放大到 board 尺寸——这是"拖拽像移动世界而非转节点环"的关键，旧版漏了它）② 实体节点 ③ 连线 SVG ④ `briefing-layer` ⑤ `nexus-brief` ⑥ **Nexus 中央结果卡**（Mismatch/Timeline/Chat/StructuredOutput，需给 board 坐标、不再 CSS 居中）。
  - **留在外面（HUD，viewport-fixed，只剩控件家具）**：Topbar、Ask composer、dashboard tags/search、`alert-pill-layer`、`nexus-inspector`、`nexus-advance-bar`。
  - **board px only**：上述 world 对象全部用 board 像素尺寸/定位，**禁 vw / 视口% / `clamp(...100%...)`**（这些只在 HUD 合法）。必清三处：`nodeStyle()` 的 clamp、briefing 宽 `min(460px,100vw-48px)`、briefing `h2` 的 `3.4vw`。
- **坐标系切换**：`PERSON_POS`/`PROJECT_POS`（`src/data/layout.ts`）、`NEXUS_POS`（`src/data/nexusLayout.ts`）从"视口百分比 + `clamp()`"改为**固定 board 像素坐标**（定一个 board 尺寸，如 1600×1200，可更高）。
  - `DashboardScene.tsx` 的 `nodeStyle()` 现在是 `clamp(half, pos%, calc(100%-half))` → 改成 board 空间的绝对 `left/top` px。
  - `src/components/SvgEdgeLayer.tsx` 和 `NexusScene.tsx` 内的 `NexusEdgeLayer`：现在 `viewBox="0 0 100 100" preserveAspectRatio="none"`（% 坐标）→ 改成 board 尺寸 viewBox，去掉 `preserveAspectRatio="none"`，path 用 board 坐标（`src/lib/edges.ts` 的 `edgePath()`）。

### 步骤 B — ④ Nexus 安全区 / 向下延申
- **不重摆 `NEXUS_POS` 的放射 topology**，只搬进 board 坐标。
- **～~右侧留 inspector 宽 gutter~~ 已废**（见修订 1 契约 5）：改用**镜头 HUD-safe inset 取景**解决"撞 inspector"——镜头 fit 时可视区减去右侧 inspector margin，飞过去的内容自然落在面板左侧空净区，不需要在 board 上预留固定 gutter。
- board 高度可大于视口；节点向下延申由 pan + 镜头兜住。inspector 是 viewport-fixed 浮层，节点平移到它背后即可（不再"撞"）。

### 步骤 C — ⑤ Dashboard 同心放射（organic，公式算坐标）
- `You`(`u_you`) 在 board 正中心当 hub。
- 其余 13 人按 `team` 松散聚簇铺**内环**（半径 R1）。
- 7 项目铺**外环**（半径 R2 > R1），**各自摆在 owner 的角度**上 → owner→project 连线 = 干净短放射辐条、不交叉。带项目者一根向外辐条，不带者无 → 外环有机不均匀（OK，这是要的气质）。
- owner 映射（已查）：`p_acme→u_vanessa` · `p_connector→u_bill` · `p_pitch→u_you` · `p_capabilities→u_wang` · `p_designsys→u_andy` · `p_csonboard→u_kate` · `p_billing→u_jason`。
- 角度从 `team + index` 公式推，**别手摆**。team 分布：Eng 6、GTM 3、Founders 2、Product/Design/Ops 各 1。
- **不要团队扇区/org-chart**（ADR-0010 守 calm）。
- 顺手：把 DashboardScene 里内联的 `avatarStyle()` 换成共享 `<PixelAvatar>`（本 session 已建，见 §4）——ADR-0012 提到的收尾。

### 跨 ④⑤ — rail 派生镜头（camera-on-rail，已按 ADR 修订 1 更新）
- 新建 `src/lib/useRailCamera.ts`（或 hook）：读活跃 step（Nexus：`thread.steps` 末项 kind；Dashboard：`focus`）→ 算镜头目标 → 经 ref `zoomToElement` / `setTransform(x,y,scale,animationTime,'easeOut')` 动画 fit。
- **两种相反的取景**：
  - **calm / 静息（无 active step、focus=null、首帧）= 全图 fit**：算整张 map（节点环＋briefing）包围盒，fit 到视口 + padding 居中。**不要手设 `initialScale`**（公式算，守 memory `prefer-runtime-navigation-over-handtuned-layout`）。
  - **step / focus = 飞向局部 bbox**：算 (该拍活跃节点簇 ＋ 该拍 Nexus 结果卡) 包围盒，zoom 到**结果卡可读**——**不是**把卡＋整环塞进全图 fit（大报告卡会缩小一切 = 比例 bug 复活）。
- **fit 到 HUD-safe 视口矩形**：包围盒→scale/position 换算时，可视区用**视口减去 HUD margin**（上 Topbar、右 inspector、下 composer），否则飞过去的簇/卡落到固定面板底下（= 原 "撞 inspector" 复活）。**这取代了旧步骤 B 的 "board 侧留 inspector 宽 gutter"——别再做 gutter。**
- 给每个节点 + 每张结果卡稳定 DOM `id`，`zoomToElement` 才能定位；或自己算 bbox 后 `setTransform`。
- 纯派生：effect 以"派生出的镜头目标"为 dep。**不入 store**。手动 pan 后下一拍 rail 再收回——与 focus 同构。
- 镜头同时适用 Dashboard 与 Nexus。

---

## 3 · `react-zoom-pan-pinch` API 速查（v3.4.3，已核实）
- `<TransformWrapper>` props：`initialScale`、`minScale`、`maxScale`、`limitToBounds`、`centerOnInit`、`doubleClick`、`wheel`、`panning`。
- `<TransformComponent>`：`wrapperStyle` / `contentStyle`（让 wrapper 撑满 scene）。
- ref 类型 `ReactZoomPanPinchRef`：`zoomToElement(node|id, scale?, animationTime?, animationType?)`、`setTransform(x, y, scale, animationTime?, animationType?)`、`centerView()`、`resetTransform()`、`instance.transformState`。
- render-props 模式：`<TransformWrapper>{({ zoomIn, zoomOut, setTransform }) => (...)}</TransformWrapper>`。
- 来源：github.com/BetterTyped/react-zoom-pan-pinch · unpkg `react-zoom-pan-pinch@3.4.3/dist/index.d.ts`。

---

## 4 · 关键文件地图
| 文件 | 角色 |
|---|---|
| `src/components/AmbientCanvasShell.tsx` | scene 路由 |
| `src/components/scenes/DashboardScene.tsx` | Dashboard：chrome + people-layer + project-layer + composer。`nodeStyle()` clamp 在此 |
| `src/components/scenes/NexusScene.tsx` | Nexus：flow-layer 节点 + edges + brief + inspector + advance；内含 `NexusEdgeLayer` |
| `src/data/layout.ts` | `PERSON_POS`/`PROJECT_POS`（% 坐标）→ 改 board + 同心公式 |
| `src/data/nexusLayout.ts` | `NEXUS_NODES`/`NEXUS_POS`/`NEXUS_EDGES` → 坐标搬 board |
| `src/components/SvgEdgeLayer.tsx` | Dashboard owner→project 连线（viewBox 0-100）|
| `src/lib/edges.ts` | `edgePath()` 贝塞尔 |
| `src/lib/focus.ts` | focus 关联簇解析 |
| `src/store/canvasStore.ts` | 冻结契约——**别扩** |
| `src/store/railStore.ts` | rail replay-to-target；镜头**别存这里** |
| `src/components/PixelAvatar.tsx` | 本 session 新建的共享像素头像（`<PixelAvatar person size>`）+ 非 scoped `.pixel-avatar` CSS |
| `src/styles/global.css` | 全部 CSS，banner 分区（`P1 Dashboard` / `P2 Nexus` / `P5 Shared PixelAvatar`）|

---

## 5 · 本 session 已完成（未提交，工作树脏）— 不要重做，但要知道 -- 更新：已经提交
- **②③ 已落地 + build 验证**：抽出共享 `src/components/PixelAvatar.tsx`；像素头像铺到 ProjectDetailScene team、EmployeeDetailScene 头部（经 `DetailShell` 新增的 `media` prop）、NexusScene 的 chat(Bill/You) / Bill 节点 / report；删了 Nexus 的 `<h2>The question becomes a coordinated thread.</h2>`。
- **① composer 展开卡顿——未解，且大概率不归你**：两个场景级假设（composer blur、节点 blur）都被证伪并已回退；composer 代码已退回 baseline（`y/opacity` reveal）。当前主假设 = **dev 模式 StrictMode 双渲染 + Vite 未压缩开销**，production build 里可能根本不卡。**正等用户跑 `npm run preview` 验证**。若 production 丝滑 → 无需改代码。若仍卡 → 先定位（只 composer vs 整个 dashboard）再修；真要平滑长高，canonical 解是给 `.composer-card` 上 framer `layout`。除非用户要你接手 ①，否则**别动 composer**。
- git：工作树有 pre-existing `M`（DashboardScene/EmployeeDetailScene/ProjectDetailScene/fixtures.p3.ts/global.css 等）+ 本 session 改动，**全部未 commit**。ADR-0012 + memory 已写盘。

---

## 6 · 验证
- 类型：`npm run typecheck`（= `tsc -b`，严格，删函数记得清引用）
- 构建：`npm run build`
- 看效果：`npm run dev`（注意 dev 下动画天生偏卡，判性能以 `npm run preview` 为准）

---

## 7 · Suggested skills
- 开工前：直接读 `docs/adr/0012-...md`（决策已定，**不要再 /grill-with-docs**）。
- 实现期：`run` 或 `verify` —— 这是高度视觉/画布的活，每做完一块就在浏览器里跑起来确认 pan/zoom/镜头/布局，别靠想象（用户明确说视觉校对不是 agent 强项，所以更要真跑）。
- 若 pan/zoom 或镜头出现卡顿/错位：`diagnose`（先 instrument 再改，别盲猜——本 session ① 的教训）。
- 收尾：`code-review`（diff 较大，覆盖坐标系切换 + 新依赖）。
