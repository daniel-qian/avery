# Session Handoff — 2026-07-01（合伙人知识包整合 + 真 eval + landing/demo 上线）

> **本仓库 (`D:\avery`) 处于稳定、已上线状态；活跃工作已转到营销工作区。** 只靠本文件 +
> `progress.md` + `feature_list.json` + `.handoff/partner-integration-0701.md`（完整运行日志）+
> `eval-harness/EVAL-REAL-0701.md`（真 eval 诚实结论）即可 restart，不要回放聊天记录。
> 前几轮的旧 handoff（P7 6-桶启动 / GTM 圆桌）已全部完成并被本轮覆盖。

## 0 · 一句话现状
合伙人（Cythia）交付的 HR 知识包已整合进 **eval / demo / landing** 三处并全部推送上线；跑了一轮真实盲测拿到
**诚实结论**；给合伙人做了交付包。**8 个提交全推 `origin/main`（收尾 `e71629d`）**，Vercel 自动部署 landing。
**下一步主战场是营销，不在本仓库**（见 §5）。

## 1 · 本轮 shipped（别重做，往上叠）
- **eval**：合伙人 6 个 SCN → `eval-harness/cases/scn-00X-*.md`（`authored_by:"partner"`，解锁 non_danny 发布闸）；
  judge rubric 换成 4 新差异轴；命名诚实化（`avery-m3`/`m3-raw`/`m3-scaffold-no-redline`，**同模型消融非跨厂商**）；
  **真跑完成** `runs/real-0701c`（gitignored）→ 诚实结论在 `eval-harness/EVAL-REAL-0701.md`；pytest **124 绿**。
- **demo** (`src/`)：终局卡 `AGENT_OUTPUT` 对齐合伙人 **8 字段**正典 + 三视觉区（read/backing/move）；Playbooks HR 栏换真 SCN。build 绿。
- **landing** (`landing/`)：折入 5 护栏 + 最小证据政策 + 8 字段产出 + 6 SCN；**定位按 eval 证据重锚**（见 §2）；
  eval 区用真逐字稿装填（**数字不上页**，NOT PUBLISHABLE）；中文 M3 20/20；tsc 绿。
- **交付包**：`eval-harness/for-partner/`（README + Elif 五答案头对头 + scorecard）——给合伙人（HR 高管）看真材料。

## 2 · 锁定事实（不要 re-litigate；★ = 本轮更新）
- **品牌 = Avery**，全英文、海外优先；`?lang=zh` 中文**走 MiniMax-M3 生成**（`landing/scripts/i18n-zh.mjs`，已加失败重试），我不自写中文。
- **定位（★ 本轮按 eval 证据改锚）**：老卖点"我们不打分、别的 AI 会"**站不住**（真跑证明 2026 免费 AI 多半也不打分）。
  → 红线**降为信任保证**（保留在 TrustLayer/Method/Output/Modules/隐私句，**不再当竞争亮点**）；
  **真差异 = Avery 会告诉你①多大把握②何时该拉 HR（升级）③亮证据**——通用 AI 给完建议就停。声音仍"资深前辈在你耳边"。
- **红线（ADR-0015）**：绝不在屏幕上量化/诊断/评判**一个人**。**deterministic 校验器是真护城河**（真跑：抽掉它同模型就翻车更多）。
- **商业模式**：advisor AI + tools 免费，**playbooks 付费**。ADR-0016：果断双向（该硬要硬，含 exit，仍不打分）。
- **standing 约束**：动页面/组件，**不动** rails(railStore) / store 契约(ADR-0013) / camera(ADR-0012) / terminal-stream(ADR-0014) /
  内部 type & 变量名 / ADR 历史文件 / `docs/archived/**` / `.to-issues/archived/**`。（`.handoff/partner-integration-0701.md`
  是本轮 integrator 作战板 = 当前件，可读可续；历史 handoff 冻结。）

## 3 · 仓库当前态（干净、可 restart）
- 分支 `main` 与 `origin/main` 同步（`e71629d`）。工作树只剩有意未追踪：`.claude/` `.codex/`
  `assets/0630-partner-docs/`（合伙人 IP 原包，**有意未入库**）`assets/logo-v0.png` `eval-harness/for-partner.zip`。
- 验证全绿：`eval-harness` pytest 124；`landing` `npx tsc --noEmit` 0 错（`next build` 本地卡 Google Fonts=国内网络，Vercel 可靠）；`src` `npm run build` 绿。
- 无 `.env` / 密钥入库。key 仍在 `eval-harness/.env`（gitignored）；曾暴露过，轮换提醒仍有效（Danny 说本轮不轮换）。

## 4 · 留给 Danny 的 HITL（本仓库侧，非 agent scope）
- **审字**：全部新英文 copy + M3 中文仍是 `⚠ 待 Danny 审字`。
- **真人 eval 评分**：eval 变"可发布 win-rate"的唯一解锁（现用合成 human label → NOT PUBLISHABLE）。找几位真 HR/经理评分。
- **合伙人 IP**：具名来源 / 案例数能否公开（Ray 建议 landing 具名合伙人；SCN-004 涉法律，作者可信度关键）。
- **真产品洞**：avery loop 需强制 **cite-before-number**（真跑暴露：no-halluc 0.1，会吐未引证数字）。
- **demo 部署**：landing 自动部署；avery-根 demo 的 Vercel 连接未确认（KK team 只有 interactive-reader/danny-portfolio/teammaster-demosite，后者连的是另一 repo）。要对外展示 demo 需先确认。

## 5 · 下个 session ≠ 本仓库：主战场转「营销」
- **工作区** `D:\Boyle\marketing-resource\avery`（自带 harness）。任务：发 **ProductHunt** · 录 **视频 demo**
  （叙事方向 + 分镜脚本 + **Remotion / HyperFrames 文本帧动画**）· **冷邮件**模板——"找方向 + 做素材"，不只写文案。
- **完整交接已写入该工作区的 `session-handoff.md`**（含：更新后的诚实态、重锚定位、要引用的本仓库素材路径、
  三大任务、Remotion/HyperFrames skills、公开 CTA/域名等 gap、中文-走-M3 约定）。
- 若下个 session 仍需碰本仓库代码（如按营销反馈改 landing 文案）：回本目录，读本文件 + `progress.md` + `feature_list.json` 即可接上。

## 6 · 指针
- 完整运行日志（本轮）：`.handoff/partner-integration-0701.md`
- 真 eval 诚实结论：`eval-harness/EVAL-REAL-0701.md`；scorecard：`runs/real-0701c/scorecard.md`（gitignored，可重跑）
- 合伙人交付包：`eval-harness/for-partner/`
- 定位/红线：`docs/adr/0015-*.md` + `0016-*.md`；`CONTEXT.md`
- 角色班子：`roles.md`（+ `.claude/agents/{phil,claire,will,dana,ceo}.md`）
- 营销交接：`D:\Boyle\marketing-resource\avery\session-handoff.md`
