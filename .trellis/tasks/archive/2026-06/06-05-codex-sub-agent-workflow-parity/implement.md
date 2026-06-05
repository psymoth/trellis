# Codex sub-agent workflow parity - Implementation Plan

## Preconditions

- Task status remains `planning` until user reviews this plan and approves `task.py start`.
- Complex task artifacts required before start: `prd.md`, `design.md`, `implement.md`, Grill Gate decision, and sub-agent context manifests.

## Grill Gate

trellis-grill-me required; completed through attended planning on 2026-06-05

Reason: the scope decision affected product/workflow semantics: whether implementation should narrowly fix the known Architecture Shaping drift or comprehensively audit all June semantics across sub-agent preludes. The user chose comprehensive audit with evidence-backed fixes only. No unresolved human decision remains before implementation.

## Implementation Checklist

### 1. Confirm final scope

- Status: done.
- Final decision: comprehensively audit Goal, Grill, Architecture Shaping, and Chinese artifact defaults across Codex sub-agent preludes, but only change evidence-backed drift.

### 2. Load development specs

Read applicable specs before code edits:

- `.trellis/spec/cli/backend/index.md`
- `.trellis/spec/cli/backend/commands-update.md`
- `.trellis/spec/cli/backend/workflow-state-contract.md`
- `.trellis/spec/cli/backend/platform-integration.md`
- `.trellis/spec/cli/backend/configurator-shared.md`
- `.trellis/spec/cli/unit-test/index.md`
- `.trellis/spec/guides/index.md`

### 3. Fix local dogfood drift

- Compare `.trellis/workflow.md` with `packages/cli/src/templates/trellis/workflow.md` for current Codex-specific June semantics.
- Compare `.codex/agents/trellis-implement.toml` and `.codex/agents/trellis-check.toml` with their template source.
- Apply the smallest local sync needed so the current repo behavior matches intended source behavior.

### 4. Fix template source

- Ensure `packages/cli/src/templates/trellis/workflow.md` contains the intended `codex-inline` / `codex-sub-agent` semantics.
- Ensure `packages/cli/src/templates/codex/agents/trellis-implement.toml` contains implement-agent constraints for accepted architecture artifacts and non-goal ownership.
- Ensure `packages/cli/src/templates/codex/agents/trellis-check.toml` contains check-agent constraints for architecture blocker/warning distinction and non-goal ownership.
- If any bundled skill or Trellis meta reference must change, update template and local copies together.

### 5. Verify update path

- Confirm `collectPlatformTemplates.codex.collectTemplates()` collects changed Codex agent files.
- Confirm `.trellis/workflow.md` is still whole-file hash-tracked and update integration coverage remains valid.
- Add a manifest only if users need release notes for `trellis update` to pull the fix, or if migration metadata is required for continuity.

### 6. Add or update tests

Candidate tests:

- `packages/cli/test/templates/codex.test.ts`
  - assert implement agent contains architecture constraint and explicitly does not own native goal lifecycle.
  - assert check agent contains architecture blocker/warning rule and explicitly does not own native goal lifecycle.
- `packages/cli/test/regression.test.ts`
  - add coverage only if workflow marker/routing text changes need runtime protection.
- `packages/cli/test/commands/update.integration.test.ts`
  - add coverage only if update mechanics change.

### 7. Validation

Run focused checks first:

```powershell
pnpm test -- packages/cli/test/templates/codex.test.ts
pnpm test -- packages/cli/test/regression.test.ts
```

If touched update behavior:

```powershell
pnpm test -- packages/cli/test/commands/update.integration.test.ts
pnpm test -- packages/cli/test/migrations/index.test.ts
```

Then run applicable broader checks if time/risk warrants:

```powershell
pnpm typecheck
pnpm lint
```

## Rollback Points

- If template sync expands unexpectedly, stop and split into child tasks.
- If update mechanics need nontrivial changes, keep this task focused on Codex and add a child task for update-system behavior.
- If Goal Mode semantics require native Codex behavior changes, do not modify implement/check agents; route back to `trellis-goal` planning.

## Ready-To-Start Criteria

- User answers the final scope question. Done.
- `implement.jsonl` and `check.jsonl` include relevant spec files.
- User reviews and approves `prd.md`, `design.md`, and `implement.md`.
- Then run `python ./.trellis/scripts/task.py start 06-05-codex-sub-agent-workflow-parity`.
