# Integrate Architecture Shaping Into Trellis Workflow

## Raw Goal Input

```text
用 goal 去实现当前 Trellis task
```

## Existing Planning Notes

The current planning task was created from the user's requirement that every Trellis-created project should be treated as a large, long-lived, continuously maintained project. The user's concrete pain point is that Codex often produces toy MVP implementations with little abstraction or modularity, sometimes placing all behavior in a single file.

Prior planning established:

- Trellis should add a native Phase 1 architecture-shaping capability, not simply copy the external `improve-codebase-architecture` skill unchanged.
- The first implementation skill name is `trellis-architecture-shaping`.
- Future broad existing-code opportunity scanning can be deferred to a possible `trellis-improve-architecture` sibling skill.
- Trellis must distinguish small MVP scope from toy architecture: reducing feature scope is allowed; collapsing maintainable structure is not.
- Architecture-sensitive planning requires a visible Phase 1 trigger decision. Required shaping produces or references `research/architecture-shaping.md`; skipped shaping records a low-risk reason.
- Architecture-shaping research must separate accepted constraints, recommended-but-adjustable suggestions, open decisions, and rejected/speculative abstractions.
- Review/check blockers require current-task scope plus accepted-constraint violation or concrete toy-MVP failure evidence; warnings cover adjustable suggestions and task-external legacy debt.
- The first closed loop is: bundled skill + workflow trigger decision + implement/check/review prompt constraints + focused validation.

The grill-agents run at `research/grill-agents/planning-artifacts-20260604-1928.md` returned `pass` with no human-input blockers.

## Goal Contract

- Objective: Implement the Trellis-native `trellis-architecture-shaping` capability so generated Trellis workflows guide agents away from toy MVP structure and toward production-shaped, long-lived project architecture.
- Scope: Update the Trellis source templates and prompts needed for the minimum closed loop:
  - `packages/cli/src/templates/common/bundled-skills/trellis-architecture-shaping/`
  - `packages/cli/src/templates/trellis/workflow.md`
  - relevant implement/check/review agent templates, including `trellis-code-architecture-review`
  - focused tests or template smoke checks for bundled skill installation/update and workflow text expectations
  - existing spec/template docs only if there is already a natural home
- Constraints:
  - Do not replace `trellis-code-architecture-review`; extend its contract.
  - Do not force every tiny edit through a heavyweight architecture process.
  - Do not create a competing `CONTEXT.md`, `docs/adr/`, goal directory, checkpoint queue, or other second source of truth.
  - Do not automatically refactor existing user code outside this task.
  - Do not add a new mandatory Trellis phase status unless implementation evidence makes it necessary and the task artifacts are updated first.
  - Do not weaken existing tests or hide regressions.
  - Preserve unrelated dirty working-tree changes.
- Done When:
  1. A bundled `trellis-architecture-shaping` skill exists and is generated into the shared skill layer by init/update paths.
  2. Workflow template guidance declares Trellis projects long-lived by default and records the Phase 1 architecture-shaping trigger decision path, including required output or low-risk skip reason.
  3. Implement/check/review prompts treat accepted architecture constraints as binding, distinguish blockers from warnings, and preserve necessary structure without endorsing speculative abstraction.
  4. Focused validation proves the new bundled skill and workflow/prompt changes are covered by tests or smoke checks, and relevant typecheck/test commands pass or have explicit evidence-backed blockers.
  5. Trellis artifacts are updated with implementation evidence, remaining risks, and final verification status before normal Trellis Phase 3.4 commit policy.
- Stop If:
  1. A required implementation choice would create a second source of truth outside `.trellis/spec/`, task artifacts, or bundled skill templates; detection: changed-file review or design mismatch.
  2. Existing tests reveal workflow-state or template update behavior that conflicts with the proposed routing; detection: focused test failure or source inspection.
  3. The implementation would require broad cross-platform prompt rewrites beyond the minimum closed loop; detection: changed-file scope exceeds listed scope or review gate identifies unrelated churn.
  4. GitNexus impact tools become available and report HIGH or CRITICAL risk for a symbol that must be edited; detection: impact analysis result.
  5. Native goal cannot be started or continued because Codex goal tooling is unavailable, paused, budget-limited, usage-limited, or blocked; detection: `get_goal` / `create_goal` / `update_goal` status.
- Token Budget: not specified
- Project Type: TypeScript/Node CLI monorepo with Trellis templates; evidence: `packages/cli/src/templates/`, `packages/cli/src/configurators/`, `pnpm` scripts and existing template tests.
- Scenario: Custom implementation goal for a Trellis-managed TypeScript CLI/template system.
- Cadence Hint: checkpoint-bounded; user asked to use goal for the current Trellis task, with existing checkpoints and no explicit run-to-completion wording or token budget.

## Default Assumptions

- Assumption: The minimum implementation should not update local `.trellis/workflow.md` unless immediate current-repo live behavior is explicitly required.
  Evidence: `design.md` and grill run classify local workflow update as deferred unless live behavior is in scope.
  Why safe: Template changes are the product deliverable; local runtime behavior can remain a separate choice.
  Stop if: Tests or implementation workflow require local workflow synchronization for validation.

- Assumption: A separate `.trellis/spec/guides/` Production-Shaped MVP guide is not required in the first closed loop.
  Evidence: PRD acceptance criterion says the convention is carried by workflow template, bundled skill, and implement/check/review prompts unless an existing spec-template entry is the natural home.
  Why safe: Avoids introducing another documentation surface while still changing agent behavior.
  Stop if: Existing spec structure has a natural, already-included entry that must be updated for consistency.

