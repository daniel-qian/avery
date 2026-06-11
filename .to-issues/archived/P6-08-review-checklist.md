# P6-08 · Danny 审字清单（AFK 盘点产出，2026-06-10）

> 由 P6-08 的 AFK 部分生成：全仓 `⚠ 待 Danny 审字` 共 **110 处 / 8 文件**（commit `449d30f` 基线）。
> 其中 **P6 wave 新增 93 处**（本 issue 主审范围），**P3/P4/P5 遗留 17 处**（附录 B，属早前 backlog，非本 wave blocker）。
> 审定方式：逐条看英文原文 → 改字直接改代码 → 删掉该行 `⚠` 注释。全部清零 = 本 issue 第一条 AC 达成。
> 行号为 `449d30f` 时点；改动后请以 `grep -n "待 Danny 审字"` 复核。

---

## A · bill/acme follow-up（P6-03 产物）

### A1 chip / 编排 copy（`src/data/cases.ts`）

| 行 | 项 | 当前 copy |
|---|---|---|
| 318 | follow-up chip 文本（issue 点名） | `I have a job for Jason — is there any alternative?` |
| 258 | follow-up step label | `PM agent re-checks alternatives for Jason` |
| 139 | case title（tab 短名 / title card / history） | `Bill & the Acme pilot` |

### A2 AlternativesCard（`src/components/scenes/NexusScene.tsx` 385–453）

| 行 | 项 | 当前 copy |
|---|---|---|
| 417 | 卡 eyebrow | `Follow-up · Alternatives` |
| 418 | 卡标题 | `Who else can absorb Bill's interrupts?` |
| 420 | header badge | `PM agent re-check` |
| 438 | 载荷词形 | `{capacityPct}% load`（Fred 78% / Nasim 85% / Aidy 82%，实时取 PEOPLE） |
| 391–409 | 候选人 skillMatch/risk 整组 | Fred：`Owns the data ingestion path — closest overlap with the Connector interrupts.` / `Low — clean signal picture this week.`<br>Nasim：`Comfortable across the backend, but no Slack/GitHub connector context yet.` / `Medium — mid-sprint on model evaluation.`<br>Aidy：`Knows the test surface, not the ingestion internals.` / `High — QA load spikes near the Friday ship.` |
| 446–450 | verdict 整段 | `Fred is the strongest alternative if Jason takes the new job — Jason still carries the cleanest margin. Either way, keep the swap to ≤ 2 days to protect the Friday ship.` |

---

## B · web-search case（P6-05 产物）

### B1 问题 / 节点 / 编排（`src/data/cases.ts`）

| 行 | 项 | 当前 copy |
|---|---|---|
| 350 | case title | `Apple review policy` |
| 353 | 默认问题（issue 点名；改字需同步 ADR-0013 决策 3 引用） | `We're shipping the Acme companion app — what's Apple's policy on expedited App Review?` |
| 359–360 | question 节点 | label `Apple review policy` · detail `What does Apple require for an expedited App Review?` |
| 364–366 | agent 节点 | kind `Research agent` · label `Policy lookup` · detail `Scopes the question and queries Apple developer documentation.` |
| 370–372 | web tool 节点 | kind `Web tool` · detail `Opens the official App Review guidelines page.` |
| 393–395 | step labels | `Agent searches Apple developer docs` / `Policy gist is ready` / `Agent checks the Acme build against the guidelines` |
| 442 | follow-up chip | `Does our current Acme companion build comply with this?` |

### B2 PolicyGistCard（NexusScene 501–550）

| 行 | 项 | 当前 copy |
|---|---|---|
| 527–530 | header | eyebrow `Agent answer · Policy gist` · 标题 `Expedited App Review — the short version` · badge `Sources cited` |
| 501–520 | 三条 point/quote/ref | ① `Expedited review exists, but only for extenuating circumstances.` — "You can request an expedited review to fix a critical bug or to release your app ahead of an event you are directly associated with." (`…/contact/app-store/?topic=expedite`)<br>② `The standard queue is already fast — plan for it first.` — "On average, 90% of submissions are reviewed in less than 24 hours." (`…/distribute/app-review/`)<br>③ `The build must be complete before any review, expedited or not.` — "Submissions should be final versions with all necessary metadata — placeholder content or obvious bugs are rejected under Guideline 2.1." (`…/guidelines/#app-completeness`) |
| 543–548 | verdict 整段 | `For the Acme companion launch: submit a final build through the normal queue now, and file the expedited request citing the pilot launch date — Apple grants these on a limited, case-by-case basis.` |

