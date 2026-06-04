# Technical Design

## Project Detection

- Project type: Node / TypeScript CLI with bundled Python task scripts and Markdown workflow/skill templates.
- Evidence:
  - `packages/cli/src/templates/common/bundled-skills/trellis-goal/SKILL.md`
  - `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/*.md`
  - `packages/cli/src/templates/trellis/workflow.md`
  - `packages/cli/src/templates/trellis/scripts/task.py`
  - `.trellis/spec/cli/backend/workflow-state-contract.md`
  - `.trellis/spec/cli/unit-test/integration-patterns.md`

## Source Of Truth / Sync Boundary

- Shipped behavior source: `packages/cli/src/templates/**`.
- `trellis-goal` protocol source: `packages/cli/src/templates/common/bundled-skills/trellis-goal/**`.
- Workflow goal override source: `packages/cli/src/templates/trellis/workflow.md`.
- Current `.agents/skills/**` files are project-local generated/runtime instances. Update them only as a minimal mirror when current-repo collaboration must immediately reflect the shipped template; do not treat them as a new source of truth.
- `.trellis/spec/**` is implementation guidance and runtime contract documentation. Update it only when workflow/runtime/development contracts change, such as breadcrumb behavior or task lifecycle ownership.
- Current task artifacts record planning, evidence, decisions, and verification results. They are not shipped behavior sources.

Implementation order:

1. Read relevant specs.
2. Modify canonical templates under `packages/cli/src/templates/**`.
3. Mirror only necessary local `.agents` / `.trellis` generated instances if immediate current-project behavior must match.
4. Add tests for load-bearing behavior.
5. Run smoke checks and review no-second-lifecycle boundaries.

## Relevant Files

- `packages/cli/src/templates/common/bundled-skills/trellis-goal/SKILL.md`: entry routing, hard rules, bridge objective, status policy.
- `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/goal-contract.md`: Goal Contract required fields and quality gate.
- `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/ambiguity-handling.md`: low/medium/high ambiguity policy and `trellis-grill-agents` integration.
- `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/prd-mapping.md`: `prd.md`, `design.md`, `implement.md` skeletons.
- `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/trellis-goal-protocol.md`: initialization, continuation, finalization contract.
- `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/task-mapping.md`: durable file model and no-second-lifecycle boundary.
- `packages/cli/src/templates/trellis/workflow.md`: active task routing and per-turn breadcrumbs.
- `.agents/skills/trellis-grill-agents/SKILL.md` and bundled equivalent if present: proxy grill role, write-back rules, final checklist.
- `packages/cli/test/scripts/task-goal.integration.test.ts`: existing goal metadata and `goal-info` coverage.
- `test/regression.test.ts` or related workflow template tests: likely place for breadcrumb/template assertions.

## Technical Boundary

### Keep

- Trellis remains the durable artifact and audit layer.
- Codex native Goal remains the execution state and continuation owner.
- `task.py mark-goal` remains metadata-only.
- `implement.md` remains evidence/recovery landmarks, not a queue.
- Parent/child tasks remain ordinary Trellis task hierarchy.

### Add

- `Autonomy Charter` section in goal-facing PRD/contract material:
  - delegated decisions
  - Frozen Invariants
  - user-only decisions
  - research authority
  - decision recording requirements
  - invalidation / stop rules
- `Decision Harness` section:
  - use `trellis-grill-agents` during initialization and active continuation for medium ambiguity or nontrivial technical choices
  - record summary in `prd.md` or `design.md`
  - record execution impact in `implement.md`
  - persist disputed or transcript material in `research/grill-agents-*.md`
- `Autonomous Research Protocol`:
  - use `smart-search` only
  - discover before deciding when current practice matters
  - fetch key sources before claim-level adoption
  - record source URLs, command/evidence paths, adopted/rejected conclusion
- `Evidence Chain`:
  - checkpoint minimum evidence
  - accepted decisions
  - rejected options
  - overturned assumptions
  - verification commands/results
  - remaining uncertainty and recovery point
- `create_goal` bridge wording:
  - explicitly says to make technical/execution decisions autonomously within `Autonomy Charter`
  - requires `trellis-grill-agents` and `smart-search` evidence for nontrivial choices
  - points to Frozen Invariants and Stop/Block rules

### Do Not Add

- new `task.json.status`
- local daemon, queue, runner, scheduler, or mailbox
- `goal_children` or automatic child native goals
- hidden state outside normal Trellis artifacts
- broad fallback that silently hides blockers

## Decision Harness

### Mandatory `trellis-grill-agents` Triggers

Use `trellis-grill-agents` when a decision is medium-risk, target objective remains unchanged, and at least one condition is true:

- affects architecture, public contract, cross-module behavior, data integrity, workflow routing, or generated template contract
- is hard to roll back or would create migration/compatibility risk
- has conflicting repo/search/test evidence
- chooses between competing community or official practices
- changes the evidence standard for a checkpoint
- could hide ambiguity behind "agent autonomy"

### Evidence-only Autonomous Decisions

Agent may decide without `trellis-grill-agents` when all are true:

- local and low-risk
- reversible
- covered by repo/source/test evidence
- does not change Frozen Invariants
- does not affect public contract, production behavior, credentials, legal/compliance, or user-visible scope
- decision and evidence are recorded in Evidence Chain

### Grill Unavailable Behavior

- If the current mission explicitly requires a grill and no real interviewer sub-agent can be spawned, the grill gate is blocked; do not silently downgrade to self-critique.
- If a later active goal decision is medium-risk but `trellis-grill-agents` is unavailable, record a Stop/Block Record unless the decision can be reclassified as evidence-only by the criteria above.
- Unavailability itself is not a new Trellis lifecycle state; it is artifact evidence and, if applicable, a native goal blocker under Codex native goal policy.

