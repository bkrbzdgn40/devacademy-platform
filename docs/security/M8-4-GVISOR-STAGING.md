# M8.4: Isolated Staging Runtime, Production Remains Disabled

**Status:** GATED STAGING IMPLEMENTATION ONLY. NOT production-safe or public-launch approval.

## Why this changes the architecture

The current worker is intentionally localhost-only. Docker containers, even
with network=none, read-only roots, non-root users and resource limits, share
the host kernel and do NOT supply a public hostile-code security guarantee.
gVisor's \`runsc\` OCI runtime interposes a user-space application kernel
between the learner program and the host, giving a **different isolation
boundary** to evaluate under a controlled staging host. It is still not
equivalent to proving that a deployment is unexploitable.

This PR introduces two exact, operator-owned values for
\`RUNNER_SANDBOX_PROFILE\`:

- \`docker-lab\` (default): preserved existing disposable localhost-only
  research harness; Docker's configured default runtime is used.
- \`gvisor-staging\`: add explicit \`--runtime=runsc\` to every JavaScript,
  Python and Java test container. The worker preflights the Docker runtime
  registry and REFUSES to consume queue jobs if \`runsc\` is missing or
  Docker metadata cannot be read. It NEVER falls back to \`runc\`.

The profile is never read from a student request, queue job or browser.
The named profile is configured on the trusted worker only. All existing
network, process, memory, CPU, mount, user, output and wall-clock controls
remain. A gVisor staging worker still accepts ONLY loopback HTTP origins
and digest-pinned runtime images and MUST NOT run on the web/DB host.

## Host readiness checklist (operator-only)

1. Provision a separate, **disposable Linux** staging VM with a patched OS,
   no student production data, DB credentials, cloud metadata service access,
   admin cookies, shared workspace or mounted cloud secrets.
2. Install and **pin/review** Docker Engine and gVisor \`runsc\` from their
   maintained, verified supply chain, then register the \`runsc\` Docker
   runtime on the host. The official gVisor Docker guide describes
   \`runsc install\` and \`docker run --runtime=runsc\`:
   https://gvisor.dev/docs/user_guide/quick_start/docker/
3. Verify the host registration using \`docker info --format '{{json .Runtimes}}'\`.
   The worker checks that registry before consuming any job.
   **This checks configuration, not a cryptographic attestation.**
4. Pre-pull and verify approved, digest-pinned Node 24, Python 3.12 and Java
   21 images on this disposable VM. Never pull images on learner requests.
   \`RUNNER_RUNTIME_IMAGE\`, \`RUNNER_PYTHON_RUNTIME_IMAGE\` and
   \`RUNNER_JAVA_RUNTIME_IMAGE\` must all contain exact reviewed digests.
5. Run the **canary** using only pre-authored programs on an isolated staging
   host, *without any worker or web secrets*:

       RUNNER_SANDBOX_PROFILE=gvisor-staging RUNNER_STAGING_CANARY=1 \
       RUNNER_RUNTIME_IMAGE=node@sha256:<approved-digest> \
       RUNNER_PYTHON_RUNTIME_IMAGE=python@sha256:<approved-digest> \
       RUNNER_JAVA_RUNTIME_IMAGE=eclipse-temurin@sha256:<approved-digest> \
       node scripts/verify-gvisor-staging.mjs

   It tests all three real runtimes in runsc with preconfigured network off.
   Refuses DATABASE_URL, APP_ORIGIN, RUNNER_WORKER_TOKEN or production mode.
   Missing profile, unregistered runtime or any failing execution => FAIL.
   **The repo's ordinary GitHub Actions CI checks profile contracts only;
   it does not claim to execute the canary with gVisor.** Record independent
   host attestations, host hardening and the actual canary results separately.

6. Never mount \`/var/run/docker.sock\` inside a learner sandbox, even read-only.
   The **trusted worker** requires host Docker access and must itself run in an
   isolated administrative/VM boundary, not as a student execution container.
   Disallow containers from obtaining host secrets or network egress.
   Protect against host VM escape, compromised CI, image supply chain failure,
   side-channel leakage, unbounded CPU/storage and tenant abuse.

## Explicitly not delivered by this PR

- No \`RUNNER_PUBLIC_ENABLED\` or public worker hostname.
- No non-loopback execution API or remote-worker bearer exposed over internet.
- No SaaS deployment, DNS, TLS or authorization for anonymous users.
- No independent security review, incident response drills, monitoring or
  audited runtime identity attestation.
- No claim that gVisor alone qualifies as a public code-running service.

**Go/no-go before public pilot** requires dedicated staging resources,
hardened network and machine isolation, privileged escape and DoS exercises,
stable pinned supply chain, access-control and credential rotation tests,
queue expiry/purge and data-retention policy, observability/alerts,
backup/restore rehearsal, an external security review, and an explicit
human-controlled production activation process.

## Regression gates

The default research setup and its Docker CI must continue to pass unchanged.
Static worker-contract tests assert that JS/Java/Python staging launch args
require \`--runtime=runsc\` while preserving \`--network=none\`,
\`--cap-drop=ALL\`, read-only mounts and resource caps.
A mocked daemon check must fail closed if \`runsc\` is not registered.
Unit tests also assert that hostile profile strings cannot become Docker CLI
arguments. Run the dedicated gVisor canary only on an approved isolated host.
