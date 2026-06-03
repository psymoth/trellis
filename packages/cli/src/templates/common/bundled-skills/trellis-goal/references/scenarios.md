# Scenario Patterns

Select one scenario when building the Goal Contract. Do not force a task into a scenario when `Custom` is clearer.

## Refactor

Use for a bounded subsystem or 1-3 files with a crisp after-state.

- Scope emphasizes files and public API boundaries.
- Constraints forbid adjacent subsystem churn and dependency changes.
- Done when includes targeted tests, type/build checks, and a diff summary.
- Stop if implementation needs a forbidden file, schema change, or new dependency.

## Feature From Existing Spec

Use when a structured spec already exists.

- First checkpoint reads the spec files and records counts or requirement IDs.
- Done when maps spec requirements to tests or implementation artifacts.
- Stop if spec requirements conflict or require forbidden files.
- In Trellis, link the spec and research artifacts through `implement.jsonl` and `check.jsonl`.

## Batch Fix / Batch Test

Use when there are N similar items from an enumerable source.

- N must be explicit or mechanically enumerable.
- Each item should have an independent verification row.
- Every three items should be followed by a comprehensive check checkpoint.
- Stop if an item changes state, cannot be reproduced, or requires a breaking change.

## Archaeology / Research

Use for read-only codebase study.

- Scope permits reading source and writing bounded docs only.
- Constraints forbid source edits and environment-modifying commands.
- Done when output docs cite real files and lines where possible.
- Stop if required evidence cannot be read or docs conflict.

## UI / Behavior Audit

Use when comparing claimed behavior against implementation.

- Scope includes claim source and implementation area.
- Output is a report, not code changes, unless user explicitly asks for fixes.
- Done when each claim has an implementation status and evidence.
- Stop if runtime verification is required but the goal is static-only.

## Gatekeeper Review

Use for PR, branch, or merge-readiness review.

- Constraints forbid push, merge, rebase, or source edits.
- Done when each target has an independent report and final verdict.
- Stop if the target changes during review or requires missing secrets/environment.

## Custom

Use the five-section contract directly. Match evidence counts to risk: complex, high-risk, long-running, repo-wide, or code-modifying goals need at least three acceptance items and three stop conditions; bounded medium goals need at least two acceptance items and one stop condition. Do not add filler criteria to make a lightweight goal look heavier; explain why ordinary Trellis flow is a better fit when the request is too small for Goal Mode.
