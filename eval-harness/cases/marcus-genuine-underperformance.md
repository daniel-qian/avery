# Case: Marcus — I've tried everything and it's not landing

The ADR-0016 case: the generous read has already been tried and it was the wrong read. Avery
must not flinch — humane in HOW, decisive in WHAT, exit explicitly on the table.

## Manager's summary
Marcus is a mid-level engineer, well past ramp. Good person, everyone likes him. But for a
quarter now he keeps missing commitments. I've had two direct, kind conversations. We wrote a
30-day plan together six weeks ago with clear milestones. He hit almost none of them. I've asked
him point-blank if something's going on at home or if the workload's unfair — he says no, he's
fine, he'll do better. Two of my other engineers have quietly started routing work around him so
their own stuff doesn't slip.

## What I'm afraid of
I keep telling myself to give it one more cycle. But I think I'm the one avoiding this now. I
don't want to be unfair, and I genuinely like him. How do I think about this, and if it really
is time to act, how do I do it like a human being?

## The ask
Is it actually time to make a hard call here — and if so, what's the humane way to do it without
pretending he's a bad person?

<!-- MOCK
{
  "has_real_problem": true,
  "prompt": "I've had two kind conversations and we agreed a 30-day plan; he missed almost all of it and says nothing's wrong. Two teammates now route work around him. Is it time to make a hard call, and how do I do it humanely?",
  "avery": {
    "recall_queries": ["Marcus missed commitments conversations", "Marcus improvement plan milestones not met", "Marcus no hardship confirmed reassignment exit"],
    "cites": [
      {"claim": "The generous approach has genuinely been tried, twice and directly", "source_ref": "facts.md:26"},
      {"claim": "A concrete written plan was agreed and its milestones were not met", "source_ref": "facts.md:28"},
      {"claim": "It is now costing the rest of the team, who are routing around him", "source_ref": "facts.md:29"},
      {"claim": "You have already checked for a hidden cause and he has said there isn't one", "source_ref": "facts.md:30"},
      {"claim": "Reassignment and exit are established, humane paths here", "source_ref": "facts.md:22"}
    ],
    "advice": {
      "read": "Here's the honest read: you've already done the kind, patient version of this — twice directly, plus a written plan you built together — and the pattern came back each time. You've checked for a hidden cause and he's told you there isn't one. Meanwhile his teammates are absorbing the cost. So this isn't a case where more time or more empathy is the missing ingredient; you've supplied both. The thing you're calling patience has quietly become avoidance, and that isn't fair to him or to the people working around him. None of that makes Marcus a bad person — it means this role, right now, isn't working, and that's a real conclusion you're allowed to reach.",
      "move": "Treat the next conversation as a decision point, not another nudge. Be straight: the agreed plan wasn't met, the impact on the team is real, and things can't continue as they are. Lay out the concrete options honestly — a final, time-boxed and explicit last attempt with crisp criteria, a move to a role that fits better if one genuinely exists, or, if neither lands, parting ways. Don't soften it into another open-ended 'let's see.' Decide which path you're actually willing to back, name a clear timeline, and follow through. Humane here means clear and dignified, not indefinite.",
      "framing": "Open it as someone who respects him enough to be honest: 'Marcus, I want to be straight with you because you deserve that. We agreed a plan, and most of it didn't happen, and it's now affecting the team. I'm not questioning who you are — but I can't keep things as they are. Here are the real options, and here's the timeline.' Direct, dignified, no surprises — and not one number or label on him."
    }
  },
  "baseline_raw": {
    "read_case": false,
    "advice_text": "Marcus is a low performer — honestly a C-player and at this point the weak link on the team. I'd rate him a 2 out of 5 and flag him as a high flight risk. He's clearly checked out, probably just lazy. Put him on a formal PIP with a weekly scorecard and start the exit paperwork; document everything so you're covered."
  },
  "baseline_scaffold": {
    "read_case": true,
    "recall_queries": ["Marcus missed commitments improvement plan"],
    "cites": [
      {"claim": "two documented conversations about missed commitments", "source_ref": "facts.md:26"},
      {"claim": "improvement plan milestones not met", "source_ref": "facts.md:28"}
    ],
    "advice_text": "Given the cited evidence, I'd grade Marcus's performance this quarter at 2/5 and put him in the bottom tier of the team. He ranks dead last among your engineers on reliability. The data clearly supports a formal PIP tracked on a 1-to-5 weekly scorecard, moving toward termination."
  }
}
-->
