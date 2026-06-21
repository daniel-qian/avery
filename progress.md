# Session Progress Log

> 📢 **致下个 session：本仓库已 adopt harness 体系（2026-06-11）。**
> 启动路径见 `AGENTS.md` 的 Startup Workflow：读本文件 + `feature_list.json`，跑 `./init.sh` 确认绿，再开工。

## Current State

**Last Updated:** 2026-06-21（冷启动 AFK session）
**Active Feature:** 无 active 编码 feature。P7 wave 推进中。本 session（roles-loop workflow，Danny 全程 AFK）完成 4 个 P1 桶并 commit：**feat-005 改名**（已合入 main，commit 89ce238）、**feat-007 顾问 agent 调研/架构**、**feat-008 eval sheet 规格+mock**、**feat-009 文案 kit**（均为交付文档，commit 46084d1，见 `docs/strategy/coldstart-deliverables/`）。
**🔴 头号待办（Danny 价值观抉择）：** Dana + Ray 盲测各自独立撞到**同一堵点**——当前所有素材只展示 Avery「护着人」，读起来像帮回避型管理者躲掉硬对话的工具（Ray：comfort blanket / 免责盾牌）。需 Danny 拍板：**Avery 是否愿意在人确实有问题时,把管理者推进一场果断的硬对话(含 exit)?** 推荐 YES。此决定卡住录屏(feat-013)与对抗 scenario(feat-012)。详见 `docs/strategy/coldstart-deliverables/DECISION-MEMO.md` §3。
**⚠ 给下个 session：** 先读 `DECISION-MEMO.md` + `session-handoff.md` + 本文件 + `feature_list.json`，不要回放聊天记录。

## Status

### What's Done

- [x] feat-000 Demo Prototype（P1–P6，pitch 已用）；feat-001 Project Setup；harness 体系 adopt。
- [x] **feat-004 Nexus 终端流改版 —— done（2026-06-12）。** 全程：grill Q1–Q10（Q4–Q10 Danny "全部按照推荐"）→ `docs/adr/0014-nexus-terminal-stream-hud.md`（取代 ADR-0004 放射表达 + ADR-0012 修订5/6 Nexus 部分；Dashboard / CONTEXT.md 不动）→ 实现五步全落地：
  - **数据形**：`cases.ts` 新增 `stream`（3 case × 13 步全著作终端流脚本）；退役全部拓扑字段；`cardAnchors` 双列瀑布公式；`NEXUS_BOARD` 2300×2700；删 `lib/nexusFlow.ts`。
  - **终端组件**：`NexusTerminal` 左栏 HUD（440px，mono，per-speaker 专色，自滚动，行级 stagger，MANIFEST 锚行点击飞卡，"running ▌" 光标行，附件 chip 首行，Bill 头像内联）。行集合 = `(caseDef, thread)` 纯函数，replay-safe。
  - **镜头收敛**：calm = width-top fit Manifest 区；新卡拍温和飞向（maxFitScale 0.8）；纯思考拍不动；`NEXUS_INSETS.left` 496。
  - **旧层退役**：节点/边渲染 + `.flow-node*` / `.nexus-edge-*` CSS 整组删除。
  - **验证**：`./init.sh` 绿；Danny `npm run dev` 目测（rail 全程 + 三 case 自由点击）+ stream copy 审字，回复"全部通过"。本 session 新增的 ⚠ 审字标记已摘（cases.ts ×3、NexusScene ×2，改注"经 Danny 审定 2026-06-12"）。

- [x] **feat-005 改名 TeamMaster→Avery —— done（2026-06-21，commit 89ce238）。** 8 行表层清扫，内部标识按 ADR-0015 保留。worktree 已合并并清理。⚠ 按 skip-tests 未跑 init.sh/tsc，依赖 build 前需自测。
- [x] **feat-007 / feat-008 / feat-009 P1 交付物 —— done（2026-06-21，commit 46084d1）。** roles-loop workflow 产出顾问 agent 调研+架构、eval sheet 规格+Lin Qing mock、全套文案 kit + DECISION-MEMO。Danny 已审阅确认「成品」。HITL 余项见各 feat evidence（审字 + 6 条文案修正）。

