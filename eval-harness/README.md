# Avery eval-harness

> **HEADLESS. EVAL DATA ONLY. NOT a product feature.**
> This directory is a self-contained Python harness that exists solely to generate
> evaluation data: run a frozen set of management scenarios through *Avery* and
> against baseline agents, then score the transcripts with cross-family LLM judges.
> It never ships into the product and **must never import or touch the product `src/`.**

Design source of truth: `../docs/strategy/coldstart-deliverables/consultant-agent-architecture.md`
(+ `-open-questions.md` RESOLVED, ADR-0015, ADR-0016).

## What it is

A `while` loop that does **think → tool-call → observe** until it produces advice —
the same commodity skeleton as Codex / Claude Code / Hermes. What makes Avery's loop
*not* a coding agent, and what this harness measures, is three things no reference
agent has:

1. a **relational operating model** in the system prompt (advise the leader on a human
   situation; never rate the human);
2. **`cite()` mandatory before advice** — the loop physically cannot finish with zero
   evidence pointers;
3. a **hard, code-enforced red-line validator** (`avery/redline.py`) that auto-fails any
   output that scores / diagnoses / ranks / labels a **person** — but, per ADR-0016, does
   **NOT** block advising a hard, decisive call (a direct conversation, reassignment, exit).

The bet is that a raw model, asked for management advice, will spontaneously score/label the
*person* (a "flight-risk: high", a "2/5") while Avery won't. When that happens on a scenario the
team did **not** author, the logged auto-fail is the eval's strongest honest result. Until then
it's a hypothesis — **mock runs script the baselines and are explicitly NOT publishable** (the
scorecard refuses to look like a result; see the publish gate in `judge.py`). The real diff —
an unedited off-the-shelf transcript next to Avery's on an identical non-author case — is the
artifact, not the mock numbers.

## The three tickets

