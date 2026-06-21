"""The agent loop: think -> tool-call -> observe, until grounded advice.

The same commodity skeleton as Codex / Claude Code / Hermes. What makes it Avery and not a
coding agent is enforced HERE, in code, not in the prompt:

  * the CITE gate    — `draft_advice` (tool-side) refuses with zero cites, AND for Avery the
                       loop refuses to accept a final answer that didn't go through draft_advice.
  * the RED-LINE gate — every final answer is validated; for Avery a crossing is pushed back and
                       retried; for baselines the crossing is recorded verbatim (the eval result).

Both gates are applied identically in spirit to all agents — Avery is *enforced* to obey them,
baselines are *measured* against them — and the validator itself is the same code for everyone.
"""
from __future__ import annotations

from dataclasses import asdict
from pathlib import Path

from . import redline
from .brain import Brain
from .cases import Case
from .tools import ToolContext, ToolError, cited_snippets, dispatch

MAX_ITERS = 12


def run_loop(brain: Brain, case: Case, system_prompt: str, *, agent_name: str, scaffold: str,
             memory_dir: Path, enforce_chain: bool, enforce_redline: bool,
             max_iters: int = MAX_ITERS) -> dict:
    """Run one (agent, case) to completion and return a JSON-able transcript.

    enforce_chain   — require the answer to come through draft_advice (true for Avery).
    enforce_redline — push back + retry on a red-line crossing (true for Avery). Baselines are
                      only measured, never corrected.
    """
    ctx = ToolContext(memory_dir=Path(memory_dir), case_path=case.path, case_id=case.case_id)
    conversation: list[dict] = [{
        "role": "user",
        "content": [{"type": "text",
                     "text": f"Scenario id: {case.case_id}\n\nThe leader asks:\n{case.prompt}"}],
    }]

    steps: list[dict] = []
    nudged_chain = nudged_redline = False
    stop_reason = "max_iters"

    for _ in range(max_iters):
        resp = brain.respond(system_prompt, conversation, _anthropic_tools())

        if resp.tool_calls:
            assistant_blocks: list[dict] = []
            if resp.text:
                assistant_blocks.append({"type": "text", "text": resp.text})
            for tc in resp.tool_calls:
                assistant_blocks.append({"type": "tool_use", "id": tc.id,
                                         "name": tc.name, "input": tc.input})
            conversation.append({"role": "assistant", "content": assistant_blocks})

            result_blocks: list[dict] = []
            for tc in resp.tool_calls:
                try:
                    obs, is_err = dispatch(tc.name, tc.input, ctx), False
                except ToolError as e:
                    obs, is_err = str(e), True
                steps.append({"type": "tool_call", "name": tc.name, "input": tc.input,
                              "observation": obs, "is_error": is_err})
                result_blocks.append({"type": "tool_result", "tool_use_id": tc.id,
                                      "content": obs, "is_error": is_err})
            conversation.append({"role": "user", "content": result_blocks})
            continue

        # --- a final answer arrived: run the gates --------------------------------------------
        final_text = resp.text or (ctx.advice.render() if ctx.advice else "")

        if enforce_chain and ctx.advice is None and not nudged_chain:
            nudged_chain = True
            conversation.append(_nudge("Deliver your answer by calling draft_advice(read, move, "
                                       "framing) — and cite() your evidence first. Do not answer "
                                       "in free text."))
            continue

        rl = redline.validate(final_text, cited_snippets(ctx))
        if enforce_redline and not rl.passed and not nudged_redline:
            nudged_redline = True
            crossed = "; ".join(f"{v.rule_id} («{v.snippet}»)" for v in rl.violations)
            conversation.append(_nudge(
                "You crossed the red line: " + crossed + ". Never put a number, score, rank, or "
                "label on a person. Describe the WORK and recommend the call instead, then "
                "re-issue draft_advice."))
            ctx.advice = None
            continue

        steps.append({"type": "final", "text": final_text})
        stop_reason = "ok"
        break

    rl = redline.validate(
        ctx.advice.render() if ctx.advice else _last_final(steps), cited_snippets(ctx))

    return {
        "case_id": case.case_id,
        "agent": agent_name,
        "scaffold": scaffold,
        "prompt": case.prompt,
        "system_prompt_chars": len(system_prompt),
        "steps": steps,
        "cites": [asdict(c) for c in ctx.cites],
        "used_draft_advice": ctx.advice is not None,
        "advice": asdict(ctx.advice) if ctx.advice else None,
        "final_text": _last_final(steps),
        "redline": {
            "passed": rl.passed,
            "summary": rl.summary(),
            "violations": [asdict(v) for v in rl.violations],
            "secondary": [asdict(v) for v in rl.secondary],
        },
        "gates": {
            "cite_gate_passed": any(c.resolved for c in ctx.cites),
            "artifact_gate_passed": ctx.advice is not None,
        },
        "stop_reason": stop_reason,
    }


def _anthropic_tools() -> list[dict]:
    from .tools import TOOL_SCHEMAS
    return TOOL_SCHEMAS


def _nudge(text: str) -> dict:
    return {"role": "user", "content": [{"type": "text", "text": text}]}


def _last_final(steps: list[dict]) -> str:
    for s in reversed(steps):
        if s.get("type") == "final":
            return s["text"]
    return ""
