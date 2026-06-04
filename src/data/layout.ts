// 手工布局坐标（% of canvas）。deterministic handcrafted layout（见 Prototype Reference doc）。
// P0 先摆得不重叠、能画出 owner→project 连线即可；P1 精修 orbit 美感。
// id 对应 fixtures.ts 的 PEOPLE / PROJECTS。

export interface Pos {
  x: number
  y: number
}

export const PERSON_POS: Record<string, Pos> = {
  u_you: { x: 50, y: 13 },
  u_wang: { x: 33, y: 19 },
  u_vanessa: { x: 67, y: 19 },
  u_bill: { x: 79, y: 35 },
  u_jason: { x: 85, y: 55 },
  u_kristen: { x: 80, y: 73 },
  u_nasim: { x: 66, y: 85 },
  u_andy: { x: 50, y: 89 },
  u_kate: { x: 34, y: 85 },
  u_will: { x: 20, y: 73 },
  u_cecily: { x: 15, y: 55 },
  u_kenan: { x: 21, y: 35 },
  u_fred: { x: 30, y: 62 },
  u_aidy: { x: 42, y: 30 },
}

export const PROJECT_POS: Record<string, Pos> = {
  p_acme: { x: 60, y: 30 },
  p_connector: { x: 70, y: 46 },
  p_pitch: { x: 46, y: 24 },
  p_capabilities: { x: 33, y: 33 },
  p_designsys: { x: 50, y: 73 },
  p_csonboard: { x: 35, y: 71 },
  p_billing: { x: 74, y: 62 },
}
