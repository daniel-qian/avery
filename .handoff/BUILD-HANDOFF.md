# TeamMaster 2.0 Prototype — Build Handoff

**读取时机**：每个 build phase（P1–P5）开始时，fresh agent 先读本文 + 下面引用的 artifacts，再动手。
本文**不复制** artifact 内容，只给**指针 + 跨 session 必须守的规矩 + 当前状态**。

---

## 1. 这是什么 / 为什么

任务：为 **Venus 首次 pitch** 做一个**可信的产品 demo**（不是生产系统）。成功 = Venus 看完能说"我清楚 problem / 目标客户 / workflow / 为什么有价值"。

权威 artifacts（动手前读）：

- **`docs/20260603-design/demo-brief.md`** — demo 的 **PRD**：一句话 pitch、虚构公司 TeamMaster Inc.、cast、hero 问题、**12-beat sheet**、scene inventory、fixture 清单。**必读。**
- **`CONTEXT.md`** — 术语表（Dashboard / Nexus / Briefing / Reality gap / Capabilities）。**用 canonical 词，别用 `_Avoid_` 词（如 CAPA）。**
- **`docs/adr/`** — `0001` demo-only 范围 · `0002` stack · `0003` rail = 可拆 driver。
- **`src/data/fixtures.ts`** — demo 全部内容真相源（SNL cast、Acme/Bill mismatch 故事、agent 6 段输出、briefings v1/v2、timeline、onboarding…）。导出的 **types = state 数据契约**。
- `prototype-vanilla/` — 旧 vanilla 探针，视觉/逻辑参照（styles 已港、贝塞尔已抽到 `src/lib/edges.ts`）。

## 2. 当前状态（commit `218256e` "P0"）

- stack：Vite + React + TS + zustand（framer-motion 已装、未大用）。
- 跑：`npm run dev`（:5173） / `npm run build`（`tsc -b` + vite，**必须保持过**）。
- 单一真相源：`src/store/canvasStore.ts`。**P0.5 contract pass 已把它冻结到最终形状**（见下）。
- **REAL**：6 scene 按 `scene` state 切换；Dashboard 渲染 people orbit + project cards（坐标在 `src/data/layout.ts`）+ owner→project SVG 连线 + 开场 Briefing；点项目/人 → detail scene（真 `Project→Task→Employee` 数据）+ Back；Capabilities / Onboarding stub 吃真 fixtures。
- **STUB（待建）**：focus 暗化/缩放动画（**契约 + resolver 已就位，UI 未建**）、composer、alert pills、Nexus 编排流、scene 转场动画、rail、详情页内部模块。

### 2.5 P0.5 contract pass（已落地，三路并行的地基；commit 待提）

三个 build phase 唯一的真争用点已消解，**P1/P2/P3 可 fan out 给并行 AFK agent，互不改 store**：

- **store 形状冻结**（`canvasStore.ts`）：state = `scene / focus / detail / briefing / thread / tasks`；action = `goScene / setFocus / openDetail / back / askQuestion / runAgent / dispatchTask / regenBriefing`，全按 ADR-0003 返 fixture / 推进 stub（零 `if(demoMode)`）。**别再扩 store；P2/P3 行为一律调这套已存在的 action。**
- **`focus` = 高亮集 + 可选 primary 锚点**（不是单实体）：`{ source:'node'|'tag'|'search'; projectIds; personIds; primary?; selector? }`，`null` = calm。三种选择器（单点 / tag / search）统一走 `setFocus`。**单点也点亮"该实体 + 关联簇"**（beat B2「相关亮/无关淡」）。
- **`src/lib/focus.ts`** = 共享解析器（一套 relatedness，零分叉）：`focusEntity(kind,id)` / `focusTags(tagIds)`（多选=并集）/ `focusSearch(q)`（前端 substring）。组件只读结果。
- **tag 模型**（`fixtures.ts`）：`DashboardTag` + `DASHBOARD_TAGS`（5 个：This week / At risk / Acme Pilot / Engineering / Hot spots）；`Project.hotspot?` 标记（Connector=true）。
- **CSS 分区**（`global.css` 尾部）：共享基座别 fork，各 phase 写自己 banner 区。
- **新词入 `CONTEXT.md`**：`Calm`（静息态）/ `Focus`（点亮关联簇的态）。
- P0 渲染现状截图（暴露 P1 要修的视觉问题）：`.handoff/屏幕截图 2026-06-04 114015.png`。

## 3. 跨 session 死规矩（最易被违反，务必守）

