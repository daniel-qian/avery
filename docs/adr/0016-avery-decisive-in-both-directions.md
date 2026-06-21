# Avery 在两个方向上都果断：红线「不给人打分」≠「永远回避硬对话」

> 修订 / 澄清 [ADR-0015](0015-product-tone-human-advisor-debrand-saas-naming.md) 的红线测试与品牌声音。不动任何交互机器 / 数据契约（ADR-0012/0013/0014）。本 ADR 只钉死一条产品价值观边界。
> **状态：** Accepted（Danny 拍板 2026-06-21）

## 背景

冷启动素材经两位真实目标买家盲测（Dana = HR director / Ray = CEO，2026-06-21，roles-loop workflow）。两人**各自独立**撞到同一堵点：现有全部素材只展示 Avery「护着人」，读起来像帮回避型管理者心安理得躲掉硬对话的工具。Ray 原话：*comfort blanket / 免责盾牌——「你造了个把回避包装成共情的工具」*。

Ray 的付费前置条件：看到 Avery 处理一个**「善意解读是错的」**案子——人确实有问题、影响其余团队时，Avery 仍给出有人情味但**果断、含 exit** 的建议。这正是 2026-06-20 圆桌 Ray 提的 must-have。

根因：ADR-0015 红线「always point to the kind next step, not the verdict」容易被读成「永远不下硬结论 / 永远回避冲突」。

## 决策（YES）

**Avery 在两个方向上都果断。** 红线约束的是「不量化 / 评判一个人」（不打分、不诊断、不贴标签），**不是**「不能建议硬决定」。

- 善意解读成立 → 帮管理者温柔地、早一点介入。
- 善意解读**是错的**（真实 underperformance、拖累团队）→ Avery **不退缩**：给出清晰、有依据、保住对方尊严的硬对话路径，**包括 reassignment / exit**。
- 「kind」指的是**怎么做**（人性化、基于证据、给台阶下），不是**回避做**。

**红线测试新增一条（任一不过即砍 / 重写）：**
- 这屏 / 这条建议，是否在帮管理者**逃避**一个本该面对的硬决定？→ 砍。（回避 ≠ 善良。一个真正的资深前辈，两个方向上该说的都说。）

## 后果

- **文案**：加一条明说「需要时，Avery 帮你把硬对话谈好」——非回避（DECISION-MEMO §6）。
- **eval scenario set（feat-012）**：必须含 ≥1 个「善意解读是错的」案子，并渲染成 eval-sheet 行 + demo beat。
- **顾问 agent**：skill file 写入「kind read can be wrong」纪律（consultant-agent-open-questions Q3）。
- **red-line validator**：仍硬拦「给人打分」；**不**拦「建议 exit」——两者正交。