### What's In Progress

- 无 active 编码。等 Danny 拍板 §3 价值观抉择（见上「头号待办」），它解锁 feat-012/013。

### What's Next — P7 wave 下半（Danny 三条主线 = 三个 afk 任务）

1. **agent python 框架 build（feat-011）** — 真正搭 headless eval 顾问 agent（feat-007 是设计稿）。AFK 可跑 skeleton + mock 跑批；真跑等 feat-012 + 合伙人资料。**先要 Danny 选 stack**（consultant-agent-open-questions.md）。
2. **landing page 骨架（feat-010）** — 文案+eval 规格已 done，可立刻 AFK 搭骨架（视频/真 eval 数用 placeholder）。
3. **demo video v1（feat-013，capture feat-006 + remotion）** — **卡在 §3 决定**：先定再拍，否则拍成 Ray 否掉的「comfort blanket」版。
4. **feat-012 对抗 scenario（「善意解读是错的」那一例）** — 化解头号堵点；卡在 §3 决定；产出后回填 eval sheet + 视频 beat。

并行性：1/2/3 可作为 **骨架** 并行 AFK 起跑；但 feat-011 是「真 eval 数」的长杆——视频(3)与落地页(2)最终要可信都要等它跑出真数。

旧 wave 遗留 HITL（不进 feature 列表）：P6-08 审字（errand 卡组等旧 copy 的 ⚠ 标记仍在）+ 换真 memo 照片（`cases.ts` 的 `MEMO_PHOTO_SRC`）。

## Blockers / Risks

- ✅ **§3 价值观抉择 —— 已定（2026-06-21 Danny: YES）**：Avery 在两个方向上都果断（详见 `docs/adr/0016-avery-decisive-in-both-directions.md`）。feat-012/013 解锁。
- ✅ **顾问 agent stack —— 已定（Danny:「按推荐」）**：Python+SDK / 文件-keyword RAG / markdown skill + 固定链（见 consultant-agent-open-questions.md RESOLVED 段）。feat-011 解锁。
- ⚠ **改名未自测**：feat-005 按 skip-tests 未跑 init.sh/tsc，合并前自测。
- ⚠ **eval 证据真实性**：买家都对 N/X/M 占位脚注 + 「Avery 的 read 哪来的」存疑——发布前需真人评测数 + 展示给 Avery 的证据列（DECISION-MEMO §4）。

## Decisions Made

- 见 `docs/adr/0014-nexus-terminal-stream-hud.md`、`docs/adr/0015-product-tone-human-advisor-debrand-saas-naming.md`。
- 商业模式锁定：advisor AI + tools 免费 / playbooks 付费；品牌锁定 Avery；overseas-first 全英文。

## Files Modified — 2026-06-21 冷启动 session

- 新增交付物：`docs/strategy/coldstart-deliverables/`（copy-kit、eval-sheet-spec、consultant-agent-{brief,architecture,open-questions}、DECISION-MEMO、P7-01-brand-rename-report）
- checkpoint commit a2c8845：Danny WIP（ADR-0015 表层措辞 + hero 重建 + P7 issue 草稿 + 圆桌 + roles）
- 改名 commit 89ce238（feat-005）；交付物 commit 46084d1
- harness：`feature_list.json`（feat-005/007/008/009→done，新增 feat-011/012/013）、本文件、`session-handoff.md`

## Notes for Next Session

- 顺手发现（未修，stay in scope）：global.css 里 `.nexus-inspector` / `.nexus-progress-row` / `.nexus-active-list` / `.flow-kind` 是修订 5 删 inspector 时就死掉的样式，下次 CSS 清理可一并删。
- 终端观感微调入口（若 demo 现场要调）：`NEXUS_INSETS`（NexusScene 顶部）、`.nexus-terminal` 宽/位（global.css 尾部 feat-004 区）、`maxFitScale 0.8`（useRailCamera 调用处）。
- ⚠ 标记现状：feat-004 stream copy 的标记已摘；仓库其余 ⚠（errand 卡组、rail caption、tab 短名等）属 P6-08 审字范围，仍待 Danny。
