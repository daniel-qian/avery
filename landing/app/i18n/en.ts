// English dictionary — the SOURCE OF TRUTH for all visible landing copy.
// `Dict` is inferred from this object (see ./index), so zh.ts must mirror its
// shape exactly. Values use backticks so ' and " need no escaping.
//
// ⚠ Every string here is still 待 Danny 审字 (draft). The Chinese (zh.ts) is
// transcreated from THIS draft by MiniMax-M3 and is regenerable: when Danny
// edits the English, re-run scripts/i18n-zh.mjs.
//
// NOT translated here (separate concern, eval is intentionally left as-is):
// the advice-transcript rows in app/data/evalRows.ts.

export const en = {
  langSwitch: { en: `EN`, zh: `中文` },

  hero: {
    topLeft: `For 20–500 person companies`,
    topRight: `Avery · MMXXVI`,
    kicker: `Managers need safer HR decisions.`,
    // {em} marks the emphasised fragment; the renderer wraps it in <em>.
    title: `The {em} for the conversation you keep putting off.`,
    em: `senior at your ear`,
    sub: `Notice sooner. Handle it better.`,
    ctaPrimary: `Book a 15-min look`,
    ctaGhost: `See the actual advice`,
    reassure: `A senior voice in your ear — not a dashboard that watches your team. Nothing gets scored or stored against anyone.`,
  },

  whatItIs: {
    eyebrow: `What Avery is — and isn't`,
    h2: `A senior voice on your side. Never a verdict on your people.`,
    isHead: `What Avery is`,
    is: [
      `A senior advisor in your ear before a hard conversation.`,
      `It reads the situation and hands you a concrete move you could make tomorrow.`,
      `Decisive in both directions: it helps you handle the hard call when it's warranted — not just avoid it.`,
      `It always shows you what it's seeing, in plain words.`,
    ],
    isntHead: `What Avery isn't`,
    isnt: [
      `A dashboard that watches or grades your team.`,
      `A flight-risk score, an engagement grade, a label on a person.`,
      `An HR paper-trail or a way to dodge the conversation.`,
      `One more tool that turns people into numbers.`,
    ],
    privacyStrong: `Your situations stay yours.`,
    privacyRest: `The details stay on your own machines, not ours — and before anything reaches the AI, names and identifiers are stripped out first. Nothing about your people is ever scored, filed, or kept against anyone.`,
  },

  audience: {
    mastheadL: `Target segment`,
    mastheadR: `20–500 people`,
    eyebrow: `Who will love using Avery`,
    h2: `Built for 20–500 growing companies.`,
    lede: `Large enterprises already have internal platforms. Tiny teams can still run on founder intuition. Avery is for the middle: enough complexity to create risk, not enough infrastructure to see it clearly.`,
    marks: [`Project pressure`, `People signals`, `No clear view`],
  },

  whyItMatters: {
    mastheadL: `Why managers care`,
    mastheadR: `Performance · cost · risk`,
    stmtA: `Avery lifts the manager`,
    stmtWord: `from`,
    stmtB: `the chaos of micromanagement.`,
    cards: [
      { n: `01`, h4: `Delivery risk is their scorecard`, p: `Managers are judged by shipped work, not by how many status updates they collect. Avery surfaces blockers before the missed deadline becomes visible.` },
      { n: `02`, h4: `Accountability has to be defensible`, p: `When a hard call is challenged, you need evidence: the signal it came from, how sure it is, and why the move fits the project.` },
      { n: `03`, h4: `People decisions carry hidden cost`, p: `A weak signal can look like a weak employee. Avery separates performance, resource gaps, dependency blocks, and overload — so you read the situation, never put a label on the person.` },
    ],
  },

  wrongCut: {
    mastheadL: `Case logic · people risk in project context`,
    mastheadR: `Four costs`,
    eyebrow: `Before firing, check the node`,
    h2: `The cost of the wrong cut.`,
    lede: `Public case analogy: after the 2022 layoffs at a major platform, some critical people were reportedly asked back. The lesson isn't gossip — it's operational debt. Cutting the wrong node creates repair cost and manager-credibility risk.`,
    steps: [
      { n: `01`, h4: `Cut`, p: `Short-term cost looks lower — but the reason for the problem may still sit inside the project system.`, metaA: `Cost`, metaB: `Visible` },
      { n: `02`, h4: `Knowledge gap`, p: `Context disappears. The team loses hidden dependency knowledge that was never written down cleanly.`, metaA: `Context`, metaB: `Lost` },
      { n: `03`, h4: `Repair`, p: `Now you pay time cost, replacement cost, and deadline cost to rebuild what was removed.`, metaA: `Time`, metaB: `Slips` },
      { n: `04`, h4: `Review risk`, p: `Leadership asks whether you understood the team before you made the people decision.`, metaA: `Judgement`, metaB: `Tested` },
    ],
  },

  morningBriefing: {
    mastheadL: `A glimpse · a morning in Avery's words`,
    mastheadR: `Illustrative`,
    eyebrow: `Ready before you open the laptop`,
    h2: `One morning, read for you.`,
    lede: `Avery doesn't wait for the right question. It reads the night's signals and hands you what's worth your attention — what's at risk, why it matters, and the move that fits.`,
    cardGreeting: `Good morning, Sarah`,
    cardCount: `4 items worth a look`,
    cardTime: `Mon 08:02`,
    items: [
      { tag: `Risk`, h4: `Project Atlas is 3 days behind.`, p: `Revenue exposure ~$240K. Worth looping in the PM lead today.` },
      { tag: `Waiting on you`, h4: `2 decisions need a sign-off.`, p: `A budget review and a contract approval are blocking other teams.` },
      { tag: `Good news`, h4: `Pipeline is up 18% week over week.`, p: `The chart's ready, with the proposal most likely to close fastest flagged.` },
      { tag: `Team signal`, h4: `Engineering velocity dipped this week.`, p: `The pattern looks like overload — not any one person falling behind.` },
    ],
    promiseEyebrow: `The promise`,
    promiseTitleA: `Less searching.`,
    promiseTitleB: `More judgement.`,
    promiseP: `Avery turns your real company data into a short, prioritised read: what's at risk, why it matters, and what to do next.`,
    stats: [
      { num: `47m`, label: `saved from daily status prep` },
      { num: `94%`, label: `risks caught before escalation` },
      { num: `3×`, label: `faster to a decision` },
    ],
  },

  demoVideo: {
    eyebrow: `A 60-second look`,
    h2: `One real situation, start to finish.`,
    p: `Watch Avery catch what a busy manager would miss — and hand back a move you can make tomorrow.`,
    badge: `Demo video — coming soon`,
    cap: `The 60-second product video drops in here once it's cut.`,
  },

  evalSection: {
    eyebrow: `Avery vs. a general AI — the actual words`,
    h2: `Same situation, same evidence. Read them side by side.`,
    p: `Not a scoreboard. Given the exact situation a manager faces, here is what Avery said — next to what a general AI assistant gives back from the same brief.`,
    noteStrong: `A preview, and we'll be straight about it.`,
    noteRest: ` The comparison answers below are illustrative of what a general assistant tends to do. The real version is pre-registered, not cherry-picked: every advisor gets the byte-identical prompt and evidence, the baseline prompts are published so no one's hobbled, and the 25–30 scenarios are frozen and git-hashed before a single run. Blind-graded transcripts and the honest human-preference numbers land here once the eval runs — not before.`,
    footer: `We evaluate the advice, never the person. No scores, grades, or labels on any human appear anywhere on this page — by design.`,
    rowsNote: `Note: the advice transcripts below stay in English for now — they are placeholder fixtures tied to the (intentionally empty) eval, and get replaced by real eval-harness output later.`,
  },

  trustLayer: {
    mastheadL: `Keeping the advice honest`,
    mastheadR: `A workflow, not a promise`,
    stmtA: `We make the AI`,
    stmtWord: `prove`,
    stmtB: `what it tells you.`,
    cards: [
      { n: `01`, h4: `Grounded in evidence`, p: `Every read is built from your own files, tasks, and weekly notes — not generic model memory.` },
      { n: `02`, h4: `Source and confidence`, p: `You see where a claim came from, and whether Avery is sure, leaning, or unsure, before you act on it.` },
      { n: `03`, h4: `A human holds the pen`, p: `Avery advises. You accept, reject, check the evidence, or ask for more. Nothing happens to a person on autopilot.` },
    ],
  },

  marketGap: {
    eyebrow: `How we're different`,
    h2: `Not another AI tool. A voice for the moment after the answer.`,
    lede: `Most AI products help you summarise or search. Avery is built for what comes next: when you have to make a people-and-project call you can stand behind.`,
    gapLabel: `Market gap · where today's AI stops`,
    panels: [
      { name: `AI copilots`, line: `Fast answers, thin accountability.`, m1label: `summary speed`, m2label: `internal validation` },
      { name: `PM / HR suites`, line: `Good systems, separate silos.`, m1label: `structured records`, m2label: `cross-context judgement` },
      { name: `Consulting`, line: `Expert judgement, slow cycle.`, m1label: `human interpretation`, m2label: `daily manager workflow` },
    ],
    averyPanel: { name: `Avery`, line: `Decision-ready, with a human in the loop.`, m1label: `evidence-weighted context`, m2label: `manager review loop` },
    strip: [
      { label: `Gap 01`, text: `Summary ≠ decision` },
      { label: `Gap 02`, text: `Data ≠ evidence` },
      { label: `Gap 03`, text: `Advice ≠ workflow` },
    ],
    themLabel: `Them`,
    oursLabel: `Avery`,
    rows: [
      { name: `A general AI assistant`, detail: `the chat tools everyone has`, them: `Answers when you ask — you still need to know the right question.`, ours: `Reads the situation first, before you know to ask.` },
      { name: `BI & dashboards`, detail: `the charts your analysts build`, them: `Show you the data; you're left to interpret what to do.`, ours: `Interprets it and points to the call that's yours to make.` },
      { name: `Task & project apps`, detail: `where the work is tracked`, them: `Track status and movement, not judgement.`, ours: `Surface what's worth your attention, by risk and impact.` },
    ],
  },

  method: {
    mastheadL: `Method · from signal to a read`,
    mastheadR: `Four steps`,
    eyebrow: `A senior advisor, not a chatbot`,
    h2: `How Avery thinks.`,
    lede: `Avery turns scattered updates into a read you can defend: your company context, real HR experience, comparable cases, and your own check at the end.`,
    steps: [
      { n: `01`, h4: `Company brain`, p: `Documents, project status, responsibilities, and weekly notes are structured into one private context.`, metaA: `Input`, metaB: `Local` },
      { n: `02`, h4: `Evidence weight`, p: `Signals are scored by source quality — direct task data, repeated blockers, sentiment, and human checks.`, metaA: `Score`, metaB: `Weighted` },
      { n: `03`, h4: `Case match`, p: `Avery draws on real cases and playbooks for situations like yours, then suggests the route that fits.`, metaA: `Playbooks`, metaB: `Retrieved` },
      { n: `04`, h4: `Your call`, p: `The output isn't a paragraph. It's a brief: the read, the evidence, how sure, and the next move.`, metaA: `Action`, metaB: `You decide` },
    ],
  },

  modules: {
    mastheadL: `Six signals · one read`,
    mastheadR: `What Avery hands you`,
    eyebrow: `What Avery actually does`,
    h2: `Six signals. One read.`,
    lede: `Risks, the things waiting on you, metrics, milestones, team health, and a next move — gathered into one short morning read.`,
    selectedLabel: `Selected`,
    items: [
      { key: `risk`, lbl: `01 — Risk signals`, val: `Risk`, desc: `Project delays, budget pressure, and delivery risk surfaced before they become escalations.`, detailName: `Risk signals`, detailBody: `Active risk alerts connect project pressure, business impact, owner, confidence, and the escalation path Avery suggests.` },
      { key: `actions`, lbl: `02 — Waiting on you`, val: `Act`, desc: `Sign-offs, blockers, and follow-ups only you can clear, ranked by urgency and impact.`, detailName: `Waiting on you`, detailBody: `Surfaces the decisions and sign-offs only you can unblock, ranked by urgency and business impact.` },
      { key: `performance`, lbl: `03 — Performance signal`, val: `Pulse`, desc: `Charts for revenue, velocity, OKRs, and pipeline — without building a dashboard.`, detailName: `Performance signal`, detailBody: `Auto-builds charts for revenue, velocity, OKRs, and pipeline so you see the pattern without building a dashboard.` },
      { key: `milestones`, lbl: `04 — Milestones`, val: `Map`, desc: `Timeline deviations, critical paths, and delivery-risk notes across active work.`, detailName: `Milestones`, detailBody: `Maps active projects, critical paths, and timeline deviations, with a note on what changed and why.` },
      { key: `people`, lbl: `05 — Team health`, val: `Team`, desc: `Overload and pace changes read from how work moves — never a grade on a person.`, detailName: `Team health`, detailBody: `Reads overload, disengagement, and pace changes from how work actually moves — not from self-report, and never as a label on a person.` },
      { key: `solutions`, lbl: `06 — Next steps`, val: `Plan`, desc: `Ranked options, tradeoffs, and a review-ready move for each risk or signal.`, detailName: `Next steps`, detailBody: `Generates ranked options with tradeoffs and a clear next move for every signal — yours to accept or reject.` },
    ],
  },

  stack: {
    mastheadL: `Where other tools stop`,
    mastheadR: `Data to action`,
    eyebrow: `The four layers`,
    h2: `Where Avery starts.`,
    lede: `A general AI can answer, BI can chart, and task apps can track. Avery connects all four layers: data, insight, decision, and the move.`,
    colLayer: `Layer`,
    colAvery: `Avery`,
    colGeneric: `General AI`,
    colBi: `BI tools`,
    colTask: `Task apps`,
    rows: [
      { layer: `Action`, sub: `Checklists and next steps`, avery: `Ranked plans with a manager-ready next step.`, generic: `Only if you prompt for it.`, bi: `Doesn't operate here.`, task: `Tracks tasks, rarely tells you what to do.` },
      { layer: `Decision`, sub: `Priority, risk, recommendation`, avery: `Flags the decision, evidence, confidence, and owner.`, generic: `No live company context.`, bi: `Shows data; leaves the read to analysts.`, task: `Shows status, not judgement.` },
      { layer: `Insight`, sub: `Patterns and forecasts`, avery: `Connects project pressure with people signals.`, generic: `Useful summaries, weak validation.`, bi: `Strong historical charts.`, task: `Limited to task movement.` },
      { layer: `Data`, sub: `Raw records and systems`, avery: `CRM, PM, finance, HR and docs in one private context.`, generic: `No internal systems by default.`, bi: `Strong with setup and analysts.`, task: `Owns one work stream.` },
    ],
  },

  landscape: {
    eyebrow: `HR AI tool landscape`,
    h2: `What Avery is for — and what it isn't.`,
    lede: `Avery isn't trying to be your HR suite, payroll, or ATS. It owns the manager-intelligence layer those tools leave empty.`,
    capability: `Capability`,
    avery: `Avery`,
    cols: [`All-in-One HR Suite`, `Workforce Mgmt`, `Talent Intelligence`, `Perf & Engagement`, `HR Admin`],
    groups: [
      {
        group: `Manager intelligence`,
        rows: [
          { title: `Daily manager briefing`, sub: `Proactive morning read` },
          { title: `Operational risk alerts`, sub: `Project, revenue, delivery` },
          { title: `AI next steps & plans`, sub: `Resolution for flagged issues` },
          { title: `Revenue & project signals`, sub: `Sales, delivery, finance in view` },
          { title: `Cross-department view`, sub: `Sales + eng + finance + ops` },
          { title: `Meeting prep & context`, sub: `Briefing before each meeting` },
        ],
      },
      {
        group: `People & HR features`,
        rows: [
          { title: `Team health signals`, sub: `Overload, pace, engagement` },
          { title: `AI performance reviews`, sub: `Drafted from data, not blank` },
          { title: `Recruiting & ATS`, sub: `Sourcing, screening, scheduling` },
          { title: `Payroll & benefits`, sub: `Processing, compliance, admin` },
          { title: `Workforce scheduling`, sub: `Shift planning and staffing` },
        ],
      },
    ],
    legendYes: `Fully included`,
    legendPartial: `Partial / limited`,
    legendNo: `Not available`,
  },

  revenue: {
    mastheadL: `Commercial model · marketing position`,
    mastheadR: `SaaS + benchmark + consulting`,
    eyebrow: `How this becomes a business`,
    h2: `Revenue logic.`,
    lede: `The strongest package isn't only seats. It's a decision layer, benchmark intelligence, and consulting around setup and evaluation.`,
    kpis: [
      { lbl: `Manager seats`, val: `45`, delta: `Core SaaS`, desc: `Recurring manager access for the read, the morning briefing, and follow-up.` },
      { lbl: `Industry benchmark`, val: `20`, delta: `Data layer`, desc: `Aggregated, privacy-safe comparison points for risk, workload, and cadence.` },
      { lbl: `Consulting`, val: `25`, delta: `Service`, desc: `Workflow evaluation, HR case setup, playbook tuning, and implementation support.` },
      { lbl: `Private setup`, val: `10`, delta: `Security`, desc: `Local deployment, permission boundaries, and internal knowledge-base config.` },
    ],
  },

  bookCta: {
    eyebrow: `From scattered → to safer decisions`,
    h2: `Bring one situation you've been sitting on.`,
    p: `15 minutes, one real case — yours or one of ours. No pitch deck. If it's not for you, just say so.`,
    placeholder: `you@company.com`,
    button: `Book a 15-min look`,
    ok: `Thanks — we'll be in touch to find 15 minutes. 🙏`,
    micro: `The tools are free. We'll never put your people on a dashboard.`,
    closing: [
      { lbl: `For`, val: `Managers under pressure` },
      { lbl: `Powered by`, val: `HR knowledge and real cases` },
      { lbl: `Next`, val: `A demo and a pilot scope` },
    ],
  },

  footer: {
    left: `Avery`,
    right: `The senior at your ear.`,
  },
};
