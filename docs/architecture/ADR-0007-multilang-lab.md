# ADR-0007: M7.2 opt-in Java/Python code evaluation

**Status:** local development laboratory, no public deployment or signed-off sandbox certification.

## Protocol

- Add `python.sum-even` and `java.clamp` exercise IDs at immutable revision 1. Public catalog includes two labeled examples each. Worker-only case bank contains two additional hidden cases/expected values per task.
- `POST /api/executions` must have a cookie-authenticated learner, same-origin protection, quota headroom and the explicit loopback lab flag. The web server selects runtime by trusted exercise ID, **never accepts a client-selected image or runtime ID**, writes a temporary queue job and returns only job metadata.
- A separate worker claims via existing bearer capability. Claimed job includes the validated runtime. Workers require pinned digest images for each runtime and execute in a disposable Docker container per case: immutable image, no network, read-only root, all capabilities dropped, `no-new-privileges`, unprivileged UID, private cgroup/IPC, bounded CPU/pids/memory/output and wall time.
- Python: student implements `sum_even(numbers)`; untrusted source plus **only input arguments** run under isolated Python 3.12. Java: student implements `Solution.clamp(int,int,int)`; worker appends its own fixed `Main` entry point and compiles/executes using Java 21. The expected outputs and verdict calculation **never reach the container**. The worker compares parsed stdout to expected JSON-compatible values and strips learner source at job completion.
- Misconfigured images, worker crash, timeouts and output exhaustion are **not mistaken for wrong answers**. A runtime exception or syntax/compilation error is a distinct `runtime_error`. The frontend shows category and aggregate score, but does not leak hidden fixtures.

## Explicit limits

1. Docker containment is an educational local-prototype boundary only, not a security assurance against determined adversaries. **Do not host internet-accessible submissions** without VM-grade isolation, network/policy enforcement, audit of Docker daemon exposure and signed/reproducible runtime images.
2. The compiler runs *inside* its own unprivileged container. The host web process never invokes `javac`, `python` or learner source. The worker Docker socket is high privilege and must reside on a separate disposable host, not the web host.
3. Student code can inspect each input, so hidden tests are a quality signal and not an anti-cheat guarantee. Public challenge examples are not encrypted.
4. Completion is aggregate only; output source may survive transiently in database WAL and backups. Source and credentials require retention policy and independent review before deployment.
5. Java uses a longer worker lease to account for compiler startup. The owner/user quotas, per-job maximum code size, idempotency and lease-token authentication remain mandatory.
6. The repetition scheduler uses quiz answers, **not** these code assessments; integrating trusted code grades into mastery needs explicit product modeling.

## Verification

Node tests validate harnesses and trusted worker routing; PostgreSQL validates mode-by-runtime and account deletion. GitHub CI spins real disposable Python/JDK Docker containers and tests correct code, public-case-overfit code, throwing code and secret isolation. Tests are not a professional penetration test.
