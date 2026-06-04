# Research: canonical-goal-autonomy-template-tests

- Query: Locate the canonical template files and tests most relevant to implementing Trellis Goal delegated autonomy planning, including current test style, commands, specs, minimal edit points, and risks.
- Scope: internal
- Date: 2026-06-04

## Findings

### Files Found

- `packages/cli/src/templates/common/bundled-skills/trellis-goal/SKILL.md` - primary bundled skill entrypoint for Trellis Goal routing, Codex bridge objective, native status policy, and hard lifecycle boundaries.
- `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/goal-contract.md` - canonical Goal Contract fields and quality gate.
- `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/ambiguity-handling.md` - low/medium/high ambiguity policy and current `trellis-grill-agents` integration.
- `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/prd-mapping.md` - skeletons for `prd.md`, `design.md`, and `implement.md`; best target for Autonomy Charter and Evidence Chain fields.
- `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/trellis-goal-protocol.md` - canonical native-goal initialization, continuation, and completion protocol.
- `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/task-mapping.md` - durable-state mapping and no-second-lifecycle constraints.
- `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/examples.md` - example / anti-example text that may need phrase alignment after adding autonomy sections.
- `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/scenarios.md` - scenario-specific Stop If guidance.
- `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/project-types.md` - project-type defaults for verification and stop conditions.
- `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/upstream-license.md` - license notice; not behavior-critical for this task.
- `packages/cli/src/templates/trellis/workflow.md` - canonical workflow / breadcrumb template. Goal execution guidance lives in `[workflow-state:*]` blocks and Phase Index prose.
- `marketplace/workflows/native/workflow.md` - bundled workflow mirror asserted equal to `workflowMdTemplate`; likely must be synchronized if `packages/cli/src/templates/trellis/workflow.md` changes.
- `packages/cli/test/templates/trellis.test.ts` - current canonical place for workflow template string assertions.
- `packages/cli/test/regression.test.ts` - current place for workflow-state invariant regressions and historical bug guards.
- `packages/cli/test/scripts/task-goal.integration.test.ts` - current integration tests for Python `task.py mark-goal`, `goal-info`, and goal hierarchy display.
- `packages/cli/test/configurators/index.test.ts` - verifies bundled skill directories and reference files are copied into platform skill roots.
- `packages/cli/test/configurators/platforms.test.ts` - platform expected bundled skill file lists include `trellis-goal` files.
- `packages/cli/src/templates/trellis/scripts/task.py` - command registration for `mark-goal` / `goal-info`.
- `packages/cli/src/templates/trellis/scripts/common/task_store.py` - behavior implementation for goal metadata and checkpoint summary.
- `packages/cli/src/templates/common/index.ts` - bundled skill loader; copies all files under `common/bundled-skills/<skill>/` recursively.

### Code Patterns

- `trellis-goal/SKILL.md` declares Trellis as the artifact layer and Codex native goal as execution owner; Codex owns active goal state created with `create_goal` (`packages/cli/src/templates/common/bundled-skills/trellis-goal/SKILL.md:8`, `:13`).
- The compact `create_goal.objective` contract already warns against copying full artifacts and requires short bridge text (`packages/cli/src/templates/common/bundled-skills/trellis-goal/SKILL.md:40`, `:44`, `:58`, `:69`).
- Current hard rules already forbid new status values, goal directories, checkpoint queues, runtime mailboxes, and fan-out child native goals (`packages/cli/src/templates/common/bundled-skills/trellis-goal/SKILL.md:88`, `:91`, `:92`, `:96`).
- Medium ambiguity currently routes to `trellis-grill-agents`, but only as unattended pressure testing and advisory output until written back to artifacts (`packages/cli/src/templates/common/bundled-skills/trellis-goal/references/ambiguity-handling.md:10`, `:28`, `:57`).
- `prd-mapping.md` already provides skeleton anchors for `Raw Goal Input`, `Goal Contract`, `Default Assumptions`, ambiguity table, initialization evidence, technical design, checkpoints, Codex goal status, and verification evidence (`packages/cli/src/templates/common/bundled-skills/trellis-goal/references/prd-mapping.md:10`, `:20`, `:39`, `:48`, `:84`, `:100`, `:134`, `:138`, `:143`, `:150`).
- `trellis-goal-protocol.md` already states `implement.md` checkpoints are evidence and recovery landmarks, not a local queue/mailbox/runtime (`packages/cli/src/templates/common/bundled-skills/trellis-goal/references/trellis-goal-protocol.md:10`, `:12`, `:14`).
- Current workflow goal entry and planning breadcrumbs route `/goal` and initialized/converted goal tasks through `trellis-goal` and Codex native goal state (`packages/cli/src/templates/trellis/workflow.md:197`, `:214`, `:231`).
- Current execution breadcrumbs for both sub-agent and inline modes say to load `trellis-goal`, inspect native goal state, continue only active native goals, and use `implement.md` as evidence/recovery landmarks rather than a local queue (`packages/cli/src/templates/trellis/workflow.md:255`, `:268`).
- Workflow execution breadcrumbs must keep Phase 3.4 commit reachable (`packages/cli/src/templates/trellis/workflow.md:257`, `:269`; spec invariant at `.trellis/spec/cli/backend/workflow-state-contract.md:166` and regression test at `packages/cli/test/regression.test.ts:3234`).
- Bundled skill files are loaded recursively by `getBundledSkillTemplates`; adding a new reference `.md` under `trellis-goal/references/` will be included automatically, but platform expected-file lists may need test updates (`packages/cli/src/templates/common/index.ts:99`, `:112`, `:128`).
- `task.py mark-goal` only writes `task.json.meta.trellis_goal` metadata, preserving status and custom meta (`packages/cli/src/templates/trellis/scripts/common/task_store.py:299`, `:325`, `:328`, `:332`).
- `task.py goal-info` reads metadata, hierarchy, and parsed checkpoint headings; it is display/reporting behavior, not a scheduler (`packages/cli/src/templates/trellis/scripts/common/task_store.py:258`, `:346`, `:366`).
- Only archive writes `status = "completed"` in `task_store.py`; goal metadata commands are not status writers (`packages/cli/src/templates/trellis/scripts/common/task_store.py:605`).

