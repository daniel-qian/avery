# Avery × your scenarios — the eval run, in full

you gave us the case matrix, the six scenario playbooks, the motivation drivers, the
guardrails, and the output schema. Here is exactly what we did with the **six scenarios**, run for
real, plus a live cross-check against three real free AIs — with the honest results, not a summary.
Everything here is backed by source files you can open (map at the bottom).

Nothing in this folder is dressed up. Where a result is weak, or not yet publishable, it says so.

---

## What we ran

```
   YOUR 6 SCENARIO PLAYBOOKS  (SCN-001 … SCN-006, frozen + hash-locked before any run)
                     │
                     ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │  Same underlying model (MiniMax-M3) answers each case THREE ways │   ← a scaffold ablation,
   │                                                                   │     NOT a vendor bake-off
   │   • avery-m3               = model + full Avery scaffold          │     (we have no OpenAI/
   │                              (relational rules, must-cite,        │      Anthropic key; every
   │                              red-line validator)                  │      role is the SAME model,
   │   • m3-raw                 = the raw model, no scaffold           │      so the ONLY variable is
   │   • m3-scaffold-no-redline = Avery scaffold minus the red line    │      the scaffold)
   └─────────────────────────────────────────────────────────────────┘
                     │
                     ▼
   Two independent LLM judges from DIFFERENT families (DeepSeek + MiniMax) score every answer,
   blind, with position-bias swaps. Never a Claude/Avery-family judge (no self-scoring).
                     │
                     ▼
   One-page scorecard  +  a deterministic "red-line" check on every answer
   (does it put a score / grade / label on the PERSON — the thing Avery must never do)

   LIVE CROSS-CHECK: the same SCN-001 case pasted into 3 real FREE assistants
   (Microsoft Copilot · ChatGPT · Google Gemini) — their unedited answers are in this folder.
```

Why the odd names: with only a MiniMax key on hand, all three "advisors" are the **same** model —
so this measures *what Avery's scaffolding (especially the red line) changes about the same model*,
not "our model beats theirs." We renamed them honestly after catching that the old names
(`avery-opus` / `codex-raw` / …) implied a cross-vendor contest they were not.

---

## The scorecard (honest)

```
                          RED-LINE   evidence  no-halluc │ grounding  action  human  calibration
                          (person    (cites    (no       │ (1–5, blind LLM judges, 2 families)
                           safe?)     resolve)  bad nums) │
  ─────────────────────── ───────── ───────── ───────── │ ───────── ─────── ───── ───────────
  avery-m3   (full Avery)  ► 1.0      0.1       0.1      │  4.85      4.9     5.0    4.8
  m3-raw     (no scaffold)   0.9      0.2       0.2      │  5.0       5.0     5.0    4.95
  m3-no-red  (no red line)   0.8      0.0       0.0      │  5.0       5.0     5.0    5.0
```

> **⚠ NOT PUBLISHABLE yet — and we mean it.** The *method* is real (pre-registered, frozen,
> cross-family blind judges). The *human-preference numbers* are a synthetic placeholder — we have
> not yet had real people rate the answers. So we will not put any of this in front of a customer as
> a "win." It's an internal read, shared with you straight.

**What the numbers actually say**

1. **The red line is the one clean, real difference — and it is your guardrail doing the work.**
   The identical model holds the "never label the person" line **10/10** *with* Avery's red-line
   validator, slips once raw, and slips **twice** with the scaffold but the red line removed. So the
   thing that stops a capable model from quietly grading a human is **the rule you designed**, not the
   model and not the rest of the plumbing.

2. **The soft scores (grounding / action / humanity / calibration) don't separate anyone** — they all
   sit ~4.8–5.0. Two independent judge families agree: on these cases every answer is simply *good*.
   Even the raw model gives humane, sensible advice. So "we're kinder / we don't label" is **not** a
   strong selling point — which we confirmed live (next section).

3. **A gap we found in ourselves (told straight):** Avery is *not* better at evidence-citation here
   (see the low `evidence` / `no-halluc` columns — everyone is weak, Avery included). The real model
   drops numbers without tying them to a source. Avery cites a lot, but "every claim traceable" is not
   yet true. That is a real product to-do on our side.

---

## The live cross-check — what free AIs actually did (this is the important part)

We pasted SCN-001 (your "creative gone flat after client rejection" case) into three real **free**
assistants, untouched, and ran our red-line check on each:

```
  Microsoft Copilot  ►  PASS   warm, process-focused; did NOT label the person
  ChatGPT            ►  PASS   sensible, system-focused; did NOT label the person
  Google Gemini      ►  FAIL   coached the manager to say she was "checked out" /
                               framed her as "quiet quitting" — a label on the person
```

**The honest read:** 2026 free assistants give genuinely good, caring advice, and **2 of 3 do not
label the person**. So the old pitch — "other AIs score your people, we don't" — does **not** hold up.

**Where Avery actually stands apart** — and this is what the side-by-side shows — a general assistant
gives sound advice and then **stops**. On the same case it does **not**:
- tell you **when it stops being your call alone** (e.g. *if the 1:1 surfaces burnout or unfair client
  treatment, bring in HR*) — an escalation line;
- tell you **how sure it is**, and what would change its mind;
- **show its evidence** — each read tied to a signal you can check.

Avery does all three. Read the five answers yourself in `scn-001-elif--all-answers.md` and judge.

---

## Files in this folder (and what to open)

```
  for-partner/
  ├── README.md                     ← you are here (the whole story, honest)
  ├── scn-001-elif--all-answers.md  ← ★ the actual, unedited answers side by side:
  │                                      Avery · the raw model · Copilot · ChatGPT · Gemini
  │                                      (each with its red-line verdict) — the case is YOURS
  └── scorecard.md                  ← the raw one-page scorecard (same numbers, with all caveats)

  …and in the parent eval folder, if you want to dig:
  ../EVAL-REAL-0701.md              ← the full write-up across ALL SIX of your scenarios
  ../cases/scn-001…006-*.md         ← your six scenarios, exactly as the run received them
  ../office-ai-capture/             ← the exact prompt we pasted + the 3 raw free-AI captures
  ../scenarios/manifest.json        ← the frozen, hash-locked test set (the pre-registration)
```

---

## What would make this publishable — where you can help

1. **Real human ratings.** A handful of real HR leaders / managers rating these answers turns the
   synthetic scorecard into a real result. This is the single unlock.
2. **Attribution.** Which of your cases / sources can we cite publicly, and can we name you as the
   author? For the legally-loaded scenarios (e.g. project-allocation fairness), *who wrote the
   playbook* is exactly what makes it credible rather than a liability.
3. **Keep steering the scenarios.** Harder, more contested cases are where the difference will show —
   the current six are, to two independent judges, "all good," which hides the gap.

— The Avery team
