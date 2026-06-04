# Restore trellis-grill-me as Trellis-native attended grill skill

## Goal / 目标

恢复并显式化 `trellis-grill-me`，让它成为 Trellis 体系里的 attended planning grill skill。真人参与式需求/方案拷问统一通过 `trellis-grill-me` 进入，并保持简短、清晰、可执行的 Trellis artifact workflow。

## Raw User Intent / 原始用户意图

用户要求后续 Trellis 项目使用 `trellis-grill-me` 作为 Trellis 体系里的真人参与式拷问能力，并确保它具备预期的核心功能。`trellis-grill-me` 的文案应专注说明自己的用途、流程、产物和停止条件。

## Confirmed Facts / 已确认事实

- 当前源码模板树里没有会生成 `trellis-grill-me` 的 skill template source。
- 当前已存在 `packages/cli/src/templates/common/bundled-skills/trellis-grill-agents/SKILL.md`，它明确写着 `Trellis Grill Agents is the unattended sibling of trellis-grill-me`，并要求 real user decisions 时默认回到 `trellis-grill-me`。
- 当前 `packages/cli/src/templates/trellis/workflow.md` 和 `.trellis/workflow.md` 已经有 Grill Gate 概念，但 `trellis-grill-me` 还不是一个可安装的 canonical skill。
- 当前测试只覆盖 workflow 的 Grill Gate 文案和 `trellis-grill-agents required`，尚未验证 `trellis-grill-me` 的生成与触发契约。

## Requirements / 需求

- 新增或恢复 Trellis-native attended grill skill，canonical name 必须是 `trellis-grill-me`。
- `trellis-grill-me` 的正式文案应短而直接，只说明自己的 workflow。
- `trellis-grill-me` 必须保持核心 attended planning grill 功能：
  - relentless interview about a plan or design until shared understanding;
  - one question at a time;
  - each question includes a recommended answer;
  - repo-answerable questions are answered by inspecting code/spec/tests/docs before asking the user.
- `trellis-grill-me` 必须是 Trellis artifact-aware：
  - 识别 active Trellis task 和 target artifact；
  - freeze original problem/scope/success criteria before grilling；
  - 将确认后的用户决策写回 `prd.md`、`design.md` 或 `implement.md`；
  - 将未解决真人决策记录为 blocker，而不是让 agent 代答；
  - 记录或要求记录 Grill Gate decision。
- `trellis-grill-me` 和 `trellis-grill-agents` 必须保持 sibling 关系：
  - `trellis-grill-me` 是真人 respondent；
  - `trellis-grill-agents` 是 unattended/proxy respondent；
  - `trellis-grill-me` 不应成为 `trellis-grill-agents` 的 mode；
  - `trellis-grill-agents` 只有用户明确授权 “你自己回答 / 无人值守 / 不要问我 / 自动拷问 / proxy answers” 时触发。
- `trellis-grill-me` 在 workflow 中的角色必须明确：它是 Phase 1 planning 的 attended Grill Gate executor，用来在 `trellis-brainstorm` 产出初版 artifacts 后，对 `prd.md` 的需求、`design.md` 的设计、`implement.md` 的实现方案做逐轮拷问和收敛，尤其处理仍需真人判断的 product intent、scope、preference、UX、compatibility、security、data integrity 等分支。
- `trellis-grill-me` 不是 `trellis-brainstorm` 的替代品，不负责创建任务或发散需求；也不是 `trellis-check` 的替代品，不负责代码完成后的质量验证。
- “实现”需要区分两层：`implement.md` 的 implementation plan 在 Phase 1 planning 产出，真实代码实现由 Phase 2.1 `trellis-implement` 产出；`trellis-grill-me` 拷问前者，代码完成后由 `trellis-check` 和 review agents 验证后者。
- Workflow、brainstorm、continue、goal ambiguity guidance 中的 attended Grill Gate routing 文案必须统一到 `trellis-grill-me`。
- 相关 tests 必须覆盖 generated skill 路径和 workflow routing，至少证明 `trellis-grill-me/SKILL.md` 被 tracked/generated。

## Acceptance Criteria / 验收标准

- [ ] `packages/cli/src/templates/common/bundled-skills/trellis-grill-me/SKILL.md` 或等价 canonical template source 存在，并声明 `name: trellis-grill-me`。
- [ ] `trellis-grill-me` skill 内容覆盖核心 attended grill 行为：relentless interview、one question at a time、recommended answer、repo-answerable evidence first。
- [ ] `trellis-grill-me` skill 内容覆盖 Trellis artifact integration：active task、freeze problem、target artifact、write-back rules、human-input blocker、Grill Gate decision。
- [ ] `trellis-grill-me` skill 文案保持简短，只描述自己的用途、流程、产物和停止条件。
- [ ] Workflow guidance 明确 `trellis-grill-me` 是 Phase 1 attended Grill Gate executor，位置在 planning artifact 初稿之后、`task.py start` 之前；它拷问需求、设计和 implementation plan，不替代 Phase 2.1 代码实现或 Phase 2.2/3.1 质量检查。
- [ ] `trellis-grill-agents` 仍然是 sibling，并且文案明确 real user decisions route to `trellis-grill-me`。
- [ ] Trellis workflow / brainstorm / continue guidance 使用 `trellis-grill-me required` 或等价明确 wording 表达真人参与式 Grill Gate。
- [ ] Codex generated shared skill layer 包含 `.agents/skills/trellis-grill-me/SKILL.md`。
- [ ] Focused tests 覆盖 bundled skill tracking、init/update generation expectations、workflow routing text。
- [ ] Relevant validation commands pass, at minimum focused template/configurator tests plus typecheck or an evidence-backed reason for any skipped command。

## Out Of Scope / 非目标

- 不处理用户全局 Codex skills 配置；本任务目标是 Trellis generated project/template 行为。
- 不把 `trellis-grill-me` 做成 `trellis-grill-agents` 的 mode。
- 不扩大为重写整个 Trellis planning workflow。
- 不要求 `trellis-grill-me` 支持 unattended/proxy answers；那是 `trellis-grill-agents` 的职责。

## Decisions / 决策

- Scope: place `trellis-grill-me` in the shared bundled skill layer so every skill-writing platform receives it through the existing managed skill pipeline. Focused verification prioritizes Codex `.agents/skills` because the current user-facing requirement is Codex/Trellis usage.

## Grill Gate

- `trellis-grill-me required` — 本任务本身涉及真人产品语义和生成范围决策。用户已确认核心方向并 asked to implement; planning can proceed to implementation start.

## Notes / 说明

- `prd.md` 只记录 requirements、constraints 和 `Acceptance Criteria`，不要写 technical design 或 execution checklist。
- Lightweight `task` 可以保持 PRD-only。
- Complex `task` 在 `task.py start` 前补充 `design.md`（technical design）和 `implement.md`（execution planning）。
- 人类阅读材料默认使用中文表达；`PRD`、`task`、`workflow`、`Grill Gate`、`sub-agent`、`quality gate` 等 technical terms 保留英文。
