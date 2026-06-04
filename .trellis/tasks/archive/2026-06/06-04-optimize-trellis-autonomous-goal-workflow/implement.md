# Implementation Checkpoints

## Planning Status

- Task Status: `in_progress`
- Implementation Approval: approved by user on 2026-06-04
- Grill Gate: `trellis-grill-agents completed; required revisions written back; pending final planning check and user review`
- Architecture Shaping: required; see `research/architecture-shaping.md`
- Verification Policy: implementation must preserve existing Trellis lifecycle boundaries and include focused tests for changed template/runtime contracts.

## Implementation Order

1. Read relevant specs and task artifacts.
2. Modify canonical templates under `packages/cli/src/templates/**`.
3. Mirror only necessary local `.agents` / `.trellis` generated instances if current-repo behavior must match immediately.
4. Add or update tests for load-bearing behavior and negative boundaries.
5. Run focused tests, then lint/typecheck/build checks as applicable.
6. Review diff for no second lifecycle, no hidden fallback, no scope drift.

## Checkpoints

### Checkpoint 1: Strengthen Trellis Goal contract references
- Type: work
- Status: done
- Canonical Target: `packages/cli/src/templates/common/bundled-skills/trellis-goal/**`
- Optional Local Mirror: project `.agents/skills/trellis-goal/**` only if needed for immediate current-repo behavior.
- Acceptance: `trellis-goal` references define `Autonomy Charter`, `Decision Harness`, `Autonomous Research Protocol`, `Evidence Chain`, `Frozen Invariants`, and Stop/Block boundaries without adding a new lifecycle or local runner.
- Current Evidence: `prd.md`, `design.md`, `research/grill-agents-autonomous-goal-planning.md`, and source template review identified `trellis-goal` references as the canonical shipped protocol source.
- Work Performed: Updated `trellis-goal/SKILL.md`, `goal-contract.md`, `ambiguity-handling.md`, and `trellis-goal-protocol.md` with delegated-autonomy protocol, Frozen Invariants, Decision Harness, Autonomous Research Protocol, Evidence Chain, and Stop/Block boundaries.
- Verification Command / Result: `pnpm test -- test/templates/trellis-goal-autonomy.test.ts test/templates/trellis.test.ts test/scripts/task-goal.integration.test.ts` passed 31 tests.
- Remaining Uncertainty: Current generated `.agents/skills/trellis-goal/**` mirror was not synced to avoid broad local generated-file churn; shipped templates are the source of truth.
- Next Recovery Point: If immediate current-repo skill behavior is required, mirror only the canonical `trellis-goal` changes into `.agents/skills/trellis-goal/**` in a separate focused pass.

### Checkpoint 2: Update workflow routing and native handoff guidance
- Type: work
- Status: done
- Canonical Target: `packages/cli/src/templates/trellis/workflow.md` and `packages/cli/src/templates/common/bundled-skills/trellis-goal/SKILL.md`
- Optional Local Mirror: `.trellis/workflow.md` only if this repo needs immediate breadcrumb behavior.
- Acceptance: active goal guidance clearly authorizes delegated autonomy within the Goal Contract, instructs autonomous research/grill/evidence update for nontrivial choices, and still points to Codex native goal ownership.
- Current Evidence: Workflow-state contract says breadcrumb body lives in `workflow.md`; tests assert the marketplace native workflow mirror matches the bundled workflow.
- Work Performed: Updated `packages/cli/src/templates/trellis/workflow.md` in both active goal breadcrumb variants to continue autonomously through approved research, `trellis-grill-agents`, delegated decisions, verification, and Evidence Chain updates when Frozen Invariants remain unchanged. Synchronized `marketplace/workflows/native/workflow.md` to the bundled workflow.
- Verification Command / Result: `pnpm test -- test/templates/trellis-goal-autonomy.test.ts test/templates/trellis.test.ts test/scripts/task-goal.integration.test.ts` passed; the workflow mirror equality test passed after line-ending-safe synchronization.
- Remaining Uncertainty: Local `.trellis/workflow.md` runtime mirror was not changed, so current project breadcrumb text may not reflect the shipped template until update/sync.
- Next Recovery Point: If this active project needs immediate breadcrumb behavior, copy only the new active-goal line into local `.trellis/workflow.md` after reviewing local customizations.

