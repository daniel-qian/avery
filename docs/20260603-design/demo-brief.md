# TeamMaster 2.0 — Venus Pitch Demo Brief

状态：草案 v1（来自 2026-06-03 grill 会话）。
本文件 = demo 的 narrative + 脚本规格，装 `CONTEXT.md`（术语）与 ADR（架构决策）不该装的东西。
关联：[ADR-0001](../adr/0001-prototype-demo-only-engineering-docs-are-reference.md) demo-only · [ADR-0002](../adr/0002-frontend-stack-vite-react-framer-motion.md) stack · [ADR-0003](../adr/0003-demo-rail-is-detachable-driver-over-free-click-core.md) rail driver · [CONTEXT.md](../../CONTEXT.md) 术语。

---

## 0. 一句话 pitch

成功指标（Venus 视角）：看完后她能答——"我清楚 problem / 目标客户 / workflow / 为什么有价值。"

> TeamMaster 把公司每天的真实信号 + 专家 **Capabilities**，合成可校对、可执行、经人确认的管理判断。它能**当面戳穿 status theater**——这是只有泛化常识的普通 ChatGPT 做不到的。

---

## 1. 演示形态

- hybrid scripted **rail**，**Danny 驱动**，Venus 看 + 问（首演不是可用性测试，别让 Venus 自己摸 UI）。
- rail = free-click core 之上的可拆 driver（ADR-0003）。Litmus：自由点击能复现每个 beat。
- stack = Vite + React + framer-motion（ADR-0002）。

**Scope note**：rail 主干刻意做满 6 个 scene（含 onboarding），由 Danny 拍板——比最小 Dashboard+Nexus 版更重、build/polish/翻车面更大；以**详情页内部模块全 placeholder** + **唯一 nice-to-have = B7** 来控成本与风险。

---

## 2. 虚构公司 TeamMaster Inc.

- 规模 ~15 人，seed 轮后 = **Venus 可能投的那家公司，用自己产品管自己**（meta wink）。
- POV = **你（Founder / CEO）**。
- orbit 里放一个自指项目 "Venus Pitch / Prototype 2.0" 作 wink，但**不** carry mismatch（避免当投资人面演自己拖进度）。

### Cast（story-critical 固定；其余 orbit 纹理，名字可改）

| 人 | 角色 | 戏份 |
|---|---|---|
| 你 | Founder / CEO | POV，提 hero 问题 |
| Wang | Co-founder / Head of Domain | owns Capabilities Build（正面，无 mismatch） |
| **Vanessa** | PM | owns Acme Pilot |
| **Bill** | Backend Eng | owns Connector；**carry reality gap / mismatch** |
| **Jason** | Backend Eng | 接 Bill interrupt 的救兵（70% 有余量） |
| Kristen · Nasim · Andy · Kate · Will · Cecily · Kenan · Fred · Aidy (~9) | FE / ML / design / CS / sales / ops / data / QA | orbit 纹理（SNL 名，可改） |

（虚构同事用 SNL 2012 黄金期 cast 名；You / Wang 保真名 = meta 点。）

### 项目集（~7，给 orbit 足够料）

| 项目 | owner | 作用 |
|---|---|---|
| **Acme Pilot**（首个 design-partner，**周五**交付） | Vanessa | hero + reality gap 表层 |
| Connector: Slack/GitHub | Bill | mismatch 落点 |
| Venus Pitch / Prototype 2.0 | 你 | 自指 wink |
| Capabilities Build | Wang | 秀护城河 |
| Design System / CS Onboarding (+1) | 杂 | 纹理 |

### 实体层级

`Project → 含多个 Task → 分配给 Employee`。Task 无独立详情 scene，只作 project / 员工 详情页内的模块。

---

## 3. Hero 问题 + 双 vertical 互锁

**hero 问题**（Dashboard composer）：

> **"Are we on track to ship the Acme pilot this Friday?"**

**互锁逻辑**（一条因果链，非两条平行线）：

```
表层 Delivery：能否周五交付 Acme？
  → Bill 报 Connector on-track
  → 信号说 at-risk（reality gap / report mismatch）
  → 为什么？HR 线交叉校对：
      Bill 被反复 @ 去救 Acme 的火 = 被打断，非低产
  → 建议不是"Bill 绩效差"（安全护栏：no personnel judgment）
     而是甩 interrupt 给 Jason + 砍 scope 保周五（Tue slip 当兜底）
```

PM agent + HR agent 双主角同台；Project Ops + HR 两个 Capabilities 都亮。Venus 全程只跟**一条**链，不烧脑。

---

## 4. Beat Sheet

标注：〔自由交互〕Danny 现场点 · 〔drill-in〕rail 走进子页面 · 〔nice-to-have〕吃紧可砍 · 〔capability〕点名能力 beat。

