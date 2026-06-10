# 多 Thread Nexus：一次性解冻 canvasStore 契约、per-case 定义数据形、Follow-up 与 errand cases

## 背景

Demo 现状只有一个 story case（bill/acme，4 manifest 结局），且全部机器为它硬编码：`canvasStore` 只有**一个** `thread` 槽位、`ORCHESTRATION` 是单一常量、`ThreadStepKind` / `nexusLayout`（9 节点拓扑、Manifest 堆叠）全部 bill/acme 专属。P0.5 把这份 store 契约**冻结**（ADR-0006 / ADR-0012 反复重申"不扩 store"铁律），目的是让 P1/P2/P3 三个并行 build phase 对着稳定契约写——该目的已达成，三个 phase 已完成。

Danny 的新需求（本次 grill 的根）有两束：

1. **更多 case**：daily-web-search（查 Apple App Store 政策，agent 调 web 工具开预览）、write-an-email（基于 memo 草稿照片起草邮件、发全工程部、等人点 Send）；且 **Nexus thread 要彼此独立、可关闭、可从历史重开**——"chrome tab controls + Claude/GPT chat history list" 的感觉。
2. **Follow-up**：观众看完产出必然想"能不能基于这个继续问/继续执行？"——demo 要**演给他们看**：每个 case 一个 follow-up showcase（bill/acme 例："I have a job for Jason — any alternative?"）；点任意 Manifest 镜头放大并提供该 Manifest 上的 follow-up；HUD 显示该 Nexus 会话的 context-window 百分比（按 x/x step 派生定位）。

关键冲突：**"thread 可分离、可关闭、可重开"本身就是要演给 Venus 看的产品故事**，而冻结契约里 thread 只有一个槽位。用 rail seek 伪造多 thread 切换会让 history list 变成 rail 耦合的 chrome——free-click 用户无法切 case，直接违反 ADR-0003 litmus（每个 beat 自由点击可达）。

## 决策

九条，构成**一次深思熟虑的 contract pass**（解冻 → 重塑 → 重新冻结）：

1. **解冻 canvasStore，单次 contract pass 后重新冻结。** `thread` → `threads`（按 caseId 键）+ `activeCaseId`；thread 增加 `isOpen` 标志。新 action：`openThread(caseId)`（开/重开 + 置 active）、`closeThread(caseId)`（只翻 `isOpen` 标志，**状态全保留**）、`askFollowUp(text)`、`sendEmail()`。`runAgent()` 保持**无参**，从 active case 的编排表（而非全局常量）按 `steps.length` 取下一步。`askQuestion` 变 case-aware。rail replay 机器（ADR-0006 pristine 快照 + replay-to-target）原样工作——仍只是按序重放 action。

2. **Case = per-case 定义数据形（"errand 深度"，否决等重编排）。** 每个 case 自带：节点 + 边拓扑、编排步骤表、Manifest 堆叠、follow-up 段（见 5）、每步 context-%（见 7）。bill/acme 是重型 hero（9 节点 / 6 步 / 4 manifest 不变）；两个新 case 是**短链 errand**（2–3 步、1–2 manifest）。叙事分工：bill/acme 证**护城河**（编排 + Capabilities + 经人确认），errand 证**日常主力**（广度）。画板上"长链 vs 快办差"的对比本身就是 pitch 点。

3. **Web-search case：fixture 截图装进假浏览器 chrome，否决 live iframe。** 提问绑故事世界（"We're shipping the Acme companion app — what's Apple's policy on expedited App Review?"）。链：question → agent → **web tool 节点**（产出圆语法）→ 两张 Manifest：**浏览器预览卡**（URL 栏显示真实 `developer.apple.com/...` 地址 + 真实页面高清截图）+ **policy gist 卡**（agent 的实际回答：guideline 引文 + 回链 URL 引用）。follow-up chip 锚在 gist 卡："Does our current Acme companion build comply with this?" → 短合规判定 Manifest。

4. **Email case：照片 → 可编辑草稿 → email 工具 → 人点 Send。** 链：question 节点（带 memo 照片附件 chip，占位图路径、Danny 后换真照片）→ agent → **doc-reader tool** 节点 → **email tool** 节点。两张 Manifest：①**可编辑草稿卡**（agent 邮件文本预填，现场可改，编辑流入 ②）；②**email-tool 卡**（To: 全部 Eng 6 人、subject/body 已填、Send 按钮待命）。**Send = store action（`sendEmail()`，dedupe-guarded，卡翻 "Sent ✓"），但不进 rail SCRIPT**——完全沿 `dispatchTask` 先例（ADR-0006 决策 5）：现场由 Danny 亲手点，"人扣扳机"必须可见是人的手；rail seek 会重置，接受。草稿编辑 = 本地态不入 replay（同 ADR-0006 决策 5）。follow-up chip 锚在 email-tool 卡："Also post a short version to #eng in Slack" → 小 Slack-message Manifest。

5. **Follow-up = Manifest 锚定 chip + 永远在场的自由文本 composer。** 点任意 Manifest 卡 → 镜头本地 `zoomToElement` 飞向它（**镜头命令不进 store**，守 ADR-0012；rail 下一拍照常收回）→ 脚本化的那张卡上显出 follow-up chip。点 chip → `askFollowUp(text)` → follow-up 段追加进 active thread 的步骤表，无参 `runAgent()` 继续走，链**重新点亮既有节点**（case 数据形允许声明新增节点，但 bill/acme 不加——"同一条 thread 把活重新拾起来"才是故事），新 Manifest 落进列。Nexus 同时常驻自由文本 composer：任意文本被接受、作为显示的 follow-up 问题、走该 case 的脚本段——与今日 `askQuestion`（B3）完全同构，ADR-0001 prototype 范围内诚实。

