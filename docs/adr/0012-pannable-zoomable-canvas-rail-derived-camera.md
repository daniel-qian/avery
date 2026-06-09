# Dashboard & Nexus 升级为可平移/缩放画板（react-zoom-pan-pinch）；chrome/canvas 分层 + rail 派生镜头

## 背景

P5 实跑暴露三个空间问题：

1. **Nexus 撞面板**：节点变多时即便全屏，放射布局也把右侧节点（`hr-cap` x=78）压到固定的 `nexus-inspector`（Current focus）下，重叠。
2. **Dashboard 层级不分 + 不 scale**：`layout.ts` 把人/项目散点**混摆同层**（`PERSON_POS` / `PROJECT_POS` 交错），视觉层级读不出；且坐标是 `clamp(px, pos%, calc(100%-px))`——**相对视口百分比**，靠硬塞进一屏，org 从 21 实体长大必崩。
3. **手摆坐标 = 昂贵 visual-confirmation 循环**：要把 `NEXUS_POS` / `PERSON_POS` / `PROJECT_POS` 像素坐标调到"刚好不重叠、刚好进一屏"，得反复跑 dev server 肉眼校对——对 agent 尤其不可靠。

Danny 的判断（本次 grill 的根）：不要把"装得下"当静态布局问题解，**下放到运行时导航**——画板可平移/缩放，节点摆"大致对"即可，挤不下让用户平移。明确："drag" 指**拖拽画板本身（pan）**，不是拖单个节点。

## 决策

Dashboard 与 Nexus 共用一个 pan/zoom 画板基座。六条：

1. **选 `react-zoom-pan-pinch`（v3.4.3，React 18 兼容），否决 React Flow。** 只需 pan/zoom、不要 node-drag / 连边交互 / minimap——React Flow 招牌能力一个不用，杀鸡用牛刀且要换渲染范式。`react-zoom-pan-pinch` 一个 `<TransformWrapper>/<TransformComponent>` 包住现有 DOM 即给 pan + wheel-zoom + pinch，**保留全部现有渲染 + framer-motion 动效**，只加一个聚焦依赖。

2. **chrome / canvas 两层。** 只有「实体节点 + 连线」躺在可平移画板上；其余全部 viewport-fixed 浮层（Topbar、Ask composer、dashboard tags/search、briefing、alert pills、`nexus-brief`、`nexus-inspector`、advance bar）。→ 撞 inspector 问题消解：画板在固定面板底下平移，节点再多只是滑到面板背后；画板右侧留一条 inspector 宽度 gutter，resting 时节点不停其正后方。

3. **坐标系 viewport-% → board 绝对坐标。** `layout.ts` / `nexusLayout.ts` 从"相对视口百分比 + px clamp"改为固定 board 像素空间；`SvgEdgeLayer` / `NexusEdgeLayer` 的 `viewBox 0–100 + preserveAspectRatio=none` 跟着改为 board 坐标。board 可比视口大（含更高），溢出由 pan/zoom 兜——这就是 Nexus 的"向下延申"。

4. **rail 推进派生镜头（camera-on-rail）。** 每拍 rail 推进 → 算该拍活跃节点簇包围盒 → 经 ref `zoomToElement(id)` / `setTransform(x, y, scale, animationTime)` 动画 fit。**镜头目标 = 当前 step / focus 的纯函数，不进 `canvasStore`**（守 ADR-0006 replay-safe + P5 不扩 store 铁律；`seek` 倒带后镜头自洽重算）。自由 pan/zoom 始终可用（守 ADR-0003：pan/zoom 是 core 能力，删 rail 仍在），手动拖后下一拍 rail 把镜头收回——与 focus 同构（rail 设 / free-click 设，同一 action）。镜头同时适用 Dashboard 与 Nexus。

5. **Dashboard 同心放射几何（organic），否决团队扇区。** You 居中当 hub；其余 13 人按 team 松散聚簇铺**内环**；7 项目摆**外环**、各自从 owner 角度向外延伸 → owner→project 连线 = 干净短**放射辐条**、不交叉；带项目者一根向外辐条，不带者无 → 外环自然有机不均匀。坐标**公式化**（team + index 推角度），不手摆。

