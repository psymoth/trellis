# Implementation Checkpoints

## Native Goal Handoff

- Codex Goal Status: active
- Handoff Objective: Complete the Trellis-backed goal for `.trellis/tasks/06-04-architecture-shaping-workflow`: implement `trellis-architecture-shaping` and the minimum workflow/prompt/test closed loop.
- Next Checkpoint: Checkpoint 1: Locate affected templates and tests
- Verification Policy: Each checkpoint records work performed, verification evidence, remaining risk, and next step. Final completion requires focused tests or smoke checks plus relevant typecheck/test commands, or an evidence-backed blocker.

## Checkpoints

### Checkpoint 1: Locate affected templates and tests
- Type: work
- Status: done
- Acceptance: Identify exact template, prompt, and test files to edit; run Fast Context or targeted source inspection; record if GitNexus impact tools are unavailable.
- Work Performed: Confirmed active native goal and Trellis goal metadata with `get_goal` and `python ./.trellis/scripts/task.py goal-info 06-04-architecture-shaping-workflow`. Loaded `trellis-goal`, `trellis-before-dev`, Windows guidance, task `prd.md` / `design.md` / `implement.md`, package/spec context, and relevant CLI/backend/unit-test specs. Ran Fast Context after `doctor` to locate workflow, bundled-skill, Codex agent, configurator, init, template, and regression test candidates. Verified source paths directly after Fast Context. Checked GitNexus availability through tool discovery; no `gitnexus_*` tools were exposed in this Codex tool surface.
- Verification Evidence: Fast Context `doctor` returned `ok: true`; Fast Context search returned candidates including `packages/cli/src/templates/trellis/workflow.md`, `packages/cli/src/templates/common/index.ts`, `packages/cli/src/templates/codex/agents/trellis-check.toml`, `packages/cli/test/templates/trellis.test.ts`, and `packages/cli/test/regression.test.ts`. Source inspection confirmed bundled skills are auto-discovered by `getBundledSkillTemplates()` and Codex writes bundled skills through `resolveBundledSkills()`.
- Remaining Risk: GitNexus impact analysis could not be run because the current tool surface did not expose GitNexus tools. Mitigated with source inspection, scoped diff review, focused tests, lint, typecheck, and `task.py validate`.
- Next Step: Add the bundled `trellis-architecture-shaping` skill.

### Checkpoint 2: Add bundled architecture shaping skill
- Type: work
- Status: done
- Acceptance: `packages/cli/src/templates/common/bundled-skills/trellis-architecture-shaping/SKILL.md` exists with concise Trellis-native trigger rules, workflow, output contract, and guardrails. Optional references exist only when they reduce SKILL.md size.
- Work Performed: Added `packages/cli/src/templates/common/bundled-skills/trellis-architecture-shaping/SKILL.md` with Trellis-native triggers, hard rules, workflow, trigger-decision record, research output contract, constraint-strength semantics, and blocker-versus-warning standards. Kept it as a single SKILL.md because the content is concise enough and no reference file is needed yet.
- Verification Evidence: `packages/cli/test/configurators/index.test.ts` now asserts the skill is collected and preserves the production-shaped MVP contract. `packages/cli/test/configurators/platforms.test.ts` and `packages/cli/test/commands/init.integration.test.ts` verify generated/tracked Codex skill paths include `.agents/skills/trellis-architecture-shaping/SKILL.md`.
- Remaining Risk: The skill is intentionally planning/research guidance only; it does not implement a separate runtime gate or new task status.
- Next Step: Update workflow routing and trigger-decision guidance.

### Checkpoint 3: Update workflow routing and trigger-decision guidance
- Type: work
- Status: done
- Acceptance: `packages/cli/src/templates/trellis/workflow.md` declares long-lived project defaults and records when/how Phase 1 makes architecture-shaping trigger decisions, including required research output or low-risk skip reason.
- Work Performed: Updated `packages/cli/src/templates/trellis/workflow.md` to declare production-shaped MVPs as a core principle, add an Architecture Shaping Decision section, record required/skip trigger decision forms, route architecture-sensitive planning to `trellis-architecture-shaping`, mention `research/architecture-shaping.md`, and require the trigger decision before `task.py start` for complex tasks. Synced `marketplace/workflows/native/workflow.md` because existing tests require it to mirror the bundled native workflow exactly.
- Verification Evidence: `packages/cli/test/templates/trellis.test.ts` verifies workflow trigger-decision text, long-lived defaults, routing, and both planning breadcrumb variants. `packages/cli/test/regression.test.ts` verifies the planning breadcrumb keeps the architecture-shaping gate visible alongside planning artifact gates.
- Remaining Risk: User clarified that other platform implement/check prompts are out of scope; workflow text is shared Trellis behavior and marketplace native mirror sync is required by existing invariant tests.
- Next Step: Update Codex implement/check/review prompt constraints only.

### Checkpoint 4: Update implement/check/review prompt constraints
- Type: work
- Status: done
- Acceptance: Relevant implement/check/review templates preserve necessary structure, reject speculative abstraction, and apply artifact-backed blocker versus warning standards. `trellis-code-architecture-review` explicitly covers toy-MVP failure modes.
- Work Performed: Updated only Codex prompt templates after user scope clarification: `packages/cli/src/templates/codex/agents/trellis-implement.toml`, `trellis-check.toml`, and `trellis-code-architecture-review.toml`. Implement now treats accepted architecture constraints referenced by `design.md` / `implement.md` as binding, preserves necessary structure, and rejects speculative abstractions. Check now verifies architecture constraints and distinguishes current-task blockers from warnings/follow-ups. Architecture review now reads `research/architecture-shaping.md` when required, blocks missing trigger decisions for architecture-sensitive complex tasks, and covers toy one-file failure modes.
- Verification Evidence: `packages/cli/test/templates/codex.test.ts` verifies Codex implement/check/architecture-review prompt contracts. `pnpm --filter psymoth test test/templates/codex.test.ts` passed with 13 tests.
- Remaining Risk: Non-Codex implement/check prompt templates intentionally remain unchanged per user instruction: "只需要处理codex就行了,其他平台不用管".
- Next Step: Add focused validation coverage.

