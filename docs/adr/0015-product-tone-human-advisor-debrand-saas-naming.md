# 产品定调：人性化顾问（"资深前辈在你耳边"）而非 AI SaaS 效率工具；品牌声音 + 命名候选 + 全局去-SaaS 文案/术语 pass；人卡退游戏化量化

> 修订 [ADR-0010](0010-calm-cards-gamified-hp-mp-hud.md) 的 HP/MP HUD 决策（个人级 HP/MP/load 量化退役，改团队级柔性信号——见决策 5）。不动 ADR-0014 终端流机制、ADR-0013 store 契约、ADR-0012 镜头/分层。本 ADR 改的是**声音、取景、术语**，不改交互机器与数据契约。

## 背景

合伙人会议裁决：现产品的前端"声音"和每个 use case 展示出来的内容太偏向 **AI SaaS 效率工具 / 堆 agent 功能**，与初衷不符。初衷是——**有效帮 HR 和中高层处理团队里的"人情世故"，一个有人情味、人性化、HR 和高层会喜欢的产品**，不是注重提升办公效率、不是仪表盘 + agent 编排。

视觉/交互底子（开放式画布、节点、衬线排版）经确认没问题，**只调声音与呈现，保留骨架**。

经 phil（增长/定位）+ claire（产品/UX）两条 loop 协作，创始人 check：定调、品牌声音、命名候选、全局去-SaaS pass 一并敲定。约束钉死：**产品全英文，第一批 pitch 在海外。**

## 决策

### 1. 定调：产品是"一个人"（资深前辈在你耳边），不是"一个地方"（平台/仪表盘）

产品宪法是 **"a wise senior at your ear"**——一个见过世面、站在你这边、从不居高临下的资深同事/顾问。"地方"语法（Hub / OS / Atlas / Workspace / 仪表盘）天然往"你进去操作的系统"漂，正是要逃的 SaaS 观感；"人"天然往"陪你、对你说话、有分寸"走。**这条定调是下面一切命名与文案取舍的总开关。**

### 2. 品牌声音陈述（Brand Voice）

> **We speak like a trusted senior colleague who's seen this before — warm, plainspoken, and never above you.** We name the hard human stuff out loud without drama or jargon, and we always point to the kind next step, not the verdict. We're the calm voice in your ear before a tough conversation — on your side, never keeping score.

**红线测试**（任一不过即砍/重写该文案）：
- 被讨论的那个人若看到这屏，会觉得**被评判 / 被处理**吗？→ 砍。（我们给人**建议**，从不给人**打分**。）
- 它听起来像一个 AI 工具在自夸 agent / 自动化 / 效率吗？→ 砍。
- 一个温暖的资深人类，会真的对同辈这样说出口吗？→ 否则重写。

### 3. 命名：fork 定为"人"；3 个终选提案（最终选名待创始人拍板）

> **最终敲定（2026-06-18 会后）：产品名 = Avery。** Counsel / Aside 退为备选；触发 user-facing `TeamMaster → Avery` 全局替换（内部 repo/package/注释标识保留）。

place-vs-person fork → **person**（理由见决策 1）。phil pressure-test 后的 3 终选，排序与定位：

1. **Counsel（首选）** —— 词义=声音 100% 重合（忠告/顾问），自带"资深、可信、站你这边"，是名又是动词，延展极好；海外母语秒懂，零 SaaS 味也零 chatbot 味。.com 裸拿难（用 trycounsel / counsel.work），软件类目商标大概率干净（定位用 "Counsel for managers" 躲开 legaltech 语境）。pitch："带团队时身边那位带过很多人的前辈，难谈的对话前你先问问 ta。"
2. **Avery（安全兜底）** —— 中性好记、母语零障碍，像真实靠谱的同事名而非 robot 助手，人格化最彻底。avery.com 被 Avery Dennison（文具）占，用 meetavery / avery.team，不撞软件商标。pitch："你团队里最会带人的那个人，只不过 ta 随时在。"
3. **Aside（记忆点最强 / 可做人格副名）** —— "把你拉到一边悄悄说句话"，精准命中私下、贴心、耳边声音，比 Counsel 更轻更暖；需要一句解释。可作产品内人格副名（产品 Counsel，耳边声音 Aside）。

**出局：** Sage（撞财务/HR 软件大牌，高风险）；Atlas / Grove / Tide / Bearing / Compass / Even（"地方"语法或撞名，与 person fork 冲突，Compass 在 HR tech 已用烂）；Mira / Margo / Otis（偏轻偏 chatbot；Otis 撞电梯公司）。

**要躲的命名坑：** `-ly` / `-ify` / `Team-` / `-OS` / `-AI` / `Sync` / `Flow` / `Hub`——全拽回"中国出海 SaaS + AI 效率工具"两个要逃离的观感。

> 现产品名 **TeamMaster** 暂留代码不动，待创始人在三终选中拍板后再全局替换。TeamMaster 本身定调有问题（像 Jira 竞品、暗示"control over people"、像 CN→EN 硬翻译）——确认要换，只是没定具体哪个。

### 4. 全局去-SaaS 文案/术语 pass（声音正典）

