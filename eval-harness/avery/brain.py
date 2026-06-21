"""The pluggable 'brain'. The loop is brain-agnostic; only this file knows about a provider.

  RealBrain  -> claude-opus-4-8 via anthropic-sdk-python. The model under test as "Avery".
  MockBrain  -> deterministic, no network. Follows a per-case scripted plan so the whole
                pipeline runs green AFK with no API key (011a/b/c all require "green on mock").

A Brain takes (system, conversation, tools) and returns a BrainResponse: either tool calls to
dispatch, or a final text answer. The conversation uses neutral Anthropic-shaped blocks; each
brain translates as needed (MockBrain ignores them and walks its plan).
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Any, Protocol

from .tools import Advice

DEFAULT_MODEL = "claude-opus-4-8"


@dataclass
class ToolCall:
    id: str
    name: str
    input: dict[str, Any]


@dataclass
class BrainResponse:
    tool_calls: list[ToolCall] = field(default_factory=list)
    text: str | None = None  # set when the brain is giving its final answer (no tool calls)

    @property
    def is_final(self) -> bool:
        return not self.tool_calls


class Brain(Protocol):
    name: str
    def respond(self, system: str, conversation: list[dict], tools: list[dict]) -> BrainResponse: ...


# --- MockBrain ---------------------------------------------------------------------------------

@dataclass
class _Step:
    tool: ToolCall | None = None  # a tool call to make
    final: str | None = None      # OR a final text answer


class MockBrain:
    """Walks a precomputed step plan. One step per respond() call."""

    def __init__(self, name: str, plan: list[_Step]):
        self.name = name
        self._plan = plan
        self._i = 0

    def respond(self, system: str, conversation: list[dict], tools: list[dict]) -> BrainResponse:
        if self._i >= len(self._plan):
            # Plan exhausted without an explicit final — emit an empty final so the loop stops.
            return BrainResponse(text="")
        step = self._plan[self._i]
        self._i += 1
        if step.final is not None:
            return BrainResponse(text=step.final)
        return BrainResponse(tool_calls=[step.tool])


def _tc(idx: int, name: str, args: dict) -> ToolCall:
    return ToolCall(id=f"mock-{name}-{idx}", name=name, input=args)


def make_mock_brain(case, persona: str) -> MockBrain:
    """Build the deterministic plan for a persona from the case's MOCK block.

    persona: 'avery' (full chain, clean) | 'baseline_raw' | 'baseline_scaffold'.
    """
    mock = case.mock or {}
    plan: list[_Step] = []
    n = 0

    if persona == "avery":
        spec = mock.get("avery", {})
        plan.append(_Step(tool=_tc(n, "read_case", {"case_id": case.case_id}))); n += 1
        for q in spec.get("recall_queries", []):
            plan.append(_Step(tool=_tc(n, "recall", {"query": q}))); n += 1
        for c in spec.get("cites", []):
            plan.append(_Step(tool=_tc(n, "cite",
                        {"claim": c["claim"], "source_ref": c["source_ref"]}))); n += 1
        adv = spec.get("advice", {})
        plan.append(_Step(tool=_tc(n, "draft_advice", {
            "read": adv.get("read", ""), "move": adv.get("move", ""),
            "framing": adv.get("framing", "")}))); n += 1
        final = Advice(adv.get("read", ""), adv.get("move", ""), adv.get("framing", "")).render()
        plan.append(_Step(final=final))
        return MockBrain("avery-opus(mock)", plan)

    # baselines
    spec = mock.get(persona, {})
    if spec.get("read_case", True):
        plan.append(_Step(tool=_tc(n, "read_case", {"case_id": case.case_id}))); n += 1
    for q in spec.get("recall_queries", []):
        plan.append(_Step(tool=_tc(n, "recall", {"query": q}))); n += 1
    for c in spec.get("cites", []):
        plan.append(_Step(tool=_tc(n, "cite",
                    {"claim": c["claim"], "source_ref": c["source_ref"]}))); n += 1
    plan.append(_Step(final=spec.get("advice_text", "")))
    return MockBrain(f"{persona}(mock)", plan)


# --- RealBrain (claude-opus-4-8) --------------------------------------------------------------

class RealBrain:
    """Calls claude-opus-4-8 through anthropic-sdk-python. Only imported/instantiated when a
    real run is requested; mock runs never touch the SDK or the network."""

    def __init__(self, name: str = "avery-opus", model: str = DEFAULT_MODEL,
                 max_tokens: int = 2048):
        try:
            import anthropic  # noqa: F401  (deferred import — optional dep)
        except ImportError as e:  # pragma: no cover - environment dependent
            raise RuntimeError(
                "anthropic SDK not installed. `pip install anthropic` and set ANTHROPIC_API_KEY, "
                "or run in mock mode (the default).") from e
        if not os.environ.get("ANTHROPIC_API_KEY"):  # pragma: no cover
            raise RuntimeError("ANTHROPIC_API_KEY not set; cannot run RealBrain.")
        from anthropic import Anthropic
        self._client = Anthropic()
        self.name = name
        self._model = model
        self._max_tokens = max_tokens

    def respond(self, system: str, conversation: list[dict], tools: list[dict]) -> BrainResponse:  # pragma: no cover - needs network
        resp = self._client.messages.create(
            model=self._model, max_tokens=self._max_tokens, system=system,
            messages=conversation, tools=tools)
        tool_calls, text_parts = [], []
        for block in resp.content:
            if block.type == "tool_use":
                tool_calls.append(ToolCall(id=block.id, name=block.name, input=dict(block.input)))
            elif block.type == "text":
                text_parts.append(block.text)
        text = "".join(text_parts) if text_parts else None
        if tool_calls:
            return BrainResponse(tool_calls=tool_calls, text=text)
        return BrainResponse(text=text or "")
