# P3-05 · Venus-facing 文案审字 pass

类型：**HITL**（需 Danny 逐字审）· Blocked by：**P3-01, P3-02**（内容须先存在才能审）

## What to build

P3-01..04 建页时所有 Venus 会读到的英文 copy 先用 agent 初稿、标 `⚠ 待 Danny 审字`。本切片**收口**：Danny 逐字过一遍，落定最终英文文案。重点在口径，不在排版。

待审清单（来自 `fixtures.p3.ts`）：
- **Connector delivery milestones**（≥5 阶段的 label / when / state 措辞）。
- **Handoffs**（Acme / Connector）：可执行行动文本，含「飞 Nexus」项的措辞（例：`Tell Jason: must finish X by Friday`、`Have the Legal agent dig into report Y → Nexus`）。
- **Weekly team updates**（Acme / Connector 成员进展行）。
- **Weekly summary + personal sentiment**（Bill / Jason / Vanessa）。
- **HR signal** 短文本（Bill→`Needs manager check-in` 等）。
- **HR knowledge analysis**（Bill 为主）：据 HR capability 生成的建议段落。

**口径硬约束**（守 CONTEXT「Reality gap」+ brief 安全护栏）：
- agent **只指证据矛盾、给低风险下一步**，**绝不做人身/人格评价**（no personnel judgment）。
- Bill 的根因口径 = `interrupt overload, not underperformance`（与 `MISMATCH.rootCause` / `AGENT_OUTPUT` 一致）。
- 用 canonical 词（Handoff / Capabilities / report mismatch），避开 `_Avoid_` 词。

## Acceptance criteria

- [ ] 上述每类 copy 经 Danny 确认，移除所有 `⚠ 待 Danny 审字` 标记。
- [ ] HR analysis / handoffs 文本无人身评价，符合 no-personnel-judgment 护栏。
- [ ] 术语与 CONTEXT.md 一致（无 `_Avoid_` 词）。
- [ ] 改动仅在 `fixtures.p3.ts` 文案层，不动组件结构、不扩 store。

## Blocked by

- P3-01, P3-02（文案随建页产出，须先存在）
