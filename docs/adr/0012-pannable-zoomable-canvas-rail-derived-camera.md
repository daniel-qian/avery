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
