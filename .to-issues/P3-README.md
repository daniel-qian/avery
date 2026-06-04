# P3 详情 scene — build issues（本地，未发 GitHub）

> 注：`.to-issues/README.md` 属 P2(Nexus) session。P3 的索引在本文件，issue 文件以 `P3-` 前缀命名，避免与 P2 的 `01..06-nexus-*.md` 冲突。

来源：2026-06-04 `/grill-with-docs` 会话锁定的 P3 规格。
权威 doc：[demo-brief](../docs/20260603-design/demo-brief.md) beat sheet · [ADR-0005](../docs/adr/0005-detail-pages-static-reveal-protected-by-beat-order.md)（详情页静态恒显）· [CONTEXT.md](../CONTEXT.md)（Dashboard / Nexus / Briefing / Calm / Focus / Reality gap / Handoff / Capabilities）。

## 铁律（每个 issue 都适用）

- **不扩 store**：只调已锁 action（`runAgent / dispatchTask / regenBriefing / askQuestion / openDetail / back / goScene / setFocus`）。详情 scene **零 `thread.steps` 耦合**（静态恒显，ADR-0005）。
- 新内容进 **`src/data/fixtures.p3.ts`**（additive，不改共享 `fixtures.ts`）；Venus-facing 英文 copy 标 `⚠ 待 Danny 审字`，统一在 P3-05 收口。
- CSS 追加到 `global.css` 尾部 `/* P3 · Detail scenes */` banner，不动共享基座。
- `npm run build`（`tsc -b` 零错 + vite）必须保持过。

## 故事节点（做满）vs texture（空态）

- **做满**：Acme · Connector · Bill · Jason · Vanessa。
- **其余 ~10 人 / 4 项目**：派生数据 + 干净空态（如 `No signals — looks steady`）。

## 切片与依赖

| # | 切片 | 类型 | Blocked by |
|---|---|---|---|
| [P3-01](./P3-01-employee-detail.md) | Employee 详情页 + 共享 DetailShell/helper | AFK | — |
| [P3-02](./P3-02-project-detail.md) | Project 详情页 + task board + handoffs | AFK | P3-01 |
| [P3-03](./P3-03-onboarding-flow.md) | Onboarding 4 步微流程 | AFK | — |
| [P3-04](./P3-04-capabilities-page.md) | Capabilities sell 页 | AFK | — |
| [P3-05](./P3-05-narrative-review.md) | Venus-facing 文案审字 pass | **HITL** | P3-01, P3-02 |

03 / 04 与 01 完全独立，可并行起。
