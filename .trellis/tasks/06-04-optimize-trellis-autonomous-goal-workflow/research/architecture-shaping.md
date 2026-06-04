# Architecture Shaping

## Problem

The current Trellis Goal workflow is durable and auditable, but not visibly more autonomous than a normal Trellis task. The product goal is to make long-running unattended goals behave as delegated-autonomy work: agent researches, decides, tests, records, and continues while the objective remains unchanged.

## Invariants

- Trellis must not become a second execution engine for Codex native goals.
- `task.json.status` lifecycle remains unchanged.
- Goal metadata remains routing metadata, not runtime state.
- All durable state stays in normal Trellis artifacts.
- Medium ambiguity can be pressure-tested by `trellis-grill-agents`; high ambiguity still blocks.
- Source-backed research must use the approved `smart-search` path.
- Completion remains evidence-based.

## Architecture Choice

Add an autonomy layer to the existing Goal Contract and artifact protocol:

1. `prd.md`: objective, constraints, Autonomy Charter, user-only decisions, acceptance criteria.
2. `design.md`: technical boundary, autonomous research evidence, accepted/rejected options.
3. `implement.md`: checkpoints, evidence chain, delegated decision log, stop/block records.
4. `research/*.md`: fetched research summaries, grill-agent transcripts/summaries, disputed material.
5. Native `create_goal` objective: compact pointer to artifacts plus explicit delegated-autonomy instruction.

## Why This Shape

- It creates a user-visible difference from ordinary tasks without adding a brittle local runner.
- It preserves compatibility with existing task lifecycle and Codex native goal status.
- It turns "agent decided this" into auditable artifact state.
- It gives `trellis-grill-agents` a clear execution-time role without making it the execution controller.

## Rejected Shapes

- Add a `goals/` directory: rejected because it creates another source of truth.
- Add `task.json.status = goal_active`: rejected because workflow-state contract requires every status writer to be audited and the native goal already owns execution state.
- Add a local queue/daemon: rejected because Trellis Goal should bridge to Codex native goal, not compete with continuous-agent-style systems.
- Auto-spawn child native goals: rejected because parent/child tasks are work-breakdown/evidence units, not native-goal fanout.

## Open Design Questions

- Whether to store evidence chain purely in Markdown or add JSONL records later. Default: Markdown now; JSONL only if implementation proves machine parsing is needed.
- Whether `trellis-grill-agents` bundled template should be changed in this task or only referenced by `trellis-goal`. Default: change only enough to define goal execution-time use if a bundled template exists.
- How strict tests should be for prose templates. Default: assert load-bearing phrases/sections, not full snapshots.

