# Restore trellis-grill-me Design

## Design Intent

`trellis-grill-me` should become the Trellis-native attended planning grill skill. Its generated instructions should be short, positive, and focused on how to grill Trellis planning artifacts with the real user.

## Current State

- There is no current skill template source that generates `trellis-grill-me`.
- `trellis-grill-agents` exists as a bundled skill and describes itself as the unattended sibling of `trellis-grill-me`.
- Workflow and brainstorm guidance already have a Grill Gate concept, but `trellis-grill-me` is not yet a generated canonical skill.
- `resolveBundledSkills()` already copies complete directories from `packages/cli/src/templates/common/bundled-skills/` into each platform skill root.

## Proposed Shape

Add `trellis-grill-me` as a bundled shared skill:

- `packages/cli/src/templates/common/bundled-skills/trellis-grill-me/SKILL.md`

A single `SKILL.md` should be enough for the first implementation. Add references only if the skill grows beyond a concise executable workflow.

## Skill Contract

`trellis-grill-me` must combine two layers:

1. Attended grill behavior:
   - relentless user interview about a plan or design;
   - one question at a time;
   - each question includes a recommended answer;
   - repo-answerable facts must be inspected instead of asked.
2. Trellis integration:
   - identify active task and target artifact;
   - freeze task request, scope, non-goals, success criteria, and acceptance bar;
   - ask only human-authority questions after repository evidence is exhausted;
   - write confirmed decisions into `prd.md`, `design.md`, or `implement.md`;
   - record unresolved user decisions as blockers;
   - record the Grill Gate result.

## Routing Changes

Update routing language to make `trellis-grill-me` canonical:

- Grill Gate result for attended grilling should be `trellis-grill-me required`.
- Workflow breadcrumbs should route real user decisions to `trellis-grill-me`.
- `trellis-brainstorm` should tell agents to use `trellis-grill-me` when real user decisions remain.
- `trellis-grill-agents` remains the explicit unattended/proxy sibling.

Generated Trellis project text should assume `trellis-grill-me` is the available attended planning grill entry and stay focused on its own workflow.

## Workflow Role

`trellis-grill-me` is the attended Grill Gate executor in Phase 1.

It runs after `trellis-brainstorm` has captured enough initial requirements to create or revise `prd.md` and, for complex tasks, `design.md` / `implement.md`. It pressure-tests requirements, technical design, and the implementation plan before `task.py start` when the remaining uncertainty requires the real user rather than repository evidence or proxy answers.

It can also be re-entered later in planning when material requirements change and the previous Grill Gate decision no longer covers the task.

It is not:

- the task creator (`task.py create` and `trellis-brainstorm` own initial artifact creation);
- the broad requirement discovery engine (`trellis-brainstorm` owns exploration and MVP shaping);
- the unattended proxy path (`trellis-grill-agents` owns that);
- the execution or verification gate (`trellis-implement` / `trellis-check` / review agents own those).

The durable result of `trellis-grill-me` is not a separate queue. It writes confirmed user decisions, rejected branches, unresolved human decisions, and the Grill Gate outcome back into normal Trellis artifacts.

## Where "Implementation" Is Produced

Trellis uses "implementation" in two related but separate senses:

- `implement.md` is the implementation plan. It is produced during Phase 1 planning after requirements and design are clear enough to sequence work, name validation commands, and identify rollback points.
- Source code implementation is produced during Phase 2.1 by `trellis-implement` or the main implementation session after `task.py start`.

`trellis-grill-me` can grill the implementation plan in `implement.md` before execution starts. It should not be the code review tool for already-written code; after code exists, `trellis-check` and review agents verify whether the implementation satisfies `prd.md`, `design.md`, `implement.md`, specs, tests, and architecture constraints. If that check exposes a requirements/design ambiguity, the workflow can roll back to Phase 1 and run `trellis-grill-me` again.

## Generation Boundary

The canonical Trellis output is `trellis-grill-me/SKILL.md`.

This does not attempt to delete or manage any user-global personal skills outside the Trellis project.

## Tests

Focused tests should verify:

- bundled skill tracking includes `trellis-grill-me/SKILL.md` for skill-writing platforms;
- Codex generation includes `.agents/skills/trellis-grill-me/SKILL.md`;
- generated `trellis-grill-me/SKILL.md` stays concise and focused on its own workflow;
- workflow / brainstorm / continue guidance uses `trellis-grill-me` as canonical attended route;
- `trellis-grill-agents` still points real user decisions back to `trellis-grill-me`.

## Risks

- Some old tests or docs may use previous attended route wording; update only Trellis-managed routing that matters for this task.
- If non-Codex platform output is included, tests must avoid brittle per-platform assumptions and rely on shared template collection where possible.
- Current working tree has unrelated dirty changes in common template/configurator areas; implementation must stage only this task's files.
