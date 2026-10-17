# Contributor guide

## Workflow

1. Start from an up-to-date `main` branch; inspect existing changes before touching files.
2. Open an issue for material new work or reference the roadmap milestone.
3. Branch names: `feat/<short-topic>`, `fix/<short-topic>`, `docs/<short-topic>`.
4. Keep PRs scoped to one objective. Prefer a **single coherent commit**; squash when appropriate.
5. Explain behavior, scope, risk, test evidence and rollback. Use the repository PR template.
6. Merge through PR review; do not push directly to `main` after bootstrap.
7. Never rewrite unrelated user changes, run destructive cleanup or force-push without explicit authorization.

## Checks expected (once code exists)

- Deterministic install from lockfile.
- Formatting/linting/typechecking.
- Unit/integration tests for changed behavior.
- Accessible keyboard and responsive UI checks when relevant.
- Privacy and isolation review for auth, runner, news ingestion or user data changes.

Documentation-only changes require consistency and link checks, not fictional claims that application tests ran. PRs should report `not applicable` transparently.

## Content contributions

Every concept needs a clear outcome, accurate explanation, tagged prerequisites, reviewed snippet and exercise rationale. If code is claimed runnable, verify it in the exact supported runtime. Never publish hidden grading tests to browser bundles. Credit sources; do not paste copyrighted articles. Translations require actual review, not an unverified machine translation label.

## Security

Never commit `.env` files, API keys, student data, production database dumps or private source material from other projects. Report potential security issues privately to repository maintainers rather than publishing working exploits in issues.

## Architecture decisions

Document significant deviations as new ADRs, update PRD/architecture/roadmap, and include migration and rollback considerations.
