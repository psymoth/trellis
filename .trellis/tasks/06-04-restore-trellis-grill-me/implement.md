# Implementation Plan

## Preconditions

- User approved creating this Trellis task.
- Planning remains in Phase 1; do not run `task.py start` until the user reviews/approves these artifacts.
- Preserve unrelated dirty working-tree changes.

## Checkpoints

### 1. Confirm existing generation chain
- Inspect `getBundledSkillTemplates()`, `resolveBundledSkills()`, platform skill roots, and focused tests.
- Confirm the current skill generation chain and where a concise `trellis-grill-me` template should live.
- Record any user/WIP files in touched areas before editing.

### 2. Add `trellis-grill-me` bundled skill
- Create `packages/cli/src/templates/common/bundled-skills/trellis-grill-me/SKILL.md`.
- Preserve attended grill behavior and add Trellis artifact workflow.
- Keep `trellis-grill-me` distinct from `trellis-grill-agents`.

### 3. Update routing text
- Update `packages/cli/src/templates/trellis/workflow.md`.
- Update local `.trellis/workflow.md` if current-repo live behavior should match the generated template.
- Update common brainstorm/continue guidance and any Codex-specific copied brainstorm template that is still generated separately.
- Ensure attended Grill Gate wording uses `trellis-grill-me required`.

### 4. Update tests
- Add/adjust tests for bundled skill tracking and Codex generated skill paths.
- Add/adjust workflow tests to require `trellis-grill-me` as canonical attended route.
- Add focused expectations for `trellis-grill-me` generation and concise workflow routing.

### 5. Verify
- Run focused tests covering configurators/templates/init paths touched by the change.
- Run typecheck.
- Run `python ./.trellis/scripts/task.py validate 06-04-restore-trellis-grill-me`.
- Run scoped `git diff --check -- <touched files>`.

## Grill Gate

- `trellis-grill-me required` — this task changes the meaning and naming of a user-facing planning route. The user's core decision is recorded in `prd.md`; implementation should wait for the remaining scope confirmation.

## Resolved Decision

- Scope implemented through the shared bundled skill layer so Codex receives `.agents/skills/trellis-grill-me/SKILL.md` through the existing generation chain. Focused verification covers Codex generation and the shared platform-template invariants without adding platform-specific behavior.

## Implementation Evidence

- Added canonical bundled skill template at `packages/cli/src/templates/common/bundled-skills/trellis-grill-me/SKILL.md`.
- Added current Codex shared skill copy at `.agents/skills/trellis-grill-me/SKILL.md`.
- Updated Trellis/Codex planning routes so attended Grill Gate records `trellis-grill-me required`.
- Updated focused tests for bundled skill tracking, Codex init generation, platform skill writes, and workflow routing.
- Validation passed:
  - `pnpm --filter psymoth test test/configurators/index.test.ts`
  - `pnpm --filter psymoth test test/configurators/platforms.test.ts`
  - `pnpm --filter psymoth test test/commands/init.integration.test.ts`
  - `pnpm --filter psymoth test test/templates/trellis.test.ts`
  - `pnpm --filter psymoth typecheck`
  - `python ./.trellis/scripts/task.py validate 06-04-restore-trellis-grill-me`
  - scoped `git diff --check`
