# Calm 人卡采用游戏化 HP/MP HUD（HP=headroom, MP=mood）；地图层守 calm；仅限 calm 卡片

## 背景

Calm 人卡全同构 + `personTone()` 仅按 `capacityPct >= 120` 上橙（Bill 134% → 橙，余皆绿），单调（#2）。Danny 要像素 avatar + HP(workload) / MP(mood) 游戏化方向。与 CONTEXT 的 Dashboard / Calm "ambient / 平静 / 组织天气" 定义、及投资人（Venus）gravitas 有张力。

## 决策

calm 人卡渲染像素 avatar + HP + MP：

- **HP = headroom（= 100 − workload），越满越好；临界 = 告警**。修正"HP = raw workload"的反直觉——否则 Bill 134% load → HP 条爆满 → 读成"状态超好"，与"快累垮"相反。正确：Bill headroom 见底 → HP 危、泛红。HP 临界态**取代** `personTone` 的橙色规则。
- **MP = mood / 士气**（新增 `mood` fixture，~15 人；现仅故事人有 sentiment）。
- **scope = 仅 calm 卡片**；详情页 / Nexus 保持现有严肃语汇（grill 选项 a）。
- **护栏：游戏化只在卡片层，地图层守 calm**——低密度、HP/MP 平时安静（健康的人条满 / 中性、不抢眼），只有掉血 / 低 MP 的人跳出来。定位为"**2 秒读懂全员状态的指挥 HUD**"，把 toy 风险 reframe 成差异化卖点，**强化而非拆解** ambient 指挥中心。

## 被否的替代

- **Ambient 严肃 micro-bar**（workload + mood，无像素 / 无 HP/MP 字样，最稳 / 投资人向）：Danny 否，要游戏化记忆点。
- **全产品贯穿游戏化**（详情页 / Nexus 也 HP/MP）：否决——scope 爆炸，且 Nexus / 详情页的严肃感是 pitch 重头，不该动。

## 后果

- 新增 `mood` fixture（~15）+ ~15 像素 sprite 资产 + HP/MP 卡片渲染 + CSS（写入 `global.css` 的 `/* P1 · Dashboard */` 区）。
- **不碰 store**。`personTone()` 被 HP-派生 tone 取代。
- 这是有意识、难逆、且违背投资人 gravitas 直觉的 product-tone 赌注，故记 ADR——护栏（地图守 calm + HUD reframe）是它站得住的前提。
