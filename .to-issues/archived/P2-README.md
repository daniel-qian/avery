# P2 · Nexus — Issue 集（本地,未发 GitHub）

来源:2026-06-04 `/grill-with-docs` 会话 + **ADR-0004**（Nexus 空间编排模型）。
权威参照:`docs/adr/0004-nexus-spatial-orchestration-model.md` · `docs/20260603-design/demo-brief.md`（B4–B10）· `CONTEXT.md`（术语）。

## 全局约束（每片都守）

- **契约只读**:`src/store/canvasStore.ts` 已 P0.5 冻结。P2 行为一律调既有 action（`askQuestion`/`runAgent`/`dispatchTask`/`regenBriefing`/`goScene`），**不扩 store**。节点态从 `thread.steps` 纯派生。
- **共享基座只读**:`global.css` 上半部基座 + `.flow-node`/`.nexus-inspector`/`.artifact-*` 类已给;P2 新样式只写进 `/* P2 · Nexus */` banner 区。
- **零 `if(demoMode)`**（ADR-0003）:每个 beat 自由点击可达;rail 是 P4 的薄 driver。
- **动效**:只动 transform/opacity,别动 width/height,别处处 blur,守 `prefers-reduced-motion`。
- UI 字符串英文（Venus 是美国听众）。

## 依赖图

```
01 骨架 ──┬── 02 inspector 轻量步
          ├── 03 mismatch 卡（killer beat）
          ├── 04 timeline 中卡
          └── 05 structured-output ── 06 收尾 regenBriefing
```

02–05 互相独立,可并行抓。

## 清单

| # | 文件 | Type | Blocked by | Beat |
|---|---|---|---|---|
| 01 | `P2-01-nexus-radial-canvas-skeleton.md` | AFK | — | B4–B9 骨架 |
| 02 | `P2-02-nexus-inspector-light-steps.md` | AFK | 01 | B4/B6/B7 |
| 03 | `P2-03-nexus-mismatch-card.md` | AFK | 01 | B5 |
| 04 | `P2-04-nexus-timeline-card.md` | AFK | 01 | B8 |
| 05 | `P2-05-nexus-structured-output.md` | AFK | 01 | B9 |
| 06 | `P2-06-nexus-closing-regen-briefing.md` | AFK | 05 | B10 |

P1 依赖核对见 `.handoff/P2-to-P1-dependency-check.md`。
