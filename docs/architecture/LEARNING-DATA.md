# Learning data persistence foundation

**Status:** Schema contract and disposable database integration tests only. It is not connected to the live Next.js app; no account registration, personal data storage or durable quiz progress is available yet.

## Migration

The initial PostgreSQL 16-compatible migration is `db/migrations/0001_learning_core.sql`. It creates three tables:

- `learner_accounts`: opaque user identifiers and timestamps, no email/password/session fields.
- `learning_attempts`: referenced user, stable lesson/exercise IDs, exercise revision, selected option, verdict, evaluator version and timestamp. Does **not** persist arbitrary code or secrets.
- `lesson_progress`: one progress row per (learner, lesson) with visit/completion times.

Foreign keys use `ON DELETE CASCADE` so attempts and progress disappear when an account is deleted. Revision constraints, uniqueness and indices support stable progress and efficient history.

## Test locally

Requires Docker:

```bash
bash db/tests/check-schema.sh
```

The test runs a throwaway PostgreSQL container, applies the migration, tests valid writes, invalid revision, FK enforcement, progress uniqueness and deletion cascade, then removes the container. The image is a development-test dependency only; before relying on production database images, pin digests and review supply-chain controls.

## Security and upcoming integration

The schema is **not** proof of secure multi-user authorization. The application must implement authenticated identity, owner-scoped queries, consistent session handling, account deletion/export and data retention controls **before enabling any write endpoint for real learners**. Authentication/session storage is deliberately absent until the Auth.js provider/adapter contract is selected and reviewed. Do not infer authorization from a URL or client-supplied `learner_id`.

The architecture currently selects Drizzle ORM for application queries. SQL here records the initial database contract independently; a follow-up integration should define its Drizzle schema and reconcile generated migrations with this exact DDL before deploying. Do not maintain conflicting schema sources.

## Release gate

No production migration or user data collection from this PR. This is a reviewed and tested *migration artifact*, not a deployed database. Schema changes must be tested on disposable DBs and reviewed for rollback/data loss before use on production.