### Checkpoint 3: Update artifact skeletons and examples
- Type: work
- Status: done
- Canonical Target: `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/prd-mapping.md` and related examples.
- Optional Local Mirror: none unless current generated task templates need immediate use.
- Acceptance: skeletons support delegated decisions, research evidence, rejected options, overturned assumptions, Stop/Block Records, and final evidence mapping.
- Current Evidence: `prd-mapping.md` is the canonical skeleton for `prd.md`, `design.md`, and `implement.md` in Trellis-backed goals.
- Work Performed: Added `Autonomy Charter`, `Decision Harness`, `Autonomous Research Protocol`, `Evidence Chain`, `Delegated Decision Log`, `Stop/Block Records`, and `Final Evidence` skeleton fields to `prd-mapping.md`.
- Verification Command / Result: `pnpm test -- test/templates/trellis-goal-autonomy.test.ts test/templates/trellis.test.ts test/scripts/task-goal.integration.test.ts` passed; `pnpm exec eslint test/templates/trellis-goal-autonomy.test.ts` passed.
- Remaining Uncertainty: Existing examples were not rewritten because the load-bearing skeleton and protocol references now carry the contract; examples can be updated later if users need richer samples.
- Next Recovery Point: Add a compact examples pass only if a future review finds generated goal PRDs still too sparse.

### Checkpoint 4: Preserve CLI compatibility and add tests
- Type: work
- Status: done
- Canonical Target: tests under `packages/cli/test/**` or `test/**` matching existing patterns.
- Acceptance:
  - Tests assert load-bearing template phrases: `Autonomy Charter`, `Decision Harness`, `Autonomous Research Protocol`, `Evidence Chain`, `Frozen Invariants`, `Stop/Block`.
  - Workflow tests assert active goal guidance includes autonomous research/grill/evidence update and Codex native goal ownership.
  - CLI integration tests assert `mark-goal` only writes `task.json.meta.trellis_goal` and `goal-info` only reads/displays metadata/checkpoint summary.
  - Negative checks confirm no new `task.json.status` writer, `goals/` runtime directory, queue, scheduler, mailbox, or hidden durable state path.
- Current Evidence: Existing `task-goal.integration.test.ts` already covers metadata-only and display-only goal command behavior.
- Work Performed: Added `packages/cli/test/templates/trellis-goal-autonomy.test.ts` for delegated-autonomy template assertions, workflow active-goal guidance assertions, and no-second-lifecycle boundary checks.
- Verification Command / Result: `pnpm test -- test/templates/trellis-goal-autonomy.test.ts test/templates/trellis.test.ts test/scripts/task-goal.integration.test.ts` passed; `pnpm lint` passed; `pnpm typecheck` passed.
- Remaining Uncertainty: Full repository test suite was not run at this checkpoint; focused test coverage matches the changed surface.
- Next Recovery Point: Run full `pnpm test` before commit if the dirty worktree is narrowed or unrelated test changes are reviewed.

### Checkpoint 5: Comprehensive Check
- Type: check
- Status: done
- Acceptance:
  - scope, tests, typecheck/build, workflow-state contract, docs consistency, no second lifecycle, no hidden fallback, no stale Grill Gate blocker, and remaining risks are reviewed before `task.py start` completion is claimed.
  - Failing assertions are not replaced by prose review.
  - If native goal blocker behavior is touched, Stop/Block Record and `update_goal(status="blocked")` coordination are verified.
- Current Evidence: Task planning artifacts, canonical template diff, focused tests, CLI lint/typecheck, task context validation, and negative boundary search.
- Work Performed: Reviewed diff scope, synchronized native workflow marketplace mirror, closed stalled sub-agents, and verified no runtime Python/TypeScript goal command behavior was changed.
- Verification Command / Result: `pnpm test -- test/templates/trellis-goal-autonomy.test.ts test/templates/trellis.test.ts test/scripts/task-goal.integration.test.ts` passed; `pnpm exec eslint test/templates/trellis-goal-autonomy.test.ts` passed; `pnpm lint` passed; `pnpm typecheck` passed; `python .\.trellis\scripts\task.py validate '.trellis\tasks\06-04-optimize-trellis-autonomous-goal-workflow'` passed.
- Remaining Risk: The working tree has many unrelated dirty files, including `packages/cli/test/commands/codex.test.ts`, so final commit staging must be selective.
- Next Recovery Point: Stage only the files listed in this task's changed-file summary, then rerun focused tests before commit if requested.

