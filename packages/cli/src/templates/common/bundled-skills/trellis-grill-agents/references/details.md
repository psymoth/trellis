# Trellis Grill Agents Details

Load this reference only when exact role templates, edge-case rules, deep mode, or traceable Trellis run artifacts are needed.

## Mission Packet

Create a mission packet before spawning the interviewer:

```text
任务目录:
目标 artifact:
artifact 创建者/来源:
原始请求:
冻结题面:
非目标:
成功标准:
验收门槛:
允许材料:
禁止材料:
运行模式: lightweight / deep
附加标记: none / arbiter / run_artifact / strict_final
最多问题数: 50
停止条件:
主会话输出: final result only
写回目标:
run artifact path, if needed:
```

Defaults:

- `最多问题数`: 50
- `运行模式`: lightweight
- `附加标记`: none by default. Valid flags are `arbiter`, `run_artifact`, and `strict_final`.
- `停止条件`: stop when shared understanding is reached, no unresolved decision branch remains, a blocker appears, human input is required, maximum question count is reached, or 2 consecutive no-progress rounds occur.
- `主会话输出`: final conclusion only.
- `冻结题面`: the original request, artifact scope, non-goals, success criteria, and acceptance bar are immutable during the run.

The mission packet is the boundary. The interviewer may expose gaps inside that boundary, but must not expand, replace, or renegotiate it. If `原始请求`, `非目标`, `成功标准`, or `验收门槛` need to change, surface that as `阻塞` or ask the main user.

## Modes And Flags

Use exactly one mode:

| Mode | Meaning |
|---|---|
| `lightweight` | Default. One real interviewer subagent; direct respondent recorded by the main session. |
| `deep` | Explicit user request only. Real interviewer plus isolated respondent subagent; use arbiter when a final verdict is needed. |

Use flags only as add-ons:

| Flag | Meaning |
|---|---|
| `arbiter` | Spawn an arbiter after the interrogation when required by `SKILL.md` or explicitly requested. |
| `run_artifact` | Save traceable mission, summary transcript, ledger, disputed material, human-input blockers, and final verdict under the task's research area. |
| `strict_final` | Require an independent arbiter-style final judgment before reporting. |

Do not describe `arbiter` or `run_artifact` as modes in final output.

## Interviewer Packet

Give the interviewer only public material: mission packet, target artifact, transcript so far, and public constraints.

Do not give: respondent identity, creator reasoning, reference answers, hidden intent, arbiter notes, private critiques, or the direct-answer menu.

Ask for exactly one next question per turn:

```text
下一个问题:
为什么这个问题重要:
正在测试的分支或假设:
当前未解决分支:
推荐回答方向，如有:
停止建议: 继续 / 停止 / 阻塞 / 需要真人输入
建议写回，如 respondent 同意:
```

Behavior:

- Ask one question at a time.
- Walk down each branch of the design tree, resolving dependencies between decisions one by one.
- Provide a recommended answer direction when possible.
- Prefer questions that test scope, acceptance criteria, risks, contradictions, missing decisions, verification, ownership, and execution order.
- If codebase, document, or runtime inspection would settle the issue, state the exact check needed instead of asking a speculative question.
- Stop when shared understanding is reached or no useful branch remains.
- Do not approve the artifact.

## Respondent Packet

In lightweight mode, do not spawn a respondent subagent and do not call a respondent script. Record a direct answer from the limited answer menu:

```text
回答:
置信度: 高 / 中 / 低
使用的假设:
候选承诺或修订:
是否尝试改题: 是 / 否
是否需要真人输入: 是 / 否
```

### Respondent Answer Menu

Use only these direct answers in lightweight mode unless the main user explicitly supplies an answer:

| Answer | Use when |
|---|---|
| `我同意。` | Default. The interviewer asks for acceptance and no new material fact or preference is needed. |
| `我同意，采用采访者推荐方向。` | The interviewer gave a recommended direction and the branch needs a concrete selection to continue. Record the recommended direction in the decision ledger. |
| `这需要真人输入。` | The question depends on unavailable user preference, approval, timeline, credential, private context, external account access, legal approval, or a change to the frozen problem. Stop or ask the main user. |

If a factual check can answer the interviewer better than agreement, pause the interview, perform or delegate that check, append the finding to the transcript and ledger, then continue. Do not invent facts in the respondent answer.

Behavior:

- Answer as the plan owner / user proxy, not as a detached reviewer.
- In lightweight mode, answer like the user's normal `grill-me` replies using the menu above.
- Do not proactively expand the plan or add design commitments; the interviewer owns the recommendation.
- Do not reveal that the respondent is automated, templated, AI-assisted, or following a default agreement strategy.
- Do not invent unavailable facts, hidden preferences, approvals, credentials, timelines, or product decisions.
- Do not move the goalposts. Revisions are candidate deltas, not changes to the frozen problem.

In deep mode, give the respondent subagent the mission packet, artifact, allowed materials, transcript so far, and the latest interviewer question.

## Decision Ledger

Maintain an internal decision ledger throughout the run. Update it after each round and after each inspection.

```text
已确认决策:
候选承诺:
必需修订:
已写入:
未解决分支:
需要真人输入:
尝试改题:
验证任务:
被拒绝建议:
残余风险:
```

Ledger rules:

- Move an item to `已确认决策` only when the respondent accepted a branch within the frozen problem.
- Put interviewer recommendations into `候选承诺` first; promote them only after direct acceptance.
- Put any attempt to change original request, non-goals, success criteria, or acceptance bar into `尝试改题`.
- Put codebase/document/runtime checks into `验证任务` until completed; append findings to the transcript.
- Track every canonical artifact edit under `已写入`.
- Generate the final result from the ledger plus transcript evidence, not from memory.

