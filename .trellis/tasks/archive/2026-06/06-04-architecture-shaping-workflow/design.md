# Architecture Shaping Workflow Design

## Design Intent

Trellis should prevent toy MVP structure before code is written. The system should preserve the existing three-phase workflow while adding an architecture-shaping routine that turns long-lived project assumptions into concrete planning and review artifacts.

## Proposed Shape

Add a Trellis-native skill named `trellis-architecture-shaping`.

This name is preferred for the first implementation because it describes the primary missing capability: shaping new work before implementation. The original `improve-codebase-architecture` idea is still useful, but its name leans toward broad refactoring of existing code. Trellis can later add `trellis-improve-architecture` as a second skill if existing-code opportunity mining becomes a separate workflow.

## Placement In Trellis

### Skill Source

Create the skill as a bundled shared skill:

- `packages/cli/src/templates/common/bundled-skills/trellis-architecture-shaping/SKILL.md`
- Optional reference files under `references/` for vocabulary and output template.

Bundled skills are discovered by `getBundledSkillTemplates()` in `packages/cli/src/templates/common/index.ts`, resolved by `resolveBundledSkills()` in `packages/cli/src/configurators/shared.ts`, and written to platform skill roots such as `.agents/skills/`.

### Workflow Routing

Update `packages/cli/src/templates/trellis/workflow.md` and local `.trellis/workflow.md` planning guidance:

- Core principles: Trellis-created projects are long-lived by default.
- Planning artifacts: complex tasks should capture architecture shape in `design.md`.
- Phase 1 owner: the main planning session, usually while using `trellis-brainstorm`, records the architecture-shaping trigger decision before `task.py start`.
- Trigger decision landing place: record the decision in `design.md` for complex tasks, or in `prd.md` for PRD-only tasks. If shaping is required, create or reference `research/architecture-shaping.md` and list it in `implement.jsonl` / `check.jsonl` when sub-agents need it. If shaping is skipped, record the low-risk reason so the skip is visible to later agents.
- Phase 1.2 Research: architecture shaping is the recommended research routine when a task creates modules, changes cross-layer contracts, introduces durable domain behavior, or risks toy-MVP implementation.
- `[workflow-state:planning]` and `[workflow-state:planning-inline]`: mention `trellis-architecture-shaping` as the route for architecture-sensitive planning, without forcing it for every tiny task.
- Active Task Routing: add architecture improvement / module-boundary / anti-toy-MVP requests -> `trellis-architecture-shaping`.

### Implementation And Check Agents

Update implement/check/review prompts so the anti-toy rule is enforced after planning:

- `trellis-implement`: replace "Don't add unnecessary abstractions" style wording with "Preserve necessary structure; avoid speculative abstractions." It should treat `design.md` architecture shape and `research/architecture-shaping.md` as implementation constraints.
- `trellis-check`: verify code shape against the PRD/design/research artifacts, not only correctness.
- `trellis-code-architecture-review`: explicitly block toy-MVP failure modes and verify architecture shaping output when the task records one.


### Blocking Versus Warning Standard

`trellis-check` and `trellis-code-architecture-review` should block only inside the current task scope and only with artifact-backed evidence. Blocking findings require at least one of:

- The implementation violates accepted constraints referenced by `design.md` or `implement.md`.
- The changed code introduces mixed responsibilities, a second source of truth, hidden fallback behavior, or untestable core behavior without an accepted shallow-area explanation.
- A single file or module now carries multiple long-lived change axes for the task's domain behavior.

Warnings or follow-up candidates are appropriate for adjustable recommendations, task-external legacy debt, or shallow areas explicitly accepted in `research/architecture-shaping.md` / `design.md`.
## Skill Behavior

The skill should:

1. Read task artifacts and relevant `.trellis/spec/` entries.
2. Inspect the codebase before asking the user for repo-answerable facts.
3. Identify durable domain concepts and likely long-lived seams.
4. Propose a minimal production-shaped module layout.
5. Distinguish necessary structure from speculative abstraction.
6. Write findings to `research/architecture-shaping.md` when running inside an active task.
7. Update `design.md` recommendations only when the user approves or the current planning phase explicitly owns the artifact.

## Output Contract

`research/architecture-shaping.md` must distinguish constraint strength so research does not become either toothless advice or accidental over-engineering. It should include:

- Scope reviewed.
- Long-lived assumptions.
- Durable domain concepts.
- Proposed module boundaries.
- Test surfaces.
- Toy-MVP risks avoided.
- Accepted shallow areas and why they are acceptable.
- Accepted constraints: architecture shape that later agents must follow.
- Recommended but adjustable: useful suggestions that implementers may revise with evidence.
- Open decisions: unresolved human or technical decisions.
- Rejected/speculative abstractions: ideas explicitly not adopted.
- Open user decisions.

## Guardrails

- No separate `CONTEXT.md` or ADR requirement. Trellis uses `.trellis/spec/`, task docs, and research files as the fact system.
- No mandatory heavy review for trivial edits.
- No automatic refactor without a task and user-approved scope.
- No architecture astronaut mode: a module or seam must earn its complexity through locality, leverage, testing value, or expected repeated change.
- No second source of truth. Architecture shaping findings must either live as task research or be promoted into `.trellis/spec/` through `trellis-update-spec`.
- Constraint promotion rule: only accepted constraints that are referenced from `design.md` or `implement.md` bind implementation/check agents. Adjustable recommendations remain advisory. Open human decisions block `task.py start`; open technical checks become validation tasks.

## Minimum Viable Implementation Boundary

The first implementation should deliver the smallest closed loop that changes agent behavior:

- Bundled `trellis-architecture-shaping` skill.
- Template workflow trigger-decision guidance.
- Implement/check/review prompt constraints that preserve necessary structure.
- Focused tests or smoke checks proving the bundled skill and workflow text are installed/updated.

Local `.trellis/workflow.md` updates are only required if this task is meant to change the current repository live workflow before template propagation.

## Deferred Enhancements

- Extra reference examples for the skill beyond the minimal output contract.
- A future `trellis-improve-architecture` sibling skill for broad existing-code opportunity scans.
- An optional hard planning gate for complex greenfield tasks.
- Additional production-shaped MVP guide material beyond the workflow template, bundled skill, and agent prompt updates required for the minimum closed loop. A separate `.trellis/spec/guides/` guide is optional unless an existing spec-template entry is already the natural home.

## Risks

- Over-triggering the skill could slow small tasks. Mitigation: recommend it for architecture-sensitive work, not every edit.
- Agents may confuse "no toy MVP" with over-engineering. Mitigation: skill requires a minimal structure and explicitly rejects speculative abstraction.
- Existing prompts contain wording like "only do what's required" and "no over-engineering" that can be misread as "no abstraction." Mitigation: update wording across implement/check/review prompts.
- Template/local workflow drift is possible. Mitigation: update templates, local generated files if needed, and tests/hash expectations together.