6. **像素 avatar 全产品铺开**（承 ADR-0010 像素方向，范围从"仅 calm 卡"扩到人像出现处）：抽共享 `<PixelAvatar person>`，替换 `ProjectDetailScene` team（现 `initials()`）、`EmployeeDetailScene` 头部（现无）、Nexus ChatCard（Bill / You）、Bill 节点、report confirmations。agent（PM / HR）无 person sprite，保持文字。

## 被否的替代

- **React Flow（@xyflow/react）**：一步给 pan/zoom/drag/edges/minimap，但要把 DashboardScene + NexusScene + SvgEdgeLayer + 两份坐标 + framer-motion focus/dim 全重写成 RF 自定义节点，数天级迁移，且只用其 pan/zoom 子集。否。
- **node-drag（拖单节点）**：非 demo 叙事，反而会拖乱为 Venus 摆好的姿态；真正需求是 pan/zoom 导航。砍。
- **继续手摆静态坐标硬塞一屏**：visual-confirmation 循环昂贵、不随 org 增长 scale。否——这正是本 ADR 要解的。
- **Dashboard 团队扇区（org-chart 式楔形）**：层级最强最算法化，但把"平静天气地图"推成生硬结构图，与 glossary 钉死的 ambient 指挥中心气质冲突、削弱 ADR-0010 "地图层守 calm" 护栏。否。
- **镜头纯手动（rail 不动镜头）**：更省码，但脚本演示会"推进了却没在画面里"，对投资人太脆。否。

## 后果

- 新依赖 `react-zoom-pan-pinch`（**扩展 ADR-0002** 冻结的 stack；framer-motion 仍在，二者分工：framer = 节点级进出场 / focus，rzpp = 画板级取景）。
- **触及 ADR-0004**：Nexus 手摆坐标语义不变（放射 topology + step 纯派生节点态 + 无参 `runAgent` 线性推进**全部保留**），仅坐标空间 viewport-% → board，且节点云置于可平移画板。ADR-0004 其余 accepted。
- 新建 / 改（均不扩 `canvasStore`）：共享 `<PanZoomCanvas>`（包 `TransformWrapper`，Dashboard / Nexus 复用，强化 ADR-0004"同一产品两面"）、`useRailCamera` 派生镜头 hook（读 step / focus → ref 命令）、`layout.ts` / `nexusLayout.ts` 改 board 坐标、`SvgEdgeLayer` / `NexusEdgeLayer` 改 board viewBox、共享 `<PixelAvatar>`、composer 去 `backdrop-filter` + `grid-template-rows 0fr→1fr` 平滑展开、删 `nexus-brief h2`。
- **不扩 `canvasStore`**（守 P5 铁律）：镜头 + pan/zoom 交互态走组件局部 / rzpp ref，replay 仍只读 `thread.steps` 派生。
- **CONTEXT.md 不动**：可平移画板是**视觉机制、非领域概念**（glossary 明确 _Avoid_ "canvas" 作术语）。
- replay-safe（ADR-0006）/ rail 可删（ADR-0003）均不变。
- 解耦：Dashboard 几何、composer 动画、删标题、avatar 各自独立可落，互不阻塞 ⑥ 的画板基座。

## 修订 1（2026-06-09，P5 实跑回归后 — 修订决策 2 与 4）

第一版 handoff（`handoff-p5-canvas-foundation.md`）**忠实**实现了决策 2/4，但实跑被 git reset 退回，暴露两个回归，**根因都在原决策本身，不在执行**：

1. **比例崩**：people 节点很小、briefing 卡与文字巨大。原因——chrome 在 `<TransformComponent>` **外**、永不被 `scale`；节点在内、被 `scale` 乘。board zoom-to-fit 时（任何 `initialScale<1`）节点缩、chrome 不缩 → 设计师按 1:1 调好的比例当场崩。
2. **拖拽像在转节点环、不像移动背景**：`canvas-grid`（`global.css` `inset:0`）被当 chrome 留在画板外恒定不动；briefing 钉死正中（`top/left:50%`）坐在节点环的甜甜圈洞里。pan 时 grid 不动、中心卡不动、只有环在滑 → 读作"我抓住了节点环在拖"，因为**没有任何看起来像世界表面的东西随镜头移动**。

