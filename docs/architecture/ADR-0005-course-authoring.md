# ADR-0005: Review-gated course scaffolding and JSON publication

**Status:** Implemented in Course Engine v1.1. Git/PR content workflow only.

## Decision

Keep Course Engine v1's declarative public course/lesson/question registries and immutable learner IDs. Add `scripts/course-cli.mjs` with `new`, `check`, and `publish --reviewed`. Two draft files keep learner-visible data separate from server-owned answer keys; draft paths are ignored by Git.

To avoid modifying executable grading source for every new course, move existing static keys from `server/grade.ts` into `server/answer-keys.json` and import them exclusively on the server. Existing key IDs, exact answers and explanations remain unchanged. The publish tool adds only validated keys and public content, never runtime capabilities.

Validate the **full resulting catalog graph** before touching the committed JSON registries. Reject duplicates, orphan references, future prerequisites, insufficient review, private answer contamination, unreviewed placeholders and runtime flag escalation. Changes are staged in temporary files and written to the working tree; Git review and CI remain required.

## Limitations / security

This is not a WYSIWYG CMS, proof of factual content, automated compiler for all languages, or a deployment mechanism. `--reviewed` and review flags are attestations by the author; independent human/content review still matters. The repository owners can read the server-side answer keys, but website clients must not receive the private JSON. Production must never serve server source or expose the drafts. Worker-only hidden test cases remain under `services/code-runner` and are unchanged.

Write-out of multiple JSON files cannot be fully atomic across process termination; validate the Git diff in any interrupted publication. The course registry remains small enough for this approach; a future multi-author CMS needs staged revisions, permission/approval workflows, author attribution and localization.
