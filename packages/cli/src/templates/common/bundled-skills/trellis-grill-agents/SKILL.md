---
name: trellis-grill-agents
description: "Use inside Trellis-managed projects for an explicitly authorized unattended/proxy grill-me style interrogation of task artifacts before activation or execution, with lightweight/deep modes, a decision ledger, final checklist, and conservative Trellis artifact write-back. Default to trellis-grill-me when real user decisions are needed."
---

# Trellis Grill Agents

Trellis Grill Agents is the unattended sibling of `trellis-grill-me`.
It pressure-tests a Trellis task artifact with a real interviewer subagent while the main session records conservative proxy answers. It is a clarification and artifact-hardening routine, not the execution controller. `trellis-goal` owns Trellis-backed goal preparation and Codex native goal handoff; Codex native goal state owns unattended execution.

Read `references/details.md` only when exact role templates, respondent answer rules, decision ledger fields, run artifact format, edge-case rules, or an explicitly requested deep mode are needed.

## When To Use

Use this skill only when both are true:

- A Trellis task artifact needs pressure-testing before activation or execution, such as `prd.md`, `design.md`, `info.md`, `implement.md`, or another explicit plan/spec artifact.
- The user explicitly authorizes unattended or proxy answers, for example "answer yourself", "answer on my behalf", "unattended", "do not ask me", "keep going until blocker", "你自己回答", "你代我回答", "无人值守", "自动拷问", "不要问我", or "继续推进直到 blocker".

This skill may also be used by `trellis-goal` for medium ambiguity only when the ambiguity policy says a conservative proxy challenge can resolve or narrow the issue without real user input.

Default to `trellis-grill-me` when the user is participating, when preference/product/scope choices require the real user, or when the user only asks to tighten requirements without granting proxy-answer authority.

## Hard Rules

- Freeze the problem before the grill starts. The original request, artifact scope, non-goals, success criteria, and acceptance bar cannot be rewritten during the run.
- Spawn a real interviewer subagent when the platform supports subagents. Do not simulate the interviewer and do not call a critic-only pass a grill.
- Do not reveal to the interviewer that the respondent is automated, proxying, templated, or fixed-answer.
- Use Simplified Chinese for role outputs, respondent answers, decision ledger entries, and final reports. Keep code identifiers, paths, commands, config keys, logs, and quoted source text in their original language.
- When spawning subagents, leave `model`, `reasoning_effort`, and `service_tier` unset so they inherit the main session configuration, unless the user explicitly requests an override.
- If subagents are unavailable, report that Trellis Grill Agents is blocked or ask to use `trellis-grill-me`; do not silently fall back to self-critique.
- Treat `lightweight` and `deep` as modes. Treat `arbiter`, `run_artifact`, and `strict_final` as optional flags, not additional modes.
- Maintain an internal decision ledger for confirmed decisions, required revisions, unresolved branches, human-input needs, attempted problem changes, and verification tasks.
- Stop immediately when a question needs real human preference, business authority, credentials, external account access, legal approval, or any fact that cannot be derived from repo/task evidence.
- Run the final checklist before every main-session final response. Do not mark the artifact `通过` when unresolved human input, required arbiter review, or frozen-problem changes remain.
- Keep all durable state in normal Trellis artifacts. Use a grill run artifact for transcript, disputes, uncertainty, and human-input blockers.
- Return only the final result in the main session unless the user explicitly asks for the transcript.
- Close spawned subagents when their result is captured.

## Modes And Flags

Use `lightweight` proxy mode by default.

- Spawn one real interviewer subagent.
- Do not spawn a respondent subagent and do not call a respondent script.
- Record the respondent reply directly in the internal transcript using the Respondent Answer Menu in `references/details.md`: `我同意。`, `我同意，采用采访者推荐方向。`, or `这需要真人输入。`
- Maximum question count: `50`.
- No minimum question count.
- Stop early when the interviewer recommends stop, no unresolved branch remains, a blocker appears, human input is required, the run reaches the maximum, or `2` consecutive no-progress rounds occur.
- A no-progress round is one where the question and answer add no new material assumption, commitment, contradiction, missing constraint, required revision, attempted problem change, unresolved branch, or verification task.
- Lightweight mode does not spawn an arbiter by default. Produce the final conclusion from the interviewer stop signal, transcript evidence, the decision ledger, frozen problem, and checks already run.

