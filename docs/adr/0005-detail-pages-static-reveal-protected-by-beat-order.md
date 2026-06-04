# 详情页静态恒显，killer beat 靠 beat 顺序而非 state-gating 保护

详情页（project / employee）的全部模块——包括 `handoffs`、`HR knowledge analysis` 等 agent 智能层——**静态恒显**：任何时刻 drill 进去都看到完整内容，不读 `thread.steps`、零条件渲染。

考虑过的备选是 **state-gating**：智能层模块 gate 在 `thread` 进度上（agent 在 Nexus 跑过对应 step 才点亮），这样详情页能"演出"智能层长出来的过程、且天然不剧透。否决它是因为 Danny 要的页面设计本就需要"任何时候点开都完整可读"，gating 会让 free-click 早期点进去的页面半空、违背设计意图。

代价：静态恒显会让 Bill 员工页提前暴露 reality gap 根因，削弱 Nexus B5/B6 的 reveal。**用 beat 顺序纪律兜底**——demo 先走完 Nexus（B3–B6）再 drill 详情；B2 因此**取消 pre-Nexus 的项目页 drill**，只做 focus 高亮。页面模块排序也配合：reveal-y 内容（risk / HR signal / evidence）下沉到次层级。

影响面跨 P1（B2 focus 交互）、P3（详情 scene 建法：零 thread 耦合）、P4（rail beat 顺序）。