### B3 ComplianceCard（NexusScene 554–610）

| 行 | 项 | 当前 copy |
|---|---|---|
| 582–585 | header | eyebrow `Follow-up · Compliance check` · 标题 `Does the Acme companion build comply?` · badge `Against cited guidelines` |
| 559–574 | 三条判定 | ✓ `Release candidate is final — no placeholder content, no known crashes.`（Guideline 2.1）<br>! `Privacy labels are stale: the new analytics SDK is not declared yet.`（Guideline 5.1.1）<br>✓ `Expedited request is justifiable — the Acme pilot launch is a dated event.`（Expedited review criteria） |
| 604–607 | verdict | `Fix the privacy labels, then submit — everything else is ready for an expedited request.` |

### B4 Apple 截图核验（HITL）

- 资产：`public/apple-app-review-guidelines.png`（1.1 MB 长图），URL 栏显示 `developer.apple.com/app-store/review/guidelines/`。
- 核：页面选择是否要换成 expedited-review 申请页、清晰度、卡内滚动范围（卡视口 330×420 半宽高，`cases.ts:431`）。

---

## C · email case（P6-06 产物）

### C1 问题 / 节点 / 编排（`src/data/cases.ts`）

| 行 | 项 | 当前 copy |
|---|---|---|
| 475 | case title | `Memo → Eng email` |
| 477 | 默认问题（改字需同步 ADR-0013 决策 4 引用） | `Turn this memo draft into an email and send it to everyone in Engineering.` |
| 471 | attachment chip 文件名 | `memo-draft.jpg` |
| 483–484 | question 节点 | label `Memo → email` · detail `Turn the attached memo draft into an email for Engineering.` |
| 488–490 | agent 节点 | kind `Comms agent` · label `Email drafting` · detail `Reads the memo photo and drafts the announcement email.` |
| 494–496 | doc-reader 节点 | kind `Doc-reader tool` · label `Memo photo` · detail `Extracts the text from the photographed memo draft.` |
| 500–502 | email tool 节点 | kind `Email tool` · label `Send to Engineering` · detail `Stages the email — sending waits for a human.` |
| 526–528 | step labels | `Agent reads the memo and drafts the email` / `Email staged — waiting for you to hit Send` / `Agent drafts the short version for #eng` |
| 569 | follow-up chip | `Also post a short version to #eng in Slack` |

### C2 MemoDraftCard / EmailToolCard / SlackMessageCard（NexusScene 616–745）

| 行 | 项 | 当前 copy |
|---|---|---|
| 616 | 演示用公司域名 | `teammaster.io`（地址 = `firstname.lastinitial@`，如 `bill.h@teammaster.io`） |
| 624 | 邮件 subject | `Friday ship: code freeze + Acme support rotation` |
| 626–636 | 邮件 body 整段 | `Team,` ¶ `Two changes for the Acme pilot ship this Friday:` ¶ `1. Code freeze starts Thursday 6pm — only Friday-path fixes go in after that.` ¶ `2. Acme support pings now route to the on-call rotation, not directly to Bill.` ¶ `If either of these blocks you, raise it in #eng before Thursday standup.` ¶ `Thanks,` / `Danny` |
| 645–648 | 草稿卡 header | eyebrow `Agent draft · Editable` · 标题 `Memo, turned into an email` · badge `From the memo photo` |
| 657–659 | 草稿卡 hint | `Edit anything — changes flow straight into the email below.` |
| 673–674 | email-tool header | eyebrow `Email tool` · 标题 `Ready to send` |
| 677–679 | 状态 badge | `Staged` / `Sent` |
| 712–713 | 按钮 | `Send` / `Sent ✓ to 6 people`（人数实时派生，Eng 6 人） |
| 721–722 | Slack 短版整段 | `Heads-up for Friday's Acme pilot ship — code freeze Thursday 6pm, and Acme support now goes to the on-call rotation (not straight to Bill). Full details in the email just sent to Engineering.` |
| 729–732 | Slack 卡 header | eyebrow `Follow-up · Slack` · 标题 `Short version for #eng` · badge `#eng` |
| 739 | 发言者 badge | `TeamMaster agent` + `APP` 角标 |

