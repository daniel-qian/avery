# 前端 stack = Vite + React + framer-motion（非 Next、非 vanilla）

## 背景

现有 `index.html` + `app.js` + `mock-data.js` + `styles.css` 是纯 vanilla throwaway 探针，任务是"探出 dashboard/nexus 的形状"，已完成。

Prototype 2.0 demo 的命脉是动画质量 + 跨元素协同 focus 转场（成功标准 #2 smooth animation、Optimize-For #5 animation quality），且要承载一条 10-beat 的强协同动画序列（见 demo brief / beat sheet）。

## 决策

用 **Vite + React + framer-motion**（语言 JS 或轻量 TS）。**不**用 Next.js，**不**继续 vanilla。现有 vanilla 文件作为视觉/结构参考，逐步被 React 实现取代。

## 理由 / 权衡

- framer-motion 让平静协同动画变简单且丝滑；vanilla 手搓 10-beat 协同会持续磨损。
- rail step machine + focus state + thread state 三套状态用 React reducer/store 干净；plain JS 随 beat 增长会糊。
- 吻合 `Prototype Reference` doc 的组件结构（`ProjectLayer` 等），少一层翻译；该 doc 本身就推 framer-motion。
- Danny 是 React-native solo dev，对他 React+framer-motion 既更高质又更快，不是 friction。
- 不用 Next：纯静态 demo 无 SSR / 无 backend 需求（见 [ADR-0001](./0001-prototype-demo-only-engineering-docs-are-reference.md)）；`vite build` 出静态包，可提前 build、可静态托管给 Venus 回看。

**被否的替代**：
- vanilla + Motion One：保住零 build + 像样动画，但三套 state 全手搓，10-beat 协同下痛。
- 纯 vanilla 硬扛：动画最痛。

## 与 ADR-0001 的关系

不冲突。ADR-0001 的"避免 premature engineering"针对的是 **backend**（ingestion/signals/DB/agent infra）。前端动画工具正是"做出 convincing UI/UX"这个 demo 唯一目标的核心能力，属于对齐而非破例。
