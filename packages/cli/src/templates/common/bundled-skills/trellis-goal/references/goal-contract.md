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
10. **Autonomy Charter**: the delegated-autonomy contract for active execution, including `Frozen Invariants`, autonomous decisions, `Decision Harness`, `Autonomous Research Protocol`, `Evidence Chain`, and `Stop/Block` boundary.

## Autonomy Charter

The Autonomy Charter is the load-bearing difference between a Trellis-backed goal and an ordinary Trellis task. It authorizes the agent to keep working without asking the user when the objective remains unchanged, while making the non-delegable boundaries explicit.

### Frozen Invariants

The agent must not weaken, replace, or reinterpret:

- `Objective`
- `Scope` and `Out of Scope`
- `Constraints`
- `Done When` and acceptance semantics
- `Stop If` conditions
- user-only decisions
- security, credential, legal, payment, production, destructive data, and data-integrity boundaries
- Codex native goal ownership and Trellis task lifecycle ownership

If Frozen Invariants conflict, use repository evidence, approved research evidence, or `trellis-grill-agents` only when the conflict can be resolved without changing the goal. If resolving the conflict would alter scope, acceptance, user preference, or a safety boundary, use Stop/Block.

### Delegated Decisions

When Frozen Invariants stay unchanged, the agent may decide and execute:

- technical approach and implementation strategy
- file organization and local code structure
- checkpoint ordering, splitting, or merging
- test and verification strategy
- autonomous research direction
- non-destructive dependency or tool evaluation
- accepted/rejected implementation options

These decisions must be recorded in the Evidence Chain or Delegated Decision Log. Chat-only reasoning is not durable evidence.

### Decision Harness

Use the Decision Harness to route ambiguity:

- low risk: decide from repository/spec/test evidence and record the default assumption
- medium ambiguity: use `trellis-grill-agents` for unattended pressure testing, then write accepted/rejected decisions back to Trellis artifacts
- high risk or user-owned boundary: Stop/Block instead of proxy-answering

`trellis-grill-agents` is a decision-pressure tool, not an execution controller and not a replacement for a real user decision.

### Autonomous Research Protocol

When external or current evidence matters, use the project-approved search path. In Codex projects that require `smart-search`, use only `smart-search` CLI commands such as `smart-search search`, `smart-search exa-search`, `smart-search fetch`, `smart-search map`, or `smart-search deep`.

Record every adopted or rejected external conclusion with:

- source URL
- command or fetched evidence path
- conclusion
- adopted/rejected reason
- remaining uncertainty

Repository source, project rules, specs, tests, and runnable command results outrank external sources.

### Evidence Chain

`implement.md` must show how the goal progressed, not only which checkpoints are marked done. Record current evidence, accepted decisions, rejected options, overturned assumptions, verification commands/results, remaining uncertainty, and next recovery point.

### Stop/Block

Stop the affected path and record a Stop/Block entry when the next decision would:

- change Objective, Scope, Constraints, Done When, Stop If, or Out of Scope
- require credentials, accounts, payments, production operations, destructive data changes, legal/compliance judgment, or external authority
- choose between incompatible user-visible outcomes or private preferences
- rely on facts that cannot be verified from repository evidence, project rules, approved research sources, or tests

Trellis records the blocker first; Codex native `update_goal(status="blocked")` is used only under the native goal status policy.

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
- High-risk, scope-changing, credential/production/legal/destructive, or user-owned ambiguity is recorded as Stop/Block.
- The Autonomy Charter defines Frozen Invariants and does not authorize changing them.
- Medium ambiguity and nontrivial decisions route through the Decision Harness before execution continues.
- External or current claims follow the Autonomous Research Protocol and record source URL plus evidence path.
- Evidence Chain fields are present in `implement.md` so continuation can recover from artifacts, not chat memory.
- The compact Codex native handoff can fit under the native objective limit by pointing to Trellis artifacts instead of pasting them.

If the gate fails during initialization, keep the task unstarted or unchanged, record `Blocked Initialization` or `Blocked Codex Native Goal Handoff`, and do not call `create_goal`.

## Field Mapping

| Contract Field | Trellis Location |
|---|---|
| Raw request | `prd.md` `## Raw Goal Input` |
| Objective / Scope / Constraints / Done When / Stop If / Token Budget / Project Type / Scenario / Cadence Hint | `prd.md` `## Goal Contract` |
| Autonomy Charter / Frozen Invariants / delegated decisions / user-only decisions | `prd.md` `## Autonomy Charter` |
| Default assumptions | `prd.md` `## Default Assumptions` |
| User-visible acceptance | `prd.md` `## Acceptance Criteria` |
| Out-of-scope boundaries | `prd.md` `## Out of Scope` |
| Decision Harness and Autonomous Research Protocol details | `design.md` |
| Technical design, evidence, and commands | `design.md` |
| Native-goal checkpoints | `implement.md` `## Checkpoints` |
| Evidence Chain, Delegated Decision Log, Stop/Block Record | `implement.md` |
| Context manifests | `implement.jsonl`, `check.jsonl`, and `prd.md` or `design.md` when inline-only |
| Ambiguity review | `prd.md`, `implement.md`, and `research/grill-agents-<topic>.md` |

The Goal Contract is ready to bridge only when `implement.md` contains independently verifiable checkpoints derived from it and the compact native handoff names those artifacts.
