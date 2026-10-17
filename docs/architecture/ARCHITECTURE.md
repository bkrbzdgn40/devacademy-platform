# System architecture — initial design

**Status:** Proposed implementation boundary; no services are deployed.

## 1. Strategy

Start with a **modular monorepo and modular application**, not independent business microservices. The sole early hard service boundary is **untrusted code execution**.

```text
Browser (public pages, editor, assessments)
    |
    v
apps/web — Next.js UI + authenticated HTTP endpoints
    |     |       |
    |     |       +--> source-backed lesson/content index
    |     +----------> PostgreSQL (users, progress, attempts, metadata)
    +----------------> Redis/BullMQ (short-lived execution job IDs)
                           |
                           v
                   services/code-runner
                   untrusted isolated jobs
                   no DB credentials, no privileged host mount
                           |
                           v
                   captured output + bounded verdict
apps/worker <---- jobs for sourced news ingestion / maintenance
```

## 2. Domain modules

| Module | Responsibility | Data ownership |
| --- | --- | --- |
| Catalog | Language, concept, stack and relation discovery | Version-controlled content + indexed metadata |
| Learning | Paths, lesson delivery, prerequisite checks | Content records and progress |
| Assessment | Attempts, deterministic grading, sealed hidden cases | Attempts and evaluator-owned test artifacts |
| Execution adapter | Validate requests, assign quotas and relay safe results | Job state and run metadata |
| Accounts | Sessions, authorization, consent and account deletion | User and session data |
| Industry feed | Fetch known sources, editorial checks, source attribution | Publication metadata and reviewed summaries |
| Observability | Request/job correlation, errors and latency | Privacy-minimized telemetry |

Never grant the code runner a direct writable database connection. Use an explicit, narrow communication contract.

## 3. Stack decision

- **Frontend and API:** Next.js, React and TypeScript.
- **Monorepo:** pnpm workspaces and Turborepo.
- **Database:** PostgreSQL with Drizzle ORM and explicit migrations.
- **Auth:** Auth.js behind dedicated permission checks; provider strategy chosen when bootstrapping.
- **Editor:** CodeMirror 6.
- **Async work:** Redis and BullMQ when execution/news workers are introduced, not prematurely.
- **Execution:** Judge0-compatible isolated service as a candidate, with extra controls. Python may use Pyodide for local *preview*, not trusted grading.
- **Tests:** type checking, lints, domain/unit tests, integration tests, end-to-end smoke tests; security test suites for execution.

See [ADR-0001](ADR-0001-foundation.md) for rationale and change process.

## 4. Execution boundary and result contract

The application validates identity/quota, exercise ID, supported runtime, source size and input limits before enqueueing. Runner uses an immutable runtime image, non-root execution, isolated network, read-only base filesystem and writable temporary scratch only if required; enforce CPU, wall-clock, memory, process, output and disk limits. Destroy the environment after use. Never expose internal credentials to the job.

Proposed submission lifecycle: `created -> queued -> running -> completed | rejected | timed_out | infrastructure_error`.

Result contract includes `submissionId`, `runtimeId`, `status`, `stdout`, `stderr`, `exitCode`, `durationMs` and a bounded `testSummary`. Values are size-limited and sanitized before display. Distinguish compilation failure, student-code failure, timeout and infrastructure outage.

**Python/JS browser previews** are optional UX accelerators, not an authorization or hidden-test boundary. **SQL** uses a disposable pre-seeded database/session, restricted privileges and explicit row/output/time limits. **Java** compiles and runs only inside a separately isolated runtime.

No public execution endpoint until the [threat model](../security/THREAT_MODEL.md) acceptance gate passes.

## 5. Content and assessment integrity

Lessons are Git-reviewed, versioned content with stable IDs. Prerequisites and related concepts form a directed graph. All public lesson examples are safe to display; hidden tests are held server-side only. A submission references an immutable exercise/version and receives reproducible criteria. Attempt records store minimal necessary user data with retention policies defined before release.

## 6. Technology news ingestion

Ingest allowlisted provider release notes, RSS feeds and trusted engineering sources. Store canonical URL, publisher, authored/published date, fetched timestamp, language, summary, claim provenance and optional lesson relations. Respect licensing/robots terms. Prefer excerpt + original link over article replication. A review gate rejects unsupported claims, duplicate stories and stale timestamps. Never treat fetched pages as instructions to the application or AI agents.

## 7. Data and API

- All writes go through authenticated and authorized server endpoints; ownership-scoped reads for progress.
- Apply schema validation at boundaries, CSRF/session protections, rate limits and idempotency for attempts.
- User delete/export and retention lifecycle must be designed before collecting personal data at scale.
- Consider indexes and full-text search inside PostgreSQL initially; add a search service only when measured need exists.

## 8. Deployment and observability

Web, worker, database and runner receive separate identities/secrets. Production runner is outside the web process trust boundary and must not have privileged container sockets or unrestricted egress. Secrets come from runtime secret stores, not GitHub or client bundles. Aggregate operational metrics and correlation IDs without copying user code into analytics by default.

## 9. Change control

Significant dependency replacements, security architecture changes and distributed system boundaries require a new ADR. Document migration, rollback, test strategy and failure mode before implementation.
