# Trellis Task Mapping

Trellis Goal uses the existing Trellis task lifecycle as durable context for a Codex native goal. The goal marker is routing metadata, not a second lifecycle or execution backend.

## Durable Files

| Purpose | Location |
|---|---|
| Lifecycle status | `task.json.status` (`planning`, `in_progress`, existing archive flow) |
| Goal routing marker | `task.json.meta.trellis_goal` |
| Parent/child hierarchy | `task.json.parent` and `task.json.children` |
| Raw request and Goal Contract | `prd.md` |
| Technical design, evidence, risks, verification commands | `design.md` |
| Native-goal checkpoints and progress evidence | `implement.md` |
| Implementation context manifest | `implement.jsonl` when the platform/workflow uses context manifests |
| Check context manifest | `check.jsonl` when the platform/workflow uses context manifests |
| Long research or grill output | `research/*.md` |

Do not create another goal directory, checkpoint queue, task status, runtime mailbox, or hidden durable state.

## Parent And Child Tasks

A Trellis Goal may live on a parent task. In that shape:

- the parent task is the Codex native goal entrypoint and owns the Goal Contract;
- child tasks remain ordinary Trellis tasks for breakdown, ownership, progress structure, and evidence;
- `task.py goal-info <parent>` is the audit entrypoint for goal metadata, checkpoint progress, child task status, and hierarchy warnings;
- archived child tasks still count as done for parent progress when they remain in the parent `children` list;
- a child task marked with `task.json.meta.trellis_goal` is an independent possible handoff marker, not a child goal automatically executed by the parent.

Do not add `goal_children`, a checkpoint queue, a local scheduler, or a fan-out native-goal runtime. Native Codex goal state remains singular and external to Trellis task hierarchy.

## Metadata Shape

Use `task.py mark-goal` to write this metadata:

```json
{
  "meta": {
    "trellis_goal": {
      "enabled": true,
      "version": 1,
      "cadence": "checkpoint-bounded",
      "source": "new-request",
      "converted_from_status": "planning",
      "converted_at": "2026-05-31T12:00:00+08:00",
      "updated_at": "2026-05-31T12:00:00+08:00"
    }
  }
}
```

Allowed `cadence` values:

- `checkpoint-bounded`: the native goal should keep checkpoint evidence fresh and may stop after a bounded checkpoint when the product pauses or resumes it.
- `run-to-completion`: the native goal handoff should ask Codex to keep working until the Goal Contract is satisfied or a terminal stop condition appears.

The cadence field is a handoff/progress hint. It must not be implemented as a local loop, queue, mailbox, or standalone runner.

Allowed `source` values:

- `new-request`
- `planning-task`
- `in-progress-task`

The marker helps agents route and resume. It must not duplicate the Goal Contract, checkpoint list, native goal status, or task lifecycle.

## New Goal Request

1. Create a normal Trellis task with `task.py create`.
2. Write `prd.md`, `design.md`, `implement.md`, and context manifests when needed.
3. Run:

```bash
python3 ./.trellis/scripts/task.py mark-goal <task> --source new-request --cadence checkpoint-bounded
```

Use `--cadence run-to-completion` only when the user explicitly requested run-to-completion style native goal execution.

After the initialization gate passes, call Codex native `create_goal` with a compact bridge objective that points to the Trellis task files.

## Planning Task Conversion

Use this when an existing task is still `planning`.

1. Read the current `prd.md` and task artifacts.
2. Preserve material that matters under `## Existing Planning Notes` or equivalent.
3. Rewrite the goal-facing sections into `Raw Goal Input`, `Goal Contract`, `Default Assumptions`, `Acceptance Criteria`, `Out of Scope`, and `Initialization Gate Evidence`.
4. Create or update `design.md` and `implement.md` checkpoints from the contract.
5. Configure `implement.jsonl` and `check.jsonl` only when needed for context loading.
6. Run:

```bash
python3 ./.trellis/scripts/task.py mark-goal <task> --source planning-task --cadence checkpoint-bounded
```

Do not run `task.py start` or call `create_goal` until initialization has passed.

## In-Progress Task Conversion

Use this when the task is already `in_progress`.

1. Perform a Conversion Audit before changing execution shape.
2. Record the audit in `prd.md` or `design.md`:
   - what work already exists
   - what evidence proves it
   - what remains unknown
   - whether current work matches the new Goal Contract
3. Add the first `implement.md` checkpoint as `Reconcile Existing Work`.
4. Mark existing verified work as done only when evidence is present.
5. Run:

```bash
python3 ./.trellis/scripts/task.py mark-goal <task> --source in-progress-task --cadence checkpoint-bounded
```

In-progress conversion does not reset status to `planning` and does not erase existing progress. After conversion, bridge or continue through Codex native goal state.

## Resume And Audit

Run:

```bash
python3 ./.trellis/scripts/task.py goal-info <task>
```

Use the output to confirm cadence, source, original status, conversion time, and checkpoint summary before choosing the next native goal handoff or continuation step.

For parent goals, also use the output to confirm child task statuses and hierarchy warnings before deciding whether the next evidence checkpoint is ready to execute.
