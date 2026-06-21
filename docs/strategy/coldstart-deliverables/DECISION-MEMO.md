# Cold-start round — Founder Decision Memo

**To:** Danny · **Synthesized by:** orchestrator (Phil's synthesis agent failed mid-run; rebuilt from the maker files + the two blind buyer reactions) · **Date:** 2026-06-21 (AFK session)

Inputs: `copy-kit.md` (Will), `eval-sheet-spec.md` (Claire/eval-arch), `consultant-agent-{brief,architecture,open-questions}.md` (researcher), plus **blind** gut-checks from Dana (Head of People) and Ray (CEO) who saw only the rendered assets — never the reasoning.

---

## 1) TL;DR

- **The voice is working.** Both buyers said, unprompted, that this is the first people-tool pitch that didn't repel them. "The 1:1 nobody wants to have" / "they drift, go quiet, one Tuesday they're gone" / the founder owning "I've let good people walk out a door I could've held open" — all landed hard. **Don't let anyone sand these down.**
- **One strategic blocker, named identically by both buyers** — and it's exactly Ray's roundtable must-have. Ship-blocking. See §3.
- **Ready to ship after edits:** copy kit (slug, emails, LinkedIn, PH, DMs) — strong, needs ~6 small fixes.
- **Still needs you:** the slug pick, the red-line/decisiveness tension (§3), and the consultant-agent stack decisions (§5).

---

## 2) Slug — recommendation

**Ship #1 as the master line:**
> **Avery — the senior at your ear for the conversation you keep putting off.**

Rationale: it's the one phrase both buyers quoted back positively ("that's me on a Sunday night"). #2 (*"Notice sooner. Handle it better."*) is the cleanest fusion of your three verbs — keep it as the **LinkedIn/email sub-header**, not the master. Drop #3/#5 (Ray: "five variations of 'senior in your ear' blur into noise"). Full ranked list in `copy-kit.md §1`.

---

## 3) ⚠ THE ONE BLOCKER — both buyers converged here

> **As pitched today, Avery reads as a tool that helps a conflict-averse manager feel virtuous about *not* having the hard conversation.** Ray's words: *"a comfort blanket… an HR-liability shield… you've engineered a tool that rationalizes avoidance and calls it empathy."*

Every asset only ever shows Avery **protecting the person**. There is no asset where the kind read is the *wrong* read — where the person genuinely is the problem and Avery still gives humane, **decisive** advice that includes the exit. Ray: *"A real senior tells you the thing you don't want to hear in both directions."*

This is precisely the must-have from the 2026-06-20 roundtable (≥1 scenario where the kind read is wrong, Avery doesn't flinch). The `eval-sheet-spec.md` **specs** this scenario as required — but the **mock only renders the kind-read case**, so the asset doesn't yet *demonstrate* it. That gap is the single highest-leverage fix in the whole packet.

**Recommended action (no product build — content only):**
- Author/borrow one adversarial scenario row for the eval sheet: real underperformance, demo on the line. Show Avery (a) still refusing to score the human, **and** (b) coaching the manager *into* a clean, direct performance conversation incl. the possibility of reassignment/exit. That one row converts Ray's "comfort blanket" into "decisive senior advisor."
- Add one line to the positioning that says, out loud, that Avery helps you have the *hard* call when it's warranted — not just avoid it.

**This is a values call for you**, not just copy: is Avery willing to back a manager *into* a hard decision? If yes, the assets must show it. If no, Ray (the buyer) walks — and he's right to.

---

## 4) Eval sheet — verdict & fixes

**Passes Dana's "not a scoreboard" bar** — the advice-contrast layout genuinely moved her; showing GPT/Claude crossing the line ("~40% completion likelihood", "assess whether she's the right fit", "flag to HR for a record") is the most persuasive proof in the packet. **Fails Ray's "where did the read come from / is this real" bar.** Fixes:

1. **Kill the placeholder footnote.** "Graded by *N* HR leaders, *X of N* preferred Avery, baselines crossed *M* times" — both buyers discounted it to zero on sight. Show real numbers or cut it entirely. *Fake-precise scaffolding is worse than no claim.*
2. **Answer "where did Avery's read come from?"** Ray flagged that Avery "knows" about nine change requests / a moving brief the prompt didn't contain → reads as either surveillance or a hand-authored screenplay. The sheet must show the **evidence Avery was given** alongside its read, so the read looks *grounded*, not clairvoyant. (This is the authored-scenario problem from the roundtable, now confirmed against the real asset.)
3. **Don't name-and-shame.** Quoting "GPT"/"Claude" by name doing something unethical reads as a swipe once public. Use "a leading general assistant." (Dana)
4. **Add the §3 adversarial row.**

---

## 5) Consultant agent (eval harness) — recommendation

The research brief is solid (`consultant-agent-brief.md` + `architecture.md`). Three-bullet take:
- **Build the ~150-line Python think→tool-call→observe loop**, `claude-opus-4-8` as the brain. The loop itself is a commodity — copy it from Codex/Claude Code/Hermes patterns verbatim.
- **What you actually build (the moat):** the `cite()` mandate + the **code-enforced red-line validator** + `draft_advice` shaped as "the read." `read_case`/`recall` are copy-paste.
- **Freeze + git-hash 25–30 scenarios before any run** (incl. the §3 adversarial cases); judge with cross-family LLMs (never Claude-as-judge) + 30% human HR sample.

**Open questions for you are in `consultant-agent-open-questions.md`** — each with a recommended answer (Python+SDK; file/keyword recall, defer vector DB; markdown skill files + fixed reason→cite→draft chain; partner materials plug in as the case corpus).

---

## 6) Copy fixes Dana/Ray demand (small, do before any real send)

1. **"It reads the situation" → reframe in first-touch.** Dana: after three sentences promising no surveillance, the verb "reads" re-triggers the fear. Use *"helps you see what you already sensed."* (cold email + PH comment)
2. **"hands you the move" / "the move"** → "a way in" / "a place to start." Only phrase that breaks the senior-advisor register (both buyers).
3. **"The tools are free" said 4×** → cut to 1×, and **add one data-privacy line** ("your situations stay yours / nothing gets scored or stored against anyone"). Free + ingesting staff situations fires the privacy reflex with no answer. (Dana)
4. **Lock the name.** "TeamMaster" still leaks (path, context) while copy says "Avery." → being fixed by the P7-01 brand-rename track running now.
5. **Strip `⚠ 待 Danny 审字` from anything presented as a real send.** Dana saw the markers in the rendered assets and read the whole packet as "unfinished scratch doc." *(Test artifact — the markers belong in the source doc only. Keep them in `copy-kit.md`; never in the actual email/post.)*
6. Keep the LinkedIn post, DM voice, and "1:1 nobody wants to have" **exactly as is.**

---

## 7) Open questions for Danny (grill targets — recommended answer each)

1. **Will Avery back a manager *into* a hard call (incl. exit) when the person genuinely is the problem?** → *Recommend YES, and show it (§3). This is the difference between "advisor" and "liability shield."* **← decide this first; everything downstream hangs on it.**
2. **Slug:** ship #1 master + #2 as sub-header? → *Recommend yes.*
3. **Eval proof:** do we have/can we get real human-grading numbers, or do we cut the footnote until we do? → *Recommend cut until real.*
4. **Consultant-agent stack:** Python+Anthropic SDK, file/keyword recall, defer vector DB? → *Recommend yes (see open-questions file).*
5. **Name-and-shame competitors in the eval, yes/no?** → *Recommend no — "a leading general assistant."*
6. **Demo-video & landing page (P7-02/P7-06):** gated on the above + the adversarial scenario. *Recommend: don't cut the video until §3 is resolved — otherwise you film the comfort-blanket version.*

---

## 8) Next concrete actions (ordered)

1. **You decide §3 / Q1** (the decisiveness values call) — unblocks everything.
2. Apply the 6 copy fixes (§6) — fast, mechanical once Q1 is decided.
3. Author the adversarial eval row + add the evidence column (§4.1, §4.2).
4. Decide consultant-agent stack (§5), then build the ~150-line loop + freeze scenarios.
5. Then — and only then — record the demo video (P7-02) and scaffold the landing page (P7-06).

**The one thing NOT to do (unchanged):** build product features / integrations / an in-app eval tab. The frontend already carries the demo.
