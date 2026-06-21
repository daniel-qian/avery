# Session Handoff — P7「GTM + eval」wave 启动（2026-06-20）

> ### 🔄 UPDATE 2026-06-21（冷启动 AFK session 后）
> 下半段进度变了，先读这条再看下文（下文 §3 表格的 P1 桶状态已过时）。
> - **4 个 P1 桶已完成并 commit**：feat-005 改名（合入 main，89ce238）、feat-007 顾问 agent 调研/架构、feat-008 eval sheet 规格+mock、feat-009 文案 kit（交付物在 `docs/strategy/coldstart-deliverables/`，46084d1）。Danny 已确认成品。
> - **必读新文件**：`docs/strategy/coldstart-deliverables/DECISION-MEMO.md`（含 Dana/Ray 盲测 + 待拍板项）。
> - **🔴 头号待办**：§3 价值观抉择——Avery 是否愿把管理者推进硬对话(含 exit)？卡住 feat-012/013。推荐 YES。
> - **下半段三主线**（Danny 定）= feat-011 agent build / feat-010 landing 骨架 / feat-013 demo 视频；新增 feat-012 对抗 scenario。详见 `progress.md` 与 `feature_list.json`。
>
> ---
>
> 上一个 session（2026-06-20）context 已爆，故交接。**只靠本文件 + `feature_list.json` + `progress.md` + `.to-issues/P7-0*` + `docs/strategy/2026-06-20-coldstart-eval-roundtable.md` 即可 restart，不要回放聊天记录。**

## 0 · 一句话现状
朋友/同事第一波 pitch 反馈良好。商业模式锁定、品牌锁定、五人角色班子建好、一轮 GTM 圆桌出了决策备忘。现在把"下一步"拆成 **6 个桶（feat-005..010 / `.to-issues/P7-0*`）**，目标：开 AFK agent 跑，让 Danny 专注营销/视频、能睡觉。

## 1 · 锁定事实（不要再 re-litigate）
- **品牌 = Avery**（旧 TeamMaster）。**全英文、海外优先**，文案必须地道英文。
- **定位**：advisor-form AI——"资深前辈在你耳边"，**不是**仪表盘 / 堆 agent 的 AI SaaS 效率工具。
- **商业模式**：advisor AI + tools **免费**，**playbooks 付费**。
- **红线（ADR-0015，最高优先）**：绝不在屏幕上量化/诊断/评判**一个人**（没有血条、没有 flight-risk %、没有绩效分）。红线三问：被讨论的人看到这屏会不会觉得被评判？像不像 AI 工具自夸 agent/效率？一个温暖的资深人类会不会真这么说？
- **护栏 A**：洗掉"机器评判人"+VC 自夸腔，但**保留"它说得出依据"**（reasoning/evidence 改人话不删）。
- **standing 约束（历轮反复强调）**：动 **页面和组件**，**不动** rails（railStore demo 步进）、store 契约（ADR-0013）、camera（ADR-0012）、terminal-stream（ADR-0014）、内部 type/变量名、ADR 文件（历史记录不改）、`docs/archived/**` + `.to-issues/archived/**` + `.handoff/**`（冻结历史）。

## 2 · 圆桌已产出（别重做，往上叠）
全文：`docs/strategy/2026-06-20-coldstart-eval-roundtable.md`（含完整五人发言 + 决策备忘）。要点：
- **Q1 冷启动**：LinkedIn 创始人亲发 **第一** → 精准冷邮件（手写、非群发，域名预热要 4–6 周、今天就得起跑）→ 社群 → ProductHunt **最后**。
- **Q2 eval**：建 **无界面** Avery 顾问 agent 跑冻结场景 vs codex/claude；**呈现成"建议对比"而非排行榜**（Dana：买家不是在聊天机器人里挑）。
- **Kill/Continue（第2周末）**：继续 = ≥8 个合格通话 + ≥3「现在就能用」+ ≥1「愿付费」；砍 = 回复率<2%、真实领导互动个位数、零主动问"啥时能试"。盯**约到的通话数**。
- **两个 crux**（已写进对应桶）：① Ray——现在全靠一个**自编**剧本，需要 ≥3 个非自编场景 + 1 个"温柔解读是错的"案子；② Dana 的红线警报经我核对**夸大了**（实际没给人打分，只是个人页有临床味的 stat-grid 观感）——属取舍，非 bug。

