# Ambiguity Handling

Execution mode is unattended. Do not stop for non-blocking clarification questions. Classify ambiguity by risk and record the result in Trellis files.

This file is the `Decision Harness` for Trellis-backed goals. It exists so a goal task behaves differently from an ordinary task: when the objective and `Frozen Invariants` remain unchanged, the agent first researches, pressure-tests, decides, verifies, and records evidence instead of asking the user by default.

## Frozen Invariants

The following are not delegated to the agent, `trellis-grill-agents`, or research synthesis:

- Objective
- Scope and Out of Scope
- Constraints and hard safety boundaries
- Done When and acceptance semantics
- Stop If conditions
- user-only decisions
- credentials, payments, legal/compliance, production, destructive data changes, and data integrity
- Codex native goal ownership and Trellis task lifecycle ownership

If a decision would alter any Frozen Invariant, classify it as High and use Stop/Block.

## Risk Levels

| Level | Definition | Action |
|---|---|---|
| Low | A conservative default is obvious from repo evidence, existing specs, runnable checks, or normal Trellis workflow rules; the choice is local, reversible, and does not alter Frozen Invariants. | Record the default assumption and continue. |
| Medium | The objective remains unchanged, but the decision is nontrivial, affects architecture/contract/workflow/evidence standards, has conflicting repo/search/test evidence, or chooses among credible technical approaches. | Use `trellis-grill-agents` unattended, then record accepted/rejected decisions. |
| High | The answer can change Frozen Invariants, scope, user-visible product meaning, data integrity, production/auth/payment/deployment behavior, legal/compliance posture, credentials, destructive operations, or private user preference. | Use Stop/Block. |

## Low Ambiguity

Write the assumption in `prd.md` under `## Default Assumptions`:

```markdown
- Assumption: <default>
  Evidence: <file, command, spec, or observed convention>
  Why safe: <why this does not expand scope>
  Stop if: <mechanically detectable condition that invalidates it>
```

Then continue initialization or native goal handoff/continuation.

## Medium Ambiguity

Load and use `trellis-grill-agents`. The goal is unattended pressure-testing, not user questioning and not execution control.

Use `trellis-grill-agents` when at least one trigger applies:

- architecture, public contract, cross-module behavior, data integrity, workflow routing, or generated template contract is affected
- the choice is hard to roll back or creates migration/compatibility risk
- repository, search, test, or command evidence conflicts
- multiple official/community practices compete
- the decision changes the evidence standard for a checkpoint
- the ambiguity could be hidden behind the phrase "agent autonomy"

Persist outputs in three places:

- full material: `research/grill-agents-<topic>.md`
- summary and accepted assumptions: `prd.md`
- execution impact: `implement.md`

After the grill, update the Goal Contract or checkpoints. If the grill exposes a high-risk or scope-changing question, convert the result to Stop/Block.

If the current mission explicitly requires `trellis-grill-agents` and no real interviewer is available, record Stop/Block rather than silently downgrading to self-critique. If a later active-goal decision can be reclassified as Low using the criteria above, record that evidence-based reclassification before continuing.

## Autonomous Research Protocol

Use approved external research before deciding when the choice depends on:

- current API, CLI, or third-party behavior not already proven by local source
- community practice or emerging agent workflow patterns
- official docs or maintainer guidance likely to affect the decision
- security, compliance, production, or cross-project implications
- disputed technical selection

In projects that require `smart-search`, use only the local `smart-search` CLI and its approved subcommands. Do not use native web search or unapproved browsing as a substitute. Fetch key sources before adopting claim-level conclusions.

Do not search when local repository evidence is sufficient, such as pure template wording, source/spec/test-proven behavior, or narrow mechanical changes.

When evidence conflicts, use this priority:

1. Frozen problem, user instructions, and project rules
2. repository source, Trellis specs, tests, and runnable command results
3. official documentation
4. fetched maintainer/source material
5. community discussions, blogs, and secondary summaries

Record adopted and rejected external conclusions with source URL, command or evidence path, adopt/reject reason, and remaining uncertainty.

## High Ambiguity

Do not guess. Use Stop/Block and record the block where it occurred:

- initialization: add `## Blocked Initialization` or `## Blocked Codex Native Goal Handoff` to `prd.md`
- native continuation: mark the current checkpoint `Status: blocked`, record a Stop/Block Record in `implement.md`, and report the blocked state; call `update_goal(status="blocked")` only under the native blocked-threshold policy

Use Stop/Block for conditions such as:

- user-visible behavior has mutually incompatible interpretations
- required files, APIs, or environments cannot be inspected
- completing the request requires credentials, destructive data changes, or production operations not already in scope
- the goal would require changing commit, archive, or task lifecycle policy
- existing dirty work would have to be overwritten or silently included

Stop/Block Record fields:

- Blocker Type:
- Triggering Evidence:
- Blocked Decision:
- Why Not Delegated:
- Required Human Answer:
- Recovery Checkpoint:
- Native Goal Action: `none | ask-user | update_goal(blocked)`

When the blocker is resolved, continuation resumes from the recovery checkpoint after re-reading `prd.md`, `design.md`, `implement.md`, and the Evidence Chain. Trellis does not add a new blocked lifecycle status.

## Recording Rules

- Every ambiguity decision must name the evidence used.
- Every default assumption must say when it stops being safe.
- `trellis-grill-agents` output is advisory until the main session writes the synthesis into `prd.md` or `implement.md`.
- Medium ambiguity must leave an accepted/rejected decision trail, not only a note that a grill happened.
- Autonomous research conclusions must include source URLs and fetched evidence paths when external sources affected the decision.
- Do not use chat-only reasoning as durable state.