6. **Thread chrome = Nexus HUD 的 tab strip + history popover（混合模型）。** tab strip = 打开的 thread（带 × 关闭）；history popover = 所有 thread，点击重开、状态完整恢复。**只在 Nexus HUD**，Dashboard 不放（glossary：Dashboard 是平静观察面，thread 管理是行动面家具）。不预置装饰性假历史——列表里每一项都必须真实可开，三个真 case 已够让列表显活。

7. **Context-window HUD："Context 42% · Step 3/6"，每 thread 独立，醒目不低调。** 数值 = active thread `steps.length` 的纯函数——case 定义携带**每步脚本化 %**（重步骤可见地多耗：human chat / report 占大头；bill/acme 收在 ~71%，follow-up 推到 ~80%），纯派生 = replay-safe、零 store 增长。挂在顶部居中 Nexus brief 行（既有"编排进行到哪"表面），不开新浮窗。带可见**安全阈值**语义（接近阈值变调）。目标观众（Venus 及目标用户）被假定懂 context window 与"thread 要守在安全阈值下"的重要性——errand thread ~15% vs hero thread ~71% 的对比让"thread 是真实会话边界、不是 UI 标签页"可被看见。

8. **Rail 三幕结构，hero 先行。** Act 1 = bill/acme 原样（含 B9 后新增 follow-up 拍）；Act 2 = "daily driver"：title card → web-search errand → title card → email errand → **关闭 email thread、从 history 重开 bill/acme** 的收束拍（顺手把 hero report 放回屏幕）；Act 3 = B11 Capabilities 收尾不动（守 ADR-0007 营收收束）。B10 briefing regen 留在 Act 1 末尾，errand case 全程 Nexus 内、不碰 Dashboard briefing。SCRIPT 约 +8–10 步（~2 分钟）。

9. **Case 间隔 title card（"Use case: Bill & the Acme pilot"）= rail chrome。** 屏幕居中、低调的 demo-only 引导浮层，住在 SCRIPT/DemoControls 层、**不进 canvasStore**——删 rail 即删 title card，零核心行为损失（守 ADR-0003）。Act 1 开头也加一张，从第一个 case 就建立间隔语法。

## 被否的替代

- **保持冻结、用 rail seek 伪造 thread 切换**：history list 变 rail 耦合 chrome，free-click 无法切 case，违反 ADR-0003 litmus；"关闭的 thread 状态保留"也是假的（每次重派生）。用 rail 把戏伪造产品主张正是 ADR-0003 要防的 `if(demoMode)` 味。否。
- **新 case 做成等重编排（与 bill/acme 同形）**：稀释 hero case、三倍 fixture 著作成本、不增加任何论点。否。
- **live iframe 嵌真 Apple 站**：developer.apple.com 发 `X-Frame-Options` / CSP `frame-ancestors`，iframe 渲染空白——不是样式问题，我们这侧不可修；且 pitch 押在会场 Wi-Fi 上。截图 + 真实 URL 栏在演示距离上不可区分。否。
- **errand 先行（小→大暖场）或 errand 不进 SCRIPT（off-rail 即兴）**：前者推迟 killer beat ~2 分钟、且 Venus 可能在看到编排护城河前先把产品 pattern-match 成"又一个 ChatGPT 套壳"；后者让 thread chrome / follow-up / title card 永远没有被排练的舞台。否。
- **follow-up 只走自由文本 composer（无 chip）**：现场打字脆弱；只接受一句话的文本框比 chip 更不诚实（composer 主张"什么都能问"，demo 兜不住）。否——chip 为主、composer 常驻为辅。
- **预置装饰性假历史 thread**：列表里不可打开的条目是不诚实 UI，可打开则每条都要付一份 case 定义成本。否。

## 后果

- **新 ADR 取代"不扩 store"铁律的旧表述**：ADR-0006 / ADR-0012 的"不扩 `canvasStore`"自本 contract pass 后读作"**不扩本 ADR 重塑后的契约**"。memory `p3-parallel-build-contract` 的"store frozen"记述同步更新。
- 工程面要做的泛化：`ORCHESTRATION` / `ThreadStepKind` / `nexusLayout`（`NEXUS_NODES` / `NEXUS_EDGES` / `NEXUS_POS` / `MANIFEST_STACK`）从模块常量改为 **per-case 定义**的数据形；坐标仍全公式（lane/row），守 memory `prefer-runtime-navigation-over-handtuned-layout`。
- SCRIPT 每步仍须 replay-safe：`openThread` / `closeThread` 幂等友好、`askFollowUp` 确定性追加、`sendEmail` 有 dedupe guard 但**不进 SCRIPT**（同 `dispatchTask`）。
- 新增 fixture 著作量：两个 errand case 的内容（问题文本、链节点文案、预览截图资产、邮件草稿、follow-up 段）+ bill/acme 的 follow-up 段 + 每 case 每步 context-%。memo 照片用占位资产，Danny 后换真照片。
- CONTEXT.md 新增 **Thread**、**Follow-up** 两词条（已落）；**"Case" 不进 glossary**——它是 demo/工程词汇（title card、SCRIPT 分幕、per-case 数据形的名字），真实用户只看见 Thread。
- 镜头机器不变：点 Manifest 的 zoom 是组件本地 ref 命令，rail 派生镜头、自由 pan/zoom、下一拍收回（ADR-0012）全部照旧。
- 风险接受：rail seek 会重置 Send/dispatch 的已点状态与草稿编辑（ADR-0006 决策 5 既有口径）；自由文本 follow-up 对任意输入回放脚本段（与 B3 askQuestion 同构，ADR-0001 demo-only 范围内）。