- Assumption: The task can proceed with `trellis-architecture-shaping` as the skill name.
  Evidence: PRD Decisions and grill run confirmed this name.
  Why safe: It targets the missing pre-implementation shaping behavior and defers broader existing-code scans.
  Stop if: Implementation discovers an existing bundled skill or command with a conflicting name.

## Ambiguity Handling

| Topic | Level | Decision | Evidence | Trellis Record |
|---|---|---|---|---|
| Skill name and sibling split | low | Use `trellis-architecture-shaping`; defer `trellis-improve-architecture` sibling. | PRD Decisions and grill run. | `prd.md`, `research/grill-agents/planning-artifacts-20260604-1928.md` |
| Trigger responsibility and output location | medium | Phase 1 planning records a trigger decision; required shaping writes or references `research/architecture-shaping.md`; skips record low-risk reason. | Grill-agents accepted write-back. | `design.md`, `implement.md`, grill run artifact |
| Constraint strength | medium | Only accepted constraints referenced by `design.md` or `implement.md` bind implementation/check agents. | Grill-agents accepted write-back. | `design.md`, grill run artifact |
| Current-repo live workflow update | low | Deferred unless explicitly in scope. | Design minimum boundary and deferred enhancements. | `design.md`, `implement.md` |

## Acceptance Criteria

- [ ] New or updated Trellis workflow text states that Trellis projects are long-lived by default and production-shaped even for MVP scope.
- [ ] A Trellis-native architecture shaping skill exists in the generated shared skill layer and can be installed by `trellis init` / `trellis update`.
- [ ] The skill has clear trigger rules for architecture improvement, architecture shaping, large/long-lived projects, refactoring opportunities, testability, module boundaries, and anti-toy-MVP concerns.
- [ ] The skill writes or guides creation of a normal Trellis research artifact such as `research/architecture-shaping.md` instead of creating an unrelated documentation system.
- [ ] Phase 1 planning guidance tells agents when to use architecture shaping and how to reference its output in `design.md`, `implement.md`, `implement.jsonl`, or `check.jsonl`.
- [ ] Every complex task records an architecture-shaping trigger decision before `task.py start`, including either a `research/architecture-shaping.md` reference or an explicit low-risk skip reason.
- [ ] Architecture-shaping trigger decisions are visible in normal task artifacts, including explicit skip reasons when shaping is not run.
- [ ] `trellis-implement`, `trellis-check`, and Codex review gate prompts are updated so agents preserve necessary structure and do not treat maintainability as optional over-engineering.
- [ ] Existing tests or focused new tests cover bundled skill installation/update and relevant workflow-state/template changes.
- [ ] The production-shaped MVP convention is carried by the workflow template, bundled architecture-shaping skill, and implement/check/review prompts. A separate `.trellis/spec/guides/` guide is not required for the first closed loop unless an existing spec-template entry is already the natural home.

## Context Manifest Plan

| Action | File | Reason |
|---|---|---|
| implement | `.trellis/tasks/06-04-architecture-shaping-workflow/prd.md` | Goal Contract and acceptance criteria. |
| implement | `.trellis/tasks/06-04-architecture-shaping-workflow/design.md` | Technical boundary and minimum implementation shape. |
| implement | `.trellis/tasks/06-04-architecture-shaping-workflow/implement.md` | Checkpoints and evidence plan. |
| implement | `packages/cli/src/templates/trellis/workflow.md` | Workflow template and workflow-state routing source of truth. |
| implement | `packages/cli/src/templates/common/index.ts` | Bundled skill discovery. |
| implement | `packages/cli/src/configurators/shared.ts` | Bundled skill resolution and write path. |
| implement | `packages/cli/src/templates/codex/agents/trellis-code-architecture-review.toml` | Existing architecture review gate to update. |
| check | `.trellis/tasks/06-04-architecture-shaping-workflow/prd.md` | Verify scope and goal contract. |
| check | `.trellis/tasks/06-04-architecture-shaping-workflow/design.md` | Verify technical boundary. |
| check | `.trellis/tasks/06-04-architecture-shaping-workflow/implement.md` | Verify checkpoint completion and evidence. |
| check | `packages/cli/src/templates/trellis/workflow.md` | Verify workflow routing. |
| check | `packages/cli/src/templates/codex/agents/trellis-code-architecture-review.toml` | Verify architecture review contract. |

## Out of Scope

- Replacing the existing `trellis-code-architecture-review` gate.
- Forcing every tiny edit to run a heavyweight architecture discovery process.
- Creating a full ADR system that competes with `.trellis/spec/` and task research artifacts.
- Automatically refactoring existing user code without an explicit task.
- Adding a new mandatory phase status unless required by evidence during implementation.
- Implementing a separate `trellis-improve-architecture` sibling skill in this task.
- Adding a hard planning gate for complex greenfield tasks in this task.

## Initialization Gate Evidence

- Goal marker: `task.py mark-goal 06-04-architecture-shaping-workflow --source planning-task --cadence checkpoint-bounded` succeeded.
- Done When mapping: five Done When items map to the implementation checkpoints and final comprehensive check in `implement.md`.
- Stop If detection: five Stop If items include detection methods.
- Ambiguity handling: medium ambiguity was handled by `trellis-grill-agents`; final run verdict was pass with no human-input blockers.
- Context curation: `implement.jsonl` and `check.jsonl` exist and validate.
- Checkpoint counts: six work checkpoints plus one comprehensive check checkpoint in `implement.md`.
- Native handoff: `create_goal` succeeded; native goal status is active.
- Dirty-state review: initialization edits only Trellis task artifacts; unrelated working-tree changes already existed.
- Validation: `task.py validate 06-04-architecture-shaping-workflow` passed after conversion.
