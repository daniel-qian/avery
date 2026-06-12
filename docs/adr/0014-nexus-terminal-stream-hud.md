# Nexus 终端流 HUD：左侧节点链退役，改终端式流式打印；Manifest 画板留存、镜头收敛

> 取代 [ADR-0004](0004-nexus-spatial-orchestration-model.md) 的放射画布**表达**（其推进模型——无参 `runAgent()` 线性走编排表、ADR-0003 litmus——全部保留），并取代 [ADR-0012](0012-pannable-zoomable-canvas-rail-derived-camera.md) 修订 5 决策 4 / 修订 6 §3–§6 的 **Nexus 节点链部分**（Dashboard 部分一概不动）。

## 背景

Pitch 实演反馈第一条（feat-004，feature_list.json）：Nexus 左侧 thinking-node 链不工作——镜头随节点簇乱飞、case 变多后节点越压越小，观众读不出 agent 实际在想什么、做什么。"agent 思考过程"这个本应最像 AI 产品的面，反而成了最难读的面。

Danny 的方向裁决：节点链这套**空间化表达退役**，换成今天 AI 工具的母语——**Claude Code / hermes 式终端流式打印**（等宽小字、per-speaker 颜色、流式行）。右侧 Manifest 卡列已被验证（修订 5/6 把它扶正为主角），保留在 pan/zoom 画板上。

经 grill 定案：Q1–Q3 当场敲定，Q4–Q10 附推荐抛给 Danny，回复"全部按照推荐"。

## 决策

1. **架构（Q1）：终端 = viewport-fixed 左栏 HUD；Manifest 留在画板。** 终端栏 1:1 永远可读（不随画板缩放）、内容自滚动。镜头方程不再含任何节点簇——`useRailCamera` / `flyToTarget` 机器原样复用，`insets.left` 加宽为终端栏宽，镜头只对 Manifest 区取景。

2. **流内容（Q2）：全新著作 per-step 流脚本，住进 case 定义。** `CaseDefinition` 新增 `stream` 数据形：每 step 一组 lines，line = `{ speaker, type('thought'|'tool-call'|'tool-result'|'manifest'), text, ref? }`。每步 ~4–8 行，3 case + follow-up 共 ~13 步，全部 Venus-facing 英文 copy 就地标 ⚠ 待 Danny 审字。旧 `nodes` / `edges` / `stepNodes` / `manifestProducers` / `manifestNodeId` 从 Nexus 渲染退役并**连同数据删除**（`lib/nexusFlow.ts` 一并删）——demo-only 仓库不养死数据。

3. **跨层联动（Q3）：MANIFEST 行 = 粗体/专色强调的可点锚。** 点该行 → 镜头飞向对应卡（复用 `inspectCard`：本地镜头命令 + 触发 follow-up chip 显出逻辑）。**不画跨层连线**——HUD（viewport 坐标）×world（board 坐标）连线是两套坐标系的脆耦合。视觉对应靠同色 + 同标题。

4. **多 agent 视觉（Q4）：per-speaker 前缀 + 专色。** speaker ∈ `you / pm / hr / agent / tool / system / bill`，各配固定前缀（YOU / PM / HR / AGENT / TOOL / SYS / BILL）与专色，等宽小字；MANIFEST 行自成一色（金/强调色）。errand case 的单 agent 用泛 `agent` 色，不冒充 PM/HR。

5. **流式动画（Q5）：行级 stagger 渐显，非逐字符打字机。** 新到拍的行组以 `--line-i` 级联渐显（chat 卡 `--chat-i` 先例同口径）；rail seek / thread 重开 = 瞬时全量渲染。**行集合 = (caseDef, thread) 的纯函数**——question 首行、follow-up 提问行、各 step 行全部确定性派生，replay-safe，store 零新增字段。

6. **镜头策略（Q6）：calm = fit Manifest 区宽度顶锚（width-top 复用）；有新卡的拍温和飞向该卡（maxFitScale 收紧，scale 基本恒定）；纯思考拍镜头不动**（depKey 只随"最近一张已显形卡"变化，思考步不触发重取景）。