| Ticket | File(s) | What |
|---|---|---|
| **011a** (#3) | `avery/`, `run_one.py` | the skeleton: loop + 4 file tools + red-line validator, end-to-end on one scenario |
| **011b** (#4) | `runner.py`, `scenarios/manifest.json` | batch runner over a frozen+git-hashed manifest, Avery vs baselines, dump JSON |
| **011c** (#5) | `judge.py` | cross-family LLM judges (never Claude-as-judge) + Cohen's κ → one-page scorecard |

## 文件结构 (annotated file map)

`★ = 核心 / 护城河所在`。其余多为业界通用、抄来即用的管道。

```text
eval-harness/                         # headless 评测仓，自成一体，绝不碰产品 src
├── README.md                         # 本文件：是什么 + 怎么跑 + mock 数不可发布声明
├── requirements.txt                  # 依赖（核心只用 stdlib；anthropic 仅真跑用，κ 用 scipy）
├── conftest.py                       # 让 pytest 找得到 import 路径
├── .gitignore                        # runs/ 输出不入库；FROZEN.lock.json 入库
│
├── avery/                            # ★ agent 本体（loop + 工具 + 大脑 + 护城河）
│   ├── loop.py                       # ★ ~150 行 think→tool-call→observe 主循环 + 两道硬门
│   ├── tools.py                      # ★ 4 个文件工具 read_case/recall/cite/draft_advice
│   │                                 #   （cite 不可跳过就锁死在这：零 cite → draft_advice 拒）
│   ├── redline.py                    # ★★ 红线校验器 = 护城河；给人打分→FAIL，建议exit→PASS
│   ├── brain.py                      # 可插拔大脑：RealBrain=claude-opus-4-8 / MockBrain=离线确定性
│   ├── memory.py                     # facts.md/notes.md 关键词 recall（暂不上向量库）
│   ├── skills.py                     # 分层 system prompt 拼装（稳定 skill→事实→当前 case）
│   ├── cases.py                      # 解析 case 文件 + 内嵌 <!--MOCK--> 脚本块
│   └── freeze.py                     # 场景集 sha256+git 冻结 / 漂移检测
│
├── skills/                           # ★ agent 的「人格 + 纪律」(markdown，⚠待 Danny 审字)
│   ├── 00-relational-model.md        #   你是顾问，建议人、绝不评判人
│   ├── 01-red-line.md                #   永不给人打分/贴标签
│   └── 02-kind-read-can-be-wrong.md  #   ADR-0016：善意解读可能是错的，该硬要硬
│
├── memory/                           # 公司记忆（recall 来源）—— 虚构数据，非真公司
│   ├── facts.md                      #   稳定事实（组织 + Lin Qing/Marcus/Priya 背景）
│   └── notes.md                      #   软性观察
│
├── cases/                            # 冻结场景（每个含 MOCK 脚本，离线可复现）—— 我手写虚构
│   ├── lin-qing-checkin.md           #   模糊型：有问题但要先了解
│   ├── marcus-genuine-underperformance.md  # ★ ADR-0016：真 underperform，要果断含 exit
│   └── priya-newhire-ramp.md         #   null 例：别瞎造问题（另一个方向的果断）
│
├── scenarios/
│   ├── manifest.json                 # ★ 冻结清单：agent 配置 + 场景列表 + seed
│   └── FROZEN.lock.json              #   冻结哈希锁（改 case 会被 --check-frozen 抓到）
│
├── redline_rules.md                  # ★ 红线规则「公开发布版」（含已知漏判率，诚实标注）
│
├── run_one.py                        # 【#3 入口】单场景端到端跑一遍
├── runner.py                         # 【#4 入口】跑批：Avery vs 两 baseline + 防位置偏差 + 导 JSON
├── judge.py                          # 【#5 入口】跨家裁判(绝不Claude)+Cohen κ+scorecard(不吹ROI)
│
└── tests/                            # 对抗自验（maker≠checker 的机器硬契约）
    ├── test_redline.py               # ★ 护城河：打分必 fail、含 exit 必 pass（被拷打 3 轮的回归锁）
    ├── test_loop.py                  # cite 不可跳过 + 单场景端到端
    ├── test_runner.py                # 冻结哈希 + 两 baseline + swap 防偏差
    └── test_judge.py                 # 绝不 Claude 当裁判 + 不吹 ROI + κ 诚实
```

数据怎么流：`cases/ + memory/ + skills/` → `avery/loop.py`(脑=`brain.py`，每步过 `redline.py` 硬门) → transcript JSON →（#4）`runner.py` 跑全清单 →（#5）`judge.py` 打分 → `scorecard.md`。

> **现状提醒**：上面跑出来的一切都是 **MockBrain（确定性、不联网、零真模型）**。本环境无 API key，真跑(`--real`)在这里跑不了；mock 证明的是「机器造对了」，不是「真模型真会给人打分」——后者要真场景 + 真 key。

## Offline / mock mode

The agent's "brain" is pluggable (`avery/brain.py`):

- **`RealBrain`** — calls `claude-opus-4-8` via `anthropic-sdk-python`. Needs
  `ANTHROPIC_API_KEY`. This is the model under test as "Avery".
- **`MockBrain`** — deterministic, no network. Follows a per-case scripted plan
  (the `<!-- MOCK ... -->` block in each case file). Lets the **whole pipeline run green
  AFK with no key**, which is exactly what 011a/b/c acceptance asks for ("runs green on
  mock"). Mock mode tests *plumbing and gates*; real mode tests *judgment*.

## Run it

```bash
cd eval-harness
pip install -r requirements.txt          # anthropic only needed for RealBrain
python -m pytest tests/ -q               # unit tests (red-line, cite-gate, loop)
python run_one.py cases/lin-qing-checkin.md          # 011a end-to-end (mock by default)
python run_one.py cases/lin-qing-checkin.md --real   # uses claude-opus-4-8 (needs key)
```

See each module's docstring for detail. Nothing here writes outside this directory.
