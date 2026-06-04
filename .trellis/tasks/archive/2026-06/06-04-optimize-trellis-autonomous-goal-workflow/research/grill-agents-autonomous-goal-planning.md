# Trellis Grill Agents Run

- Target artifact: `prd.md`, `design.md`, `implement.md`
- Date: 2026-06-04
- Mode: lightweight
- Flags: run_artifact
- Frozen problem: optimize Trellis Goal so long-running unattended goals feel more autonomous while preserving existing Trellis task lifecycle and Codex native goal ownership.
- Conclusion: needs revision; accepted revisions written back
- Human input required: no
- Attempted problem change: no
- Isolation: real interviewer sub-agent + main-session proxy respondent

## Historical Note

The main session briefly recorded this grill as blocked after reading `trellis-grill-agents` hard rules and before discovering the dynamic `multi_agent_v1.spawn_agent` tool. After tool discovery, a real interviewer sub-agent was spawned and the grill completed. The historical blocker is preserved here for auditability; it is no longer the current Grill Gate state.

## Mission Packet

```text
任务目录: .trellis/tasks/06-04-optimize-trellis-autonomous-goal-workflow
目标 artifact: prd.md, design.md, implement.md, research/community-goal-direction.md, research/architecture-shaping.md
原始请求: 用户点名 trellis-brainstorm 与 trellis-grill-agents，要求走 Trellis 流程规划怎么优化 Trellis Goal。
冻结题面: 优化 Trellis Goal，使长期无人值守的大任务体现更强自主性；目标不变时由 agent 自主联网调研、技术选型、方案取舍、checkpoint 推进，并用 trellis-grill-agents 和 evidence chain 留下可审计记录。
非目标: 不新增 local daemon、queue、scheduler、runtime mailbox、新 task.json.status、独立 goals/ 目录、自动 child native goals；不改变 Codex native goal 对 execution state 的所有权。
成功标准: artifacts 足以指导后续实现，明确 Autonomy Charter、Decision Harness、Autonomous Research Protocol、Evidence Chain、Stop/Block boundary、tests/verification plan。
验收门槛: 不能隐藏需要真人的 scope/product/security/credential/legal/production 决策；不能让 Trellis 变成第二执行引擎；后续 implementation checkpoint 必须可验证。
```

## Summary Transcript

| Round | Question Theme | Respondent | Result |
|---:|---|---|---|
| 1 | `trellis-grill-agents` mandatory triggers vs evidence-only decisions | 我同意，采用采访者推荐方向。 | Define mandatory grill triggers, evidence-only criteria, and unavailable behavior. |
| 2 | Evidence Chain minimum record unit | 我同意，采用采访者推荐方向。 | Define per-checkpoint minimum fields and triggered extra fields. |
| 3 | What counts as "goal unchanged" | 我同意，采用采访者推荐方向。 | Add Frozen Invariants and Delegated Execution Plan. |
| 4 | Autonomous Research Protocol triggers and evidence priority | 我同意，采用采访者推荐方向。 | Add research triggers, no-search criteria, priority order, conflict handling. |
| 5 | Verifiable tests and negative assertions | 我同意，采用采访者推荐方向。 | Add template/workflow/CLI positive assertions and no-second-lifecycle negative checks. |
| 6 | Source-of-truth and sync boundary | 我同意，采用采访者推荐方向。 | Canonical shipped behavior lives under `packages/cli/src/templates/**`; local instances are mirrors only. |
| 7 | Native blocker coordination | 我同意，采用采访者推荐方向。 | Write Trellis Stop/Block Record first; call `update_goal(blocked)` only under native policy. |
| 8 | Stale Grill Gate blocker cleanup | 我同意，采用采访者推荐方向。 | Preserve historical blocker but update current gate to completed with revisions written back. |
| 9 | Stop decision | N/A | No unresolved branch remains; stop and write back accepted revisions. |

## Decision Ledger

### Confirmed Decisions

- High-risk or user-owned decisions must block; medium-risk architecture/contract/cross-module/evidence-conflict decisions require `trellis-grill-agents`; low-risk local reversible choices can be evidence-only decisions.
- If a mission explicitly requires grill and no real interviewer is available, the grill gate blocks; do not silently downgrade to self-critique.
- Every checkpoint needs minimum evidence: current evidence, work performed, verification command/result, remaining uncertainty, next recovery point.
- Nontrivial decisions add accepted decision, rejected options, reason, and source/test/grill evidence path.
- Overturned assumptions record original assumption, overturning evidence, and affected scope.
- Frozen Invariants include objective, scope/non-goals, hard constraints, user-only decisions, security/credential/legal/production/data integrity boundaries, and acceptance criteria semantics.
- Autonomous research uses `smart-search` only and applies evidence priority: frozen problem/project rules > repo source/spec/test > official docs > fetched maintainer/source material > community discussion/blog.
- Shipped behavior should be changed in `packages/cli/src/templates/**`; task artifacts are evidence, not shipped source.
- Stop/Block Records are written to `implement.md` before asking user or using native `update_goal(status="blocked")`.

### Required Revisions

- Add `Autonomy Charter` with `Frozen Invariants` and `Delegated Execution Plan`.
- Add Decision Harness trigger rules and unavailable behavior.
- Add Evidence Chain minimum and triggered fields.
- Add Autonomous Research Protocol triggers, no-search criteria, evidence priority, and conflict handling.
- Add concrete test assertions and negative no-second-lifecycle checks.
- Add Source Of Truth / Sync Boundary.
- Add native goal blocker coordination and Stop/Block Record fields.
- Update stale Grill Gate blocked state.

### Verification Tasks

- Ensure later implementation tests assert load-bearing autonomy sections and no-second-lifecycle boundaries.
- Ensure workflow guidance still points to Codex native goal ownership.
- Ensure CLI behavior remains metadata/display-only for `mark-goal` and `goal-info`.

### Residual Risks

- Implementation could scatter protocol prose across multiple sources of truth.
- Tests could assert weak prose and miss runtime contract drift.
- `trellis-grill-agents` wording could accidentally imply it is a runtime controller.
- Autonomy language could be misread as permission to weaken acceptance criteria unless Frozen Invariants are prominent.

## Accepted Write-Backs

- `prd.md`: Autonomy Charter, updated Grill Gate state, expanded acceptance criteria.
- `design.md`: Decision Harness, Evidence Chain, Autonomous Research Protocol, Source Of Truth / Sync Boundary, Stop/Block boundary.
- `implement.md`: implementation order, checkpoint canonical targets, evidence fields, Stop/Block Record, concrete verification assertions.

## Final Checklist

- active_task_identified: yes
- target_artifact_identified: yes
- artifact_creator_identified: yes
- frozen_problem_recorded: yes
- mode_and_flags_recorded: yes
- arbiter_required: no
- arbiter_used_if_required: N/A
- question_count_recorded: yes
- decision_ledger_updated: yes
- write_back_promotion_test_applied: yes
- unresolved_branches_recorded: yes
- human_input_recorded: yes, none required
- attempted_problem_changes_recorded: yes, none
- no_progress_rule_checked: yes
- spawned_agents_closed: yes
- final_output_only: yes