### Existing Test Modes

- Template string assertions: `packages/cli/test/templates/trellis.test.ts` extracts workflow-state blocks and asserts load-bearing phrases for goal routing, grilling, architecture shaping, dispatch guards, and parent/child guidance (`packages/cli/test/templates/trellis.test.ts:50`, `:156`, `:173`, `:245`).
- Workflow mirror assertion: `packages/cli/test/templates/trellis.test.ts` requires `marketplace/workflows/native/workflow.md` to exactly match `workflowMdTemplate` (`packages/cli/test/templates/trellis.test.ts:112`, `:120`).
- Regression assertions: `packages/cli/test/regression.test.ts` checks workflow-state blocks preserve commit, planning artifact, no-task, and completed-block invariants (`packages/cli/test/regression.test.ts:3234`, `:3341`, `:3359`, `:3366`).
- Python CLI integration: `packages/cli/test/scripts/task-goal.integration.test.ts` stamps template scripts into a temp `.trellis` project and runs real Python commands with `spawnSync`, not mocked internals (`packages/cli/test/scripts/task-goal.integration.test.ts:2`, `:94`, `:102`, `:149`, `:194`, `:246`).
- Goal metadata behavior tests assert `mark-goal` preserves `task.json.status`, preserves custom meta, writes version/cadence/source/conversion timestamps, and `goal-info` reports checkpoint counts and parent/child drift warnings (`packages/cli/test/scripts/task-goal.integration.test.ts:138`, `:139`, `:144`, `:191`, `:237`, `:260`).
- Bundled skill install tests assert required `trellis-goal` files are present after configurator output (`packages/cli/test/configurators/index.test.ts:381`, `:383`, `:387`, `:392`, `:396`; `packages/cli/test/configurators/platforms.test.ts:41`, `:57`, `:62`, `:67`, `:69`, `:74`).
- Test style is mostly focused phrase checks for load-bearing template contracts, not full Markdown snapshots. This matches the current risk: delegated-autonomy is primarily template/protocol wording unless CLI behavior changes.

### Suggested Minimal Modification Points

1. Update `packages/cli/src/templates/common/bundled-skills/trellis-goal/SKILL.md`.
   - Add a short `Autonomy Charter` / delegated autonomy rule near the bridge or hard rules.
   - Update compact `create_goal.objective` shape to explicitly authorize autonomous technical/execution decisions within the Goal Contract and Autonomy Charter.
   - Preserve existing no-runner/no-queue/no-extra-status wording.

2. Update `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/goal-contract.md`.
   - Add required Goal Contract or quality gate language for `Autonomy Charter`, `Decision Harness`, `Autonomous Research Protocol`, `Evidence Chain`, `Frozen Invariants`, and Stop/Block boundaries.
   - Keep the current gate shape; do not introduce new task lifecycle concepts.

3. Update `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/ambiguity-handling.md`.
   - Expand medium ambiguity from initialization-only pressure testing into active-goal delegated decision pressure testing.
   - Keep `trellis-grill-agents` advisory and artifact-hardening only; it must not become an execution controller.

4. Update `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/prd-mapping.md`.
   - Add skeleton sections/fields for `Autonomy Charter`, `Frozen Invariants`, `Decision Harness`, `Autonomous Research Protocol`, `Evidence Chain`, delegated decision log, rejected options, overturned assumptions, and Stop/Block Record.
   - This is the lowest-risk place to make future generated artifacts auditable without changing `task.py`.

5. Update `packages/cli/src/templates/common/bundled-skills/trellis-goal/references/trellis-goal-protocol.md`.
   - Add continuation-time instructions: autonomous research through approved project search tooling, use `trellis-grill-agents` for medium-risk nontrivial choices, and write decisions/evidence back to artifacts before moving on.
   - Keep `update_goal` terminal-status policy unchanged.

