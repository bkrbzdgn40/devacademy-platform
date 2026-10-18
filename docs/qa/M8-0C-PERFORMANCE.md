# M8.0C | Measured performance, not guessed optimizations

## Evidence sources

- Headless Chrome against a Next production build, recording resource transfers,
  navigation timing and CodeMirror's readiness on the Apply stage.
- Disposable PostgreSQL 16 concurrency probe using 40 read-only 25ms queries,
  logging pool size, pending waiters, p50 and p95 response time.
- Isolated Docker JS/Python/Java probes on disposable GitHub Actions VMs,
  recording execution wall time and verified output.

Each runner is environment-specific and noisy. Logs and JSON artifacts produced
by CI contain the results; this document intentionally does not invent
pre-change speedup numbers or production Core Web Vitals.

## CodeMirror optimization

CodeMirror itself already uses next/dynamic; however the three grammar packages
were imported eagerly by every CodePlayground instance. Import only the selected
JavaScript, Java or Python grammar when its editor is mounted. A small loading
placeholder and unmount cancellation keep async behavior safe.

## Database behavior

Do not raise the web pool's default max of 10 without load measurements and a
production connection budget. The new probe exercises that limit against a
throwaway database, not actual student data. It does not change credentials,
queries, migrations or connection-pool policies.

## Docker behavior

Retain separate non-root network-disabled containers, CPU/PID/time caps and the
worker/web isolation boundary. The probe captures actual end-to-end wall times
for 3 executions per runtime. Reported 128/256/512 MiB memory numbers are
configured container ceilings, **not measured RSS or peak memory**. Separate
privileged-host instrumentation would be needed for observed CPU/memory data.

## Comparability and next gate

Repeat measurements on the same GitHub runner class before choosing numeric
regression limits. Real-world LCP/INP and authenticated representative load
testing still require dedicated measurement. No production deployment or public
code execution is authorized by these changes.