### C3 真 memo 照片（HITL，本 issue 资产项）

换法（路径集中一处，`src/data/cases.ts:470`）：

1. **覆盖法**：把真照片导出为 SVG 不现实——直接把照片（jpg/png）放进 `public/`，然后改 `MEMO_PHOTO_SRC = '/<新文件名>'`；之后删除占位 `public/memo-draft-photo.svg`（AC 要求占位图删除）。
2. 同时核 `MEMO_PHOTO_NAME`（`cases.ts:471`，chip 显示名 `memo-draft.jpg`）与真照片格式一致（见 D-3 一致性条目）。
3. 照片内容须呼应 EMAIL_DRAFT_BODY 两个要点（code freeze Thursday 6pm / Acme support 走 on-call rotation），否则 "agent 读照片成稿" 的故事断链。

---

## D · 一致性核验发现（AFK 只记录，不改 copy）

1. **`MEMO_PHOTO_NAME = 'memo-draft.jpg'` vs 实际资产是 `.svg`**（`cases.ts:470–471`）：attachment chip 显示 `memo-draft.jpg`，但占位图是 SVG。换真 jpg 照片后自然消解；若保留 svg 占位演示则文件名撒谎。换图时一并对齐。
2. **邮件落款 `Danny`**（NexusScene:636）：fixtures 命名规约是「You / Wang 保真名，其余 SNL cast」——demo 里发件人 persona 是 `You (Founder/CEO)`。落款用 `Danny`（场外真名）是唯一一处把演示者名字写进 Venus-facing copy 的地方。是 meta 点还是笔误，请 Danny 定夺。
3. **AlternativesCard verdict 语义**（NexusScene:448）：chip 问的是 "I have a **job** for Jason"（一件活），verdict 回的是 "if Jason takes the **new job**"（像换工作/新职位）。建议统一为 task/assignment 口径，避免 Venus 听岔。
4. **verdict 与数据的张力**（同上）：`Jason still carries the cleanest margin` 与 PEOPLE 数据一致（Jason 70% < Fred 78%），但 B9 报告刚把 Bill 的 interrupts 派给 Jason——"Jason 余量最干净" 在 follow-up 时点是否仍成立，叙事上值得过一遍。
5. **Compliance 卡的 `new analytics SDK`**（NexusScene:566）：fixtures 里没有任何 analytics SDK 的伏笔，是悬空细节（无矛盾，但若 Venus 追问没有支撑）。可接受或换成 fixture 有据的细节。
6. **Aidy 风险等级 vs 载荷**（NexusScene:404–409）：Aidy 82% 载荷低于 Nasim 85%，但 risk 标 High（Nasim Medium）。定性理由（QA 周五压力峰值）讲得通，现场口播时留意别被数字反问。
7. 其余交叉核验通过：Eng 收件人恰 6 人（Bill/Jason/Kristen/Nasim/Fred/Aidy）✓；地址公式对全员 lastInitial 可用 ✓；#eng 频道在邮件 body / Slack 卡 / step label 三处一致 ✓；policy-gist verdict 的 "pilot launch date" 与周五 ship 故事线一致 ✓；railStore caption 与 cases.ts step label 同文 ✓。

---

## E · title cards + rail captions（P6-07 产物）

### E1 title card chrome（`src/components/DemoControls.tsx:67`）

- eyebrow：`Use case`（三张卡共用；标题单源引 `case.title`，见 A1/B1/C1 的 title 行）。

### E2 rail captions（`src/store/railStore.ts`，14 处）

