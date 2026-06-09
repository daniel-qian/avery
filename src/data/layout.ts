// P5 ⑤ (ADR-0012 修订 2)：Dashboard 软标签团队聚簇（soft labeled team zones）。
// 取代修订 1 的同心放射环。每个 team 一块有机блоб（轻量标签、无硬边界/楔形——"team 靠感知、
// 不靠画框"，守 ADR-0010 calm）；天气（节点 tone/热点）仍是视觉主角，结构只承载布局。
// You 降为 Founders 簇内普通一员（观察者身份由 Topbar/HUD 承载）；7 项目各自贴在 owner 旁
// → owner→project = 短辐条。坐标全是 board px，簇内用 phyllotaxis 公式确定性铺开、不手摆。

import { PEOPLE, PROJECTS } from './fixtures'
import { polar, type Pos } from './board'

export type { Pos }

export interface TeamZone {
  team: string
  label: string
  center: Pos
  labelPos: Pos // 标签锚点：簇上方（随簇尺寸上移），避免被中心节点压（修订 3）
}

// 6 块 team 区铺满宽 board（2600×1640）。中心是粗骨架（HUD 遮挡由镜头 HUD-safe inset 兜，
// 故此处只需均衡填板、不必躲 HUD）。Eng 最大（6 人 + 2 项目）给左中较大空间。
const ZONE_CENTER: Record<string, Pos> = {
  Eng: { x: 660, y: 600 },
  Founders: { x: 1340, y: 470 },
  GTM: { x: 2010, y: 580 },
  Product: { x: 780, y: 1170 },
  Design: { x: 1400, y: 1190 },
  Ops: { x: 2060, y: 1160 },
}

const ZONE_LABEL: Record<string, string> = {
  Eng: 'Engineering',
  Founders: 'Founders',
  GTM: 'Go-to-market',
  Product: 'Product',
  Design: 'Design',
  Ops: 'Operations',
}

// 簇内 phyllotaxis（向日葵）铺点：确定性、有机、不规则——读成一簇而非阵列。
const GOLDEN_ANGLE = 137.50776
const CLUSTER_STEP = 172

// 各 team 人数 → 簇最大半径 → team 标签上移量（标签浮在簇顶节点之上，不被压，修订 3）。
const teamCount: Record<string, number> = {}
for (const p of PEOPLE) teamCount[p.team] = (teamCount[p.team] ?? 0) + 1

function clusterMaxRadius(team: string): number {
  return CLUSTER_STEP * Math.sqrt(Math.max(0, (teamCount[team] ?? 1) - 1))
}

export const TEAM_ZONES: TeamZone[] = Object.keys(ZONE_CENTER).map((team) => {
  const center = ZONE_CENTER[team]
  return {
    team,
    label: ZONE_LABEL[team] ?? team,
    center,
    labelPos: { x: center.x, y: center.y - clusterMaxRadius(team) - 96 },
  }
})

function packed(center: Pos, indexInTeam: number): Pos {
  if (indexInTeam === 0) return { ...center }
  const r = CLUSTER_STEP * Math.sqrt(indexInTeam)
  return polar(center, r, indexInTeam * GOLDEN_ANGLE)
}

// 人按 team 聚簇，组内 index 用 fixtures 顺序。
const teamSeen: Record<string, number> = {}
export const PERSON_POS: Record<string, Pos> = {}
for (const person of PEOPLE) {
  const i = teamSeen[person.team] ?? 0
  teamSeen[person.team] = i + 1
  const center = ZONE_CENTER[person.team] ?? { x: 1300, y: 820 }
  PERSON_POS[person.id] = packed(center, i)
}

// 项目贴 owner 右下方 → 短 owner→project 辐条，project 视觉归属其人。
const PROJECT_OFFSET: Pos = { x: 226, y: 36 }
export const PROJECT_POS: Record<string, Pos> = {}
for (const project of PROJECTS) {
  const base = PERSON_POS[project.ownerId] ?? { x: 1300, y: 820 }
  PROJECT_POS[project.id] = { x: base.x + PROJECT_OFFSET.x, y: base.y + PROJECT_OFFSET.y }
}
