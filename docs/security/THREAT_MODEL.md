# Security baseline and threat model

**Status:** Mandatory pre-launch requirements, not an attestation that controls exist.

## Protected assets

Learner accounts and credentials; session tokens; unpublished hidden tests; intellectual property; operational secrets; database integrity; application availability; published curriculum trust; third-party source attribution.

## Trust boundaries

1. Browser and API requests are untrusted.
2. All student-submitted code and program input are untrusted even when a student is authenticated.
3. Third-party RSS, release notes, docs and AI-generated text are untrusted input.
4. Runner workers and sandboxes may be compromised; web database/secrets must remain unreachable.
5. CI dependencies, packages and build artifacts have supply-chain exposure.

## Threats and required mitigations

| Threat | Required response |
| --- | --- |
| Remote code escape | Dedicated non-privileged runner host/VM/container boundary; hardened namespaces/seccomp/cgroups where supported; security review and adversarial escape tests |
| Fork bomb / infinite loops | CPU and wall timeouts, PID/process and memory quotas, output and disk limits, kill-and-discard |
| SSRF/network exfiltration | No default outbound network in learner workloads; no metadata endpoint or internal service reachability |
| Filesystem access | Immutable runtime image, read-only mounts, short-lived per-job scratch, no host credentials/sockets |
| Grading manipulation | Hidden cases server-side, immutable exercise revisions, authenticated ownership-scoped attempts |
| Abuse/cost drain | Per-user/IP quotas, concurrency caps, queue backpressure, payload limits, monitoring and suspension path |
| XSS/content injection | Escape output, sanitize rich text, CSP where practical; treat news HTML as untrusted |
| Prompt injection from external sources | Never obey external content as operational instructions; attribute and review summaries |
| Auth/tenant mix-up | Object-level authorization tests, session hardening, CSRF defense and audit of ownership queries |
| Secrets in logs | Runtime secret manager, least-privilege credentials, redaction, log retention |
| Dependency compromise | Pinned lockfile, updates, review and dependency scanning |
| News misinformation and copyright | Original canonical links, publication dates, editorial review, no unauthorized article copies |
| Privacy leaks | Data minimization, encrypted transport, retention/deletion/export policy, region/compliance review |

## Sandbox acceptance gate

The runner is blocked from production until evidence exists for all of:

- User code cannot access web-app credentials, database, queue control or privileged container socket.
- Runner has appropriate process, memory, CPU, output, disk, execution-time, network and concurrency limits.
- Isolation tested with adversarial fixtures (infinite loop, process explosion, large output, file reads, network access, input bombs) in a non-production environment.
- Runtimes are versioned, signed or provenance-checked where feasible, and deployment rollback is documented.
- Java/JS/Python and SQL execution variants are individually reviewed.
- Fail-closed behavior on worker/timeouts and infrastructure errors is observed.
- Security owner signs off with evidence links recorded in the PR.

**A library/framework and a container by themselves do not prove isolation.** For high-trust production deployment, evaluate VM-grade isolation if needed. Production egress stays denied unless specific use cases have a separately reviewed allowlist.

## Operational policy

No tokens/keys in code, examples, prompts or PR discussions. Never bypass branch protection, disable required checks, publish private repository contents, or add high-risk third-party actions without review. Keep the repository private until licensing and disclosure are approved. Before collecting real users' data, create privacy notices and a deletion/export process (including applicable Turkish KVKK obligations).
