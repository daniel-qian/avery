# Prototype 2.0 是 demo-only；工程类 design docs 仅作 reference

## 背景

TeamMaster 1.0 的死因是"在验证产品故事之前就先做工程"（API、backend、DB schema、infra）。2.0 的第一目标不是建软件，而是为 Venus 的首次 pitch 证明业务故事。

`docs/20260603-design/` 下的 design docs 分两类：

- **叙事类**（`可信产出技术思维报告 v0.2`、`TeamMaster Dashboard Prototype Reference`）—— 直接服务 pitch / 答辩。
- **工程类**（`设想仓库和模块结构`、`补充：自动实时更新架构`）—— 描述 monorepo、ingestion / signals / intelligence / workers 等生产系统管线。

## 决策

Prototype 2.0 是 **demo-only**：只做 UI / UX / 高保真交互 / 故事演示 / 视觉与动画。工程类 docs 一律视为 **reference / pitch talking points**，**不**在 Venus demo 阶段实建任何 backend、DB、RAG、agent infra、ingestion、signals pipeline。

产品最强卖点（reality-gap 闭环：自报 vs 实际信号冲突检测）通过 **mock 数据预埋剧情**来"演"，而非真建管线。

## 理由 / 权衡

- 真建任何一块 = 原样重犯 1.0 错误。
- Venus 的成功指标是"她听懂 problem / customer / workflow / value"——纯叙事 + 假数据即可达成，零行 backend。
- 被否的替代方案：建一条 thin vertical slice（如真接一个 Slack connector）以增加可信度。否决原因：验证前的工程投入正是要避免的，且 demo 里"演"出来的可信度对首次 pitch 已足够。

## 后果

任何指向工程类 docs 的"我们是不是该把这个建起来"的提议，默认 **wontfix**，直到 Venus 验证后才重启架构 / DB / 实现规划。
