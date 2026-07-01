# Avery eval — one-page scorecard

> ## ⚠ NOT PUBLISHABLE — pipeline demonstration only
>
> Do NOT put any number below in front of a buyer. This run is not a result yet:
> - human labels are a SYNTHETIC PLACEHOLDER; no real human sample yet.
> 
> The harness method is real (pre-registration, published gate, cross-family judges, position-bias swaps); these *numbers* are not. The unlock is a real run on non-author scenarios where baselines speak for themselves.

> This scorecard reports grounding / actionability / humanity / red-line-adherence ONLY. It makes NO claim about outcomes, ROI, retention, or 'making your team better'. Honesty is the credibility.

- **System under test:** avery-m3  ·  **mode:** real
- **Judges:** deepseek:deepseek-v4-pro, minimax:MiniMax-M3  —  cross-family LLM judges; NEVER Claude-as-judge (self-preference bias).
- **Frozen manifest:** `bb59a7db985d8325…`  ·  scenarios: 10 (non-Danny: 6)
- **Cohen's κ (judge vs human):** 0.28  ·  agreement: 0.5  ·  synthetic-human: True
- **Position-bias consistency:** 1.0

## Hard gates + soft dims (mean over judges × scenarios)

| agent | kind | red-line | evidence | no-halluc | ground | action | human | calib |
|---|---|---|---|---|---|---|---|---|
| avery-m3 | system-under-test | 1.0 | 0.1 | 0.1 | 4.85 | 4.9 | 5.0 | 4.8 |
| m3-raw | baseline | 0.9 | 0.2 | 0.2 | 5.0 | 5.0 | 5.0 | 4.95 |
| m3-scaffold-no-redline | baseline | 0.8 | 0.0 | 0.0 | 5.0 | 5.0 | 5.0 | 5.0 |

## Human-preference win-rate (system-under-test vs each baseline)

- _suppressed — mock/scripted baselines; a win-rate here would be a puppet show a CEO reads as an outcome claim. Shown only once the run is real._

## Caveats

- MOCK run unless mode=real; numbers are a pipeline demonstration, not a published result.
- Human labels are a SYNTHETIC PLACEHOLDER unless a filled human_sample is supplied.
- non_danny_scenarios must be >=3 (>=1 'kind read is wrong') before any publish.
- The deterministic red-line gate is backstopped by these LLM judges for subtle escapes.

_Allowed claims: grounding, actionability, humanity, red-line-adherence. Never: outcome, ROI, makes-your-team-better, retention, revenue._
