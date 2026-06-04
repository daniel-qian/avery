> PRD · 由 grill-with-docs + to-prd 于 2026-06-04 从对话综合而来。建立在 **P0.5 contract pass**（已落地、build 绿）之上。术语见 `CONTEXT.md`；尊重 ADR-0001（demo-only）/ ADR-0003（rail = 可拆 driver）。

## Problem Statement

作为正在用 TeamMaster 看自己公司的 manager / founder（以及 Venus 首演时驱动 demo 的 Danny），我打开 Dashboard 时看到的应该是一张**平静、可读的"组织天气"地图**——一眼分得清谁忙、哪个项目吃紧。但当前（P0）的 Dashboard 是个**永远全展开的静态堆叠**：卡片互相重叠、靠边的卡片 bbox 溢出视口、Briefing 没有居中的呼吸空间，而且**没有任何办法把注意力收束到某一簇**人/项目上。它读起来像一次性数据倾倒，不像一个让人"先看清、再动手"的观察面。我需要它先静下来，再能按我的意图点亮我关心的那一簇。

## Solution

Dashboard 有两个态（见 `CONTEXT.md`）：

- **Calm** —— 静息默认态。人 = avatar + 名；项目 = 小 chip（状态点 + 标题）。Briefing 居中作主角，人/项目绕它转。无高亮、无展开。
- **Focus** —— 一组**关联实体被点亮、其余淡化**的态。单点节点也点亮"该实体 + 关联簇"（owner / 依赖 / 被分配的人），不是只亮被点那一个。

三种选择器进入 Focus，统一走同一条路径与同一套 relatedness（零分叉）：

1. **点单个节点**（人 / 项目）；
2. **顶部 tag 行**（5 个 curated tag：This week / At risk / Acme Pilot / Engineering / Hot spots），多选 = 并集；
3. **顶部 search 栏**（手动输入，substring 匹配 name/title）。

**点空白处** → 恢复 Calm。

与三者并列但**语义根本不同**的是底部 **Composer**：它不是"在地图上找"，而是"问 agent"——把 hero 问题飞进 Nexus（scene 切换）。两个输入框必须差异化，因为它们做的事不同。

外加：**alert pills** 浮现 hot-spot 信号、density pass 修重叠/溢出、framer-motion 接入 focus 暗化/缩放过渡。

## User Stories

1. 作为 manager，我想打开 Dashboard 时看到一张平静的组织地图（Calm 态），以便一眼读出组织天气而不被信息淹没。
2. 作为 manager，我想在 Calm 态下每个人只显示 avatar + 名、每个项目只显示状态点 + 标题，以便地图保持低密度、可扫读。
3. 作为 manager，我想让开场 Briefing 居中且四周留白，以便它作为"组织天气"主角被先读到。
4. 作为 manager，我想点击某个项目时它连同其 owner、依赖项目、被分配的人一起点亮、其余淡化，以便我立刻看到这个项目牵动了谁。
5. 作为 manager，我想点击某个人时他连同他 own 的项目、他有 task 的项目一起点亮，以便我看到这个人的工作面。
6. 作为 manager，我想被点中的那个实体有比关联簇更强的视觉强调（锚点），以便我记得我是从哪进入 Focus 的。
7. 作为 manager，我想在顶部看到一行最多 5 个标签（This week / At risk / Acme Pilot / Engineering / Hot spots），以便用预设视角快速切片地图。
8. 作为 manager，我想选中一个标签时自动点亮其匹配的项目/人簇，以便不用逐个点节点就能聚焦一个主题。
9. 作为 manager，我想同时选中多个标签时点亮它们的并集（越选越多），以便叠加我关心的多个维度。
10. 作为 manager，我想 "This week" 标签点亮本周到期的项目（Acme/Connector/Pitch），以便聚焦时间压力簇。
11. 作为 manager，我想 "At risk" 标签点亮系统判断为 at-risk 的项目，以便直奔风险。
12. 作为 manager，我想 "Engineering" 标签点亮工程团队的人及其项目，以便按人群聚焦。
13. 作为 manager，我想 "Hot spots" 标签点亮被标记的热点（Connector），以便预热 reality gap 所在区域。
14. 作为 manager，我想在顶部有一个搜索栏，手动输入即按名称/标题匹配并点亮命中的人/项目簇，以便用自由关键词聚焦。
15. 作为 manager，我想搜索栏与底部 AI 输入栏在视觉上明显不同，以便我不会把"在地图上找"误当成"问 agent"。
16. 作为 manager，我想点击空白处即取消所有标签/搜索/单点选择、恢复 Calm，以便一键回到平静态。
17. 作为 manager，我想 Focus 态下无关的人/项目被淡化而非移除，以便我仍保有全局上下文。
18. 作为 manager，我想在底部有一个醒目的 Composer 来提问，以便把一个管理问题交给 agent 编排（飞进 Nexus）。
19. 作为 manager，我想 hero 问题"Are we on track to ship the Acme pilot this Friday?"能从 Composer 发出，以便触发 demo 主线。
20. 作为 manager，我想在 Dashboard 上看到 alert pills 浮现 hot-spot / 风险信号，以便在钻入前就察觉异常。
21. 作为 manager，我想靠近视口边缘的节点被 clamp 在安全边界内，以便没有卡片溢出被截断。
22. 作为 manager，我想任何两个节点不重叠，以便每张卡片都可点、可读。
23. 作为 manager，我想 Calm→Focus 的暗化/缩放是平滑过渡（仅 transform/opacity）而非闪切，以便它读起来沉稳。
24. 作为开启了 prefers-reduced-motion 的用户，我想过渡退化为即时切换，以便不被动效干扰。
25. 作为 Danny（demo 驱动者），我想自由点击就能复现每个 Dashboard beat（B1/B2），以便 rail 始终是可拆 driver（ADR-0003 litmus）。
26. 作为 manager，我想移除左上角的 "Ambient command center / Prototype" 卡片，以便顶部留给 tag 行与 search。
27. 作为 manager，我想从 Focus 态再点一次锚点节点就钻入其详情 scene，以便"先看清簇、再钻进去"。

