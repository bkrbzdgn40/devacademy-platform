# ADR-0003: Judging actual code without leaking private expectations

**Status: implemented as opt-in LOCAL LAB ONLY, 2026-10-17.**

## Design

- Three JavaScript function-writing challenges at `/pratik`. Each ships a named entry point, starter source and two **public** input/output examples.
- Worker-private exercises reside in `services/code-runner/src/exercises-private.mjs`, never imported by a Next.js route or client bundle.
- In assessment mode the session-authenticated learner sends `mode=assess`, `exerciseId`, immutable integer `exerciseRevision`, UUID request ID and their source (at most **6 KiB**).
- Web validates against the **public** exercise ID/revision catalog, enforces existing same-origin and queue quotas and queues the request. The queue carries an exercise ID, not expected outputs.
- The separate trusted worker selects tests by server-provided ID+revision, creates a separate isolated Docker process for **each test case** and passes only student source + that case's arguments into the sandbox. **Expected results stay in trusted worker memory.**
- The trusted worker parses bounded JSON stdout, compares it with a typed strict-deep equality check, then sends only a pass/fail summary via its bearer-authenticated, lease-checked completion endpoint. The student receives counts and public-example successes, **never hidden input/expected values**.
- Missing function, incorrect return, extra stdout or malformed output fails the test. Runtime exception is a separate runtime-error status. Sandbox timeout, resource exhaustion or infrastructure failure are **inconclusive**, never recorded as a wrong answer.
- The learning assessment result is currently stored only as an owned execution job, not a claimed mastery/completion event. It is erased with account deletion; source is erased at terminal state. Postgres WAL/backup retention still needs explicit policy.

## Trust and limitations

1. This is a **sandboxed educational judge prototype**, not a cheat-proof adversarial competition engine. Student source can inspect input arguments within its own sandbox; only expected values and full test definitions stay out. Output spoofing and other malicious behavior need threat-model review.
2. Code runs in a separate Docker test container, **not** in Next.js or the trusted worker. Public deployment remains blocked by VM-level isolation, dedicated hosts, image provenance, hardened profiles, edge abuse controls, MFA/identity hardening, input quotas, and independent security review.
3. Hidden tests are private from learners and the browser, **not** from repository owners or a developer who sees the worker source. Production hidden tests require separate artifact access controls.
4. Exercise cases are immutable per revision. Do not silently edit a released revision's expected outputs; publish a new revision and migrate versioned history.
5. A 30-second worker lease and five cases per job impose a budget; excessive Docker startup may expire the lease. Report this as infrastructure error and do not award a grade.
6. Our initial scoring is all-or-nothing across 5 tests, with a count for feedback. It is not a statistical proof of correctness; richer metamorphic/property-based cases belong in later iterations.

## Verification

- Unit tests: public catalog/worker case consistency, hidden-only failure, all pass, malformed outputs, exception/timeout/infrastructure differentiation.
- Container integration: real Node sandbox with a correct function, a function that passes public examples only, and a runtime exception.
- SQL: assessment-mode data invariants, source erasure and deletion cascades.
- PostgreSQL + HTTP: session ownership, unknown IDs/revisions rejection, worker-only scoring and summaries, wrong lease/replay denial.
- Production Next CI: `/pratik` pages, 56 responsive Chrome route/viewport cases; production execution remains **off**.
