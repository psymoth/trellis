# Optimize Trellis autonomous goal workflow

## Raw Request

```text
[$trellis-brainstorm](D:\IdeaProjects\trellis-plus\.agents\skills\trellis-brainstorm\SKILL.md) [$trellis-grill-agents](D:\IdeaProjects\trellis-plus\.agents\skills\trellis-grill-agents\SKILL.md) 走trellis流程去规划怎么优化trellis goal
```

## User Intent

用户希望优化 Trellis Goal，使它真正体现长期无人值守完成大任务时的“更加自主”效果。目标不是让 Trellis 自己实现第二套 goal runner，而是在现有 Trellis task artifact 与 Codex native Goal bridge 上增加清晰的 delegated-autonomy 协议：只要最终目标不变，中途技术路线、联网调研、方案取舍、checkpoint 顺序、局部实现策略由 agent 自主决定，并用 `trellis-grill-agents` 和 Evidence Chain 留下可审计记录。

## Confirmed Facts

- 当前 `trellis-goal` 明确定位为 Codex native goal bridge；Trellis owns `prd.md` / `design.md` / `implement.md` / context manifests / `task.json.meta.trellis_goal`，Codex native goal owns active execution state。
- 当前 `trellis-goal` hard rules 禁止新增 goal directory、checkpoint queue、runtime mailbox、新 `task.json.status` 或第二执行引擎。
- 当前 `trellis-grill-agents` 是 unattended artifact-hardening routine，不是 execution controller；但它允许在用户显式授权 proxy answers 时对 Trellis artifacts 做 lightweight/deep pressure test。
- 当前 workflow breadcrumb 在 goal task 上要求先 load `trellis-goal`，检查 native goal state，并把 `implement.md` checkpoint 作为 evidence/recovery landmarks。
- 社区方向强调 goal mode 的实际价值来自 long-run harness：evidence-based continuation、intent calibration、decision/evidence chains、autonomous research、planner/worker/judge roles、rollback/failure memory、budget/stop guards。

## Requirements

- Trellis Goal 必须增加一等的 `Autonomy Charter`，描述 agent 在不改变 objective/scope/constraints 时可以自主做哪些决策。
- Trellis Goal 必须区分三类决策：
  - agent 可自主决定：技术选型、实现顺序、代码组织、测试策略、联网调研方向、非破坏性依赖评估、checkpoint 拆分或重排。
  - 需要 `trellis-grill-agents` 代理拷问：中等风险但目标不变的架构取舍、复杂技术方案、社区实践取舍、证据不足但可通过 repo/search/test 收敛的问题。
  - 必须 stop/block 并找真人：改变目标/scope、生产/账号/凭证/成本/法律/破坏性数据操作、互斥产品偏好、无法从 repo 或公开资料验证的事实。
- Trellis Goal 必须增加 Autonomous Research Protocol：联网资料只能走项目批准的 `smart-search` CLI；关键结论必须记录 source URL、fetch/evidence path、采用或拒绝理由。
- Trellis Goal 必须增加 Evidence Chain：记录 current evidence、accepted decisions、rejected options、overturned assumptions、verification commands、remaining uncertainty，而不是只把 checkpoint 标成 `done`。
- Codex native `create_goal` compact objective 必须显式授权 delegated autonomy：在 Goal Contract 和 Autonomy Charter 内自主推进；非平凡决策用 `trellis-grill-agents` 和 `smart-search` evidence。
- Workflow breadcrumb 必须让 goal task 的执行期行为明显区别于普通 task：普通 task 遇到产品/范围偏好倾向问用户；goal task 在授权范围内应先自行调研、拷问、决策、记录。
- 设计必须保持 Trellis 现有 lifecycle：不新增 `task.json.status`，不新增独立 goal queue，不自动为 child tasks 创建 native goals，不绕过 Phase 3.4 commit/finish policy。

## Autonomy Charter

### Frozen Invariants

Agent 不得自主弱化、替换或重解释以下内容：

- `Objective`
- `Scope` and `Out of Scope`
- `Hard Constraints`
- `User-only decisions`
- `Security` / `credential` / `legal` / `production` / `data integrity` boundaries
- `Acceptance Criteria` 的语义
- Codex native goal ownership 和 Trellis task lifecycle ownership

若 implementation 发现这些 invariant 彼此冲突，低风险澄清可通过 repo evidence、`smart-search` evidence 或 `trellis-grill-agents` 收敛；如果会改变 scope、放宽验收、突破 non-goal 或安全边界，必须 block 并请求真人输入。

### Delegated Execution Plan

在 Frozen Invariants 不变时，agent 可以自主调整：

- 技术路线与实现策略
- 文件拆分和代码组织
- checkpoint 顺序、拆分或合并
- 测试策略和 verification command selection
- research path 和 source discovery
- 中低风险方案取舍的 accepted/rejected decision

这些自主调整必须写入 Evidence Chain 或 Delegated Decision Log，不能只留在 chat reasoning 里。

