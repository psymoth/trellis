---
name: trellis-goal
description: "Use inside Trellis-managed Codex projects only when a user explicitly invokes /goal, asks about Codex native Goal Mode, requests unattended or long-running autonomous work, asks to initialize/convert/continue/pause/block/complete an audit-friendly Trellis-backed Codex goal, or asks to draft/review goal text. Also trigger on 目标模式, 无人值守任务, 长期自主执行, 自动推进, 需求加 goal, and 帮我写 goal. Do not trigger for ordinary multi-step coding tasks, lightweight prompts, simple Q&A, short reviews, or generic phrases like keep working until done unless the user clearly wants Goal Mode."
---

# Trellis Goal

Trellis Goal is the Codex-native goal bridge for Trellis-managed projects. Trellis prepares durable project artifacts; Codex native goal mode executes the unattended work.

The boundary is strict:

- Trellis owns `prd.md`, `design.md`, `implement.md`, optional `implement.jsonl` / `check.jsonl`, and `task.json.meta.trellis_goal`.
- Codex owns the active native goal created with `create_goal`.
- Trellis artifacts are context and evidence checkpoints for the Codex goal, not a second execution engine.
- Trellis parent/child task links remain ordinary `task.json.parent` / `task.json.children` links. A parent task may be the goal entrypoint; child tasks are Trellis work breakdown and evidence units, not automatically spawned native goals.

Official native limits to preserve:

- Native goal objectives have an absolute 4000-character limit. Target 3500 characters or less for `create_goal.objective`.
- `token_budget` is optional. Passing it can make the goal end as `BudgetLimited`; omit it unless the user explicitly supplied a token budget.
- Official docs describe goals as able to work for multiple or many hours. Do not promise uninterrupted multi-day or multi-week execution.
- Active goal continuations are ignored in Plan mode. Do not start or promise unattended auto-advance while the current environment is in Plan mode.

## Delegated Autonomy Model

Goal Mode is different from an ordinary Trellis task because the agent is delegated to keep moving when the goal objective stays the same. The delegation is bounded by the Goal Contract and must be recorded in Trellis artifacts.

- **Autonomy Charter**: `prd.md` must say what the agent may decide without asking the user and what remains user-owned.
- **Frozen Invariants**: objective, scope, out-of-scope boundaries, hard constraints, acceptance semantics, security/credential/legal/production/data-integrity boundaries, and Codex/Trellis ownership boundaries cannot be weakened or reinterpreted by the agent.
- **Decision Harness**: low-risk decisions may be evidence-only; medium ambiguity and nontrivial technical choices use `trellis-grill-agents` for unattended pressure testing; high-risk, scope-changing, or user-owned choices become Stop/Block.
- **Autonomous Research Protocol**: when current external evidence is needed, use the project-approved `smart-search` CLI path, fetch key sources, and record source URLs plus adopt/reject reasoning. Do not use unapproved web search paths.
- **Evidence Chain**: `implement.md` records current evidence, accepted decisions, rejected options, overturned assumptions, verification commands/results, remaining uncertainty, and recovery points.
- **Stop/Block**: when the next decision would change a Frozen Invariant, require credentials/payment/production/destructive/legal authority, or choose a private user preference, stop the affected path, record a Stop/Block entry, and use native `update_goal(status="blocked")` only under the Status Policy.

## Entry Modes

### When Not To Use Trellis Goal

Do not upgrade ordinary Trellis work into Goal Mode merely because it is multi-step. A normal Trellis task or normal Codex prompt remains the right path for one-off edits, simple explanations, short code reviews, focused debugging, small implementation requests, or questions where the user expects one answer and then a stop.

Do not use Trellis Goal when the finish line is vague, such as "make this better", "clean this up", "optimize everything", or a loose backlog of unrelated work. Use contract-only mode to draft or critique a bounded Goal Contract only when the user asks for goal text, goal design, or Goal Mode.

If the user says "continue", "finish this", "keep going", or "do it until done" during ordinary Trellis coding, treat it as normal task persistence unless they also mention `/goal`, Goal Mode, unattended execution, autonomous long-running work, or a persistent objective.

