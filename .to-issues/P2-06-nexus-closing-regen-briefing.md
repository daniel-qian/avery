# Slice 6 — B10 收尾触发（regenBriefing + 回 Dashboard）

## What to build

B10 收尾触发——把可信产出闭环带回 Dashboard。`structured-output` 完成 / thread complete 后,report 面板末尾提供"Return to dashboard"按钮,点击调 `regenBriefing()` + `goScene('dashboard')`。

**跨片依赖（务必在 PR 描述里标注）**:`regenBriefing()` 把 `store.briefing` 切到 `BRIEFING_V2`,但当前 `DashboardScene` 硬编码 `import BRIEFING_V1`、**未读 `store.briefing`**,所以 Briefing V2 的可见效果 + orbit 重排属 **P1 职责**(P1 需把 `DashboardScene` 改为读 `store.briefing`)。本片**只负责触发正确**,不负责 Dashboard 渲染——验证到"action 被正确调用 + scene 切回 dashboard"即可。

触发必须是 free-click 可达的真 action(ADR-0003:rail 后续复用同一 action,零 `if(demoMode)`)。

## Acceptance criteria

- [ ] thread 走到 `structured-output` / complete 后,出现"Return to dashboard"触发点
- [ ] 点击调用 `regenBriefing()` 且 `goScene('dashboard')`,scene 切回 dashboard
- [ ] 触发是 free-click 可达的真 action（rail 可复用,零 `if(demoMode)`）
- [ ] PR 描述标注 P1 依赖:`DashboardScene` 需改读 `store.briefing` 才能显现 V2 + orbit 重排
- [ ] `npm run build` 过

## Blocked by

- Slice 5（structured-output report 面板）
