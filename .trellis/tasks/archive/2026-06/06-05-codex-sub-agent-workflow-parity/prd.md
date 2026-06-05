# Codex sub-agent workflow parity

## Goal / 目标

让 6 月左右新增的 Codex/Trellis workflow 魔改功能在 `codex-inline` 与 `codex-sub-agent` 两条路径上保持语义一致，并明确哪些职责属于 main session，哪些职责属于 `trellis-implement` / `trellis-check` / `trellis-research` sub-agent。

本任务先完成 planning，不直接进入 implementation。目标是避免只修 inline 或只修本地文件，导致 fresh init、`trellis update`、当前仓库 dogfood 配置、Codex sub-agent 实际执行行为之间继续漂移。

## Requirements / 需求

- 明确当前 `codex.dispatch_mode` 的两条路径：
  - `inline`: main session 使用 `trellis-before-dev` / `trellis-check` skill 直接实现和检查。
  - `sub-agent`: main session 负责协调，dispatch `trellis-implement` / `trellis-check` agent，由 agent pull task context 并直接实现或检查。
- 识别并修复 6 月新增功能在 sub-agent 路径上的覆盖缺口，重点包括：
  - `Goal Contract` / active goal behavior 只由 main session 和 Codex native goal state 驱动，implement/check sub-agent 只能消费已确认 artifact，不应创建或更新 native goal terminal state。
  - `Grill Gate` 和 `trellis-grill-me` / `trellis-grill-agents` 属于 Phase 1 artifact pressure-testing，普通 implement/check sub-agent 不应自行补做人类权威决策。
  - `Architecture Shaping` 的 accepted constraints 应通过 `design.md`、`implement.md`、`research/architecture-shaping.md` 和 JSONL manifest 传给 sub-agent，并在 implement/check agent instructions 中被当作执行和检查约束。
- 保持本地 dogfood 文件与 template source 同步，至少覆盖：
  - `.trellis/workflow.md`
  - `.codex/agents/trellis-implement.toml`
  - `.codex/agents/trellis-check.toml`
  - `packages/cli/src/templates/trellis/workflow.md`
  - `packages/cli/src/templates/codex/agents/trellis-implement.toml`
  - `packages/cli/src/templates/codex/agents/trellis-check.toml`
  - 必要的 bundled skills、migration manifest、regression tests、spec docs。
- 不把 `sub-agent` 做成第二套 workflow engine；它只执行 main session 已经完成 planning/review 后交给它的 artifact。
- 不主动扩展 Claude/Cursor/OpenCode/Gemini/Qoder 等非 Codex 平台行为，除非共享 template 或 workflow 语义必须同步。

## Confirmed Facts / 已确认事实

- 用户已确认最终范围：全面审计 6 月新增 semantics（Goal、Grill、Architecture Shaping、Chinese human-readable artifact defaults）在 Codex sub-agent prelude / workflow routing 中的覆盖，但 implementation 只修 evidence-backed drift，不做无证据的广泛改写。
- 用户已确认本任务范围包含 `trellis update` / migration / release manifest 路径：至少修当前 dogfood 文件、template source、regression tests；如果 evidence 显示已有项目升级路径不会获得这些变化，则补 migration manifest 或 update-path tests。
- 当前仓库 `.trellis/config.yaml` 显式配置 `codex.dispatch_mode: sub-agent`，本会话 breadcrumb 也显示当前是 `sub-agent` mode。
- `packages/cli/src/templates/shared-hooks/inject-workflow-state.py` 已按 `codex.dispatch_mode` 切换 breadcrumb key：`inline` 使用 `*-inline` block，`sub-agent` 使用普通 status block。
- `packages/cli/src/templates/trellis/scripts/common/workflow_phase.py` 已将 `--platform codex` 映射成 `codex-inline` 或 `codex-sub-agent`，用于 step detail 的平台 block 过滤。
- `packages/cli/src/templates/trellis/workflow.md` 的 template 版本已经包含 `Architecture Shaping`、`Goal execution override`、`Active goal behavior`、`Grill Gate`，并同时覆盖 `codex-inline` 与 `codex-sub-agent` platform markers。
- 当前本地 `.trellis/workflow.md` 相比 template 缺少至少一部分 `Architecture Shaping` 相关内容，说明 dogfood 文件与 template source 存在 drift。
- 当前本地 `.codex/agents/trellis-implement.toml` / `trellis-check.toml` 相比 template 缺少 architecture-shaping 执行/检查约束，说明 Codex sub-agent prelude 也存在 drift。
- `packages/cli/src/migrations/manifests/0.5.9.json` 和 `0.6.0-beta.1.json` 记录过默认切到 `inline`、`codex-inline` / `codex-sub-agent` namespace、以及 sub-agent context 继承问题；说明这类问题已有历史回归风险。
- `packages/cli/test/regression.test.ts` 已覆盖：
  - `--mode phase --platform codex` 在 `dispatch_mode: sub-agent` 下显示 sub-agent routing。
  - step `2.1` 在 Codex sub-agent mode 下显示 self-loaded agent context，而不是 hook injection 或 `trellis-before-dev`。
  - `resolve_breadcrumb_key` 在 Codex inline/sub-agent 与非 Codex 平台之间正确分流。
  - `resolve_effective_platform` 将 `codex` 映射到 `codex-inline` / `codex-sub-agent`。
  - Codex hook 会注入 `<codex-mode>` banner。