### Checkpoint 5: Add focused validation coverage
- Type: work
- Status: done
- Acceptance: Existing or new tests/smoke checks prove the bundled skill is installed/updated and workflow/prompt expectations are covered. Validation avoids brittle string-only checks where a structured test already exists.
- Work Performed: Extended existing tests rather than creating a separate brittle suite. Added coverage for bundled skill collection/install tracking, Codex init hash tracking, workflow trigger-decision text, planning breadcrumbs, and Codex prompt contracts.
- Verification Evidence: Passing focused commands: `pnpm --filter psymoth test test/templates/codex.test.ts`, `pnpm --filter psymoth test test/templates/trellis.test.ts`, `pnpm --filter psymoth test test/configurators/index.test.ts`, `pnpm --filter psymoth test test/configurators/platforms.test.ts`, `pnpm --filter psymoth test test/commands/init.integration.test.ts`, and `pnpm --filter psymoth test test/regression.test.ts`.
- Remaining Risk: Tests cover template generation and prompt text contracts, not a live Codex UI session. That is appropriate for this CLI/template task.
- Next Step: Run final verification commands and update evidence.

### Checkpoint 6: Run verification and update Trellis evidence
- Type: work
- Status: done
- Acceptance: Run relevant focused tests, typecheck or targeted checks, `task.py validate`, and update this file with evidence. Any skipped command has an evidence-backed reason.
- Work Performed: Ran focused test suite, regression test, lint, typecheck, scoped diff checks, task validation, and goal metadata checks. Separated scoped diff check from full working-tree check because the repository contains many unrelated dirty files.
- Verification Evidence: Passed: `pnpm --filter psymoth test test/templates/codex.test.ts`; `pnpm --filter psymoth test test/templates/trellis.test.ts`; `pnpm --filter psymoth test test/configurators/index.test.ts`; `pnpm --filter psymoth test test/configurators/platforms.test.ts`; `pnpm --filter psymoth test test/commands/init.integration.test.ts`; `pnpm --filter psymoth test test/regression.test.ts`; `pnpm --filter psymoth typecheck`; `pnpm --filter psymoth lint`; `python ./.trellis/scripts/task.py validate 06-04-architecture-shaping-workflow`; scoped `git diff --check -- <touched files>`. Full `git diff --check` reports pre-existing unrelated blank-line issues in `AGENTS.md` and `CLAUDE.md`; scoped diff check for this task's touched files passed.
- Remaining Risk: No full `pnpm test` was run because the focused suite plus regression suite already covered the changed template/configurator/init paths, and lint/typecheck passed. Full working tree remains dirty with unrelated user/WIP changes that were preserved.
- Next Step: Perform comprehensive completion audit and prepare Phase 3.4 commit plan.

### Checkpoint 7: Comprehensive Check
- Type: check
- Status: done
- Acceptance: Scope, tests, typecheck/build, generated template behavior, spec/workflow consistency, review-gate behavior, rollback notes, and remaining risks are reviewed. No unrelated user changes are reverted.
- Work Performed: Audited scope against the Goal Contract and the user's later clarification that only Codex prompt templates should be handled. Confirmed added skill is a shared bundled skill because Codex installs shared skills into `.agents/skills/` through the existing common bundled-skill path; confirmed non-Codex implement/check prompt templates were not edited. Reviewed diff for second sources of truth, hidden fallback, unrelated refactors, and toy-MVP/over-engineering mismatch.
- Verification Evidence: Scoped touched-file status contains the new bundled skill, shared workflow template, marketplace native workflow mirror, Codex agent templates, focused tests, and this task evidence file. No non-Codex implement/check prompt template was edited in this goal implementation. Existing marketplace native mirror invariant remains satisfied by `test/templates/trellis.test.ts`.
- Remaining Risk: Phase 3.4 commit confirmation has been received from the user. Repository-level GitNexus impact/change detection remains unavailable in the current Codex tool surface; this was mitigated with Fast Context, source inspection, scoped diff review, focused tests, lint, typecheck, and Trellis validation.
- Next Step: Execute the approved Phase 3.4 commit plan, then finish/update native goal terminal status as appropriate.

## Progress Log

- 2026-06-04: Converted existing planning task into Trellis Goal Contract and checkpoint/evidence plan at user request: "用 goal 去实现当前 Trellis task".
- 2026-06-04: `task.py mark-goal --source planning-task --cadence checkpoint-bounded` succeeded.
- 2026-06-04: `create_goal` succeeded; native goal status is active.
- 2026-06-04: Implemented `trellis-architecture-shaping`, workflow trigger-decision guidance, Codex implement/check/architecture-review prompt constraints, focused tests, and verification evidence. User clarified only Codex prompt templates are in scope; non-Codex implement/check prompt templates were left unchanged.
- 2026-06-04: Presented Phase 3.4 commit plan; user replied `ok` to execute the scoped commits.
