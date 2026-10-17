# M3 private execution worker and editor bridge

**State: local, opt-in development laboratory ONLY. Public execution is deliberately disabled.**

## What is implemented

- The editor discovers availability from `GET /api/executions/availability`. With the lab disabled, it behaves as before and never submits code.
- With a localhost development server, learner login, migrated private PostgreSQL and explicit `RUNNER_LAB_ENABLED=1`, the editor sends source plus a fresh UUID to the authenticated queue.
- The browser polls an owner-scoped status endpoint and shows escaped, bounded stdout and stderr. Source is never returned by GET.
- An independent worker process fetches one job over HTTP using a separate bearer secret and a one-use lease token, runs the existing isolated Docker experiment, and reports results.
- Worker has **no database connection**, refuses startup when web DB / app secrets are present, and requires a pinned `node@sha256:...` runtime image digest.
- On an expired job poll, the web API fails closed, erases source and displays an infrastructure error.
- No process uses `eval`, `vm` or a shell to run user-supplied code inside Next.js.

## Manual local lab prerequisites

This is a developer-only experiment, not a supported student feature. **Do not enable it on a public interface** and do not use real learner data. On an isolated test machine:

1. Install Docker Engine and PostgreSQL 16. Apply migrations `0001`, `0002`, `0003` in order to an **empty throwaway database**.
2. Run Next **development** server bound to loopback with `APP_ORIGIN=http://127.0.0.1:3000`, `RUNNER_LAB_ENABLED=1`, a random `RUNNER_WORKER_TOKEN` of >=32 bytes, and the local `DATABASE_URL` for the test database.
3. On a **separate shell/process** with no `DATABASE_URL` or `APP_ORIGIN`, set `RUNNER_APP_ORIGIN=http://127.0.0.1:3000`, the same worker token, and `RUNNER_RUNTIME_IMAGE=node@sha256:<exact local Node image digest>`.
4. Pre-pull that signed/verified runtime image on the worker host and run `node services/code-runner/src/worker.mjs`.
5. Register a throwaway account in `/hesap`, then run a short JavaScript snippet from `/laboratuvar`.

The image digest must be taken from a trusted release and reviewed. A Docker tag alone is rejected by the worker. The worker refuses to contact non-loopback URLs. Never copy a credential into the repo or terminal history that will be shared.

## Evidence

- Worker protocol unit tests exercise malformed tickets, unauthorized configuration, idle queue, successful results and failure conversion.
- Existing Docker isolation smoke verifies network denial, memory/process limits, timeout and output bound.
- Disposable DB and real local HTTP integration verifies owner isolation, CSRF, quotas, lease replay rejection and account deletion.
- Headless Chrome responsive smoke checks the editor hydration and no page-wide overflow.

## What remains blocked

A Docker container alone is **not** an adequate guarantee against hostile code. Before public release: dedicated hardened runner hosts or microVM isolation, signed pinned images, custom seccomp/AppArmor, separate network identity/mTLS, retry/queue monitoring, process-escape and adversarial load testing, edge/IP quotas, retention enforcement, telemetry without code capture, privacy compliance, independent review and explicit authorization for deployment. **Production gate remains OFF irrespective of environment flags.**

Worker orchestration is sequential per process and uses a 30-second lease. Slow Docker startups and crashes may result in infrastructure errors; this is intentional fail-closed behavior, not silent retries. There is no public SaaS deployment or money spend.
