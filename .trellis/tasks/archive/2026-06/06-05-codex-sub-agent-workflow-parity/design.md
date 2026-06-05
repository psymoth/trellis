# Codex sub-agent workflow parity - Design

## Problem

Codex now has two Trellis execution paths:

- `codex-inline`: the main session loads skills and edits/checks directly.
- `codex-sub-agent`: the main session coordinates, then dispatches `trellis-implement` / `trellis-check` agents that pull task context themselves.

June workflow changes added new planning and execution semantics: Goal Contract handling, Grill Gate boundaries, Architecture Shaping, and Chinese human-readable task artifacts. The routing layer already knows about `codex-inline` / `codex-sub-agent`, but local dogfood files and Codex agent preludes can drift from the template source.

The design goal is parity of semantics, not identical mechanics.

## Architecture Shaping Decision

Architecture Shaping: required; see this `design.md`.

Reason: this task changes workflow routing, pull-based sub-agent context, template/update behavior, and regression boundaries. The work is cross-layer and affects long-lived Trellis behavior. A separate `research/architecture-shaping.md` is not required for planning because the relevant architecture evidence is already captured in `prd.md` and this design; if implementation discovers deeper module-boundary risk, add that research file before `task.py start`.

## Responsibility Boundaries

### Main Session

The main Codex session owns all workflow decisions:

- Classify request and task creation.
- Run Phase 1 planning with `trellis-brainstorm`.
- Record `Architecture Shaping` and `Grill Gate` decisions.
- Run or coordinate `trellis-goal` and Codex native `create_goal` / `update_goal`.
- Dispatch `trellis-implement` / `trellis-check` only after `task.py start`.
- Run Phase 3.3 spec update, Phase 3.4 commit planning, and `/trellis:finish-work`.

### Codex `trellis-implement`

The implement agent owns code/template edits after activation:

- Resolve active task from `Active task:` or `task.py current --source`.
- Read `implement.jsonl`, then `prd.md`, `design.md`, `implement.md`.
- Follow accepted constraints in task artifacts and referenced research.
- Implement directly and never spawn nested `trellis-implement` / `trellis-check`.
- Do not create or update Codex native goals.
- Do not make user-authority decisions for Grill Gate.

### Codex `trellis-check`

The check agent owns verification and self-fix after implementation:

- Resolve active task and read `check.jsonl`, task artifacts, and relevant specs.
- Verify changed code against task artifacts and specs.
- Treat accepted architecture constraints as blockers only when they are current-task scoped and evidence-backed.
- Treat adjustable recommendations or legacy debt as warnings/follow-ups.
- Never spawn nested Trellis implement/check agents.
- Do not run Phase 3.4 commit or `/trellis:finish-work`.

### Codex `trellis-research`

The research agent may produce durable research files under `{TASK_DIR}/research/`. It must not edit source, workflow, specs, agents, or git state. For `codex-inline`, research stays in the main session when active-task resolution would be unreliable.

## Synchronization Model

The implementation must update all authoritative layers that define Codex behavior:

1. Local dogfood files in this repo:
   - `.trellis/workflow.md`
   - `.codex/agents/trellis-implement.toml`
   - `.codex/agents/trellis-check.toml`
   - possibly `.agents/skills/*` if the local skill layer is missing bundled skills required by current workflow semantics.
2. Template source for fresh init and update:
   - `packages/cli/src/templates/trellis/workflow.md`
   - `packages/cli/src/templates/codex/agents/trellis-implement.toml`
   - `packages/cli/src/templates/codex/agents/trellis-check.toml`
   - relevant bundled skills and meta references if changed.
3. Update path:
   - `collectPlatformTemplates.codex.collectTemplates()` already collects `.codex/agents/*.toml`.
   - `.trellis/workflow.md` is whole-file hash-tracked and already has update integration coverage.
   - If a new user-visible update note is needed, add a migration manifest with no file migration and notes telling users to run `trellis update`.

## Parity Rules

`codex-inline` and `codex-sub-agent` should share these semantics:

- Goal Mode is a main-session/native-goal concern. Sub-agents consume artifacts; they do not own native goal lifecycle.
- Grill Gate is a Phase 1 artifact gate. Implement/check agents must not invent proxy answers.
- Architecture Shaping constraints become binding only when accepted in `design.md`, `implement.md`, or referenced research.
- JSONL manifests are context lists for sub-agent/spec/research files; they do not replace `implement.md`.
- Breadcrumb text must be safe if inherited by a sub-agent; sub-agents self-exempt from main-session dispatch instructions.

## Testing Strategy

Add or adjust tests at the smallest existing layers:

- Template tests for `.codex/agents/trellis-implement.toml` and `trellis-check.toml` to lock new prelude constraints.
- Regression tests for `codex.dispatch_mode` routing only if workflow text changes affect markers or step filtering.
- Update integration test only if this task changes update mechanics or reveals that current hash-tracked update path does not refresh the affected files.
- Manifest continuity tests only if a new manifest is added.

## Compatibility

Default behavior for current projects must remain conservative:

- Projects in `inline` mode continue to route through `trellis-before-dev`.
- Projects explicitly set to `sub-agent` get stronger sub-agent prelude constraints.
- User-modified `.trellis/workflow.md` or `.codex/agents/*.toml` remain protected by hash-based update conflict handling.
- Non-Codex platforms are not deliberately changed.

## Risks

- Copying template text into local dogfood files without updating source templates would make this repo pass locally but fresh init/update drift.
- Updating only `workflow.md` would remind the main session about new rules but leave sub-agents under-instructed.
- Overloading implement/check agents with Goal/Grill authority would create a second execution controller and violate Trellis boundaries.
- Broadening scope to all platforms would slow this task and add compatibility risk unrelated to the user request.
