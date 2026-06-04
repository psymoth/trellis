# Trellis Goal Protocol

Trellis Goal prepares a normal Trellis task and bridges it into Codex native goal mode. It does not replace Trellis phases, status values, commit policy, finish/archive flow, or Codex native goal state.

## Ownership Boundary

| Owner | State |
|---|---|
| Trellis | `task.json`, `prd.md`, `design.md`, `implement.md`, optional `implement.jsonl` / `check.jsonl`, and `research/` |
| Codex native goal | active unattended execution state created by `create_goal` and inspected with `get_goal` |

`implement.md` checkpoints are evidence and recovery landmarks. They help the native goal resume and report progress; they are not a local queue, mailbox, or second execution runtime.

Parent/child task links are still ordinary Trellis hierarchy. A parent task can be the goal entrypoint while child tasks remain work-breakdown and evidence units. The parent native goal may read child task status through `task.py goal-info <parent>`, but it must not auto-spawn or auto-run native goals for those children.

## Delegated Autonomy Contract

A Trellis-backed goal is not only a longer ordinary task. It delegates execution judgment to the agent as long as the goal's `Frozen Invariants` remain unchanged.

### Autonomy Charter

`prd.md` must contain an `Autonomy Charter` for execution goals. It defines:

- `Frozen Invariants`
- decisions the agent may make autonomously
- user-only decisions
- `Decision Harness` routing
- `Autonomous Research Protocol`
- `Evidence Chain` recording requirements
- `Stop/Block` boundaries

The agent may autonomously research, grill, decide, implement, verify, and update evidence when the Objective, Scope, Constraints, Done When, Stop If, Out of Scope, safety boundaries, and ownership boundaries remain unchanged.

### Decision Harness

Route decisions during initialization and continuation:

- low risk: decide from repository/spec/test evidence and record the assumption
- medium ambiguity: use `trellis-grill-agents` for unattended pressure testing, then record accepted/rejected decisions
- high risk or user-owned: Stop/Block

`trellis-grill-agents` is not an execution controller. It pressures the decision and writes evidence back through the main session into Trellis artifacts.

### Autonomous Research Protocol

When current external evidence matters, use the project-approved research path. In Codex projects that require `smart-search`, only use local `smart-search` CLI subcommands. Fetch key sources before adopting claim-level conclusions, then record source URL, command or evidence path, adopted/rejected conclusion, reason, and remaining uncertainty.

### Evidence Chain

`implement.md` must be sufficient for a resumed native goal to recover:

- current evidence
- work performed
- accepted decisions
- rejected options
- overturned assumptions
- verification commands/results
- remaining uncertainty
- next recovery point

Long transcripts, fetched-source details, and disputed material belong in `research/`; `implement.md` keeps the summary and index.

## Initialization

1. **Inspect native goal state**
   If `get_goal` is available, call it before creating or bridging. Do not create a second native goal when one is already active.

2. **Resolve entry source**
   - new request: create a normal Trellis task
   - planning conversion: use the current planning task and preserve useful PRD material
   - in-progress conversion: audit existing work and add a `Reconcile Existing Work` checkpoint

3. **Write the Goal Contract**
   Preserve the raw request in `prd.md`, then write `Goal Contract`, `Autonomy Charter`, `Default Assumptions`, `Acceptance Criteria`, `Out of Scope`, and `Initialization Gate Evidence`.

4. **Write the technical boundary**
   Use `design.md` for project detection, relevant files, architecture decisions, Decision Harness details, Autonomous Research Protocol evidence, verification commands, risks, and rollback notes.

5. **Write checkpoint evidence plan**
   Use `implement.md`. Each checkpoint should have:
   - type: work or check
   - status: pending / in_progress / blocked / done
   - acceptance or verification evidence required
   - current evidence, work performed, verification command/result, remaining uncertainty, and next recovery point fields

   Checkpoints should be small enough that a resumed native goal can tell what evidence is missing. They do not impose a local per-turn execution cadence.

6. **Configure context**
   Add relevant specs and research files to `implement.jsonl` and `check.jsonl` only when the local workflow/platform uses context manifests. For inline Codex work, recording the same context plan in `prd.md` or `design.md` is acceptable.