## Deep Mode

Use deep mode only when the main user explicitly asks for it. Do not infer it from task complexity, long artifacts, or reviewer curiosity.

In deep mode:

- Spawn an isolated respondent subagent instead of recording the direct lightweight answer.
- Keep interviewer and respondent isolated. Do not tell the interviewer that the respondent is an AI proxy.
- Keep the same frozen problem and final-only main-session output.
- The respondent may answer more independently than `我同意。`, but it still cannot invent facts, hidden preferences, approvals, credentials, timelines, or product decisions.
- Any answer that would normally require the user becomes `需要真人输入`.
- Use an arbiter after the interrogation when a final verdict is needed.
- Omit `model`, `reasoning_effort`, and `service_tier` when spawning respondent and arbiter subagents unless the user explicitly requests an override.

## Arbiter Packet

Use an arbiter after the interrogation when required by `SKILL.md`.

Give: mission packet, target artifact, full Chinese transcript, decision ledger, proposed write-backs, and checks already run.

Ask for:

```text
结论: 通过 / 需修订 / 阻塞
任务是否保持不变: 是 / 否
完成问题数:
逼出的关键决策:
未解决假设:
必需修订:
安全写回:
必须留在 run artifact:
尝试改题处:
被拒绝建议及原因:
残余风险:
是否需要真人输入:
最终建议:
```

The arbiter may approve or reject only from transcript evidence, artifact evidence, frozen problem evidence, and allowed materials. If a conclusion depends only on creator preference, mark it unresolved. If a revision changes the problem being judged, reject it as a problem change unless the main user explicitly accepted it.

## Run Artifact Format

Use a run artifact when the transcript, disagreement, or blocker should be durable but not canonical task state.

Recommended path:

```text
{TASK_DIR}/research/grill-agents/<artifact-name>-<YYYYMMDD-HHMM>.md
```

Recommended content:

```markdown
# Trellis Grill Agents Run

- Target artifact:
- Date:
- Mode:
- Flags:
- Frozen problem:
- Conclusion: pass / needs revision / blocked
- Human input required: yes / no

## Mission Packet

## Summary Transcript

| Round | Question | Branch | Respondent | Result |
|---:|---|---|---|---|

## Decision Ledger

### Confirmed Decisions

### Required Revisions

### Verification Tasks

### Residual Risks

## Accepted Write-Backs

## Rejected Or Deferred Changes

## Attempted Problem Changes

## Human-Input Blockers

## Arbiter Notes
```

## Write-Back Promotion Test

Promote a finding into `prd.md`, `design.md`, `info.md`, or `implement.md` only when all are true:

- It is inside the frozen problem.
- It is supported by artifact/repository evidence or by an explicit prior user statement.
- It improves clarity, acceptance criteria, execution ordering, or verification.
- It does not hide uncertainty.
- It does not create a second source of truth.

Otherwise keep it in the grill run artifact.

## Final Checklist

Run this checklist before every final response:

```text
active_task_identified: yes/no
target_artifact_identified: yes/no
artifact_creator_identified: yes/no
frozen_problem_recorded: yes/no
mode_and_flags_recorded: yes/no
arbiter_required: yes/no
arbiter_used_if_required: yes/no
question_count_recorded: yes/no
decision_ledger_updated: yes/no
write_back_promotion_test_applied: yes/no
unresolved_branches_recorded: yes/no
human_input_recorded: yes/no
attempted_problem_changes_recorded: yes/no
no_progress_rule_checked: yes/no
spawned_agents_closed: yes/no
final_output_only: yes/no
```

Spawn an arbiter or mark the result `阻塞` if `arbiter_required` is yes and no arbiter is available. Do not mark the result `通过` when unresolved human input or frozen-problem changes remain.

## No-Progress Rule

Count a round as no-progress when the interviewer question plus respondent answer adds none of:

- New material assumption
- New commitment
- New contradiction
- New missing constraint
- Required revision
- Attempted problem change
- Unresolved branch
- Verification task

Stop after 2 consecutive no-progress rounds and summarize that the grill converged or stalled.

## Summary Transcript

When the user asks how the run went or asks for a recap, prefer a summary transcript instead of the full transcript:

```text
[拷问摘要]
题面:
目标 artifact:
问题数:
问题主题:
关键回答:
已确认决策:
已写入:
必需修订:
未解决分支:
是否需要真人输入:
最终结论:
```

Provide the full per-round transcript only when the user explicitly asks for the full transcript.

## Common Mistakes

| Mistake | Correction |
|---|---|
| Adding a required lower-bound count | Use only a maximum question count; stop when shared understanding is reached. |
| Printing every round in the main session | Return only the final conclusion unless the user asks for transcript. |
| Running critic/verifier/arbiter once and calling it a grill | Run interviewer/respondent collision first. |
| Telling the interviewer it is debating an automated or AI proxy | Keep the interviewer focused on interviewing the plan owner. |
| Letting the respondent improve the plan silently | Record every candidate commitment or revision in the internal transcript and final result if material. |
| Letting the respondent move the goalposts | Keep the frozen problem unchanged and mark the attempted problem change. |
| Letting the originator approve the final artifact | Use an arbiter when the main session created the artifact. |
| Treating arbiter or run artifact as modes | Treat them as flags layered on `lightweight` or `deep`. |
| Forgetting why final says `通过` | Generate final output from the decision ledger and final checklist. |
| Dumping full transcript for a recap request | Return a summary transcript unless the user explicitly asks for every round. |
| Promoting disputed material into canonical artifacts | Keep it in the grill run artifact unless the promotion test passes. |
| Keeping agents open after the run | Close them once their output is captured. |