### User-only Decisions

以下情况不能由 `trellis-grill-agents` 或 evidence-only decision 代理：

- 用户目标、scope、acceptance criteria 的语义改变
- 需要账号、密钥、付款、生产部署、破坏性数据变更或外部系统权限
- 需要法律、合规、品牌、业务优先级或真实偏好判断
- 无法从 repo、project rules、official docs、fetched sources 或 tests 证明的私有事实

## Acceptance Criteria

- [ ] `trellis-goal` planning/design references 明确包含 `Autonomy Charter`、Autonomous Research Protocol、Decision Harness、Evidence Chain、Stop/Block boundary。
- [ ] `trellis-grill-agents` 在 goal 场景中的职责从“启动前 artifact hardening”扩展为“执行中 medium ambiguity / nontrivial decision pressure test”，但仍不成为 execution controller。
- [ ] `workflow.md` goal override 文案能明确引导 active goal 在授权范围内自主调研、拷问、决策、更新 artifacts，而不是退回普通 task loop。
- [ ] `prd-mapping.md` / `implement.md` skeleton 支持记录 delegated-autonomy 决策、source-backed research、accepted/rejected/overturned assumptions 和 final evidence。
- [ ] CLI/script 行为保持兼容：`task.py mark-goal` / `goal-info` 仍只负责 metadata 和 checkpoint summary，不引入新 status writer 或 local scheduler。
- [ ] 相关 tests 覆盖模板/文档契约的关键不可回归点，至少包括 goal metadata 不变、workflow breadcrumb 包含 autonomous goal guidance、goal artifact skeleton 包含 autonomy/evidence sections。
- [ ] 负向检查确认没有新增 `task.json.status` writer、`goals/` runtime directory、queue、scheduler、mailbox 或 hidden durable state。

## Out of Scope

- 不实现 24/7 daemon、PM2/cron runner、后台队列或本地 scheduler。
- 不新增 `task.json.status`、`goals/` 目录、独立 checkpoint queue、runtime mailbox 或第二事实来源。
- 不改变 Codex native `create_goal` / `get_goal` / `update_goal` 的所有权边界。
- 不自动为 parent task 的 children 创建或并行运行多个 native goals。
- 不允许 agent 自主执行需要凭证、账号、支付、生产部署、破坏性数据变更或法律/合规判断的动作。

## Ambiguity Handling

| Topic | Level | Decision | Evidence | Trellis Record |
|---|---|---|---|---|
| Goal 是否应新增本地 runner | low | 不新增；保留 Codex native goal ownership | `trellis-goal` hard rules 与 `task-mapping.md` | `design.md` Technical Boundary |
| 中途技术决策是否问用户 | medium | 用户已授权使用 `trellis-grill-agents`，目标不变时由 agent 代理决策 | 当前用户请求和前文“只要目标不变就行” | `research/grill-agents-autonomous-goal-planning.md` |
| 联网调研方式 | low | 只使用 `smart-search` CLI，遵守 AGENTS.md 搜索规则 | 项目 AGENTS.md 搜索规则 | `design.md` Autonomous Research Protocol |
| 是否需要修改 source code 还是仅 docs/skills | medium | 规划阶段不定死；实现阶段先改 canonical templates，CLI 只在显示/测试需要时改 | 现有差异主要在 protocol wording 和 skeletons | `design.md` Source Of Truth / Sync Boundary |

## Grill Gate

`trellis-grill-agents completed; required revisions identified and written back; pending final planning check and user review.`

- Mode: lightweight
- Isolation: real interviewer sub-agent + main-session proxy respondent
- Result: no human input blocker, no attempted problem change
- Accepted revisions: Decision Harness triggers, Evidence Chain minimum fields, Frozen Invariants, Autonomous Research Protocol priority order, test assertions, source-of-truth boundary, native goal blocker coordination, Grill Gate state cleanup
- Run artifact: `research/grill-agents-autonomous-goal-planning.md`

## Architecture Shaping

Architecture Shaping: required; see `research/architecture-shaping.md`.

## Context Manifest Plan

| Action | File | Reason |
|---|---|---|
| implement | `.trellis/spec/cli/backend/workflow-state-contract.md` | Editing workflow breadcrumbs changes per-turn runtime contract. |
| implement | `.trellis/spec/cli/backend/script-conventions.md` | If CLI scripts/tests are touched, task.py contracts and JSON handling must stay compatible. |
| implement | `research/community-goal-direction.md` | Community evidence for long-run autonomy direction and design tradeoffs. |
| implement | `research/grill-agents-autonomous-goal-planning.md` | Proxy grill decisions and accepted revisions. |
| check | `.trellis/spec/cli/unit-test/integration-patterns.md` | Tests for template/workflow behavior should follow integration patterns. |
| check | `.trellis/spec/cli/backend/workflow-state-contract.md` | Verify no breadcrumb/runtime contract regression. |

