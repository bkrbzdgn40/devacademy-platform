# Accounts, sessions, authorization and durable learning history

**Status:** Local/private testing capability; public deployment requires the launch hardening checklist below.

## Chosen pilot strategy

No third-party OAuth/email credentials are necessary for this **local learning pilot**. Learners register using a 3–24 character lowercase ASCII username and a passphrase of **at least 15 characters**, up to 128 characters (and a 512-byte UTF-8 cap). Password recovery and verified email are not available. Before public release, prefer a mature, reviewed identity provider or completed security audit plus recovery/MFA and abuse-prevention measures.

### How to run locally

1. Start a private PostgreSQL 16 instance.
2. Apply both ordered migrations: `db/migrations/0001_learning_core.sql` and `0002_auth_sessions.sql`.
3. Set `DATABASE_URL` locally, e.g. copy `apps/web/.env.example` to `apps/web/.env.local` and replace the sample URL with your local database credentials.
4. Run `pnpm install --frozen-lockfile`, then `pnpm dev`.
5. Open `/hesap` to register; `/dersler` to complete exercises; `/hesap` to review or delete records.

**Never commit .env.local.** Do not run migration files repeatedly against a persistent DB; a schema migration history/check and backup process are needed before production rollout.

### Data model

- `learner_accounts`: opaque UUID learner identity.
- `learner_credentials`: unique normalized username, salted scrypt KDF verifiers; **never raw passwords**.
- `learner_sessions`: **only SHA-256 token digests**, expiry timestamps and owned learner IDs, cascading delete.
- `auth_attempt_limits`: atomic, persistent per-username verification throttle, max five attempts in a 15-minute window.
- `learning_attempts`: only selected option, exercise revision, graded outcome, learner UUID and time.
- `lesson_progress`: view/completion history owned by a learner.

All database queries are parameterized through `pg`. Single-connection transactions protect multi-write operations. Every protected read and mutation resolves learner UUID from the server-validated session, **not from a user-supplied learner ID**. Deleting an account requires current password and `DELETE` confirmation, then cascades all progress and sessions, while preserving other accounts.

### Request defenses

- State-changing endpoints require an explicit, strictly matching `Origin` header; set `APP_ORIGIN` to the externally accessible scheme/host in nonlocal environments.
- All auth/quiz/progress JSON requests have strict body limits, content type checks and bounded, validated IDs.
- Session bearer is 256 random bits, `HttpOnly`, `SameSite=Lax`, `Path=/`; HTTPS uses the `__Host-` prefix and `Secure`. Sessions expire server-side after seven days and are revoked server-side on logout/account delete.
- All sensitive API reads and writes return `Cache-Control: no-store`.
- Anonymous quiz users can still practice, but responses explicitly state `saved:false`; authenticated attempts are persisted. Lesson completion is granted **only after that learner has correctly answered all questions for the lesson**.
- The browser cannot change the learner ID, exercise grade or trusted option key.

### Tests and limitations

CI runs separate web checks and a disposable PostgreSQL integration workflow covering database integrity, sessions, owner isolation, forged IDs, password re-verification, real HTTP cookies, same-origin CSRF rejection, logout and deletion.

**Blocking tasks before exposing registration publicly:**
- Edge/distributed IP + device rate limits, anti-automation and registration-abuse prevention in addition to per-username DB throttling.
- Password breach screening, account recovery and optional MFA, and mature identity library assessment/audit.
- Security review of reverse proxy TLS, `APP_ORIGIN`, session cookie and headers; HTTPS-only outside loopback.
- Data privacy/retention/export, breach response and user consent/KVKK review.
- An administrative, reversible migration deployment flow with backup and restore tests.
- Threat-model review and penetration testing; No production credentials in CI.

The capability in this PR is real under a configured local PostgreSQL environment, not an announcement that accounts are enabled on a public hosted service. Do not deploy a public login system straight from this proof-of-concept.