| 行 | beat | caption |
|---|---|---|
| 46 | T1 | `Use case — Bill & the Acme pilot` |
| 57(注)→60/65 | B2 drill ×2 | `Drill Acme — current state` / `Drill Bill — current state` |
| 110 | B9f | `Follow-up — alternatives for Jason` |
| 140 | T2 | `Use case — Apple review policy` |
| 148 | W1 | `Ask — Apple review policy` |
| 153 | W2 | `Agent searches Apple developer docs` |
| 158 | W3 | `Policy gist — sources cited` |
| 163 | W4 | `Follow-up — does the Acme build comply?` |
| 173 | T3 | `Use case — Memo → Eng email` |
| 179 | E1 | `Ask — turn the memo into an email` |
| 184 | E2 | `Agent reads the memo, drafts the email` |
| 191 | E3 | `Email staged — Send is yours`（free-click 拍，rail 加 `→ your turn` 角标） |
| 196 | E4 | `Follow-up — short version to #eng` |
| 208 | CL | `Close the errand — back to the hero thread` |

---

## F · thread chrome / composer / context HUD（P6-02/03/04 产物，NexusScene）

| 行 | 项 | 当前 copy |
|---|---|---|
| 903 | history 按钮 | `History` |
| 907 | popover eyebrow | `Threads` |
| 926–927 | history item meta | `{n}/{m} steps · Open` / `Closed` |
| 958 | 空态标题 | `No open threads` |
| 960–961 | 空态正文 | `Ask anything to start a new thread, or reopen one from History.` |
| 968 / 971 | 空态 composer | placeholder `Ask your team anything...` · 按钮 `Ask` |
| 767 / 770 | follow-up composer（HUD） | placeholder `Ask a follow-up on this thread...` · 按钮 `Ask` |
| 1133 | follow-up chip eyebrow | `Suggested follow-up` |
| 1353 | brief 的 follow-up 前导词 | `Follow-up: "{question}"` |
| 1363–1364 | context HUD 词形 | `Context {pct}% · Step {n}/{m}`（阈值刻度 `85%` 常驻） |

### F2 context-% 曲线 feel（P6-04，HITL 现场过）

- hero：8 → 19 → 31 → 47 → 58 → **71**（主段收口）→ **80**（follow-up）（`cases.ts:275–283`）。
- web-search：8 → 15 → 23；email：9 → 17 → 24（errand 低耗对比，`cases.ts:407–411 / 539–543`）。
- 核：71→80% 跨过 85% 阈值前的 amber 时机、"thread 是真实会话边界" 这句口播是否顺。

---

## 附录 A · HITL 验收剩余（issue 原 AC，给 Danny）

- [ ] 上表 A–F 逐条审定 → 改字 → 删 `⚠` 注释（清零 = AC1）。
- [ ] 真 memo 照片入库 + 删占位 svg（C3 换法）= AC2。
- [ ] Apple 截图核验（B4）。
- [ ] 点 Manifest 镜头飞行手感 / title card 停留时长 / 三幕全程跑一遍计时（含现场手点 Send、Dispatch）= AC3。
- 跑法：`npm run dev` → `→`/Space 走 rail（26 beat / 29 step，title card 在 T1/T2/T3）；E3 拍停下手点 Send。

## 附录 B · P6 之前的遗留 ⚠（17 处，非本 wave blocker）

早前 wave（P3-05 收口未清完 + P4-03 + P5）留下的待审字，建议另起一轮或顺手过：

| 文件 | 处数 | 内容 |
|---|---|---|
| `src/data/fixtures.p3.ts` | 13 | 详情页 fixture 整文件（HR analysis / weekly sentiment / 症状 payload / 计划 / 周报 / capabilities catalog——9–10 行文件头声明全文件待审；守则：no personnel judgment） |
| `src/data/fixtures.ts` | 1 (+4 处 `⚠ 高价值` 提示) | 272 行 B7 chat transcript；另 222/240/351/398 标"高价值建议审"（capabilities 引文 / mismatch 卡 / AGENT_OUTPUT 六段 / briefings） |
| `src/components/scenes/ProjectDetailScene.tsx` | 2 | 36 行 grown 态状态文案（`at risk · diagnosed · actions in flight · Friday held`）；42 行 shell copy（`No handoffs yet — agent actions have not been generated.` / `Reported vs signals` / `Reality gap`） |
| `src/components/scenes/EmployeeDetailScene.tsx` | 1 | 36 行模块深度标签（`Observed symptoms` / `Capabilities-backed`） |