6. Update `packages/cli/src/templates/trellis/workflow.md`.
   - Strengthen `[workflow-state:planning]`, `[workflow-state:planning-inline]`, `[workflow-state:in_progress]`, and `[workflow-state:in_progress-inline]` goal-specific lines.
   - Goal-task execution breadcrumbs should explicitly differ from ordinary tasks: within frozen scope, research, grill, decide, and record evidence before asking the user.
   - Keep Phase 3.4 commit guidance visible in both in-progress blocks.
   - Mirror the same workflow content to `marketplace/workflows/native/workflow.md` or the existing equality test will fail.

7. Add or update tests without changing Python CLI behavior unless behavior actually changes.
   - In `packages/cli/test/templates/trellis.test.ts`, extend the `[trellis-goal] workflow.md breadcrumbs route goal mode` assertions to include `Autonomy Charter`, delegated autonomy / autonomous research, `trellis-grill-agents`, evidence update, and Codex native goal ownership.
   - Add a bundled skill content assertion, either in `packages/cli/test/configurators/index.test.ts` or a focused template test, that `trellis-goal` references include load-bearing phrases: `Autonomy Charter`, `Decision Harness`, `Autonomous Research Protocol`, `Evidence Chain`, `Frozen Invariants`, `Stop/Block`.
   - Keep `packages/cli/test/scripts/task-goal.integration.test.ts` mostly unchanged unless `task.py` behavior changes. It already covers metadata-only and display-only behavior.
   - If adding new reference files under `trellis-goal/references/`, update expected bundled skill file lists in configurator/platform tests as needed.

### Verification Commands

Run from `packages/cli` unless noted:

- `pnpm test -- test/templates/trellis.test.ts`
- `pnpm test -- test/configurators/index.test.ts test/configurators/platforms.test.ts`
- `pnpm test -- test/scripts/task-goal.integration.test.ts`
- `pnpm test -- test/regression.test.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm run build`

Optional focused exact checks after implementation:

- Search for forbidden new lifecycle/runtime artifacts: `rg -n "goal_children|goals/|checkpoint queue|runtime mailbox|scheduler|new task\\.json\\.status|status\\s*=\\s*['\\\"]blocked|status\\s*=\\s*['\\\"]goal" packages/cli/src`
- Confirm command registration still only exposes metadata/display goal commands: `rg -n "mark-goal|goal-info" packages/cli/src/templates/trellis/scripts`

### Related Specs

- `.trellis/spec/cli/backend/index.md` - pre-development checklist says workflow-state edits must read the workflow-state contract and tests should be considered for behavior changes (`.trellis/spec/cli/backend/index.md:37`, `:59`, `:63`, `:72`, `:76`).
- `.trellis/spec/cli/backend/workflow-state-contract.md` - breadcrumb body is source-of-truth in workflow.md; no fallback dicts; no new status writer without updating writer table (`.trellis/spec/cli/backend/workflow-state-contract.md:166`).
- `.trellis/spec/cli/backend/script-conventions.md` - Python script conventions apply if `task.py` or common script behavior is touched; current research suggests avoiding script edits.
- `.trellis/spec/cli/unit-test/index.md` - CI expectation is `pnpm lint` -> `pnpm build` -> `pnpm test`; quality check suggests `pnpm lint && pnpm typecheck && pnpm test` (`.trellis/spec/cli/unit-test/index.md:58`, `:74`, `:82`).
- `.trellis/spec/cli/unit-test/conventions.md` - pure template text normally does not need tests, but bug-fix / load-bearing workflow contract changes use regression/template assertions; avoid tautological tests (`.trellis/spec/cli/unit-test/conventions.md:47`, `:55`, `:62`).
- `.trellis/spec/cli/unit-test/integration-patterns.md` - command-level integration tests use real temp directories and real filesystem operations instead of internal mocks.
- `.trellis/spec/guides/index.md` - project-local operating rules point back to AGENTS.md for Codex-only Trellis platform scope.

### External References

- None used. This research was internal-only because the requested scope was locating canonical repo files, tests, commands, and specs.

## Caveats / Not Found

- `python ./.trellis/scripts/task.py current --source` returned no active task in this shell. The user explicitly supplied `.trellis/tasks/06-04-optimize-trellis-autonomous-goal-workflow`, so this file was written there.
- Fast Context was not used because the user supplied exact target directories/files; source files were read directly.
- No source/template/test files were modified and no tests were run; verification commands above are recommended for the implement agent after changes.
- No evidence suggests a required `task.py` behavior change for delegated autonomy. Existing CLI should remain metadata-only/read-only for goal commands unless implementation discovers a concrete display need.
- If `packages/cli/src/templates/trellis/workflow.md` changes, `marketplace/workflows/native/workflow.md` must likely change in the same implementation because the current test requires exact equality.