要洗掉的是 **"机器在评判人" + VC 自夸腔**；保留的是 **"产品有真东西、说得出依据"**。术语正典（user-facing copy 层；内部 type/变量名不动）：

- **`Capabilities` → `playbooks`**（user-facing）。"Capabilities" 是 agent 编排腔；"playbook" 是资深前辈的词（带过人的领导都讲 playbook），温暖、有经验感、零 SaaS 味，且已是数据里的词。
- **`Nexus` / `orchestration` → 名词标签（含导航 tab）用 `The room`；动作/场景语境（如 banner eyebrow）用 `working it through`。**（2026-06-18 修订：tab 是名词，应为 "The room"；上轮误置为 "Working it through" 待改回。）"Nexus" 仅作内部领域概念名保留。
- **导航 tab 命名（2026-06-18 敲定）：** `Dashboard → Your team`、`Nexus → The room`、`Playbooks`（保留）、`Onboarding`（暂留）。
- **Onboarding 重构取景：** 从"喂数据进 company brain"→**"像给 day-one 新经理做交接"**。`Building the company brain`→`Getting to know your team`；`Parsing into the company brain`→`Learning how your team works`；去掉 PDF/DOCX/CSV 文件类型 chip + 编号 wizard 步骤（保留文件名与分步揭示骨架）。
- **VC 腔从用户界面清掉：** `the moat` / `Auto-prioritized` / `Trusted output`（说给投资人听的自夸，放用户界面既油腻又心虚）。
- **红线那处：** `Reality gap` / `report mismatch`（user-facing）→ **`Worth a closer look`**——被点名的下属看到不刺痛。底层领域概念 reality gap / report mismatch 不变（见 CONTEXT），只改呈现给用户的标签。

**两条反向护栏（别矫枉过正）：**
- **(A) 保留"它说得出依据"。** reasoning / evidence 措辞从情报腔改人话（`Trusted output`→"What it found" / "The read"；依据 → "Why I'm saying this →" 点开仍引用你之前讲过的具体事实），但**绝不删**——这是"前辈"与"算命先生"的区别，也是 demo 的可信产出卖点。
- **(B) 见决策 5。**

### 5. 人卡退游戏化量化：个人级 HP/MP/load → 团队级柔性信号（修订 ADR-0010）

把人量化成 RPG 血条（HP/MP/load）的 creep 风险高于 "company brain"——"把员工变成游戏单位"一旦被截图即头条级灾难。创始人裁决：**不量化个人，改成集体、柔性的信号表达**（如"团队这周节奏偏满"这类基于团队整体、不给单人打分的柔性读数），呼应已有的 `Live organization weather` 人味。替换 `DashboardScene.tsx` 个人级 HP/MP/load（含 aria-label `HP {n}. MP {n}. {n}% load`），保留"读得到团队状态"的价值。

## 被否的替代

- **命名走"地方"（Grove / Atlas / Tide / Bearing）**：是效率工具的语法、往平台/仪表盘漂，与定调冲突。否。
- **Sage**：声音对，但撞财务/HR 软件大牌，商标高风险。否。
- **把 reasoning / evidence 一起洗软/删掉**：会丢掉可信产出卖点，把"前辈"洗成"算命先生"。否（护栏 A）。
- **保留个人级 HP/MP/load 血条**：creep 风险 + 与"人性化"定调正面冲突。否（决策 5）。
- **本轮就改产品名**：终选未定，贸然全局替换会返工。否——TeamMaster 暂留，待创始人拍板。

## 后果

- **代码落地（claire 本轮执行）：** `src/data/fixtures.ts`、`fixtures.p3.ts`、`cases.ts`、`OnboardingScene.tsx`、`NexusScene.tsx`、`DashboardScene.tsx`、`Topbar.tsx`、`EmployeeDetailScene.tsx` 的 user-facing copy 按决策 4 改写；HP/MP/load HUD 按决策 5 改造。落完 `npx tsc --noEmit` 须过。
- **CONTEXT.md：** Language 表新增 **Positioning** / **Voice** 两条；`Capabilities` 加 surface label "Playbooks"、`Nexus` 加 surface label "Working it through"；intro 补人性化取景。底层领域概念名（Capabilities / Nexus / reality gap / report mismatch）保留——它们是**领域概念**，本 ADR 改的是其 **user-facing 标签**，概念不变。
- **内部不动：** type / 变量 / store 契约（ADR-0013）/ 镜头机器（ADR-0012）/ 终端流机制（ADR-0014）零触碰。
- **待办（创始人）：** ① 三终选拍板最终产品名 → 触发一次全局 TeamMaster 替换；② use case 定稿后喂回 claire/phil 继续按本声音落每个 use case 的内容。
- 这是有意识的 product-tone 转向（demo 已用现版 pitch 过），故记 ADR；护栏 A（留可信产出）+ 红线测试是它站得住的前提。

## 决策（续）— 第二轮页面层 + hero case 重铸（2026-06-18/19）