## Evidence Chain Requirements

### Minimum Per-checkpoint Evidence

Every completed checkpoint must record:

- Current Evidence:
- Work Performed:
- Verification Command / Result:
- Remaining Uncertainty:
- Next Recovery Point:

### Triggered Decision Evidence

When applicable, record:

- Accepted Decision:
- Rejected Options:
- Decision Reason:
- Source/Test/Grill Evidence Path:
- Overturned Assumption:
- Overturning Evidence:
- Affected Scope:

### Stop/Block Record

When user input or high-risk ambiguity blocks continuation, record:

- Blocker Type:
- Triggering Evidence:
- Blocked Decision:
- Why Not Delegated:
- Required Human Answer:
- Recovery Checkpoint:
- Native Goal Action: `none | ask-user | update_goal(blocked)`

## Delegated Decision Log

| Decision | Authority | Evidence | Result | Artifact |
|---|---|---|---|---|
| Use delegated-autonomy as the differentiator from ordinary tasks | User + community research | User stated desire for long unattended autonomy; community sources emphasize harness/evidence loops | accepted | `prd.md`, `design.md` |
| Do not build local daemon/queue in this task | Repo contract | `trellis-goal` hard rules and `task-mapping.md` | accepted | `design.md` |
| Use `trellis-grill-agents` for medium ambiguity during goal execution | User named skill and proxy-autonomy goal | `trellis-grill-agents` skill + ambiguity policy + real interviewer grill | accepted with mandatory triggers/unavailable behavior | `design.md`, `research/grill-agents-autonomous-goal-planning.md` |
| Keep source of truth in shipped templates | Grill Round 6 | Shipped behavior must affect future init/update output | accepted | `design.md` |
| Coordinate blockers through Trellis evidence first, native goal status second | Grill Round 7 | Codex native goal owns execution state; Trellis owns audit artifacts | accepted | `design.md`, `implement.md` |
| Do not sync local generated mirrors in this pass | Source-of-truth boundary + dirty worktree review | Shipped templates and marketplace native workflow are sufficient for distributable behavior; local `.agents` / `.trellis` mirrors are heavily dirty/generated | accepted | `implement.md` |

## Evidence Chain

| Evidence | Supports | Status |
|---|---|---|
| OpenAI Cookbook `Using Goals in Codex` | Goal as evidence-checked continuation contract | current |
| `openai/codex#20958` | Community desire for intent calibration, evidence chains, side-thread tolerance, stop guard | current |
| `continuous-agent` README | Long-run queue, strategy retry, deterministic validation | current |
| `godmode` README | measure/modify/verify/keep-revert loop and failure memory | current |
| `claude-code-goal-mode` README | plan-tree, evidence-mapped criteria, review gates, triple budget | current |
| Cursor long-running agents blog | planner/worker/judge roles and coordination lessons | current |
| `research/grill-agents-autonomous-goal-planning.md` | Proxy grill accepted revisions and residual risks | current |
| `packages/cli/test/templates/trellis-goal-autonomy.test.ts` | Template contract regression coverage for delegated autonomy and no-second-lifecycle boundaries | current |
| Focused test run | Shipped template and CLI goal metadata compatibility | current |

## Progress Log

- 2026-06-04/codex: Created planning artifacts from user request, repository evidence, and community goal-mode research.
- 2026-06-04/codex: Initially recorded a blocked grill attempt before discovering the dynamic sub-agent tool; preserved in run artifact as historical context.
- 2026-06-04/codex: Ran real lightweight `trellis-grill-agents` interviewer sub-agent. Eight accepted decision rounds plus final stop recommendation. No human input required and no attempted problem change.
- 2026-06-04/codex: Wrote accepted grill revisions into `prd.md`, `design.md`, `implement.md`, and `research/grill-agents-autonomous-goal-planning.md`.
- 2026-06-04/codex: Implemented canonical Trellis Goal delegated-autonomy template changes, synchronized marketplace native workflow, added focused template regression tests, and verified focused tests/lint/typecheck/task context validation.
