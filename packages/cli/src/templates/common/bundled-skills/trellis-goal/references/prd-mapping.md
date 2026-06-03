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

## Default Assumptions

- Assumption: <default>
  Evidence: <file, command, spec, or observed convention>
  Why safe: <why this does not expand scope>
  Stop if: <condition that invalidates it>

## Ambiguity Handling

| Topic | Level | Decision | Evidence | Trellis Record |
|---|---|---|---|---|
| <topic> | low/medium/high | <default/grill-agents/BLOCKED> | <evidence> | <prd/design/implement/research path> |

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
- Ambiguity handling: <low defaults / grill-agents files / blocked>
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
- Work Performed:
- Verification Evidence:
- Remaining Risk:
- Next Step:

### Checkpoint 2: <small independently verifiable action>
- Type: work
- Status: pending
- Acceptance: <how this checkpoint is verified>
- Work Performed:
- Verification Evidence:
- Remaining Risk:
- Next Step:

### Checkpoint 3: Comprehensive Check
- Type: check
- Status: pending
- Acceptance: scope, tests, typecheck/build, UI/UX if relevant, security, data consistency, docs, rollback, and remaining risks are reviewed.
- Work Performed:
- Verification Evidence:
- Remaining Risk:
- Next Step:

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
