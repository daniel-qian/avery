import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(resolve(root, path), 'utf8')

const fixtures = read('src/data/fixtures.p3.ts')
const projectScene = read('src/components/scenes/ProjectDetailScene.tsx')
const employeeScene = read('src/components/scenes/EmployeeDetailScene.tsx')
const dashboardScene = read('src/components/scenes/DashboardScene.tsx')

const expectations = [
  ['fixtures.p3.ts', fixtures, 'Observed state: Friday is still the target'],
  ['fixtures.p3.ts', fixtures, 'Diagnosed state: Acme remains at risk'],
  ['fixtures.p3.ts', fixtures, 'Raw assignment pressure; no reroute yet.'],
  ['fixtures.p3.ts', fixtures, 'Bill focus protected; scope confirmation routes through Vanessa.'],
  ['fixtures.p3.ts', fixtures, 'Overload symptoms'],
  ['fixtures.p3.ts', fixtures, 'Protected focus'],
  ['fixtures.p3.ts', fixtures, 'reported on track \u00b7 signals at risk'],
  ['fixtures.p3.ts', fixtures, 'at risk \u00b7 diagnosed \u00b7 Friday held'],
  ['ProjectDetailScene.tsx', projectScene, 'projectBriefFor(project, phase)'],
  ['ProjectDetailScene.tsx', projectScene, 'projectTeam(project.id, phase)'],
  ['ProjectDetailScene.tsx', projectScene, 'tasksForProject(project.id, phase)'],
  ['EmployeeDetailScene.tsx', employeeScene, 'employeeOverviewFor(person, phase)'],
  ['EmployeeDetailScene.tsx', employeeScene, 'tasksForPerson(person.id, phase)'],
  ['DashboardScene.tsx', dashboardScene, "briefing.version === 2 ? 'grown' : 'believed'"],
  ['DashboardScene.tsx', dashboardScene, 'dashboardPersonCopy(person, dashboardPhase)'],
  ['DashboardScene.tsx', dashboardScene, 'dashboardProjectCopy(project, dashboardPhase)'],
]

const missing = expectations.filter(([, content, needle]) => !content.includes(needle))

if (missing.length > 0) {
  console.error('P5 content swap check failed:')
  for (const [file, , needle] of missing) {
    console.error(`- ${file}: missing "${needle}"`)
  }
  process.exit(1)
}

console.log(`P5 content swap check passed (${expectations.length} expectations).`)
