# M3 — Separate JavaScript runner isolation proof

**Status: LAB PROTOTYPE ONLY. Not a production execution service. Not wired to web API, lessons or the Run button.**

## Security boundary

`services/code-runner/src/run-isolated.mjs` launches one ephemeral Docker container per attempt using a preinstalled Node runtime image. No source text becomes a command-line shell string; it is written to a temporary file mounted **read-only**. The Docker CLI runs on the **runner host only**. The container itself never receives Docker socket or database credentials.

Controls in the prototype:
- Explicit `--network=none`; no outbound internet or internal services.
- Read-only root filesystem, no Linux capabilities and `no-new-privileges`.
- Non-root container UID/GID 65534, no IPC share and ephemeral isolated temporary filesystem.
- CPU .5, 128 MB memory/swap, 32 processes and 64 open-file limit.
- 8 KiB source, 8 KiB each of stdout/stderr and a 1.8-second wall-time limit.
- UUID-like names and best-effort `docker rm -f` cleanup on timeouts and failures.
- Runtime image pre-pulled; no automatic Docker image downloads at submission time.
- No output of submitted code or secrets in logs from the runner API.

## Local experiment

Requires Docker Engine on a **dedicated isolated development machine**, Node.js 24, no other workloads or application credentials.

```bash
docker pull node:24-alpine
node services/code-runner/tests/isolation-smoke.mjs
node services/code-runner/src/cli.mjs services/code-runner/samples/hello.js
```

CI tests normal output, missing host credentials, blocked socket connection, output flooding and infinite-loop timeout. These are **proof-of-concept checks**, not a penetration test or full container-escape audit.

## Why not production-ready

A privileged Docker daemon or shared runner host can be dangerous if the runner orchestrator is compromised. A Docker container is **not an assured hostile-code security boundary**; a dedicated VM-per-execution or gVisor/Firecracker class isolation may be required. Additional gates:

1. Deploy on separate hardened hosts with **no app secrets, no production network reachability**, and preferably rootless runtime / VM isolation.
2. Pin runtime **image by signed digest** (the prototype uses a mutable `node:24-alpine` label in CI).
3. Apply hardened seccomp/AppArmor/SELinux policies and verify kernel/runtime patching.
4. Confirm zero outbound network including DNS, IPv6, loopback routing and cloud metadata.
5. Add trusted queue, authenticated worker protocol, per-user and IP quota, concurrency budgeting, idempotency and job persistence.
6. Verify process escalation, mount traversal, symlinks, namespace escapes, huge stdin/out, crash recovery and orphan cleanup under realistic attacker workloads.
7. Enforce runner API input validation, output encoding and refusal to reveal hidden test cases.
8. Independent security sign-off with evidence, threat-model updates and a rollback plan.

**Explicitly no public API route to this runner is created.** The product's disabled Run button stays disabled until these acceptance gates are met.