## Implementation Decisions

立在 **P0.5 已冻结的契约**上（`canvasStore.ts` + `lib/focus.ts` + `fixtures.ts`），P1 **不得再扩 store**，只消费已有 action：

- **状态即单一事实源**（ADR-0003）：Calm = `focus === null`；Focus = `focus` 为下面这个**已锁形状**（来自 P0.5 contract pass）：

  ```ts
  interface Focus {
    source: 'node' | 'tag' | 'search'
    projectIds: string[]   // 点亮 → .is-related
    personIds: string[]
    primary?: { kind: 'person' | 'project'; id: string }  // 锚点 → .is-focused
    selector?: { tags?: string[]; query?: string }        // 顶部 UI 回显
  }
  ```

- **三种选择器统一出口 `setFocus`**：节点 → `setFocus(focusEntity(kind,id))`；tag → `setFocus(focusTags(ids))`；search → `setFocus(focusSearch(q))`；空白 → `setFocus(null)`。集合解析全在 `lib/focus.ts` 纯函数里，组件只读结果、不自算 relatedness（一套 relatedness、零分叉）。
- **Composer 走 `askQuestion(text)`**（≠ search）：设置 thread 问题 + 切到 Nexus（B3）。Composer 与 search 是两件事，UI 必须差异化（search 轻/嵌顶部 filter 行；Composer 重/底部居中行动入口）。
- **tag = curated fixture + 声明式 match**（`DASHBOARD_TAGS`，5 个，已在 fixtures）；多选 = 并集；`Project.hotspot` 标记驱动 "Hot spots"（Connector=true）。tag/search 判定 in-scope（B1/B2〔自由交互〕的实现机制）、保持精简、不开新 ADR。
- **密度模型 = 方案 A**：Calm 极简（人=avatar+名、项目=状态点+标题）；Focus/drill 才展开 summary/progress/tasks。**别让卡片永远全展开**（P0 现状是临时态）。
- **布局 = 手工坐标**（`layout.ts`，deterministic，不上 layout 引擎）；新增**边界 clamp**（参照 `prototype-vanilla/app.js` 的 `setNodePosition`）+ **去重叠**；Briefing 居中需留中心空区。
- **视觉类已存在**：`.is-related` / `.is-muted` / `.is-focused`（节点）；CSS 写进 `global.css` 尾部 P1 banner，**别 fork 共享基座**。
- **动效**：framer-motion 仅动 transform/opacity，不动 width/height，不处处 blur，守 `prefers-reduced-motion`。
- **可拆分并行**：P1a（focus 暗化缩放 / composer / alert pills / framer-motion，不依赖 layout 清单）与 P1b（删卡 + tag/search UI + density/clamp/去重叠）可作为两个并行切片，互不改 store。

## Testing Decisions

- **不引入测试设施**（守 ADR-0001 demo-only）。验证 = `npm run build`（`tsc -b` 零类型错 + vite bundle 成功，**硬性必须过**）+ **手动浏览器验**（`npm run dev`，见 handoff §7；注意 Windows localhost 探针怪癖是 shell 客户端问题、非 app 问题）。
- **好测试只验外部行为**：本 feature 的"行为"是视觉态（Calm 的低密度、Focus 的点亮/淡化正确簇、点空白回 Calm、search/Composer 视觉可区分），最适合手动观察验收，不值得为 demo 一次性件搭测试栈。
- **逻辑 seam = `lib/focus.ts` 三个纯函数**（`focusEntity / focusTags / focusSearch`）：确定性、吃 fixtures，是 focus 视觉对错的唯一逻辑源头。本期不为它写自动化测试（同 demo-only 取向），但它被刻意抽成纯函数，**留作日后若上 vitest 的第一落点**。
- 现有 prior art：仓库目前唯一的"测试"门 = `npm run build` / `npm run typecheck`。

## Out of Scope

- 任何 backend / DB / RAG / agent infra（ADR-0001）—— reality gap 等靠 fixtures 演。
- **Nexus 编排流内部**（P2）、**详情 4 scene 内部模块**（P3，placeholder）、**rail / DemoControls**（P4）、**motion polish 迭代**（P5）。
- 独立 TASK 详情 scene（task 是 project/员工 页内模块）。
- 模糊搜索库 / 搜索高亮分词（search 保持纯前端 substring）。
- 超过 5 个 tag、运行时自由推导 tag、tag 的交集语义。
- layout 引擎 / 自动布局（坚持手工坐标）。
- 扩 `canvasStore` 的 state 或 action（契约已冻结）。

## Further Notes

- 对应 beat sheet：**B1**（ambient calm Dashboard + Briefing#1 + 淡连线）、**B2**（〔自由交互①〕点 Acme → focus → drill-in）。tag/search 是 B1/B2 自由交互的自然形态。
- ADR-0003 litmus：自由点击须能复现每个 Dashboard beat —— 若某行为只有 rail 模式才发生，即建错了。
- 并行编排：本 PRD 与 P2（Nexus）、P3（详情）可同时 fan out，因 P0.5 已消解三者对 store 的争用；P3 最独立。
- Danny 的 layout 清单与 scope 判定的逐条记录见 `.handoff/BUILD-HANDOFF.md` §2.5 / §5.1。
