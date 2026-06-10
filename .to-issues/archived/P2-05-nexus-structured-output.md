# Slice 5 — B9 structured-output 中央 report 面板 + 派 task

## What to build

B9 高潮——结构化可信输出 + 交互式派 task,是 Venus **逐字读**的一拍。推进到 `structured-output` step,**中央 report 面板**纵向铺开 `AGENT_OUTPUT` 的固定 6 段:

1. conclusion（最突出）
2. evidence（5 条）
3. uncertainties（2 条）
4. recommendedActions（4 条:主方案保周五 + conditional 兜底）
5. needsConfirmationFrom（谁确认）
6. nextTasks（派 task 模板）

`nextTasks` 每条带"派"动作,点击调 `dispatchTask(template)`,task 进入 `tasks` state;派出后给可见确认态(如标记 dispatched / 禁用按钮)。

排版清晰、层次分明——这是"可信产出报告"的展示面,体现"结论 / 依据 / 不确定点 / 建议动作 / 谁确认 / 下一步"闭环。

## Acceptance criteria

- [ ] 推进到 `structured-output`,中央面板显示全部 6 段,内容取自 `AGENT_OUTPUT`
- [ ] 6 段排版清晰、层次分明（conclusion 最突出）
- [ ] 每条 `nextTasks` 可点击派出,调 `dispatchTask`,task 进入 `tasks` state
- [ ] 已派 task 有可见确认态,重复点击不重复派
- [ ] `npm run build` 过

## Blocked by

- Slice 1（Nexus 放射画布骨架）
