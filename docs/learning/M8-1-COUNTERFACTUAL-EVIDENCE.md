# M8.1 | Karşı-Olgusal Kanıt Döngüsü

## Original educational experiment

A lesson's multiple-choice training remains **guided practice**, not proof of
understanding. For six initial lessons across JavaScript, Java and Python, a
new separate, server-evaluated experience asks for TWO typed outputs under
a small, meaningful code change. The learner writes a causal explanation
and chooses confidence. Explanations stay in the browser and **are not
automatically graded or persisted**. Output answers are checked against
server-only reviewed deterministic logic. No learner code is executed.

The core loop: prediction -> two counterfactual outcomes -> causal explanation
-> correctness + calibration reflection -> fresh case after an error ->
independent pass -> **new independent case at least 24h later**.

This is an experiment in transfer and retention, not a validated measurement
of general programming competence. The system labels the results separately:
guided completion, transfer evidence and delayed transfer evidence.
The second state cannot be triggered by repeating the first answer immediately.

## Initial verified concept coverage

- JS let/const object mutation and Array.map source immutability
- Java division/casting and method overloading vs overriding
- Python range upper bound and print vs return

Other lessons retain their previous guided flow without pretending
transfer evidence exists. No randomized student code runs in web.
No private answers or expected outputs are sent by GET or embedded
in client bundles.

## Evidence, privacy and abuse limits

- Requires authenticated learner and already-completed guided lesson.
- Stable trial is issued on start and stored in the DB. Random seed
  is not exposed; client sees only the question.
- A wrong answer reveals the expected pair *after* grading and rotates
  the server-side seed. Up to eight attempts per stage, then 24h cooldown.
- Only stage 0 passing unlocks stage 1, exactly 24h later, enforced by DB
  \`passed_at\` (not client clock).
- No learner source code or raw answers/reflections saved. Table contains
  lesson ID, stage, random seed, attempt count, timestamps, confidence.
- Account deletion cascades to the new table. Subject ownership is derived
  from the session, not request body. JSON size, origin and normal auth
  defenses still apply.

## Migration and rollback

Apply **0007** after 0006 in local dev/QA DB before opening the new lab.
No changes to earlier 0001..0006 migrations, lesson completion or history.
The new API requires a migrated DB; it fails closed if absent. Backup and
verify schema migration before any future shared/production deployment.
Rollback app to previous version leaves an additive, unused table in place.
Do not drop populated tables without an approved data migration.

## Verification

Run core tests via \`corepack pnpm check\`. PostgreSQL integration uses
\`RUN_APP_TESTS=1 bash db/tests/check-schema.sh\`, including independent
proof phases, authorization, stale form submission, cooldown, cascade
deletion and HTTP CSRF / learner isolation. Production Chrome responsive
smoke covers prior lesson flows.

## Scientific honesty and next experiments

Typing two predicted outcomes is more open than recognizing multiple
choice, but students can still brute-force or use external help. The
ungraded explanation cannot objectively prove causal comprehension.
Follow-up experiments should compare independent performance on unseen
code-writing challenges, track calibration trends with consent, randomize
misconception-driven hints and run user studies. No claims of proven
learning improvement without controlled evidence.

## Runtime correctness gate

The main CI now executes two independently seeded examples for each of the six missions with actual Java 21, Python 3.12 or Node.js 24 runtimes. Java program bodies compile inside temporary directories; the fixture checks the final two output lines against the server evaluator and deletes its temporary files. This runs authored generator output in CI only; no learner-supplied code is executed in the web process.
