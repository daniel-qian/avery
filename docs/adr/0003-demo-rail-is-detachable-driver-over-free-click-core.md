# Demo rail = free-click core 之上的可拆 driver

## 背景

Venus pitch 用 scripted rail 当主干（保证叙事顺序、防翻车，见 demo brief）。但 demo 结束后的开发是 free-click 的 develop-test-feedback loop —— free-click 才是长期 product，rail 是一次性 demo 辅助。naive 直觉会 rail-first 硬编码序列，结果 demo 完没有可继续开发的东西，且 free-click 会跟 Venus 看到的分叉。

## 决策

rail 建成 free-click core 之上的一层薄 driver：

- **单一事实源 = state**（`scene / focus / thread / tasks / briefing`），暴露一套 **action API**（`goScene / setFocus / runAgent / dispatchTask / regenBriefing`）。
- **free-click 和 rail 都只走这套 action**。rail = 有序 step 列表，每个 step 调和点击一模一样的 action。
- **先建 free-click，再在上面铺 rail。** 只为 beat sheet 触及的切片建 free-click，不为 demo 不展示的页面建。
- scripted 内容（agent 回复 / timeline / mismatch 卡）当 **fixture/data** 存，喂同一批 dumb 组件；`runAgent` 现返回 fixture，以后换真逻辑。
- **零 `if(demoMode)` 分支。**

**Litmus test**：自由点击能复现 rail 的每一个 beat → rail 是纯 driver、可随手扔。某 beat 只有 rail 模式才发生 → 建错了。

## 理由 / 权衡

被否的替代是 rail-first 硬编码：短期更快，但 demo 后留不下可开发的 product，且行为分叉。薄 driver 前期略贵，换来 rail 干净可扔 + free-click 从第一天就是一等公民。

## 后果

删 rail = 删 `SCRIPT` + `<DemoControls>` 4 个按钮，**只删自动前进，不删任何行为**——每个 beat 点击仍可达。fixture 后续部分变 seed/test 数据、部分丢弃。