**Scene 0 · Onboarding（prologue，must-have）**
- **B0** TeamMaster Inc. 建立：上传 / 解析公司文件 → agent 分析 → **capabilities 调用** → "建脑"完成 → 时间跳到稳态。〔答 provenance + 首秀 capabilities〕

**Scene 1 · Dashboard（calm）**
- **B1** ambient dashboard：Briefing#1 组织天气（Acme 周五 / 82% health / 隐约 hot-spot）；~15 人 orbit + ~7 项目 + 淡连线；framing "synced from Slack + GitHub + docs"。
- **B2** 〔自由交互①〕点 Acme → focus 动画（相关亮 / 无关淡），建立 `Project→Task→Employee` 结构感。**此处不 drill**——详情页 drill 一律移到 Nexus reveal（B6）之后。理由：详情页**静态恒显全部模块**（含 agent 智能层），若 agent 没跑就 drill 进项目页会提前剧透 killer beat。见 [ADR-0005](../adr/0005-detail-pages-static-reveal-protected-by-beat-order.md)。
- **B3** composer 发 hero 问题 → 问题**飞进** Nexus（转场）。

**Scene 2 · Nexus（spatial orchestration flow，复用 Dashboard 连线语汇）**
- **B4** 〔capability〕PM agent 启动 → 取证据 + Company RAG + **Capabilities** → 〔drill-in〕**Capabilities 页**：私有 / 订阅 / 自动优先 = 护城河（投资人向）→ 回。
- **B5** 交叉校对 → **戳穿 reality gap**：Bill 报 on-track vs 信号（PR 卡 / 重复 blocker / 任务零更新）at-risk。report-mismatch 卡弹出。〔killer beat〕
- **B6** HR agent 解释根因（bandwidth 打断非低产；安全护栏 "evidence-based, no personnel judgment" 可见）→ 〔drill-in〕**员工详情页**：Bill workload / current tasks / at-risk 信号（模块 placeholder）。
- **B7** 〔capability〕〔nice-to-have〕拉 Bill（真人）+ agent 进线程；agent **背景聆听**、记录、补建议。
- **B8** 〔capability〕agent 调 tool → 造 **timeline 图**：主方案**保周五**（interrupt 甩 Jason + 砍 dedupe），Tue slip 标 **conditional 兜底**（绑定 rate-limit 变数）。
- **B9** 〔capability〕〔自由交互②〕**结构化可信输出**（结论 / 依据 / 不确定点 / 建议动作 / 谁确认 / 下一步）→ **交互式派 task**（owner + deadline + follow-up，一两下点完）。
- **B9b** 〔drill-in〕drill 回 **Acme 项目页**收尾：agent 的 `handoffs` checklist 已**落在项目页上、可直接执行**（挨着重排后的 delivery milestones）。项目页 = agent 行动落地处（取代被砍的 B2 drill；天然在 reveal 后，不剧透）。
- **B10** 〔capability〕回 Dashboard → **重生成 Briefing**：天气更新（Acme→at-risk + 原因 + 新 task 在途；orbit 反映重排）。

**收尾**：可信产出报告那张闭环图（输入→事实→agent→人 review→task→新信号→事实）被完整走了一遍，且发生在 Venus 在意的公司上。

---

## 5. Scene Inventory

**建（全部进 rail）**：Onboarding · Dashboard · Nexus · Project 详情页 · 员工详情页 · Capabilities 页。

**不建**：独立 TASK 详情 scene（task 是 project / 员工 页内模块）；详情页内部模块（current tasks / workload / milestone timeline）暂用 **placeholder**。任何工程类 backend（ADR-0001）。

---

## 6. Fixture 清单（narrative → build 的桥）

scripted 内容一律当 **data/fixture** 存，喂同一批 dumb 组件（ADR-0003）；`runAgent` 现返回 fixture，以后换真逻辑。

- [ ] onboarding 样本：几个假公司文件名 + 解析结果 + capabilities 命中
- [ ] cast ~15 people + 项目集 ~7 + `project–task–employee` 分配关系
- [ ] 信号集：Leo at-risk 证据（stalled PR / 重复 blocker / 任务零更新 / 被 @ 救火记录）
- [ ] Capabilities 条目样本：Project Ops playbook + HR playbook 片段
- [ ] report-mismatch 卡内容
- [ ] timeline 数据（slip + 重排）
- [ ] agent 结构化输出（6 段式）
- [ ] Briefing v1（calm）/ v2（更新后）
- [ ] 派 task 目标模板

---

## 7. 已锁决策指针

- 范围：ADR-0001（demo-only）
- stack：ADR-0002（Vite + React + framer-motion）
- 架构：ADR-0003（rail = 可拆 driver）
- 详情页：ADR-0005（静态恒显，reveal 靠 beat 顺序保护）
- 术语：CONTEXT.md（Dashboard / Nexus / Briefing / Reality gap / Capabilities）
