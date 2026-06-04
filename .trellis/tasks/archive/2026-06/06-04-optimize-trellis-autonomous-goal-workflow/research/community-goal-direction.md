# Community Goal Direction Research

## Commands

- `smart-search search "community discussion OpenAI Codex Goal Mode long running autonomous coding agent goals" --validation balanced --extra-sources 2 --timeout 90 --format json --output C:\tmp\smart-search-evidence\trellis-goal-community-01-codex-goal.json`
- `smart-search search "AI coding agents goal mode long running autonomous tasks community direction AutoGPT Devin Claude Code" --validation balanced --extra-sources 2 --timeout 90 --format json --output C:\tmp\smart-search-evidence\trellis-goal-community-02-agent-goals.json`
- `smart-search exa-search "long running autonomous coding agents goal mode community discussion GitHub Reddit Hacker News" --num-results 8 --include-highlights --format json --output C:\tmp\smart-search-evidence\trellis-goal-community-03-exa.json`
- `smart-search fetch "https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex" --format json --output C:\tmp\smart-search-evidence\trellis-goal-community-fetch-openai-cookbook.json`
- `smart-search fetch "https://github.com/openai/codex/issues/20958" --format json --output C:\tmp\smart-search-evidence\trellis-goal-community-fetch-codex-issue-20958.json`
- `smart-search fetch "https://github.com/jackzhaojin/continuous-agent" --format json --output C:\tmp\smart-search-evidence\trellis-goal-community-fetch-continuous-agent.json`
- `smart-search fetch "https://github.com/arbazkhan971/godmode" --format json --output C:\tmp\smart-search-evidence\trellis-goal-community-fetch-godmode.json`
- `smart-search fetch "https://github.com/lokafinnsw/claude-code-goal-mode" --format json --output C:\tmp\smart-search-evidence\trellis-goal-community-fetch-claude-goal-mode.json`
- `smart-search fetch "https://github.com/lidangzzz/goal-driven" --format json --output C:\tmp\smart-search-evidence\trellis-goal-community-fetch-goal-driven.json`
- `smart-search fetch "https://cursor.com/blog/scaling-agents" --format json --output C:\tmp\smart-search-evidence\trellis-goal-community-fetch-cursor-scaling.json`

## Findings

1. OpenAI positions Goals as durable, thread-scoped completion contracts with evidence-based continuation. Strong goals define outcome, verification surface, constraints, boundaries, iteration policy, and blocked stop condition.
2. Community feature requests around Codex `/goal` ask for a broader long-run harness: intent calibration, evidence chains, side-thread tolerance, and stop guards that prevent "I know the next step but still stop" behavior.
3. Continuous-agent style projects move beyond one goal per thread into a queue/executive loop, but their useful patterns for Trellis are strategy retry, deterministic validation, asynchronous human blockers, and evidence logs. The local daemon/queue itself is out of scope for Trellis Goal.
4. Godmode emphasizes autonomous iteration only when there is a mechanical metric. It records failures, reverts bad changes, and treats evidence as the basis for keeping a change.
5. Better Goal for Claude Code adds plan trees, evidence-mapped acceptance criteria, review gates, explicit lifecycle states, and triple budgets. Trellis can borrow evidence mapping and review gates without copying its separate engine/lifecycle.
6. Cursor's long-running agent experiments show planner/worker/judge separation works better than flat peer coordination. Too little structure causes duplicate work and drift; too much structure creates bottlenecks.
7. Goal-Driven prompt experiments push extreme multi-agent persistence, but their relevant lesson is that a master/controller should verify criteria before accepting a subagent's completion claim.

## Implications For Trellis

- Trellis Goal should differentiate itself through delegated autonomy, not through another runtime engine.
- The Goal Contract should include an Autonomy Charter so the agent can make technical/execution decisions without asking the user when the objective is unchanged.
- `trellis-grill-agents` should become the medium-ambiguity decision harness for goal execution, with conservative write-back into Trellis artifacts.
- `smart-search` should be the mandated research path for current/community/technical-choice decisions.
- `implement.md` should contain an Evidence Chain and Delegated Decision Log, not just checkpoint statuses.
- Completion must remain evidence-based and should never rely on confidence-only "done" claims.

## Source URLs

- https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex
- https://github.com/openai/codex/issues/20958
- https://github.com/jackzhaojin/continuous-agent
- https://github.com/arbazkhan971/godmode
- https://github.com/lokafinnsw/claude-code-goal-mode
- https://github.com/lidangzzz/goal-driven
- https://cursor.com/blog/scaling-agents