诊断：决策 2 的 chrome/canvas 线把"几乎一切"划成 viewport-fixed，board 上只剩裸节点——既无世界表面传达运动（症状 2），也与 chrome 不共享 scale（症状 1）。原决策遗漏了**三份未写明的契约**。下列五条修订之，**取代决策 2 的分层清单与决策 4 的镜头取景**：

1. **重画 world / HUD 线。** **world**（在可平移画板上、随镜头 pan+zoom）= 一张 board 尺寸的**背景表面**（原 `canvas-grid` 搬进画板、放大到 board 尺寸）＋ 实体节点 ＋ 连线 ＋ **briefing** ＋ **`nexus-brief`** ＋ **Nexus 中央结果卡**（Mismatch / Timeline / Chat / StructuredOutput——原 ADR 两张清单都没收录它们，是 gap）。**HUD**（仅 viewport-fixed 浮层）= 只剩真正的"控件家具"：Topbar、Ask composer、dashboard tags/search、alert pills、`nexus-inspector`、advance bar。→ briefing/nexus-brief/结果卡均改判 world，**与节点同缩**，症状 1 大半自愈。

2. **board px only（scale 契约）。** 一切 world 对象的尺寸与定位**纯用 board 像素**——禁 `vw`、禁视口 `%`、禁 `clamp(...100%...)`；这些单位**只在 HUD 合法**。必改的三处遗漏：`nodeStyle()` 的 `clamp(half,pos%,calc(100%-half))` → board px；briefing 宽 `min(460px,calc(100vw-48px))` → 定 px；briefing `h2` 的 `clamp(28px,3.4vw,44px)`（巨字元凶，`vw` 跟的是窗口不是 board）→ 定 px。board 只有一套坐标系，比例对 scale 不变。

3. **calm / 初始镜头 = 公式算的"全图 fit"。** 原 ADR 只定义了 active-step / focus 的派生镜头，**没定义静息镜头**——于是 rzpp 回退默认（`initialScale:1` + `centerOnInit`），装不下 board，执行者多半手设了个小 `initialScale` 硬塞，这正是"开局节点很小"的另一半成因。改为：calm target = 整张 calm map（环＋briefing）包围盒 fit + padding 居中，**复用同一套派生镜头机器**，**不手设 `initialScale`**（守 memory `prefer-runtime-navigation-over-handtuned-layout` ＋ 本 ADR 决策 4）。briefing 既已成 world（可被 pan 出屏），calm 镜头是"开局必见 headline"的保证，非可选。

4. **step / focus 镜头 = 飞向 local bbox（与 calm 相反的操作）。** 中央结果卡既是 world 对象，每拍 rail（及 free-click focus）**飞向 (该拍 active 节点簇 ＋ 该拍结果卡) 的局部包围盒**、zoom 到**结果卡可读**——**不是**把"卡＋整环"塞进全图 fit（大报告卡会把一切缩小 = 症状 1 从后门回来）。环成为出框的可平移上下文；报告是"飞过去的目的地"，非 modal。结果卡因此需要**真实 board 坐标**（锚在各自簇旁），不再 CSS 居中。**calm = 全图 fit；step = 局部 fit，二者方向相反。**

5. **镜头 fit 到 HUD-safe 视口矩形（取代 board-side gutter）。** Topbar（上）/ inspector（右）/ composer（下）都浮在 board 之上；若镜头 fit 整个视口，飞过去的簇与卡会落到这些家具**底下**——即原 ADR 开篇的 "Nexus 撞 inspector" 借镜头复活。原步骤 B 用"board 侧留 inspector 宽 gutter"挡——但 gutter 是固定 board 距离去对抗视口尺寸的面板，跨屏会 mis-fit。改为：镜头 fit-bbox 用**视口减去 HUD 上/右/下 margin 后的安全矩形**，任何缩放下飞过去的内容都落在空净区。**退役 board-side gutter。**

未变：决策 1（选 rzpp）、3（坐标系 viewport-%→board，本修订只是把"什么算 board 对象"扩大）、5（Dashboard 同心放射几何）、6（PixelAvatar）。不扩 `canvasStore` 铁律、replay-safe、rail 可删、CONTEXT.md 不动（world/HUD 同 "canvas"，是视觉机制非领域词）均不变。
