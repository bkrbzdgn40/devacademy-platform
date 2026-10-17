# ADR-0004: Version-controlled multi-course engine

**2026-10-17 · Active (developer preview)**

## Decision

Replace JS-only page/rendering assumptions with a small **data-first course registry** and two reusable UI components: `CourseOverview` and `CourseLesson`. Keep the modular Next.js application, rather than adding an unnecessary course microservice or runtime registry now.

### Data contract

- `courses.json`: ordered catalog courses, stable ID, URL slug, catalog `languageId`, `locale`, editor mode, explicit *disabled* execution capabilities, and ordered lesson IDs.
- `lessons.json`: all languages together; a stable ID, slug, objective, explanation, runnable-looking **reviewed-only** code sample, misconceptions/takeaways, prerequisite IDs, question IDs.
- `questions.json`: public code/prompt/options only.
- `server/grade.ts`: server-only keyed answers and explanations. No hidden solution in client JSON.
- `course-validator.mjs`: data integrity gate including referential integrity, IDs/slugs, prerequisites order/acyclicity, question ownership, private key coverage, no accidentally enabled execution.

### Routing and compatibility

- `/kurslar`, `/kurslar/[courseSlug]`, `/kurslar/[courseSlug]/[lessonSlug]` implement course-neutral routing.
- Previous `/dersler` and `/dersler/[slug]` remain functional wrappers for JavaScript. No link/ID migration and no destructive SQL migration.
- All signed-in progress remains indexed by immutable `lesson_id` and `exercise_id`. Dashboard aggregates both courses, grouping by course.

### Editorial verification

A Java course provides **three introductory lessons and six prediction questions**. Trusted question snippets are compiled using Java 21 and executed as part of GitHub CI; six private answer keys must match actual outputs. This is NOT a Java sandbox or user-code executor.

Browser editors are capability-gated. JS retains its existing opt-in, loopback-only lab workflow. Java is **editing-only plaintext**, even if JS lab is enabled. Future languages may use plain edit mode until syntax support is reviewed. Never infer execution support from inclusion in the catalog.

### Tradeoffs and follow-up

The model uses a single reviewed Git repository as CMS. Large catalogs later require localization and language-aware import/build partitions, editorial UI, reference linking, course versioning and course/skill-specific mastery analytics. Content licensing/editorial review and runtime security gates remain mandatory. No production deployment.

## Guided Course Experience v1 (M6)

Python and Java lessons use a four-phase learning route: **predict → trace → debug → transfer**.
Each lesson includes an instructor-authored, progressively revealed execution trace; a buggy example editable locally in CodeMirror with true Python or Java Lezer grammar highlighting; a server-graded **"which change fixes the bug?"** question; two optional hints; and an independent transfer question. Wrong fix choices receive a misconception-specific explanation. This is an educational diagnosis of the learner's chosen fix, **not an execution or grading of their edited code**. The editor does not submit Python/Java source to a server. Existing JavaScript lessons keep their established routes and JavaScript sandbox safety gate.

Course overview pages show an account-scoped completion fraction and suggested next lesson when PostgreSQL + a signed-in learner is present. Anonymous/unconfigured environments show an honest unavailable/login notice, not fabricated 0% progress. Quiz attempts and lesson-completion ownership remain enforced by existing database controls. Past completed lessons are not revoked when a third diagnostic question is introduced; students who complete a previously unfinished lesson must now pass its third exercise.

Private answer keys and wrong-choice explanations live in `apps/web/src/server/answer-keys.json`; public `apps/web/src/data/lesson-guides.json` and `questions.json` contain hints, broken source examples and answer options, never private correct-option IDs or diagnostic feedback. Grammar packages are pinned in pnpm lockfile.

**Limits:** this is a deterministic instructor-curated diagnostic loop, not an AI tutor or independent proof that any edited source is correct. Deeper personalized learning requires longitudinal mastery modeling and an audited sandbox for non-JS code. New diagnostic questions use stable `debug.<language>.*` IDs; the existing reviewed Java/Python sample tests only execute the non-buggy `java.*`/`python.*` educational fixtures in CI.