- **ADR-0003 litmus**：rail 是 free-click core 之上的**薄 driver**。**先建 free-click，再铺 rail；零 `if(demoMode)` 分支。** 判据：自由点击能复现 rail 的每个 beat。scripted 内容一律当 fixtures 喂 dumb 组件（`runAgent` 现返回 fixture，以后换真逻辑）。
- **calm→focus 密度模型（已定 = 方案 A）**：calm 态**极简**（人 = avatar+名；项目 = 小 chip：状态点+标题），**focus / drill 才展开** summary/progress/tasks。**别让卡片永远全展开**（P0 现在是全展开，是临时态）。
- **范围 demo-only（ADR-0001）**：不建 backend / DB / RAG / agent infra。reality-gap 等卖点靠 fixtures **演**，不真建。指向工程类 design docs 的"是不是该建起来" = 默认 wontfix。
- **故事口径**：Delivery × People 互锁**一条**因果线；mismatch 落 **Bill**；**主方案保周五**（把 Bill 的 interrupt 甩给 Jason + 砍 dedupe），**Tue slip = conditional 兜底**（绑定 rate-limit 变数）；agent **只指证据矛盾、不做人身判断**。逐字内容见 fixtures 的 `AGENT_OUTPUT` / `MISMATCH` / `BRIEFING_V2`。
- **命名**：虚构同事 = SNL 2012 黄金期 cast 名；You / Wang 保真名（meta 点）。
- **语言**：UI 字符串**英文**（Venus 是美国人）；与 Danny 对话默认简体中文（见 `AGENT.md`），技术名词留英文。注意 caveman 简洁模式是上个 session 的临时设定、**非默认**。

## 4. Phase 计划（P0 ✅）

build 顺序见 demo-brief；简表：

- **P1 Dashboard**（下一个）：**先 layout + density pass**（修重叠 + 渲染安全边界 + 落地方案 A 的 calm→focus 密度）→ focus 暗化/缩放动画 → composer → alert pills → framer-motion 接入。
- **P2 Nexus**：spatial orchestration flow + inspector + agent 输出渲染。
- **P3 详情 4 scene**：project / employee / capabilities / onboarding（内部模块 placeholder）。
- **P4 rail**：12-beat `SCRIPT` + DemoControls 驱动 action API（ADR-0003，扔得掉）。
- **P5 polish**：动效，按 Danny 的 motion 参考迭代。

## 5. P1 启动须知（已知待办 / 悬而未决）

- 截图暴露、均属 P1：①卡片**重叠** ②**渲染安全边界**（靠边卡 bbox 溢出视口——抄 `prototype-vanilla/app.js` 里 `setNodePosition` 的 clamp 思路）③**briefing 居中需留中心空区**（calm 态 briefing 是主角，人/项目绕它转）。
- **Danny 的"改/删元素清单"已定（grill 锁，见 §5.1）**——layout gate 解除，P1 可动。
- **P1 可拆 P1a / P1b 并行**：P1a = focus 暗化缩放 / composer / alert pills / framer-motion（不依赖清单，可即刻 fan out）；P1b = layout + density pass（§5.1 清单）。
- 布局：继续用 `src/data/layout.ts` 手工坐标（deterministic，doc 明确不要 layout 引擎）。

### 5.1 Danny 的 P1 layout 清单（grill 锁定 2026-06-04）

1. **删**左上角 "Ambient command center / Prototype" 卡片。
2. **顶部 tag 行**（5 个，见 §2.5 `DASHBOARD_TAGS`）：选 tag → `setFocus(focusTags([...]))` 点亮关联簇（多选=并集）；点空白 → `setFocus(null)` 恢复 calm。
3. **顶部 search 栏**：`setFocus(focusSearch(q))`，同 tag 族（在地图上找）。**UI 必须跟底部 composer 差异化**——search = 轻/低/嵌顶部 tag 行旁（filter 气质，不离 Dashboard、无 agent）；composer = 重/醒目/底部居中（行动入口，`askQuestion` → 飞进 Nexus）。两者做的事根本不同，差异化是语义驱动不是装饰。

scope 判定（grill）：tag/search = B1/B2〔自由交互〕的实现机制，**in-scope 但保持精简**（5 tag 锁死、search 纯前端 substring，不上搜索库），**不开新 ADR**。
- 动效参考工作流（来自上个 session 约定）：Danny **按 beat 增量**给 **URL > 录屏 > 截图**；每个附「精确到哪一下 + 哪个属性 / 映射哪个 beat / 喜欢什么 / 角色」；守 transform+opacity、`prefers-reduced-motion`、别动 width/height、别处处 blur。可建 `docs/20260603-design/motion-refs.md` 收口。

## 6. Suggested skills

- **`/handoff`** — 每个 P 收尾、跨 session 交接时更新本文。
- **`/grill-with-docs`** — 涉及计划权衡/拆解时延用它（全部已锁决策由它产出；**别推翻已锁 ADR**，要改先走 grill 并记新 ADR）。
- 切 issue（若 Danny 要）：见 `AGENT.md` 的 issue-tracker 约定（`gh` → `daniel-qian/TM2.0`）。
- **不要**用 `prototype` skill 重起炉灶——脚手架已在 `src/`，在其上增量建。

## 7. 验证

- `npm run dev` → 浏览器看（PowerShell 的 HTTP 探针因 Windows `localhost` IPv4/IPv6 绑定连不上，是 shell 客户端怪癖、非 app 问题）。
- `npm run build` 必须过：`tsc -b` 零类型错 + vite bundle 成功。