7. **Handle ambiguity**
   Apply `ambiguity-handling.md`:
   - low risk: record a default assumption and continue
   - medium: use `trellis-grill-agents` only for evidence-backed pressure testing
   - high risk or user-owned: record Stop/Block and do not call `create_goal`

8. **Mark the task**
   Run `task.py mark-goal` with the correct `--source` and cadence hint. Do not hand-edit `task.json`.

9. **Gate and activate**
   If initialization passes, start the Trellis task when needed, then call Codex native `create_goal` with a compact bridge objective. If initialization fails, record `## Blocked Initialization` or `## Blocked Codex Native Goal Handoff` and do not simulate goal execution locally.

## Native Handoff

The `create_goal.objective` text is a compact pointer to Trellis artifacts. It should include:

- active task path
- files to read first
- one-line objective summary
- next checkpoint hint
- delegated-autonomy instruction to operate inside the Autonomy Charter, preserve Frozen Invariants, use `trellis-grill-agents` for medium ambiguity, use approved research evidence for external/current claims, and Stop/Block high-risk or user-owned boundaries
- verification/reporting policy
- instruction to update Trellis artifacts with evidence, accepted/rejected/overturned decisions, blockers, risks, and final status
- instruction to use `update_goal` only for genuine complete or blocked terminal states

Do not paste the full raw request, full Goal Contract, checkpoint list, project rules, or spec excerpts into the native objective when those details already live in Trellis files.

## Continuation

At the start of every continuation:

1. Use `get_goal` when available and apply the native status policy.
2. Run or mentally reproduce `task.py goal-info <task>`.
3. Read `task.json`, `prd.md`, `design.md`, `implement.md`, and context manifests when present.
4. Continue the active native goal objective autonomously inside the Autonomy Charter.
5. For nontrivial choices, use the Decision Harness: evidence-only for low risk, `trellis-grill-agents` for medium ambiguity, and Stop/Block for high-risk or user-owned boundaries.
6. Use the Autonomous Research Protocol when external/current evidence is needed.
7. Update `implement.md` with work performed, verification evidence, accepted/rejected/overturned decisions, remaining uncertainty, and next recovery point.

Evidence can be diff review, command output, logs, tests, typecheck, build, UI inspection, file review, or another concrete artifact suited to the checkpoint. Do not mark a checkpoint done from confidence alone.

For parent goals, `goal-info` child summaries are context, not a completion oracle. Use them to identify missing evidence, drift, or archived work, but only mark the native goal complete when the Goal Contract and final verification evidence are satisfied.

## Native Status Policy

- `Active`: continue the objective and keep Trellis artifacts current.
- `Paused`: do not continue automatically; report that the native goal is paused.
- `BudgetLimited`: report the exhausted user-supplied budget; do not mark blocked or complete.
- `UsageLimited`: report the product/account limit; do not mark blocked.
- `Blocked`: continue only after the blocker is resolved or the user resumes the goal.
- `Complete`: do not continue or create a replacement unless the user explicitly starts a new goal.

## Stop/Block

Record the blocker in Trellis artifacts before stopping. Use `update_goal(status="blocked")` only when the same blocking condition has repeated for the required Codex blocked threshold, or when a Goal Contract `Stop If` condition makes further work unsafe.

Do not use blocked merely because the work is hard, incomplete, or would benefit from clarification.

Stop/Block records include:

- blocker type
- triggering evidence
- blocked decision
- why not delegated
- required human answer
- recovery checkpoint
- native goal action

## Finalization

When the Goal Contract is satisfied:

1. Verify every `Done When` item with evidence.
2. Confirm no `Stop If` condition is active.
3. Confirm every delegated decision has Evidence Chain support and no Frozen Invariant was changed.
4. Run required tests, lint, typecheck, build, screenshots, or static checks.
5. For parent goals, review `task.py goal-info <task>` and resolve or record hierarchy warnings before final status.
6. Update `implement.md` and task artifacts with final evidence and remaining risks.
7. Follow Trellis Phase 3.4 commit confirmation and finish/archive policy.
8. Call `update_goal(status="complete")` only when no required work remains.

If commit confirmation or archive policy requires user confirmation, record the pending plan and stop there; do not claim full completion until the normal Trellis finish path is complete.
