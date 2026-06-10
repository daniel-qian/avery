# P4-01 · rail spine：replay-to-target 引擎 + 完整 SCRIPT + 键盘驱动

类型：**AFK** · Blocked by：**None — 可立即开始**

## What to build

把整条 demo 做成**键盘可驱动**的 scripted rail，建在已有 free-click core 之上（ADR-0003 可拆 driver · ADR-0006 replay-to-target）。这是 P4 的核心 tracer bullet：引擎 + 完整 SCRIPT + 键盘三者一起才"能驱动整条 demo"，故为一片。

**`useRail` store（独立、可删，不碰 `canvasStore`）**
- state：`index`（当前原子 step）+ `hidden`（bool）。
- 创建时抓一次 pristine 快照 `INITIAL = useCanvas.getState()`（含稳定 action 引用）。
- `seek(target)` = `useCanvas.setState(INITIAL, true)` 倒带 → **同步** for-loop replay `SCRIPT[0..target].run()` → `set({ index: target })`。多个同步 `set` 被 React 批成一次 render，无闪烁。
- `next` = `seek(index+1)`（封顶）· `prev` = `seek(index-1)`（封底 0）· `restart` = `seek(0)` · `toggleHidden`。

**`SCRIPT`（16 step / 12 beat）** — `run` 调已存在 action，beat 作 label：

| beat | step | run |
|---|---|---|
| B0 | 1/12 | `goScene('onboarding')` —（Danny 手点 onboarding 自己的 Continue×4，末步落 dashboard） |
| B1 | 2/12 | `goScene('dashboard')` |
| B2 | 3/12〔free〕| `setFocus(focusEntity('project','p_acme'))` |
| B3 | 4/12 | `askQuestion(HERO_QUESTION)` |
| B4 | 5/12 ① | `runAgent()` |
| B4 | 5/12 ② | `goScene('capabilities')` |
| B4 | 5/12 ③ | `goScene('nexus')` |
| B5 | 6/12 | `runAgent()` |
| B6 | 7/12 ① | `runAgent()` |
| B6 | 7/12 ② | `openDetail('employee','u_bill')` |
| B6 | 7/12 ③ | `goScene('nexus')` |
| B7 | 8/12 | `runAgent()` |
| B8 | 9/12 | `runAgent()` |
| B9 | 10/12〔free〕| `runAgent()` —（Danny 现场点报告卡的 Dispatch） |
| B9b | 11/12 | `openDetail('project','p_acme')` |
| B10 | 12/12 | `regenBriefing()` 后 `goScene('dashboard')`（同一步两 action） |

- `runAgent()` **不传 kind**，靠调用次序对齐 store 的 `ORCHESTRATION`（pm→cross→hr→human→timeline→output）。
- 钻入返回一律 `goScene('nexus')`，**不用 `back()`**（back 回 dashboard 且清 focus/detail）。
- 本地态（onboarding 步、composer/search 文本、B9 dispatch）**不进 replay**。

**挂载 + 键盘**
- `DemoControls` 挂在 `AmbientCanvasShell` 内、scene-stage 外（overlay）。本片可只配**最小 caption**（呈现细节交 P4-02）。
- `useLayoutEffect` 开局 `seek(0)` 进 B0（避免先闪 dashboard）。
- 全局 keydown：`→`/`Space` → next · `←` → prev · `R` → restart · `H` → toggleHidden（`Space` 要 `preventDefault`）。

## Acceptance criteria

- [ ] 键盘可正向走通 B0 → B10（16 个 step），`Prev` 可逐步回退且状态正确。
- [ ] 任一 step 的世界状态 == 用 free-click 复现该 beat 的状态（litmus）。
- [ ] B4 ②（Capabilities）/ B6 ②（Bill 页）整页可见、③ 经 `goScene('nexus')` 返回，**thread 进度不丢**。
- [ ] B7 human-loop 被走到（ORCHESTRATION 删不掉）；B10 落 dashboard 显 Briefing **V2**。
- [ ] `seek` 倒带+replay 同步、无可见闪烁；in-scene 手点后下一次 rail 键按自愈。
- [ ] **不扩 `canvasStore`**、零 `if(demoMode)`；rail 全部代码可一次性删除而 free-click 行为不变。
- [ ] `npm run build` 过。

## Blocked by

None — 可立即开始（与 P4-03 独立，可并行）。