## Autonomous Research Protocol

### Research Required

Use approved `smart-search` CLI before deciding when the choice involves:

- current API/CLI behavior not already proven by local source
- third-party tool behavior
- community practice or emerging agent workflow pattern
- security/compliance implication
- cross-project pattern
- disputed technical selection
- official docs or maintainer guidance likely to affect the decision

### Research Not Required

Do not search when local evidence is sufficient:

- pure repository behavior proven by source/spec/test
- template wording changes whose truth is inside this repo
- implementation details already covered by `.trellis/spec/**`
- narrow mechanical changes that do not depend on current external practice

### Evidence Priority

When evidence conflicts, use this priority:

1. Frozen problem and project rules
2. Repository source, Trellis specs, tests, and runnable command results
3. Official documentation
4. Fetched maintainer/source material
5. Community discussions, blogs, and secondary summaries

External conclusions can inform tradeoffs but cannot override project rules or runnable repo evidence. Every adopted or rejected external conclusion must record source URL, fetch/evidence path, adopt/reject reason, and remaining uncertainty.

## Evidence Chain

### Minimum Checkpoint Fields

Every checkpoint completion must record:

- current evidence
- work performed
- verification command/result
- remaining uncertainty
- next recovery point

### Triggered Extra Fields

When applicable, record:

- accepted decision
- rejected options
- decision reason
- source/test/grill evidence path
- original assumption, overturning evidence, and affected scope
- blocker type and recovery requirement

`implement.md` keeps the summary and index. Long transcripts, fetched source details, or disputed material live in `research/*.md`.

## Stop / Block Boundary

High-risk or user-owned decisions must stop. The agent should:

1. Stop the affected execution path.
2. Write a Stop/Block Record to `implement.md`.
3. Ask the user the minimum necessary question in the main conversation.
4. Call native `update_goal(status="blocked")` only when Codex native goal blocked policy is satisfied or no meaningful work can continue.

Stop/Block Record fields:

- blocker type
- triggering evidence
- blocked decision
- why not delegated
- required human answer
- recovery checkpoint

When the blocker is resolved, continuation resumes from the recovery checkpoint after re-reading `prd.md`, `design.md`, `implement.md`, and Evidence Chain. Trellis does not add a blocked lifecycle status.

## Data / Artifact Flow

1. User requests Trellis-backed goal or conversion.
2. `trellis-goal` initializes ordinary Trellis task artifacts.
3. `prd.md` records Goal Contract plus Autonomy Charter.
4. `design.md` records technical boundary, research evidence, and decision rationale.
5. `implement.md` records checkpoints plus evidence chain and delegated decision log.
6. Medium ambiguity triggers `trellis-grill-agents`; accepted results are written back into canonical artifacts.
7. Research-heavy decisions use `smart-search` and store evidence under `research/`.
8. Native `create_goal` receives compact bridge objective pointing to artifacts and autonomy rules.
9. Continuations re-read artifacts, update evidence chain, and only call `update_goal` for genuine terminal states.

## Verification Commands

- `pnpm test -- test/scripts/task-goal.integration.test.ts`: verifies existing goal CLI behavior remains compatible.
- `pnpm test -- test/regression.test.ts`: verifies workflow breadcrumb/template invariants if workflow text changes are covered there.
- `pnpm lint && pnpm typecheck`: validates TypeScript template/test changes if any are made.
- `$env:PYTHONUTF8='1'; python .\.trellis\scripts\task.py goal-info 06-04-optimize-trellis-autonomous-goal-workflow`: verifies planning checkpoints parse if task is later marked as goal for testing.

Required assertion targets for implementation:

- Templates include load-bearing sections/phrases: `Autonomy Charter`, `Decision Harness`, `Autonomous Research Protocol`, `Evidence Chain`, `Frozen Invariants`, `Stop/Block`.
- Workflow active goal guidance includes autonomous research/grill/evidence update and still points to Codex native goal ownership.
- CLI integration tests keep `mark-goal` metadata-only and `goal-info` read/display-only.
- Negative checks confirm no new `task.json.status` writer, `goals/` runtime directory, queue, scheduler, mailbox, or hidden durable state path.
- Failure of those assertions cannot be replaced by prose review.

## Risks

- Risk: wording implies Trellis itself runs unattended. Mitigation: repeat ownership boundary and avoid local runner language.
- Risk: autonomy charter hides real user decisions. Mitigation: explicit user-only decision and high-ambiguity BLOCKED rules.
- Risk: research becomes unsupported web synthesis. Mitigation: require `smart-search fetch` evidence for adopted claim-level decisions.
- Risk: more sections make lightweight goal use cumbersome. Mitigation: only require full delegated-autonomy sections for unattended/long-running goals; contract-only/lightweight goals may stay concise.
- Risk: workflow breadcrumb gets too long. Mitigation: concise breadcrumb, full protocol in `trellis-goal` references.
- Risk: prose gets duplicated across shipped templates and local generated instances. Mitigation: canonical template first, local mirror only when necessary.

## Rollback Notes

- If autonomy wording causes routing confusion, revert changes to `trellis-goal` references and workflow breadcrumb blocks only; no task data migration should be needed.
- If tests reveal template snapshot drift, narrow assertions to load-bearing phrases rather than exact full prose.
- If CLI behavior changes accidentally, restore metadata-only behavior for `mark-goal` and display-only behavior for `goal-info`.

## Grill-Agent Notes

- `research/grill-agents-autonomous-goal-planning.md`: lightweight grill completed with a real interviewer sub-agent. No human input required, no attempted problem change. Accepted revisions have been written back into planning artifacts.

