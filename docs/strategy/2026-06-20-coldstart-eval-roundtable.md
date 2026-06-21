# Roundtable — batch cold-start + evaluation data (2026-06-20)

Context: first pitch to friends/colleagues landed well; they liked the frontend. Business model locked: **advisor-form AI + tools free, playbooks paid**. Market: overseas-first, all-English. Two questions on the table:

- **Q1.** How do we batch cold-start? (get Avery in front of many strangers fast)
- **Q2.** How do we present our evaluation data? (proof of *why* Avery's advice is good)

Method: `/begin-loop` shape — Phil/Claire/eval-architect produce → Will packages → Dana (HR) + Ray (CEO) gut-check the real assets → founder decision memo. Web-search on throughout. Cast in [roles.md](../../roles.md).

---

## FOUNDER DECISION MEMO (the synthesis)

**To:** Danny · **From:** Phil (GTM + product) · **Date:** 2026-06-20

### 1) Q1 — batch cold-start plan
Reorder, don't blast. Buyers (HR + senior leaders) are a trust buy.
- **(A) Founder-led LinkedIn** — 4–5 narrative posts/week off Danny's *personal* profile, Lin Qing as story not pitch, demo link in first comment to protect reach. Loop: post → leader comments → DM → 15-min call → call becomes next post.
- **(B) Surgical cold email** — 20–40 hyper-personalized sends/day off warmed secondary domains (**warmup starts today, takes 4–6 weeks**), each tied to something the buyer posted. NOT batch — 2026 deliverability kills the blast.
- **(C) Communities** (People-Ops Slack/Discord, r/managers) — be useful 3 weeks before naming Avery.
- **(D) ProductHunt LAST**, once, as a credibility spike + email-capture event, not an engine.
- **Ray's change:** the same authored Lin Qing scenario across five assets reads as "Danny wrote one good story," not "the product is good." **Rotate in 2–3 more scenarios** before scaling any channel.

### 2) Q2 — evaluation-data plan
Build the headless harness — correct minimum build; both buyers said why.
- **Build:** ~150-line `think→tool-call→observe` loop, Claude as Avery's brain, 4 file-based tools, markdown memory, no UI. Run **25–30 scenarios, frozen + git-hashed before any run**, incl. ~5 adversarial/null cases. Mandatory `cite()` before advice; hard red-line gate that auto-fails person-scoring. Judges: **cross-family LLMs (never Claude-as-judge)** + real HR humans on a 30% sample.
- **Present** as the product, not a benchmark: reuse `StructuredOutputCard`/`MismatchCard` styling for a side-by-side "what each advisor said" panel — Avery's actual advice text vs raw GPT/Claude, one scenario per row, `safeFraming` quoted verbatim.
- **Dana's change:** a scoreboard answers a question the buyer isn't asking ("I'm not choosing between chatbots"). Lead with the advice contrast + `safeFraming`; **demote "9 of 11 preferred Avery" to a quiet footnote.**
- **Ray's must-have:** ≥3 scenarios Danny did NOT author, and ≥1 where the kind read is the WRONG read (genuine underperformance) — and Avery must NOT flinch. That result kills his biggest objection.

### 3) Danny's three intuitions
- **#1 "stop building, go distribute" — AMEND.** Right that a 2-person team can't build in a vacuum; wrong if it means video-only. A video proves interest in a *concept*; it can't prove *the advice is good* — the buyer's real objection. Distribute video AND eval in parallel.
- **#2 "headless eval agent, no frontend integrations" — GO.** Both buyers validated it independently; only non-fakeable proof, costs emails not engineering. **One blocker (Dana):** the person-page stat-grid feel — Danny's call (see appendix).
- **#3 "LinkedIn + PH + cold email" — AMEND.** Reorder: LinkedIn first, surgical email second, communities third, PH dead last. Rewrite the follow-up #1 ("her files showed three re-scopes") — reads as file-surveillance in the opener.

### 4) Next 1–2 weeks
- **Week 1 — FOUNDER:** cut the 60–90s video; start email-domain warmup (clock starts today); build a 200-name ICP list; start daily LinkedIn posting; join 3 communities. *(+ decide the red-line taste call, appendix.)*
- **Week 1 — AVERY-AGENT-HELPS:** scaffold harness loop + 4 tools; draft + freeze 25–30 scenarios (flag non-authored); build the static comparison page reusing existing card CSS.
- **Week 2 — FOUNDER:** video live; 20 personalized emails/day; recruit 5–10 HR leaders to grade outputs; book calls. A/B the subject line on the first 100 sends, decided on reply rate.
- **Week 2 — AVERY-AGENT-HELPS:** run the batch, dump JSON, auto-verify citations, compute human-preference + κ.
- **The ONE thing NOT to do:** build product features, integrations, or an in-app eval tab. The frontend already carries the demo.

### 5) Biggest risk + KILL/CONTINUE signal
**Risk:** a "that's cool" reaction that never converts — polished frontend wins applause; the human-side problem may be felt-but-not-budgeted. Track *calls booked*, not impressions/upvotes.
- **CONTINUE (end of Week 2):** ≥8 qualified 15-min calls from ~200 personalized touches + 2 weeks posting, ≥3 "can I use this with my team now," ≥1 "I'd pay for the playbook."
- **KILL/PIVOT:** <2% email reply rate, single-digit post engagement from *actual leaders* (not founders/peers), zero unprompted "when can I try it."

---

## The voices

### Phil — GTM
- **ICP is a relationship-trust buy, not self-serve.** That reorders everything.
- **LinkedIn = the #1 compounding loop**, not a side channel. 4–5 posts/week, personal profile; each conversation becomes the next post.
- **Cold email surgical, not batch.** 2026 deliverability penalizes blasts (complaint rate must stay <0.3%); 20–40 hyper-personalized/day off warmed domains. ([PowerDMARC](https://powerdmarc.com/bulk-email-sender-requirements/), [Unify](https://www.unifygtm.com/explore/cold-email-2026-domain-setup-deliverability-sequences))
- **Communities** = highest trust-per-touch; be a human for 3 weeks first.
- **ProductHunt is "applause, not adoption"** for slow-onboarding B2B — last, once, as loop fuel. ([EQ4C](https://tools.eq4c.com/why-im-skipping-product-hunt-for-my-saas-launch-the-real-numbers-will-shock-you/))
- **Biggest risk:** "that's cool" that never books a call. Track *calls booked*. Legs = ≥8 calls / ≥3 "use it now" / ≥1 "I'd pay" in 2 weeks; nobody-cares = <2% reply, single-digit leader engagement, zero unprompted interest.

### Claire — product / eval presentation / demo
- **Don't lead with a benchmark table** — a non-technical buyer reads an eval grid as tool-y and as rating the human. Lead with the artifact they already trust: the **"The read" card**; your eval *is* its four sections made auditable.
- **Format:** side-by-side "what each advisor said," one scenario/row — Avery's read vs raw GPT/Claude as *actual advice text*, not scores. The contrast sells itself.
- **One quiet human number:** "Graded by N HR leaders — X/N preferred Avery." Human judges, not LLM-as-judge.
- **Red line:** show the read of the *situation*, never a score on the *person*; quote `safeFraming` verbatim — "we evaluate the advice, never the human" is itself a selling point.
- **Demo (Lin Qing):** cold open ("status says on track") → terminal streams → MISMATCH card snaps in (*the dread moment*) → "The read" hands the move → human-loop send → eval panel → "Avery. The senior at your ear."
- **Verdict on #2:** right call, don't build more UI. Minimum = harness→JSON + one static comparison page reusing existing card CSS + real human grading.

### Eval architect — the headless harness
- **A) Architecture (days to build):** single-threaded `think→tool-call→observe` loop (same primitive as Codex/Claude Code), Python + Anthropic SDK, `claude-opus-4-8` as Avery's brain, 4 file-based tools (`read_case`, `recall`, `cite`, `draft_advice`), markdown memory (`facts.md` + `notes.md`), keyword recall (no vector DB early). What makes it not-a-coding-agent: relational operating model in the system prompt; **`cite()` mandatory before advice**; **red-line validator as a hard tool-side check** (Codex/Claude *will* trip it — an honest differentiator).
- **B) Comparison protocol:** identical prompt + evidence to all three; publish baseline prompts so no one says you hobbled them. **25–30 scenarios frozen + git-hashed before any run**: ~10 anonymized real, ~10 from a fixed taxonomy, ~5 adversarial/null ("don't intervene yet"). Rubric: hard-fail gates (red-line, contradicts evidence, hallucination) then 1–5 soft dims (grounding/actionability/humanity/calibration). Judges: **two LLMs of different families — never Claude-as-judge** (self-preference bias) — plus human grading of 30% (report Cohen's κ); randomize order + swap-and-rerun to kill position bias.
- **C) Artifact + claim:** one-page scorecard + open repo (frozen scenarios, judge prompts, raw transcripts). Licenses: *"on a frozen, pre-registered set, blind cross-family judges + HR practitioners rated Avery better-grounded and more actionable, and Avery never crossed the red line; baselines did, N times."* Does NOT license outcome/ROI claims — say so out loud; the honesty is what makes the rest credible.
- Sources: [OpenAI Codex loop](https://openai.com/index/unrolling-the-codex-agent-loop/), [Claude Code master loop](https://www.zenml.io/llmops-database/claude-code-agent-architecture-single-threaded-master-loop-for-autonomous-coding), [Agent SDK loop](https://platform.claude.com/docs/en/agent-sdk/agent-loop), [Self-Preference Bias (NeurIPS 2024)](https://arxiv.org/pdf/2410.21819).

### Will — shippable assets
Constraints from 2026 data: cold email <80 words, first name + real first line (top performers >10% reply); LinkedIn rewards first 3 lines + comments (15× likes), generic-AI phrasing kills reach; PH tagline "X for Y", first comment read by 60–80% of voters.

**Positioning:** *Avery — the senior leader at your ear for the conversation you keep putting off.*

**Cold email** — subject `{FirstName}, the 1:1 nobody wants to have`; 78-word body tied to a post the buyer made, one ask (15 min), easy out. CEO variant subject: `{FirstName}, your best people leave quietly`. Follow-up #1 references "three re-scopes" (⚠ Dana would delete this — see below).

**LinkedIn post** — hook: *"A designer on our team was 'on track.' Her status was green. Her standups were fine. Then she quit."* Story-first, "Including me," ends with a question, demo link in first comment.

**ProductHunt** — tagline `The senior leader at your ear before a hard 1:1` (47 chars); anti-hype maker's first comment ("I once let one of my best designers quietly burn out… every tool wanted to score my people; that's the wrong line").

**Demo beat sheet** — 0–8s cold open → 8–25s terminal + MISMATCH snap → 25–45s "The read" hands the move → 45–70s human-loop send → 70–85s eval panel → 85–90s end card. Red-line note for production: never show a number on Lin Qing herself.

**First A/B:** the cold-email subject (pain vs loss), decided on reply rate.
- Sources: [Snov.io 2026](https://snov.io/blog/cold-email-statistics/), [Instantly 2026](https://instantly.ai/cold-email-benchmark-report-2026), [LinkedIn algo 2026](https://blog.mean.ceo/linkedin-algorithm-organic-reach/), [ZoomSphere: generic AI kills reach](https://www.zoomsphere.com/blog/linkedin-algorithm-2026-why-generic-ai-content-kills-your-organic-reach).

---

## Buyer gut-check

### Dana (Head of People) — "I almost want to believe this"
- 🟢 **Keep:** the LinkedIn first six lines ("Including me"); "it doesn't score your people… a line software shouldn't cross"; the human-loop transcript ("open by checking in, not checking up"); `safeFraming` verbatim; the on-device privacy line ("nothing leaves, nothing goes to a server" — lead louder with this); "you stay in the chair… the human pulls the trigger."
- 🔴 **Puts me off:** *(claims about the product screens — see verification below, partly overstated)* the person-page stat-grid; numeric risk bars; the **eval scoreboard** ("answers a question I'm not asking — I'm not choosing between chatbots"); the **follow-up #1** "her files showed three re-scopes" reads as file-surveillance in the opener I'd forward; "playbooks are the paid part" in the maker's intro is tonally jarring.
- 🟡 **Cold:** "at your ear" sounds like an earpiece; "MISMATCH / the gap" frames it as the manager's failure; "cite evidence" about a person sounds like building a case file.
- **Forward to CEO?** The `your best people leave quietly` variant — yes. The follow-up #1 — delete/rewrite.
- **Bottom line:** wouldn't trust it with her team *yet*; biggest blocker = make the screens match the words.

### Ray (CEO) — "forward to Dana, kick the tires, don't buy yet"
- **Won by:** "reads the situation, shows its evidence, hands the manager the move" + "not a dashboard, not a score on anyone." Follow-up #1 is the strongest single asset — concrete, falsifiable, recognizable.
- **Lost / pushed back:** the same authored scenario dressed five ways reads as "Danny wrote one good story." Checked the fixtures: the Lin Qing case is genuinely well-built **but authored** (hand-written signals/numbers, reviewed 2026-06-12). So the demo proves *"Avery presents a great answer beautifully,"* not *"Avery generates one from messy real inputs."*
- **Curious vs trust:** email/positioning clear the curious bar easily. The eval clears "well-formed, grounded, non-creepy" (he *respects* the rigor — "a believable loss beats an unbelievable win" = most credible sentence in the pitch) but NOT "following this advice makes my team better" — that needs users, not transcripts.
- **Real fear (blast radius):** a tool whose whole personality is "don't read anyone as slow, protect the person" will systematically talk weak managers *out of* hard calls they need to make. Wants to see adversarial cases where the kind read is *wrong* and Avery doesn't flinch. Plus a data-handling story (it reaches into files/Slack/email to infer emotional state).
- **Bottom line:** forward + take the meeting; won't pay yet. Blocker = *show Avery handle a case it didn't write, including one where the kind read is the wrong read.*

---

## Appendix — code-claim verification (Danny's call)

Dana/Ray flagged the product screens as still "scoring people." Checked against source — **overstated**:

- `EmployeeDetailScene` overview grid (Lin Qing = `u_bill`): `workloadValue` = *"Chasing a moving brief"*, `statusLabel` = *"Stretched right now"* — **prose, not numbers**. Only number is `progressValue` = *"48% · brief kept moving"* — that 48% is **project** completion, not a person score. (`src/data/fixtures.p3.ts:202-207`)
- `DashboardScene` risk bars (`:547`): values are `RISK_DIMS` (progress/blockers/…) on a **project card** — project-risk data, not people-scoring.

**No person is quantified** (no burnout %, flight-risk, or performance grade — those were already removed). What's real is a **feel** issue: the person page keeps a clinical four-cell stat-grid + a warning status dot on a human, plus one project %. Whether that crosses the red line is a **taste/values call for Danny**, not a correctness bug — left untouched pending his decision.
