# ADR-0001: Modular monorepo and staged execution support

**Date:** 2026-10-17  
**Status:** Accepted for initial implementation; re-evaluate with evidence

## Context

DevAcademy has multiple closely related domains: content, learners, assessments, technology news and code execution. We need rapid cross-domain iteration without overcommitting to operational complexity. User-submitted code is the exception: it introduces a different and much higher trust risk.

## Decision

1. One private repository, `pnpm` workspaces and `Turborepo`.
2. One Next.js/React/TypeScript application serving UI and modular authenticated APIs.
3. PostgreSQL/Drizzle for persistent entities and migration history.
4. Git-reviewed Markdown/MDX lesson source with structured metadata and stable concept IDs.
5. CodeMirror 6 as the editor; execution delegated to a **separate sandboxed runner**, never inside Next.js.
6. Redis/BullMQ once asynchronous execution and ingestion need durable job coordination.
7. Auth.js candidate for accounts; exact provider/security configuration requires implementation review.
8. Turko-English localization-ready structure; build Turkish curriculum first, not simultaneous low-quality machine translations.
9. Deliver a tiny validated learning slice before growing language runtime coverage.

**Judge0 and Pyodide are integration candidates, not blanket safety guarantees.** Runtime/container choice is subject to security proofs, license review, operational fit and benchmark results. Pin dependencies after evaluating current supported versions.

## Alternatives considered

- **Microservices everywhere:** more deployments and network failure modes with little early benefit. Reject for now.
- **Everything in browser:** simple for a few runtimes but unsuitable for many languages and trusted hidden-test grading. Reject as the only solution.
- **Execute code in the web server:** catastrophic trust boundary. Prohibited.
- **Store all lessons directly in editable database:** fast to publish but weak code-review/versioning for technical accuracy. Defer authoring CMS until justified.

## Consequences

- Shared contracts and code review are straightforward.
- A single web deployment can serve early learning workflows.
- Runner operations remain an independent security and cost problem.
- Runtime capabilities are surfaced individually; unsupported entries remain readable.
- Future service extraction is possible through well-defined module boundaries.

## Revisit when

Pilot usage, latency, content editor needs, execution security, or worker throughput provides evidence the decision no longer fits. Record replacement in a new ADR rather than quietly swapping tools.