> 沿用本 ADR 的定调与红线，落到具体页面与核心 demo 案例。开发 = claire；检查 = 新增 **dana** 人设（非技术 HR 总监，真实目标用户视角，专测"工具感 / 把人当对象处理"的红线，见 `.claude/agents/dana.md`）。

### 6. 顶部 HUD 不再遮挡 + 常驻一行 + 点击展开
原 `Live organization weather` / `Working it through` 大居中横幅压住画布卡片 → 缩成顶部常驻摘要行（浮层卡 `position:absolute` 不占文档流），**详情仅点击展开**（去掉 hover 弹卡：扫一眼型用户会忽略 hover，且划过误弹）。Dashboard `.briefing-*` 与 Nexus `NexusBriefHud` 同口径。brief 读数去掉 `Context X%`（AI 谈自己内存），只留人话 `Step n of m`。

### 7. 去 agent/AIDE 字眼、保留专家身份
终端/chat 的 `PM agent / HR agent / AIDE` 对 HR 读着像机器人 → 通用单 agent = **`AVERY`**（产品本身在替你跑），专家 badge = **`PM` / `People`**（去 "agent" 字、留专业角色）。多专家协同的实质（护城河）保留，只洗工具腔。

### 8. 红线扩展到所有"单个人"的表面（不止地图）
个人页/卡也不许量化、诊断、贴标签：删员工详情页 capacity 百分比进度条；删 sentiment 情绪 badge；`134% raw load`/`Overload symptoms` → 情境化护人措辞（"Pulled in a lot of directions"/"Stretched right now"）；**Alternatives 卡**从"人的替补榜（%load/skill/risk 排名 + 裁决）"重构成"谁这周有空搭把手"（无分数无等级）；员工页**会渲染**的 `hrSignal` 必须读着是关心处境、不是"她被分诊"（"Worth a quiet word" 这类经理动作指令不挂在她名下）。`moodPct`/`sentiment` 保留为 data-only、**确认不渲染**。

### 9. `mode: 'diagnosis' | 'symptom'` → `'reading' | 'grown'`（内部 type 改名）
数据模型里描述"对一个人处境的解读"的字段用医学词（诊断/症状）与红线相悖，虽不外显但塑造团队心智 → 改中性词。一次 type union + 全引用点的结构改动（typecheck 兜底）。

### 10. Avery 不以自己名义自主发消息
邮件/Slack 作者从 `Avery` → **`You`（经理）发、`Drafted by Avery`（起草）**；`From: You` / `Ready for you to send`。对齐 human-loop "human pulls the trigger"——AI 自主在 #channel 谈论员工是最高 creep。

### 11. Hero demo case 重铸为合伙人场景 + Maslow 框架
合伙人要亲自讲，故 hero case 从工程场景全量重铸为**设计团队**场景（便于她讲清、也修正"好像没变化"——因为之前只换文案、领域没变）：
- **场景**：团队 `Prism Design Team`、项目 `New Retail Smart Shopping Guide`（智能导购 Demo）。主角 **Lin Qing**（原 Bill，she/her，核心 UI flow）；`Sun Xiaomei`(反馈)/`Chen Mingyuan`(数据字段)/`Zheng Zixuan`(关键视觉)。**display name 改、内部 id 保留**（`u_bill`/`p_acme` 等不动以免断引用 + 头像）。
- **领域 re-flavor**：`SignalSource` 类型 `'slack'|'github'` → `'figma'|'feedback'`；证据从 PR/commit/rate-limit → Figma frame 重做 / 反馈轮次 / 未解决评论 / 无验收标准。user-facing 零 Acme/Bill/Connector/Engineering 泄漏（含两个 errand 的一致性补丁）。
- **Maslow**：用 Maslow 五层读 Lin Qing 动机为何下降（安全感/成就感被磨没，非能力问题）。**"Maslow" 词保留可见**（创始人定，方法论卖点），但只在 manager 的 coaching/playbook 层，**不挂在员工个人卡上**；且剥掉"系统剖析"外壳——无命令行式 `read motivation --person … --frame maslow`、无 `Safety:/Esteem:` 诊断表标签前缀，改前辈人话。
- **新组件**：责任拆分卡（Who owns what）+ Lin Qing 可勾选 checklist（本地态、不入 store）——读着是"帮她把活儿变得可完成"，非盯交付。
- 约束：两个 errand 的 step-kind/orchestration/推进逻辑不动（只改文案一致性）；rail replay + free-click 不断；typecheck + build 绿。

### 待办（创始人）
- **定稿** `⚠ 待 Danny 审字`：hero case 全部新英文（AI 结论段、1:1 transcript、playbook 名、SCOPE_SPLIT/checklist、SIGNALS、briefings、cases.ts stream、rail caption 等已就地标注）。
- **live 过目**：组织天气 pill 常驻+展开的实际观感、Lin Qing 详情页（claire 用 DOM 几何/断言验证，截图工具被 canvas 动效拖超时）。
- **Apple 合规 errand**：整体是发布工程腔（release candidate / privacy labels / Guideline 5.1.1），与"人"的故事 genre 不搭——是否重铸前提待定（dana 指出，未在自主轮改动）。
- 旧的"三终选拍板产品名"待办已 close（= Avery）。
