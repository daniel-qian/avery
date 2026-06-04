// 手工布局坐标（% of canvas）。deterministic handcrafted layout（见 Prototype Reference doc）。
// P0 先摆得不重叠、能画出 owner→project 连线即可；P1 精修 orbit 美感。
// id 对应 fixtures.ts 的 PEOPLE / PROJECTS。

export interface Pos {
  x: number
  y: number
}

const SAFE_X = { min: 12, max: 88 }
const SAFE_Y = { min: 12, max: 88 }

function clampPos(pos: Pos): Pos {
  return {
    x: Math.max(SAFE_X.min, Math.min(SAFE_X.max, pos.x)),
    y: Math.max(SAFE_Y.min, Math.min(SAFE_Y.max, pos.y)),
  }
}

export const PERSON_POS: Record<string, Pos> = {
  u_you: clampPos({ x: 50, y: 14 }),
  u_wang: clampPos({ x: 34, y: 18 }),
  u_vanessa: clampPos({ x: 66, y: 18 }),
  u_bill: clampPos({ x: 84, y: 33 }),
  u_jason: clampPos({ x: 88, y: 62 }),
  u_kristen: clampPos({ x: 85, y: 84 }),
  u_nasim: clampPos({ x: 65, y: 85 }),
  u_andy: clampPos({ x: 50, y: 86 }),
  u_kate: clampPos({ x: 35, y: 84 }),
  u_will: clampPos({ x: 19, y: 74 }),
  u_cecily: clampPos({ x: 13, y: 54 }),
  u_kenan: clampPos({ x: 12, y: 35 }),
  u_fred: clampPos({ x: 25, y: 62 }),
  u_aidy: clampPos({ x: 24, y: 26 }),
}

export const PROJECT_POS: Record<string, Pos> = {
  p_acme: clampPos({ x: 68, y: 33 }),
  p_connector: clampPos({ x: 78, y: 48 }),
  p_pitch: clampPos({ x: 50, y: 27 }),
  p_capabilities: clampPos({ x: 23, y: 45 }),
  p_designsys: clampPos({ x: 57, y: 72 }),
  p_csonboard: clampPos({ x: 34, y: 70 }),
  p_billing: clampPos({ x: 74, y: 74 }),
}
