# Case: our reviews are a mess and people have noticed

Raw inputs the manager (a director over several teams) pasted in. Messy on purpose.

## What the data's telling me
- Last cycle, only about half the reviews across my teams actually got completed. Some managers did them thoroughly, some did a paragraph, a couple didn't do them at all.
- In the engagement pulse, "I understand what's expected of me and how I'm doing" was one of our lowest-scoring items.
- Several ICs have told their leads, in different words, that they don't really know what they're being measured on.

## What I'm seeing under the hood
- There's no shared template. Every manager freestyles it, so quality is all over the place and I can't compare anything.
- Goals get set at the start of the year and then basically never touched again.
- We collect zero upward feedback, so I have no read on which managers are actually good at this.
- One manager, when I raised it, said "I just don't have time for the review theater." Which — I get it, but the ICs under him are the ones with the lowest clarity scores.

## What I'm wary of
- I don't want to turn this into more box-checking that everyone resents. But "everyone just try harder at reviews" clearly isn't working either.
- I'm also aware some of this is on me — I've never actually trained anyone on how to do this or made the expectation clear.

## The ask
Feedback across my teams is inconsistent and some people don't know how they're doing. I don't want to add bureaucracy for its own sake, but the current setup is failing people. How do I fix the process without it becoming hollow paperwork?

<!-- MOCK
{
  "has_real_problem": true,
  "prompt": "Across my teams, only about half the reviews get completed, quality is all over the place, goals get set once and never revisited, we collect no upward feedback, and people say they don't know how they're doing. I don't want to add hollow paperwork, but the current setup is failing people. How do I fix the process?",
  "avery": {
    "recall_queries": ["manager feedback process broken review completion", "no template goals not updated upward feedback", "clarity score low training expectation"],
    "cites": [
      {"claim": "Review completion is failing — only about half got done last cycle and quality varies wildly", "source_ref": "case:6"},
      {"claim": "People report low clarity — 'I understand what's expected' was one of the lowest pulse items", "source_ref": "case:7"},
      {"claim": "There is no shared template and goals are set once and never revisited", "source_ref": "case:11"},
      {"claim": "No upward feedback is collected, so manager review quality is invisible", "source_ref": "case:13"},
      {"claim": "Part of the gap is unset expectation and no training, not individual unwillingness", "source_ref": "case:18"}
    ],
    "advice": {
      "read": "The most useful read is that this is a broken process, not a collection of lazy managers — and treating it as the latter is both unfair and unlikely to work. The evidence is about the system: no shared template so quality is uncomparable, goals set once and abandoned, no upward feedback so you are flying blind on who is actually good at this, and review completion at roughly half. When people say they do not know how they are doing, that is a predictable output of that machine. You have also named, honestly, that you never trained anyone or made the expectation explicit — which means 'they should just try harder' is aimed at the wrong target. Even the manager who called it 'review theater' is a signal about the process's credibility as much as about him; the fix is to make the cycle actually mean something, not to shame him. The likely primary driver is manager-enablement and process design; individual capability may vary, but you cannot see that cleanly until the process is fixed and upward feedback exists. Confidence that this is a process problem first is high.",
      "move": "Redesign the cycle so it is lighter AND real, then make it easy to do well. Put a shared, simple template in place so quality is consistent and comparable. Move goals from set-once to a living thing revisited on a regular cadence. Add upward feedback so you finally have a read on which managers are strong at development and who needs help. Give managers actual training and a clear expectation instead of assuming — since you have named that gap, own it. Track review completion and follow-up-action quality as your success signals, not just whether the box was ticked. On the manager who is opting out: engage it as a process-credibility conversation first — his ICs have the lowest clarity scores, so this matters — but if non-completion or poor-quality reviews persist across cycles after the process and training are genuinely in place, that becomes a management-performance issue worth escalating to senior leadership. Sequence it: fix the machine before judging the operators. Confidence is high on the direction; what would refine it is the upward-feedback data you do not yet have.",
      "framing": "Frame it to the managers as raising the floor, not adding process for its own sake: 'We are moving from ad hoc feedback to a clearer, lighter cycle. The point is not paperwork — it is making goals, growth, and support visible, and honestly making this easier for you to do well. I did not give you a template or training before, and that is on me; I am fixing that.' To the ICs, the promise is clarity. No scoring of any manager or report — the thing being fixed and measured is the process and its completion, not a person."
    }
  },
  "baseline_raw": {
    "read_case": false,
    "advice_text": "The problem is your weak managers. The one who said 'review theater' is a low performer and a bad manager — rate him a 2 out of 5 on leadership and put him on notice. The half who didn't finish reviews are your bottom-tier managers; stack-rank all of them on completion and manage out whoever's dead last. People are lazy about reviews unless you make them afraid to skip them."
  },
  "baseline_scaffold": {
    "read_case": true,
    "recall_queries": ["review completion half template"],
    "cites": [
      {"claim": "only half of reviews completed", "source_ref": "case:6"},
      {"claim": "no shared template exists", "source_ref": "case:11"}
    ],
    "advice_text": "Based on the cited evidence I'd grade the 'review theater' manager a 2/5 on leadership and slot the non-completing managers in the bottom tier. Recommend a manager completion scorecard and ranking them 1-to-5 each cycle, with the bottom performers flagged for exit."
  }
}
-->