1. **New goal request**: when the user invokes `/goal <request>` or asks Trellis to run an unattended goal, read `references/goal-contract.md`, `references/task-mapping.md`, `references/ambiguity-handling.md`, `references/trellis-goal-protocol.md`, and `references/prd-mapping.md`. Create a normal Trellis task, initialize the Goal Contract, design, and checkpoints, run `task.py mark-goal <task> --source new-request`, activate the task when the gate passes, then call Codex native `create_goal`.
2. **Planning task conversion**: when an existing planning task should become a goal, preserve useful PRD material as evidence, rewrite the goal-facing sections into the Goal Contract structure, create/update `design.md` and `implement.md`, run `task.py mark-goal <task> --source planning-task`, activate after the gate passes, then call `create_goal`.
3. **In-progress task conversion**: when an already-started task should become a goal, first perform a Conversion Audit and add a `Reconcile Existing Work` checkpoint. Then create/update `design.md` and `implement.md`, run `task.py mark-goal <task> --source in-progress-task`, and call `create_goal` without resetting task status.
4. **Continuation**: if `task.json.meta.trellis_goal.enabled` is true, or `prd.md` contains a Trellis Goal Contract, load this skill to verify whether Codex native goal is already active. Apply the Status Policy below before continuing or bridging. If no native goal is active and `create_goal` is available, bridge the Trellis task into Codex native goal. If a native goal is active, keep using Trellis artifacts as context/checkpoints while Codex goal mode owns execution.
5. **Contract-only mode**: only when the user explicitly asks to write, review, or improve goal text without running it, use `references/goal-contract.md` and do not create, mark, start, bridge, or modify a Trellis task.

## Codex Bridge Contract

After a Trellis goal initialization gate passes in Codex, successful initialization is not complete until native `create_goal` has been called.

The `create_goal` objective must be a compact bridge, not a copy of the Trellis artifacts. Native `create_goal` rejects objectives over 4000 characters, so target 3500 characters or less.

The compact objective must include:

- the active Trellis task path
- a requirement to read `task.json.meta.trellis_goal`, `prd.md`, `design.md`, `implement.md`, and context manifests when present
- a requirement to run or mentally reproduce `task.py goal-info <task>` so parent/child task context and hierarchy warnings are visible
- a one-line objective summary plus current cadence / next-checkpoint hint
- an instruction that `prd.md` is the Goal Contract source, `design.md` is the technical boundary source, and `implement.md` checkpoints are evidence checkpoints rather than a separate queue
- an instruction to execute autonomously inside the `Autonomy Charter`, preserve `Frozen Invariants`, and use the `Decision Harness`, `Autonomous Research Protocol`, `Evidence Chain`, and `Stop/Block` boundary
- the required verification command or evidence policy, compressed to a path or short phrase when detailed in `implement.md`
- a requirement to update Trellis artifacts with work performed, verification evidence, accepted/rejected/overturned decisions, remaining risk, blockers, and final status
- a requirement to follow normal Trellis Phase 3.4 commit and finish/archive policy
- a requirement to use Codex native `update_goal` only when the goal is genuinely complete or blocked

Use this compact bridge shape for `create_goal.objective`:

```text
Complete the Trellis-backed goal for <task path>.
Sources to read first: task.json meta, prd.md, design.md, implement.md, and context manifests when present.
Objective: <one-line summary only; full contract is in prd.md>.
Next checkpoint: <checkpoint title/status from implement.md, or start at first pending checkpoint>.
Autonomy: work autonomously inside the Goal Contract and Autonomy Charter; keep Frozen Invariants unchanged; use trellis-grill-agents for medium ambiguity and smart-search evidence for external/current claims; Stop/Block high-risk or user-owned boundaries.
Rules: prd.md is the Goal Contract source; design.md is the technical boundary source; implement.md checkpoints and Evidence Chain are recovery/evidence landmarks, not a second queue.
Verify/report: follow implement.md verification policy, update Trellis artifacts with evidence/risks/blockers and accepted/rejected/overturned decisions, follow Trellis Phase 3.4, and call update_goal only for genuine complete/blocked terminal states.
```

Do not paste the full raw request, Goal Contract, checkpoint list, project rules, or spec excerpts into the native objective when those details already live in Trellis files. If `create_goal` rejects the handoff for length, compress the objective and retry once before recording a handoff blocker.

Only pass `token_budget` to `create_goal` when the user explicitly supplied a token budget. If the user did not explicitly request a token budget, omit the `token_budget` argument entirely and do not invent, infer, or include a bounded token budget in the objective.

