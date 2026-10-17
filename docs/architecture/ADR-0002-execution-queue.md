# ADR-0002: Lab-only authenticated execution queue

**2026-10-17 · Proposed / implemented as a private lab contract**

## Rationale

An editor must never invoke the Docker daemon or untrusted runtime inside the Next.js process. The web process already owns learner identities and a PostgreSQL connection. Instead of introducing Redis credentials and a second state store before any public runner is reviewed, a **small PostgreSQL queue** controls job intake and leasing, with an authenticated worker HTTP protocol.

This is a deliberate short-term departure from the original architecture diagram proposing Redis/BullMQ. Revisiting the queue transport is required once real workload and isolation constraints are measured.

## Boundaries

```text
Browser (session cookie)
   -> Next API POST /api/executions (same-origin, owner session, size/quota/idempotency)
   -> PostgreSQL execution_jobs (source temporary)
   <- Next API GET /api/executions/:id (owner-only status/results)

Trusted operator worker (separate process, bearer secret, loopback lab)
   -> Next API POST /api/internal/executions/claim (atomic SKIP LOCKED)
   <- ephemeral job ID/source/lease capability
   -> isolated Docker/VM runner (never receives worker credential or database password)
   -> Next API POST /api/internal/executions/complete (one-use lease)
```

## Enforcement in this slice

- Feature **OFF** by default. Both user and worker APIs fail closed outside `RUNNER_LAB_ENABLED=1`, `NODE_ENV=development` and loopback `APP_ORIGIN=http://127.0.0.1:PORT`.
- User must have a validated session; request body is JSON and requires an explicit matching Origin.
- Only `nodejs-24`, at most 8192 UTF-8 bytes, UUID request ID. No arbitrary runtime/flags.
- One job per (`learner_id`,`request_id`), 2 active jobs/learner, 32 global active jobs, 6 submissions/minute/learner. These are **lab quotas**, not public abuse prevention.
- Worker authorization uses a separate 32+ byte secret, checked in constant time; the client never obtains it.
- Transactions and `FOR UPDATE SKIP LOCKED` coordinate workers. Each claim receives a random 256-bit lease capability valid for 30 seconds.
- Only the valid lease can complete a running job; duplicate/expired results are rejected.
- Stalled running jobs and jobs queued over ten minutes become infrastructure errors when the queue is next accessed. This is **lazy expiry**, not a guaranteed real-time daemon.
- The database clears source code when a job reaches a terminal state; deleting a learner cascades jobs. Database logs, WAL and backups may still retain historical bytes; production privacy retention must be designed.
- Owner reads return only safe job metadata, bounded stdout/stderr and outcomes, never the source or lease.
- No worker/runtime connection or user-facing Run control is enabled in this PR.

## Tests and limitations

Disposable PostgreSQL SQL constraints + direct queue integration tests; Next dev real HTTP integration covers session owner isolation, CSRF, token rejection, idempotency, lease and deletion. Production `next start` cannot enable the lab and must return 503.

Still **blocking** before any public execution: independently audited runtime isolation; mTLS/workload identity, safe dedicated VM/host; IP/global abuse quotas, trusted operator approvals, queue backpressure monitoring; source retention and cleanup service; network deny, pinned images, crash containment; independent security sign-off.

Do not run this lab against production credentials or bind Next development server to a public interface.
