# P2 → P1 / 共享代码 依赖核对

日期:2026-06-04（`/grill-with-docs` P2 会话产出）。
用法:新 session 据此**检查 P1 相关代码是否需要调整**。每项已就当前工作树核对,结论附在条目。
关联:`docs/adr/0004-nexus-spatial-orchestration-model.md` · `.to-issues/P2-README.md` · `docs/20260603-design/demo-brief.md`（B10）。

---

## 1. B10 闭环:`DashboardScene` 读 `store.briefing` —— ✅ 已满足

P2 Slice 6（B10）收尾调 `regenBriefing()` 把 `store.briefing` 切到 `BRIEFING_V2`。要显现,`DashboardScene` 必须**读 `store.briefing`**(而非硬编码 `import BRIEFING_V1`)。

核对:`DashboardScene.tsx` 已 `const briefing = useCanvas((s) => s.briefing)`,并渲染 `briefing.headline / subhead / metrics`。**无需调整。**

## 2. composer → Nexus 入口:`askQuestion` —— ✅ 已满足

P2 经 `thread.question` 消费 hero 问题。`DashboardScene` 的 composer 已 `onSubmit` 调 `askQuestion(text)`(契约里 `askQuestion` 跳 `scene='nexus'` + 起 thread,`status='running'`、`steps=[]`)。**无需调整。**

注:demo-brief B3"问题**飞进** Nexus"的转场动画属 P5 polish;功能入口已通,P2 不阻塞。

## 3. B10 orbit 重排 —— ⚠ 待确认（可选,可留 P5）

demo-brief B10 写"orbit 反映重排"。当前 orbit 用静态 `PERSON_POS / PROJECT_POS`,`briefing` V1→V2 切换**不移动节点**。

判断:若"天气更新"靠 briefing 文案 + metrics 变化即可表达,则当前足够、无需动 orbit。若要真重排节点位置呼应"风险已 owned",需 P1/P5 加一套 V2 坐标或位移——属 polish。**P2 不依赖此项**;由你决定是否在 P5 补。

## 4. `back()` 往返 —— ⚠ 归 P4 rail（非 P1）

契约 `back()` 写死回 `dashboard`。P2 已规避:B4/B6 的 drill-in 用 **Nexus 内浮层**展开(见 ADR-0004 遗留张力 A),不跳 scene。P4 rail 若做 Capabilities/Employee **整页** drill-in 往返,回程用 `goScene('nexus')` 而非 `back()`。**P1 无需动**,记给 P4。

---

## 结论

P2 对 P1 的**硬依赖(#1、#2)当前工作树均已满足**,P2 可直接并行开建。#3 为可选 polish、#4 归 P4 —— 两者都不阻塞 P2。
