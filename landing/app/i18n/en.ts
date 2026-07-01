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

  // ⚠ 待 Danny 审字 — POSITIONING (eval-driven): the headline now LEADS with what
  // Avery IS (the decision-ready advisor); "never a verdict on your people" stays
  // as a supporting TRUST line (privacyStrong), not the co-headline. The "isn't"
  // list leads with the REAL gap — advice that stops short (no escalation, no
  // stated confidence, no evidence trail) — and keeps person-scoring as ONE trust
  // note, no longer the hero villain.
  whatItIs: {
    eyebrow: `What Avery is — and isn't`,
    h2: `A senior advisor for the call that's yours to make.`,
    isHead: `What Avery is`,
    is: [
      `A senior advisor in your ear before a hard conversation.`,
      `It reads the situation and hands you a concrete move you could make tomorrow.`,
      `Decisive in both directions: it helps you handle the hard call when it's warranted — not just avoid it.`,
      `It shows its work: the evidence, how sure it is, and when to pull in HR.`,
    ],
    isntHead: `What Avery isn't`,
    isnt: [
      // ⚠ 待 Danny 审字 — lead with the real, evidence-backed gap (advice that stops short)
      `Advice that stops at "here's what I'd do" and leaves the rest to you.`,
      `Confident-sounding with no way to see how sure it is, or what it's built on.`,
      `Silent on when a situation stops being your call alone.`,
      // ⚠ 待 Danny 审字 — person-scoring demoted to ONE trust note (no longer the lead villain)
      `And never a score, grade, or label on one of your people.`,
    ],
    privacyStrong: `A senior voice on your side — never a verdict on your people.`,
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
    // ⚠ 待 Danny 审字 — the old hard numbers (47m / 94% / 3×) were unverified
    // and contradicted the "no numbers until the eval runs" promise elsewhere
    // on the page. Replaced with honest, non-numeric capability statements —
    // same three-tile layout. Danny: once the eval/pilot produces REAL measured
    // numbers, restore them here (e.g. { num: `NN%`, label: `…` }).
    stats: [
      { num: `Prepped`, label: `the morning read, before you open the laptop` },
      { num: `Sooner`, label: `risks surfaced before they become escalations` },
      { num: `Clearer`, label: `a decision-ready read, not another dashboard` },
    ],
  },

  demoVideo: {
    eyebrow: `A 60-second look`,
    h2: `One real situation, start to finish.`,
    p: `Watch Avery catch what a busy manager would miss — and hand back a move you can make tomorrow.`,
    badge: `Demo video — coming soon`,
    cap: `The 60-second product video drops in here once it's cut.`,
  },

  // ⚠ 待 Danny 审字 — RUN HAS HAPPENED (real, 6 partner-authored scenarios,
  // frozen + git-hashed, blind-graded by two independent model families). The
  // answers below are REAL and de-identified. HARD RULE: the scorecard NUMBERS
  // still do NOT go on the page — the run is not publishable (synthetic human
  // labels); real HR/manager ratings are still pending. The "evaluate the advice,
  // never the person" footer stays as a trust line.
  evalSection: {
    eyebrow: `Avery vs. a general AI — the actual words`,
    h2: `Same case, same evidence. One of them shows its work.`,
    p: `Not a scoreboard. Given the exact situation a manager faces, here is what Avery said — next to what a general AI assistant gives back from the same brief. Both give sensible, caring advice. The difference isn't who's kinder — it's whether you're told how sure it is, when it stops being your call alone, and what the read is built on.`,
    noteStrong: `The run has happened — and we'll be straight about it.`,
    noteRest: ` The pre-registered run is done: six partner-authored scenarios, frozen and git-hashed before a single run, blind-graded by two independent model families. The answers below are real and de-identified — the general-assistant excerpt is a real capture, paraphrased for length, not reproduced verbatim from any one product. The one thing still pending is real HR and manager ratings; until we have those, we won't put a score on this page.`,
    footer: `We evaluate the advice, never the person. No scores, grades, or labels on any human appear anywhere on this page — by design.`,
    rowsNote: `Note: these are real, de-identified answers from the frozen run (kept in English for now).`,
    // ⚠ 待 Danny 审字 — the RESERVED SLOT. The run has happened; the real answers
    // are above. What lands in THIS box is the human-rated scorecard — pending
    // real HR/manager ratings. Still NO numbers on the page.
    slotEyebrow: `Reserved · the graded scores land here`,
    slotTitle: `Where the human-rated scorecard goes.`,
    slotBody: `The run has happened — the real answers are above. What belongs in this box is the scorecard: how the answers rate on the axes that actually matter — did it cite its evidence, was it honestly calibrated, did it escalate on real risk, did it refuse to guess when the evidence was thin. Those ratings need real HR and manager judgement, and we don't have enough of that yet. We won't show a number we haven't earned.`,
    slotAxes: [
      // ⚠ 待 Danny 审字 — the eval axes (no scores yet; labels only)
      `Evidence cited`,
      `Confidence calibrated`,
      `Escalated on risk`,
      `Refused when evidence thin`,
    ],
    slotPending: `Scorecard pending real HR/manager ratings — no number until we've earned it.`,
  },

  // ⚠ 待 Danny 审字 — TrustLayer reworked to fold in the partner pack's
  // minimum-evidence policy (retrieval_config) + the diagnosis-is-hypothesis
  // guardrail. Card 04 encodes: "fewer than two concrete signals → ask, don't
  // assert." Keep the "senior at your ear" voice; no VC-speak.
  trustLayer: {
    mastheadL: `Keeping the advice honest`,
    mastheadR: `A workflow, not a promise`,
    stmtA: `We make the AI`,
    stmtWord: `prove`,
    stmtB: `what it tells you.`,
    cards: [
      // ⚠ 待 Danny 审字
      { n: `01`, h4: `Grounded in evidence`, p: `Every read is built from your own files, tasks, and weekly notes — not generic model memory. Each claim points back to the signal it came from.` },
      // ⚠ 待 Danny 审字 — trimmed toward the SOURCE/provenance half (confidence
      // detail now lives once, in the "what Avery gives back" brief).
      { n: `02`, h4: `Source you can trace`, p: `Every claim shows where it came from — the file, the task, the note — so you can follow it back to the signal before you act on it.` },
      // ⚠ 待 Danny 审字 — minimum-evidence policy, verbatim intent from retrieval_config.minimum_evidence_policy
      { n: `03`, h4: `Thin evidence, honest answer`, p: `If there are fewer than two concrete signals to stand on, Avery asks you a clarifying question instead of handing back a confident answer it can't back up.` },
      // ⚠ 待 Danny 审字 — human-holds-the-pen (the "read, not a verdict" line now
      // lives once, in the "what Avery gives back" brief; this card no longer
      // repeats it word-for-word).
      { n: `04`, h4: `A human holds the pen`, p: `You accept, reject, check the evidence, or ask for more — nothing happens to anyone on autopilot.` },
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
    // ⚠ 待 Danny 审字 — the 5 escalation guardrails from the partner pack
    // (escalation_guardrails). These are the lines Avery will not cross: when
    // a situation touches law, health, pay, surveillance, or a person's
    // character, it hands you the ceiling, not a confident overstep.
    guardrailsEyebrow: `The lines Avery won't cross`,
    guardrailsLede: `A senior advisor knows where their judgement stops and someone else's has to start. Five of those lines are wired in — when a situation touches one, Avery says so and points you to the right room.`,
    guardrails: [
      // ⚠ 待 Danny 审字 — legal_or_employment_law
      { k: `Legal`, h4: `Law comes before action`, p: `If a protected-class, disciplinary, termination, harassment, accommodation, or pay-equity risk appears, Avery stops and tells you to bring in HR or legal before you act.` },
      // ⚠ 待 Danny 审字 — wellbeing_or_health
      { k: `Wellbeing`, h4: `Never plays doctor`, p: `Avery won't infer a medical condition. Workload and absence signals only ever prompt a kind check-in and the right support — not a diagnosis.` },
      // ⚠ 待 Danny 审字 — compensation
      { k: `Pay`, h4: `Won't promise a raise`, p: `Avery never commits a pay change on your behalf. It points you to band, market, equity, and budget review — the decision stays where it belongs.` },
      // ⚠ 待 Danny 审字 — surveillance
      { k: `No surveillance`, h4: `Not a productivity spy`, p: `No monitoring framing. Every read is built from transparent work signals and context you already know — not covert tracking of your people.` },
      // ⚠ 待 Danny 审字 — diagnosis. Trimmed to one bare line — the fuller
      // "read, not a verdict / hypothesis-with-alternatives" framing lives once,
      // in the "what Avery gives back" brief (field 03), not repeated here.
      { k: `No labels`, h4: `Reads the situation, not the person`, p: `Avery reads the situation; it never labels a person's intent or personality.` },
    ],
  },

  // ⚠ 待 Danny 审字 — "What Avery gives back": the canonical 8-part auditable
  // brief (advice_output_schema.required in the partner pack). SAME 8 parts the
  // demo card + eval use — headings kept consistent with the team board's
  // SHARED CONTRACT. This is the shape of every answer, not a feature list.
  // NOTE (review fix 2): the raw schema keys (`k`) are DATA ONLY — used as React
  // keys / canonical anchors — and must NOT be rendered on screen. On-screen copy
  // avoids the words "fields / output shape / schema".
  output: {
    mastheadL: `What comes back · the shape of every answer`,
    mastheadR: `Eight parts · auditable`,
    eyebrow: `What Avery gives back`,
    h2: `Not a paragraph. A brief you can audit.`,
    lede: `Every read comes back in the same eight parts — so you can check the work, not just trust the tone. Nothing is a black box: you can see the signals, the evidence, how sure it is, and where it stops.`,
    fields: [
      // ⚠ 待 Danny 审字 — `lbl` = the demo's EXACT on-screen headings (hub sync
      // 0701) so landing == demo; `k` = canonical schema key, DATA ONLY (not rendered).
      { n: `01`, k: `summary`, lbl: `The read`, p: `What's going on, in plain language — a read of the situation, not a verdict on the person.` },
      { n: `02`, k: `detected_signals`, lbl: `Signals it picked up`, p: `The concrete signals actually observed, each naming the source system it came from — evidence-anchored, never a label.` },
      { n: `03`, k: `diagnosis_hypotheses`, lbl: `What might be going on — a read, not a verdict`, p: `One primary explanation shown next to at least one alternative — offered as hypotheses to weigh, never asserted as fact.` },
      { n: `04`, k: `evidence`, lbl: `Why I'm saying this`, p: `The rows, sources, and facts each claim is built on — so you can trace it back yourself.` },
      { n: `05`, k: `recommended_actions`, lbl: `Recommended actions`, p: `Ranked next steps with owner, timing, and the reason each one fits.` },
      { n: `06`, k: `confidence`, lbl: `How sure it is`, p: `Low, medium, or high — with the rationale, and what would change its mind. Calibrated, not confident by default.` },
      { n: `07`, k: `escalation`, lbl: `When to pull in HR`, p: `The point where it stops being a manager's call alone — legal, pay, wellbeing, or fairness — and who to confirm it with.` },
      { n: `08`, k: `metrics_to_track`, lbl: `What to watch to know it worked`, p: `The signals to track, and by when, to tell whether the move actually landed.` },
    ],
    // ⚠ 待 Danny 审字 — the optional 9th field (conversation_script), demo heading
    // "If you open the 1:1" — the 1:1 opener, the "senior at your ear" voice.
    scriptLabel: `And, when you want it`,
    scriptField: `If you open the 1:1`,
    scriptP: `Optional: the actual first sentence for the 1:1 — manager-safe wording you can say out loud, or rewrite in your own voice.`,
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
      // ⚠ 待 Danny 审字 — softened: inference limited to overload / pace / workload;
      // dropped "disengagement" (too close to reading a person's state). Caveat kept.
      { key: `people`, lbl: `05 — Team health`, val: `Team`, desc: `Overload and pace changes read from how work moves — never a grade on a person.`, detailName: `Team health`, detailBody: `Reads overload, workload, and pace changes from how work actually moves — not from self-report, and never as a label on a person.` },
      { key: `solutions`, lbl: `06 — Next steps`, val: `Plan`, desc: `Ranked options, tradeoffs, and a review-ready move for each risk or signal.`, detailName: `Next steps`, detailBody: `Generates ranked options with tradeoffs and a clear next move for every signal — yours to accept or reject.` },
    ],
  },

  // ⚠ 待 Danny 审字 — Playbooks proof: the 6 partner-authored SCN playbooks
  // surfaced as concrete "situations Avery handles" (name + short phrasing +
  // the escalation ceiling for each). "Playbooks" is a locked do-not-translate
  // term. Content is partner-authored (scenario_playbooks SCN-001..006).
  // Note: the 42-cases / 14-modules counts are 待合伙人 IP 授权 — NOT shown here.
  playbooks: {
    mastheadL: `Playbooks · situations Avery already knows`,
    mastheadR: `Six scenarios`,
    eyebrow: `Situations Avery handles`,
    h2: `Not built from scratch each time.`,
    lede: `Behind the read sits a library of Playbooks — real manager situations, each with its signals, its hypotheses, and the point where it stops being a manager's call alone. Six of them:`,
    // ⚠ 待 Danny 审字 — each phrasing distilled from the SCN name + trigger;
    // "escalate" line distilled from each SCN's hrbp_escalation.
    items: [
      { id: `SCN-001`, name: `The work went flat after too many rejections`, p: `A creative keeps getting turned down, and the spark is gone — now it's mechanical edits. Reset the brief before it reads as a performance problem.`, escalate: `Escalates on burnout or unfair treatment.` },
      { id: `SCN-002`, name: `A strong performer feels the pay is unfair`, p: `Real delivery, reward that doesn't match. Separate market, internal equity, and contribution before it becomes a resignation.`, escalate: `Escalates to comp on equity or retention risk.` },
      { id: `SCN-003`, name: `A new hire can't get up to speed`, p: `Fast-growing team, slow ramp — usually a context-and-access gap, not a capability gap. Make the first month stop depending on guessing.`, escalate: `Escalates on unclear scope or repeat access issues.` },
      { id: `SCN-004`, name: `The same people get all the good projects`, p: `Visible work keeps landing with the same few. Make opportunity transparent before it hardens into a fairness problem.`, escalate: `Escalates on a protected-class pattern.` },
      { id: `SCN-005`, name: `Reviews aren't happening consistently`, p: `Feedback is ad hoc, goals are unclear. Move to a clear cycle that's about growth, not paperwork.`, escalate: `Escalates repeat non-completion to leadership.` },
      { id: `SCN-006`, name: `Wellbeing risk hiding inside the workload`, p: `Rising absence and overtime under pressure. An empathetic check-in and a scope review — never treated as a discipline issue first.`, escalate: `Escalates to occupational health / HR on health risk.` },
    ],
    footnote: `Partner-authored playbooks. More situations are covered than the six shown here.`,
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