7. **卡排布（Q7）：`cardAnchors` 公式改双列瀑布（贪心放进较短列）。** 仍公式化不手摆（守 memory `prefer-runtime-navigation-over-handtuned-layout`）；节点链退场后 Manifest 区左移占满，`NEXUS_BOARD` 相应缩窄。

8. **free-click 推进（Q8）：advance bar 继续当主路径**（ADR-0003 litmus 既已满足，不另起炉灶）；终端底部"运行中 ▌"光标行**仅视觉提示、不可点**——避免"点终端推进"这条新交互路径带来的误触与 rail 同构成本。

9. **节点遗留物处置（Q9）：** question / memo 附件 chip → 终端首行打印（附件缩略图内联）；Bill 像素头像内联进 human-loop 流行（`bill` speaker 行）；self-report 叙事改由 cross-check 流文案承载；cross-check collision 节点特效退役（mismatch 卡已承载该叙事）。

10. **范围与文档（Q10）：Dashboard 完全不动**（节点/边/镜头/CSS 的 Dashboard 部分零触碰）；CONTEXT.md 不动——终端流是**视觉机制非领域概念**，Manifest"经链条显形"词义不变（链条从画板节点变成终端行，显形语义如故）。

## 被否的替代

- **节点链保留但缩小/简化**：反馈根因是表达形态（空间拓扑读不出思考流）不是尺寸参数；调参数解不了。否。
- **逐字符打字机动画**：现场演示节奏被打字速度绑架、seek 重放要么等要么跳帧、实现要碰计时器状态——行级 stagger 给同等"活着"的感觉而零状态。否。
- **终端入 world 画板（随镜头缩放）**：终端的全部价值在 1:1 可读，进画板就在 calm scale 下变蚂蚁字——正是节点链死掉的原因复发。否。
- **HUD×world 跨层连线**：两套坐标系（viewport-fixed × board transform）实时对齐，pan/zoom 每帧重算且脆。同色+同标题+点击飞行已给足对应感。否。
- **点终端行推进编排**：与 advance bar 双主路径，rail 同构成本翻倍且易误触。光标行只做"还在跑"的视觉提示。否。

## 后果

- **取代关系**：ADR-0004 的放射画布表达退役（决策 1/3/4/5 的空间拓扑部分）；其§2 推进模型、ADR-0003 litmus、ADR-0007 叙事拍全部存续。ADR-0012 修订 5 决策 4（Nexus 三 lane 直链）、修订 6 §3（链压窄细带）/§4（Nexus 无调光的节点部分）/§5（breathe glow）/§6（产出圆语法）退役；修订 5/6 的 Dashboard 部分、world/HUD 分层、board px-only、镜头机器全部不动。ADR-0013 的 contract（threads / openThread / askFollowUp / threadPlan）零触碰。
- **数据形清理**：`CaseDefinition` 删 `nodes` / `nodeOrder` / `pos` / `edges` / `stepNodes` / `manifestProducers` / `manifestNodeId`，删 `laneRowPositions`；新增 `stream`。`lib/nexusFlow.ts` 删除。`questionAttachment` 保留（终端首行 chip）。
- **渲染清理**：NexusScene 删 `nexus-flow-layer` / `NexusEdgeLayer` / 节点渲染 / collision FX；global.css 退役 `.flow-node*` / `.nexus-edge-*` 整组（grep 确认 Dashboard 早已不用 `.flow-node`），新增 `/* feat-004 · Nexus terminal (ADR-0014) */` 区。
- **镜头收敛**：`NEXUS_INSETS.left` 28 → 终端栏宽（~480）；camera target 只剩两种——calm width-top fit Manifest 区 / contain 飞最近显形卡（maxFitScale 收紧）。
- **不变量存续**：replay-safe（ADR-0006）、rail 可删（ADR-0003）、store 契约冻结（ADR-0013）、board px-only（ADR-0012）全部不变。终端行集合纯派生，seek 任意 index 自洽。
- **著作成本**：~13 步 × 4–8 行全新英文流脚本，全标 ⚠ 待 Danny 审字（P6-08 同口径 HITL）。
