# PRD Mapping

Use these skeletons when initializing or converting a Trellis-backed Codex native goal. Keep raw user input verbatim.

## `prd.md`

````markdown
# <task title>

## Raw Goal Input

```text
<verbatim user input or existing task request>
```

## Existing Planning Notes

Only include this section when converting an existing task. Preserve useful prior PRD material here before rewriting the goal-facing contract.

## Goal Contract

- Objective: <one concrete final state>
- Scope: <files, directories, subsystem, output artifact, and boundaries>
- Constraints:
  - <constraint>
- Done When:
  1. <verifiable artifact>
  2. <verifiable artifact>
  3. <required for complex/high-risk/code-modifying goals; omit filler for bounded medium goals>
- Stop If:
  1. <mechanically detectable condition plus detection method>
  2. <required for complex/high-risk/code-modifying goals; omit filler for bounded medium goals>
  3. <required for complex/high-risk/code-modifying goals; omit filler for bounded medium goals>
- Token Budget: <number only if user supplied one, otherwise "not specified">
- Project Type: <detected type and evidence>
- Scenario: <scenario or Custom>
- Cadence Hint: <checkpoint-bounded | run-to-completion; include user evidence for run-to-completion>

## Autonomy Charter

### Frozen Invariants

Agent must not weaken, replace, or reinterpret:

- Objective:
- Scope / Out of Scope:
- Constraints:
- Done When / acceptance semantics:
- Stop If:
- User-only decisions:
- Security / credential / legal / payment / production / destructive data / data-integrity boundaries:
- Codex native goal ownership and Trellis task lifecycle ownership:

### Delegated Decisions

When Frozen Invariants stay unchanged, agent may autonomously decide:

- technical approach:
- implementation order:
- file organization:
- checkpoint split/merge/reorder:
- test and verification strategy:
- research path:
- accepted/rejected implementation options:

Every delegated decision must be recorded in the Evidence Chain or Delegated Decision Log.

### Decision Harness

- Low ambiguity: <evidence-only default and record path>
- Medium ambiguity: use `trellis-grill-agents`; record accepted/rejected results in `research/grill-agents-<topic>.md`, `prd.md`, and `implement.md`
- High or user-owned ambiguity: Stop/Block

### Autonomous Research Protocol

- Approved search path: project-approved `smart-search` CLI only; do not substitute native web search or unapproved browsing
- Required evidence fields: source URL, command/evidence path, conclusion, adopt/reject reason, remaining uncertainty
- Evidence priority: project rules and repo evidence before external sources

### Evidence Chain

`implement.md` must record current evidence, accepted decisions, rejected options, overturned assumptions, verification commands/results, remaining uncertainty, and next recovery point.

### Stop/Block

Stop and record a Stop/Block entry when a decision would change Frozen Invariants, require credentials/account/payment/production/destructive/legal authority, choose a private user preference, or depend on unverifiable facts.

## Default Assumptions

- Assumption: <default>
  Evidence: <file, command, spec, or observed convention>
  Why safe: <why this does not expand scope>
  Stop if: <condition that invalidates it>

## Ambiguity Handling

| Topic | Level | Decision | Evidence | Trellis Record |
|---|---|---|---|---|
| <topic> | low/medium/high | <default/grill-agents/Stop-Block> | <evidence> | <prd/design/implement/research path> |

## Acceptance Criteria

- [ ] <user-visible or artifact-visible result>

## Context Manifest Plan

| Action | File | Reason |
|---|---|---|
| implement | `.trellis/spec/.../index.md` | <why implementation needs it, if manifests are used> |
| check | `.trellis/spec/.../quality-guidelines.md` | <why verification needs it, if manifests are used> |

## Out of Scope

- <explicit non-goal>

## Conversion Audit

Only include for in-progress conversion.

- Existing work:
- Verified evidence:
- Unverified work:
- Reconciliation checkpoint:

## Blocked Initialization

Only include if initialization fails. Include the blocked condition, evidence, and next safe action.

## Blocked Codex Native Goal Handoff

Only include when Trellis artifacts are ready but Codex native goal handoff cannot safely happen, such as Plan mode or unavailable `create_goal`.

## Initialization Gate Evidence

