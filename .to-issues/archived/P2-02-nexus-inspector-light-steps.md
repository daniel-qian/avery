# Slice 2 — inspector + 轻量步内容（pm-agent / hr-root-cause / human-loop）

## What to build

Nexus inspector 浮层 + 三个轻量步的展开内容。`.nexus-inspector`(右下,基座 CSS 已给)显示**当前 active step** 的细节,用基座 `.artifact-list` / `.artifact-card` 渲染:

- **`pm-agent`（B4）**:PM agent 取证据 + Company RAG + Capabilities;列 `s_pr` / `s_blocker` / `s_noupdate` 三条证据 + `cap_po_dep` 的 gist。
- **`hr-root-cause`（B6）**:根因 = interrupt overload(非低产);列 `s_mentions` / `s_commits` + `cap_hr_interrupt` gist + `MISMATCH.safeFraming`("evidence-based, no personnel judgment")。
- **`human-loop`（B7）**:一句"Bill pulled into the thread · agent listening in the background, recording context to refine its recommendation."

新增 `HUMAN_LOOP` fixture:往 `src/data/fixtures.ts` 加一个导出常量承载 B7 文案,**不改动现有 types**(fixtures 是内容真相源,不是 store / CSS 基座)。

组件保持 dumb:内容全部取自 fixtures,无业务逻辑分支。

## Acceptance criteria

- [ ] 推进到 `pm-agent`,inspector 列出 3 条 Connector 证据 + Project-Ops capability gist
- [ ] 推进到 `hr-root-cause`,inspector 显示根因 + 2 条 interrupt 信号 + HR capability gist + safe-framing 文案
- [ ] 推进到 `human-loop`,inspector 显示背景聆听文案;`HUMAN_LOOP` fixture 已加且未改动 `fixtures.ts` 现有 types
- [ ] inspector 内容随 active step 切换;非这三步时不喧宾夺主(让位给 03/04/05 的中央卡)
- [ ] `npm run build` 过

## Blocked by

- Slice 1（Nexus 放射画布骨架）