## 3 · 6 个桶（= feat-005..010 / `.to-issues/P7-0*`）

| 桶 | 内容 | 今晚 AFK 能跑? | 依赖 |
|---|---|---|---|
| **P7-01 / feat-005** | Avery 改名 + surface-label 漏字清扫 | ✅ 是（P1） | 无 |
| **P7-02 / feat-006** | demo 视频录制就绪（clean capture mode） | ◑ 半（Danny 录） | feat-005 |
| **P7-03 / feat-007** | 顾问 agent 调研+brief+架构提案 | ✅ 是（P1，Danny 醒来 grill） | 无 |
| **P7-04 / feat-008** | eval sheet 布局 + benchmark 规格 | ✅ 是（P1，合伙人喂真资料） | 软依赖 07 |
| **P7-05 / feat-009** | 文案 kit：slug + 邮件/消息 + PH/LinkedIn | ✅ 是（P1，Danny 审字） | 无 |
| **P7-06 / feat-010** | landing page 脚手架 | ◑ 半（占位） | 09/06/08 |

**今晚直接开的 AFK：05 / 07 / 08 / 09**（彼此独立、不需 Danny 在线）。**留给 Danny/合伙人**：06（录视频）、10（依赖前面）、合伙人的模拟公司资料+问题（喂 08）。

## 4 · 两个必须先定的 grill 张力（每个我都给了推荐；最终归 Danny）

**张力 A — 改名深度（P7-01）**：Danny 列了 `nexus→the room / dashboard→your team / capabilities→playbooks / tm→avery`，可能想连**内部标识符**一起改。
- **本轮默认 = 只改品牌 + surface 漏字，内部 id/文件名/CSS/类型不改**（ADR-0015 已决定内部名保留；改 scene id/文件/CSS 是纯 churn + demo 回归风险）。
- 若 Danny 要深改 → 单开 P7-01b 大重构 + 全回归，**别混进 P7-01**。

**张力 B — 创始人声音 vs 红线（P7-05，最重要）**：Danny 的声音 **"observe your team faster, build a better team, avoid conflicts"** 与红线/反监控定位**冲突**："observe faster"=监控/效率腔（ADR-0015 要逃离的），"avoid conflicts"=压制冲突（Ray 警告的"把经理劝退出该谈的硬话"）。
- **推荐**：三个动词当**内部北极星**，对外 slug 翻译为：看得更早（"see what your team's carrying before it's a crisis"）/ 帮人做出最好工作 / **handle** the hard conversation（不是 avoid）。主定位仍是 "the senior at your ear"。出 3–5 个过红线的 slug 候选让 Danny 选，**不要把 "observe your team faster"/"avoid conflicts" 原样当对外标语**。

## 5 · 下个 session 启动指令
1. 读 `AGENTS.md` → 本文件 → `feature_list.json` → `.to-issues/P7-0*`。跑 `./init.sh` 确认绿。
2. **先把张力 A/B 抛给 Danny**（两个问题，各带推荐），他选完再让碰文案/改名的 agent 定稿；调研/规格类（07/08）不必等。
3. **开 AFK：** 用 orchestrator/Workflow 起并行 background agent，每桶一个，认领对应 feat 并按 `.to-issues/P7-0*` 的 scope 干：
   - 碰代码的桶（05、10）→ worktree 隔离；纯文档/调研桶（07、08、09）→ 不需 worktree。
   - 角色：调研/架构 → 可用默认 + web search；文案 → `will` + 红线复核用 `dana`；eval 规格 → 参考圆桌 eval-architect。
   - 每桶完成：`./init.sh` 绿（若碰代码）、新英文 copy 标 `⚠ 待 Danny 审字`、回写 `feature_list.json` evidence + `progress.md`。
4. 收尾：更新 `progress.md` / `feature_list.json`，新写一份 handoff（若又换 session）。

## 6 · 指针
- 策略全文 + 五人发言：`docs/strategy/2026-06-20-coldstart-eval-roundtable.md`
- 角色班子：`roles.md`（+ `.claude/agents/{phil,claire,will,dana,ceo}.md`）
- 定调/红线/surface label：`docs/adr/0015-product-tone-human-advisor-debrand-saas-naming.md` + `CONTEXT.md`
- memory：`gtm-coldstart-eval-strategy` / `roles-cast`（跨 session 已存）