- 现有 tests 主要覆盖 dispatch-mode routing 机制，尚未直接锁定 6 月新增 semantics（例如 `Architecture Shaping` constraints、active goal behavior、Grill Gate boundary）是否进入 Codex sub-agent prelude。
- `trellis-meta` 的 local customization guidance 要求：改 workflow 先改 `.trellis/workflow.md`，改 agent 行为要同步 platform agent files；如果涉及实际用户项目升级，还要考虑 template / update path。

## Acceptance Criteria / 验收标准

- [ ] `codex-inline` 与 `codex-sub-agent` 在 `workflow.md` 的 planning / in_progress guidance 中表达同一套 6 月新增 workflow semantics，差异仅限执行机制。
- [ ] `trellis-implement` agent instructions 明确读取并遵守 `design.md`、`implement.md`、JSONL spec/research，以及 accepted `research/architecture-shaping.md` 约束。
- [ ] `trellis-check` agent instructions 明确检查 changed code 是否违反 task artifacts、specs、accepted architecture constraints，并区分 blocker 与 advisory follow-up。
- [ ] `Goal Contract` / native goal terminal-state 操作仍由 main session / `trellis-goal` 管理，普通 implement/check sub-agent 不会被指示调用 `create_goal` / `update_goal` 或自行推进 Goal Mode。
- [ ] `Grill Gate` 决策仍属于 planning artifact gate；implement/check sub-agent 不会被要求代替真人或 proxy grilling。
- [ ] 本地 dogfood 文件与 `packages/cli/src/templates/**` 的对应内容同步，避免当前仓库行为与 fresh init 行为不一致。
- [ ] 相关 regression tests 覆盖 `codex.dispatch_mode`、`codex-inline` / `codex-sub-agent` platform filtering、workflow-state breadcrumb、agent prelude 关键约束。
- [ ] 若涉及 `trellis update` 行为或用户升级路径，补充 migration manifest / spec 文档，说明现有用户如何获得更新。
- [ ] 通过适用的目标测试、type-check / lint 或最小验证命令。

## Out Of Scope / 暂不包含

- 不重新设计 Trellis native task lifecycle。
- 不把 `Goal Mode` 变成 Trellis 自己的 checkpoint runner。
- 不默认为非 Codex 平台补齐同等级改造。
- 不启动 implementation；本阶段只做 planning artifact。

## Open Questions / 待决策

- 已确认：本任务包含 `trellis update` / migration / release manifest 路径。实现时先修当前 dogfood + template source + regression tests；如果 evidence 显示既有项目无法通过普通 `trellis update` 获得修复，则补 migration manifest / update-path tests。
- 已确认：全面审计 6 月新增 semantics 在 sub-agent prelude 中的覆盖，但只修 evidence-backed drift。

## Notes / 说明

- `prd.md` 只记录 requirements、constraints 和 `Acceptance Criteria`，不要写 technical design 或 execution checklist。
- Lightweight `task` 可以保持 PRD-only。
- Complex `task` 在 `task.py start` 前补充 `design.md`（technical design）和 `implement.md`（execution planning）。
- 人类阅读材料默认使用中文表达；`PRD`、`task`、`workflow`、`Grill Gate`、`sub-agent`、`quality gate` 等 technical terms 保留英文。
