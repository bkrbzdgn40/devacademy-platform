# M8.0B | Security and reliability controls

Status: implemented in source; not a production deployment or security certification.

## Registration quotas

Registration validates the username/password before performing any expensive
password hashing. Atomic PostgreSQL rate counters then restrict requests to:

- 5 registration attempts per normalized username / 15 minutes.
- 120 total registration attempts across app instances / 15 minutes.
- A rate-limited attempt returns HTTP 429 and Retry-After: 900.
- Counters use hashed subjects. No passwords/tokens are logged or stored there.
- The system fails closed on database errors and checks existing usernames
  before performing scrypt. The credentials UNIQUE constraint still closes races.

The global limit is deliberate protection against rotated usernames but also
allows an attacker to temporarily exhaust *new account* availability. It is
not IP-based because client-supplied X-Forwarded-For is untrusted. Before
public signup, add an edge/proxy rate limiter with trusted client IP handling,
abuse monitoring and a documented adjustment policy. The 120 cap is a beta
default, not a measured production threshold.

Login and account deletion use their existing DB-backed throttles.

## Operator-only retention

No migration, automatic cron or production mutation is made in this PR.
Only these auth records can be cleaned:

- learner_sessions rows where expires_at <= now().
- auth_attempt_limits rows older than 24 hours by window_start.

The operation never targets accounts, credentials, learning attempts,
course progress or review schedules.

With DATABASE_URL set to the correct database, run:

    node scripts/cleanup-auth-state.mjs
    node scripts/cleanup-auth-state.mjs --apply --batch-size=200

The default is a read-only count. The explicit --apply option deletes up to
the chosen batch size (1–1000) **per table per call**, using row locks with
SKIP LOCKED. Review the dry-run, target database and recoverable backup before
production use. Run in limited repeated batches with monitoring; no unattended
schedule has been installed.

Rollback: stop the maintenance invocation. Expired sessions and stale limit
counters are not restored by this script and do not affect active logins.
For app changes, revert the release rather than manipulating user rows.

## Web response headers

Next.js now includes X-Frame-Options: DENY, X-Content-Type-Options: nosniff
and Referrer-Policy: strict-origin-when-cross-origin for web and API paths.
A tested CSP and edge TLS/HSTS settings remain pre-production work.

## CI

- DB integration runs when all relevant integration tests change, including
  the maintenance script.
- Worker isolation CI also reacts to app/worker execution contracts, API
  endpoints, queue integrations and relevant database migrations.
- Dependency audit checks high/critical production advisories when package
  manifests, lockfiles or its workflow change, and on a weekly schedule.
- Unit/DB/HTTP tests cover 429, pre-hash quota rejections, live sessions and
  dry-run/bounded retention. Browser headers are checked over production HTTP.

## Outstanding release requirements

This milestone is not an independent penetration test or authorization to
enable public code execution. Public launch still requires edge-level signup
abuse defenses, alerting, backups and a restore drill, a CSP and TLS review,
KVKK/privacy retention review, dependency triage and independent security
review. A runner must stay opt-in and localhost-only until its separate
security acceptance gate is signed off.
