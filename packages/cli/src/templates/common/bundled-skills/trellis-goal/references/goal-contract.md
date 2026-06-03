# Goal Contract

The Goal Contract turns a loose Trellis-backed goal request into a bounded, verifiable Codex native goal. It lives in `prd.md`; `design.md` records the technical boundary; `implement.md` records checkpoints and evidence for native-goal continuation.

Use a Trellis Goal only when the work is bigger than one normal prompt, has a durable objective, and can be checked against evidence over multiple turns. A normal Trellis task or normal Codex prompt is better for one-off edits, simple explanations, short reviews, focused debugging, lightweight implementation requests, or any request where the user expects one answer and then a stop.

Do not create a Trellis Goal for a vague finish line or a loose backlog of unrelated work. First draft or critique a bounded Goal Contract when the user asks for goal text or Goal Mode; otherwise keep the work in ordinary Trellis flow.

## Required Fields

Every execution goal must contain:

1. **Objective**: one concrete sentence describing the final state.
2. **Scope**: files, subsystem, feature area, output artifact, and explicit boundaries.
3. **Constraints**: what must not change, compatibility rules, project instructions, and safety limits.
4. **Done When**: verifiable artifacts, exact commands, tests, file paths, or measurable outputs.
5. **Stop If**: mechanically detectable conditions that force a paused handoff, blocked report, or escalation.
6. **Token Budget**: a number only when the user provides one; otherwise `not specified`.
7. **Project Type**: detected type plus evidence.
8. **Scenario**: selected scenario from `scenarios.md`, or `Custom`.
9. **Cadence Hint**: `checkpoint-bounded` or `run-to-completion`, with user evidence for run-to-completion.

## Quality Gate

Before calling `create_goal`, verify:

- The raw user request is preserved verbatim.
- Objective has one concrete final state.
- Scope is smaller than "the whole repository" unless the goal is read-only or the output is tightly bounded.
- Complex, high-risk, long-running, repo-wide, or code-modifying goals have at least three `Done When` items and at least three `Stop If` items.
- Bounded medium goals have at least two `Done When` items and at least one `Stop If` item.
- Lightweight goal-drafting requests do not contain filler criteria; either keep the contract concise or record why a normal prompt/Trellis task is the better fit.
- Each `Done When` item maps to one or more checkpoint acceptance checks or final verification items.
- Each `Stop If` item includes a detection method.
- Vague words such as "improve", "optimize", "all", "everything", and "clean up" are converted into bounded actions.
- Existing tests must not be skipped, weakened, or rewritten to hide a regression.
- Every default assumption records evidence, why it is safe enough, and when it stops being safe.
- Medium ambiguity has a `trellis-grill-agents` record or has been reclassified.
- High-risk or scope-changing ambiguity is recorded as `BLOCKED`.
- The compact Codex native handoff can fit under the native objective limit by pointing to Trellis artifacts instead of pasting them.

If the gate fails during initialization, keep the task unstarted or unchanged, record `Blocked Initialization` or `Blocked Codex Native Goal Handoff`, and do not call `create_goal`.

## Field Mapping

| Contract Field | Trellis Location |
|---|---|
| Raw request | `prd.md` `## Raw Goal Input` |
| Objective / Scope / Constraints / Done When / Stop If / Token Budget / Project Type / Scenario / Cadence Hint | `prd.md` `## Goal Contract` |
| Default assumptions | `prd.md` `## Default Assumptions` |
| User-visible acceptance | `prd.md` `## Acceptance Criteria` |
| Out-of-scope boundaries | `prd.md` `## Out of Scope` |
| Technical design, evidence, and commands | `design.md` |
| Native-goal checkpoints | `implement.md` `## Checkpoints` |
| Context manifests | `implement.jsonl`, `check.jsonl`, and `prd.md` or `design.md` when inline-only |
| Ambiguity review | `prd.md`, `implement.md`, and `research/grill-agents-<topic>.md` |

The Goal Contract is ready to bridge only when `implement.md` contains independently verifiable checkpoints derived from it and the compact native handoff names those artifacts.