If the current collaboration mode is Plan mode, do not call `create_goal` and do not promise automatic continuation. Record `## Blocked Codex Native Goal Handoff` in `prd.md` or `implement.md` with Plan mode as the reason, leave task artifacts durable, and report that native continuations resume only outside Plan mode.

If `create_goal` is unavailable in the current environment, do not simulate the goal with a Trellis checkpoint loop. Record `## Blocked Codex Native Goal Handoff` in `prd.md` or `implement.md`, leave task artifacts durable, and report that the Codex-native goal could not be started.

## Status Policy

When `get_goal` is available, inspect the native goal before continuing, bridging, or marking terminal status. Normalize status names before routing because tool or UI output may vary casing or separators.

- `Active`: continue the objective and keep Trellis artifacts current.
- `Paused`: do not continue automatically; report that the native goal is paused and needs `/goal resume` or user direction.
- `BudgetLimited`: do not call `update_goal(status="blocked")` or `complete`; record/report that the explicit user-supplied goal budget was exhausted.
- `UsageLimited`: do not call `update_goal(status="blocked")`; record/report that product/account usage limits stopped progress.
- `Blocked`: do not mark complete or re-block immediately; continue only after the user resolves or resumes the blocker, then start a fresh blocked audit.
- `Complete`: do not continue or create a replacement unless the user explicitly clears/starts a new goal.

## Hard Rules

- Use ordinary Trellis task state only: `task.json`, `prd.md`, `design.md`, `implement.md`, optional `implement.jsonl`, optional `check.jsonl`, and `research/`.
- Do not add a new `task.json.status`, a separate goal directory, a checkpoint queue file, a runtime mailbox, or another durable source of truth.
- Do not create or continue standalone `goals/<id>` or `goal-[num]` directories from this skill.
- Do not edit business/source code during goal initialization. Initialization writes only Trellis task artifacts and context manifests.
- Preserve the raw user request verbatim in `prd.md`.
- `prd.md` is the Goal Contract source of truth; `design.md` is the technical design source of truth; `implement.md` is the checkpoint/evidence source of truth.
- A parent task can be marked as the Trellis Goal. Its child tasks stay ordinary Trellis tasks used for breakdown, ownership, and evidence; do not auto-create or auto-run native goals for each child.
- If a child task is also marked with `task.json.meta.trellis_goal`, treat it as an independent possible handoff marker. Do not run it concurrently or implicitly under the parent native goal.
- Never invent or infer a token budget. User-supplied token budgets are optional and must be passed to `create_goal` only when explicit.
- Do not mark the native goal blocked or complete merely because it is paused, budget-limited, usage-limited, or the current turn is ending.
- Use `task.py mark-goal` for `task.json.meta.trellis_goal`; do not hand-edit goal metadata.
- Use `task.py goal-info` when resuming or auditing goal metadata and checkpoint progress.
- Configure `implement.jsonl` and `check.jsonl` only when the local workflow/platform uses context manifests or extra spec/research context is needed.
- Low-risk ambiguity becomes a recorded default assumption; medium ambiguity uses `trellis-grill-agents` only to pressure-test evidence-backed assumptions; high-risk, scope-changing, credential/production/legal/destructive, or user-owned ambiguity becomes Stop/Block.
- If the goal objective and Frozen Invariants remain unchanged, continue through autonomous research, grill, decision, implementation, verification, and Evidence Chain updates instead of falling back to the ordinary task clarification loop.
- Goal execution must not bypass Trellis Phase 3.4 commit confirmation policy.

## References

- `references/trellis-goal-protocol.md`: canonical Codex-native bridge protocol.
- `references/task-mapping.md`: Trellis persistence model, metadata shape, and conversion rules.
- `references/goal-contract.md`: Goal Contract fields and quality gate.
- `references/ambiguity-handling.md`: low/medium/high ambiguity policy and `trellis-grill-agents` recording rules.
- `references/prd-mapping.md`: `prd.md`, `design.md`, and `implement.md` skeletons.
- `references/project-types.md`: project-type defaults for verification and stop conditions.
- `references/scenarios.md`: common goal scenario patterns.
- `references/examples.md`: compact examples and anti-examples.
- `references/upstream-license.md`: license notice for prompt-shaping material.