- Goal marker: `task.py mark-goal ...` <result or pending reason>
- Done When mapping: <each item maps to checkpoint acceptance or final verification; complex/high-risk/code-modifying goals have at least 3, bounded medium goals have at least 2>
- Stop If detection: <each stop condition has a detection method; complex/high-risk/code-modifying goals have at least 3, bounded medium goals have at least 1>
- Ambiguity handling: <low defaults / grill-agents files / Stop-Block records>
- Context curation: <implement.jsonl/check.jsonl entries or inline equivalent>
- Checkpoint counts: <work/check checkpoint count>
- Native handoff: <create_goal called | blocked reason | not requested for contract-only mode>
- Dirty-state review: <evidence no source code changed during initialization>
- Validation: `task.py validate <task>` <result or reason unavailable>
````

## `design.md`

````markdown
# Technical Design

## Project Detection

- <evidence from files, scripts, specs, or repository layout>

## Relevant Files

- `<path>`: <why it matters>

## Technical Boundary

- <architecture choice, interface boundary, data flow, or constraint>

## Decision Harness

- Low-risk delegated decisions:
- Medium ambiguity requiring `trellis-grill-agents`:
- High-risk or user-owned Stop/Block boundaries:
- Grill-agent records:

## Autonomous Research Protocol

- Search commands or reason search is unnecessary:
- Source URLs:
- Fetched evidence paths:
- Adopted conclusions:
- Rejected conclusions:
- Remaining uncertainty:

## Evidence Chain Design

- Evidence to collect before each checkpoint can be marked done:
- Accepted/rejected decision recording location:
- Overturned-assumption recording location:
- Final verification evidence:

## Verification Commands

- `<command>`: <what it proves>

## Risks

- <risk and mitigation>

## Rollback Notes

- <rollback or recovery route>

## Grill-Agent Notes

- `<research/grill-agents-<topic>.md>`: <summary and accepted execution impact>
````

## `implement.md`

````markdown
# Implementation Checkpoints

## Native Goal Handoff

- Codex Goal Status: <not-created | active | paused | blocked | complete | unavailable>
- Handoff Objective: <compact create_goal summary or blocked reason>
- Next Checkpoint: <checkpoint title/status>
- Verification Policy: <commands/evidence required before completion>

## Checkpoints

### Checkpoint 1: <small independently verifiable action>
- Type: work
- Status: pending
- Acceptance: <how this checkpoint is verified>
- Current Evidence:
- Work Performed:
- Verification Command / Result:
- Remaining Uncertainty:
- Next Recovery Point:

### Checkpoint 2: <small independently verifiable action>
- Type: work
- Status: pending
- Acceptance: <how this checkpoint is verified>
- Current Evidence:
- Work Performed:
- Verification Command / Result:
- Remaining Uncertainty:
- Next Recovery Point:

### Checkpoint 3: Comprehensive Check
- Type: check
- Status: pending
- Acceptance: scope, tests, typecheck/build, UI/UX if relevant, security, data consistency, docs, rollback, and remaining risks are reviewed.
- Current Evidence:
- Work Performed:
- Verification Command / Result:
- Remaining Uncertainty:
- Next Recovery Point:

## Evidence Chain

| Evidence | Supports | Status | Source / Command | Remaining Uncertainty |
|---|---|---|---|---|
| <evidence> | <contract item or checkpoint> | current/overturned/rejected | <path, URL, or command> | <uncertainty> |

## Delegated Decision Log

| Decision | Authority | Evidence | Result | Artifact |
|---|---|---|---|---|
| <decision> | Autonomy Charter / trellis-grill-agents / user | <source/test/grill evidence> | accepted/rejected/overturned | <prd/design/implement/research path> |

## Stop/Block Records

Only include when high-risk or user-owned ambiguity blocks continuation.

- Blocker Type:
- Triggering Evidence:
- Blocked Decision:
- Why Not Delegated:
- Required Human Answer:
- Recovery Checkpoint:
- Native Goal Action: `none | ask-user | update_goal(blocked)`

## Final Evidence

- Done When mapping:
- Verification commands/results:
- Remaining risks:
- Stop If review:
- Native goal final action:

## Progress Log

- <timestamp/session>: <summary>
````

## Checkpoint Status Values

Use plain text status values only:

- `pending`
- `in_progress`
- `blocked`
- `done`

Do not add new `task.json.status` values for checkpoints.