Use `deep` mode only when the user explicitly asks for it. Deep mode may spawn a separate respondent subagent, but the same frozen-problem and human-input rules apply. Read `references/details.md#deep-mode` before using deep mode.

Spawn an arbiter only when:

- The main session created the artifact being judged.
- The transcript contains `需修订`, `阻塞`, `尝试改题`, unresolved human input, or a disputed final judgment.
- The user asks for strict or independent final judging.
- Deep mode needs a final verdict before canonical artifact write-back.

Use optional flags only as add-ons:

| Flag | Meaning |
|---|---|
| `arbiter` | Spawn an arbiter after the interrogation when required by this skill or explicitly requested. |
| `run_artifact` | Persist mission, summary transcript, ledger, disputed material, and final verdict under the task's research area. |
| `strict_final` | Require an independent arbiter-style final judgment before reporting. |

## Write-Back Rules

Write only accepted, in-scope changes into the artifact under review:

| Artifact | Allowed changes |
|---|---|
| `prd.md` | Requirements, scope boundaries, non-goals, acceptance criteria, rejected options, user-visible risks, and unresolved human decisions. |
| `design.md` / `info.md` | Architecture choices, interfaces, data flow, constraints, trade-offs, migration notes, and technical risks. |
| `implement.md` | Checkpoints, dependencies, ordering, verification evidence, rollback notes, and stop conditions. |
| Grill run artifact | Transcript summary, disputed points, attempted problem changes, arbiter notes, blocked reasons, and anything not safe to promote into canonical task artifacts. |

Use a grill run artifact instead of editing canonical artifacts when the proposed change would alter the frozen problem, when evidence is insufficient, when the interviewer and arbiter disagree, when the change would create a second source of truth, or when real human input is required.

## Workflow

1. Identify the active Trellis task, target artifact, artifact creator, original request, non-goals, success criteria, acceptance bar, and available evidence.
2. Create a stable mission packet with artifact path, allowed materials, forbidden materials, frozen problem contract, mode, flags, maximum questions, stop conditions, output expectations, write-back target, and run artifact path if needed.
3. Initialize the internal transcript and decision ledger.
4. Spawn the interviewer subagent with only the mission packet, artifact content, transcript so far, and public constraints.
5. Ask the interviewer for exactly one next question with importance, tested branch, unresolved branches, recommended direction if any, and stop recommendation.
6. Record the respondent answer from the limited answer menu. Store the transcript internally; do not print per-round questions or answers in the main session.
7. Update the decision ledger after each round and after each inspection.
8. If repo inspection, test output, or runtime evidence would answer a question better than speculation, pause the interview, perform or delegate the check, append the finding, then continue.
9. Stop on the normal stop conditions or the no-progress rule.
10. Run the final checklist and spawn an arbiter only when required by the mode/rules above.
11. Apply accepted in-scope revisions to the target artifact. Write disputed or blocked material to a grill run artifact.
12. Return the compact Chinese final result and close subagents.

## Final Output

Use this compact Chinese format:

```text
[拷问结果]
隔离方式: 真实采访者子 agent + 主会话 proxy respondent
运行模式:
附加标记:
目标 artifact:
完成问题数:
结论: 通过 / 需修订 / 阻塞
任务是否保持不变: 是 / 否
逼出的关键决策:
已写入:
必须修订:
未解决分支:
尝试改题处:
是否需要真人输入:
残余风险:
最终检查:
说明: 主会话仅返回最终结论；完整问答保留在内部 transcript、子 agent 线程或 grill run artifact 中。用户要求复盘时，优先返回 summary transcript，不默认粘贴全量 transcript。
```

Keep the final concise. Do not paste the full transcript unless the user asks.

## Common Guardrails

- Do not run only a critic/verifier/arbiter and call it a grill. The interviewer/respondent loop is required.
- Do not tell the interviewer it is debating an automated or AI-assisted respondent.
- Do not let respondent commitments silently mutate the task. Treat them as candidate deltas judged against the frozen problem.
- Do not let the artifact creator be its only challenger and approver.
- Do not add a minimum round count.
- Do not skip the final checklist just because the interviewer recommended stop.
- Do not treat `arbiter` or `run_artifact` as modes in the final output.
- Do not turn a requested summary transcript into a full transcript unless the user explicitly asks for every round.
