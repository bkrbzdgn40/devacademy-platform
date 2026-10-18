# DevAcademy

**Interactive software learning, practice, assessment and industry awareness.**

> Status: local development preview. Three shared course paths (JavaScript, Java and Python), authenticated progress, and a localhost-only experimental JavaScript sandbox/assessment are implemented. Public code execution and production deployment remain disabled.

DevAcademy connects programming languages, software engineering concepts and modern technology stacks to interactive lessons, programming practice, skill checks, learning paths and attributed technology updates.

## Run locally

Requires **Node.js 24** and **pnpm 10.34.7**.

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Open http://localhost:3000. `corepack pnpm check` runs lint, type checks, catalog unit tests and production build. On Windows, `corepack enable` can fail with EPERM when the global Node.js installation is protected; use `corepack pnpm ...` directly without installing a global pnpm shim. For accounts, configure local PostgreSQL 16 as described in [identity and progress setup](docs/architecture/IDENTITY-AND-PROGRESS.md); do not use real public user data in this development preview. `GET /api/health` checks the web process only, not future databases or workers.

## Current preview

- A Turkish landing page with a seven-lesson JavaScript learning path and three exploration routes.
- Catalog previews for languages, concepts and technologies, including the uncommon **COW** language.
- Seven reviewed JavaScript lessons and fourteen output-prediction exercises with server-side scoring and explanations.
- Three function-writing challenges under `/pratik`, with open examples and worker-only hidden test cases. Evaluation is available only in an explicitly configured **local sandbox laboratory**, never in production.
- PostgreSQL migrations for learner/attempt/progress, username credentials and server-side sessions, plus local registration/login, saved quiz attempts and account deletion. These features are active only with a configured database. Answers are not shipped in public question JSON.
- Responsive styling, keyboard skip link and basic semantic markup.
- All sample catalog items explicitly report **no runnable runtime**. Anonymous quiz responses are not persisted; authenticated quiz responses are stored if the local database is configured. Registration has initial DB-backed abuse limits; edge-level protections are still required before public signup.
- Technology news is a truthful empty state, not a synthetic live feed.

## Architecture (current and future)

```text
apps/web/                 # Next.js UI, session APIs and authenticated learning flows
apps/web/src/server/      # authenticated PostgreSQL queue (local lab only)
services/code-runner/     # separate local-lab worker and Docker sandbox
db/                       # PostgreSQL migrations and integration tests
packages/ui/              # shared UI components (planned)
packages/learning-engine/ # content grading and progress (planned)
scripts/                 # course drafting and reviewed publication
docs/                     # project decisions, risks and roadmap
```

Stack foundation: Next.js, React, TypeScript, pnpm and Turborepo. The execution worker is opt-in localhost-only and remains disabled by default. Redis is not used. Authentication and PostgreSQL storage operate in a configured local development environment, not a public hosted deployment.

## Planning and governance

- [Product requirements](docs/requirements/PRD.md)
- [Architecture](docs/architecture/ARCHITECTURE.md)
- [Learning data schema](docs/architecture/LEARNING-DATA.md)
- [Identity, sessions and progress setup](docs/architecture/IDENTITY-AND-PROGRESS.md)
- [ADR-0001](docs/architecture/ADR-0001-foundation.md)
- [Content model](docs/content/CONTENT_MODEL.md)
- [Threat model](docs/security/THREAT_MODEL.md)
- [Code assessment ADR](docs/architecture/ADR-0003-code-assessment.md)
- [Roadmap](docs/roadmap/ROADMAP.md)
- [Contributor guide](CONTRIBUTING.md)
- [Agent instructions](AGENTS.md)

Develop on feature branches and merge through reviewed pull requests. Never execute user-submitted code in the web process. No secrets in repository history.

## License

All rights reserved until an explicit licensing decision is recorded.

## Course Engine v1 (three learning languages)

Browse `/kurslar` for JavaScript fundamentals (7 lessons / 14 questions), Java fundamentals (3 lessons / 6 questions) or Python fundamentals (5 lessons / 10 questions). Both use the same pages, lesson identity contract, server grading and account-scoped progress. Existing `/dersler` URLs remain valid. Adding another course is **content-as-code**, not a custom frontend page: see [Add a course](docs/content/ADD-A-COURSE.md) and [ADR-0004](docs/architecture/ADR-0004-course-engine.md).

Java code is **editing-only**; reviewed repository Java snippets are verified in GitHub CI but learners cannot compile/run Java. All public execution remains blocked until dedicated safety gates are satisfied.

## Course Engine v1.1: add a course safely

Use `node scripts/course-cli.mjs new python python-temelleri "Python Temelleri"` to generate an ignored authoring draft. Complete its public lessons/questions and separate private answers, mark both editorial review gates after actual review, then run `node scripts/course-cli.mjs check python-temelleri` and `node scripts/course-cli.mjs publish python-temelleri --reviewed`. Run `corepack pnpm check`, inspect the Git diff and open a PR. Details: [Course authoring guide](docs/content/ADD-A-COURSE.md) and [ADR-0005](docs/architecture/ADR-0005-course-authoring.md). New runtimes are **never automatically enabled**.

## Python Fundamentals (published, editing-only)

Python Temelleri is available under `/kurslar/python-temelleri`. It contains five Turkish lessons and ten server-graded prediction questions. Reviewed Python 3.12 examples run in CI only; student Python code is not executed on the web server or in any local runtime. The independent course-authoring drafts stored under `content/course-drafts/` are intentionally untracked and are not automatically published. If you previously created a `python-temelleri` draft locally, it remains separate from the published Git content. Avoid publishing the obsolete draft; archive it for reference instead.

## M6: Guided learning for Java and Python

Java and Python lessons now follow **predict, trace, debug, transfer**, with grammar-aware syntax highlighting, progressively revealed traces, two-level hints and option-specific explanations. "Debug" tasks assess the selected repair, **not learner-edited source**. An authenticated course overview displays per-course completion and suggests the next lesson. The existing language execution restrictions do not change. See [Course Engine ADR](docs/architecture/ADR-0004-course-engine.md).

## M7: Kişisel tekrar

Authenticated learners can visit `/tekrar`. Questions answered incorrectly return after 10 minutes; successful scheduled reviews return after 1, 3, 7, 14, or 30 days. Historical completions are unchanged. Requires additive PostgreSQL migration `db/migrations/0005_spaced_reviews.sql` before first M7 graded attempt. The review schedule is not an AI mastery score. [Architecture notes](docs/architecture/ADR-0006-spaced-reviews.md).

## M7.2: Python/Java local code judge

Two programming challenges are available at `/pratik/python-cift-topla` and `/pratik/java-araliga-sinirla`. The ordinary site **never runs learner code**. An explicitly opted-in localhost-only Docker lab supports compiling/executing each attempt in fresh network-disabled, read-only, least-privilege short-lived containers. The worker checks hidden expected outputs, while the student sees only a bounded result summary. Deploying the judge publicly still requires an external security audit and VM-grade isolation. See [ADR-0007](docs/architecture/ADR-0007-multilang-lab.md). Apply additive migration `db/migrations/0006_multilang_lab.sql` in addition to `0005` before using the lab with existing local PostgreSQL.

## M8.0A: Focused learner navigation and lesson stages

The top navigation now offers **Öğren**, **Pratik yap**, **Keşfet** (Diller/Kavramlar/Teknolojiler), and **İlerlemem**. Scheduled review remains one click away from the signed-in progress dashboard and course progress card. Guided Java/Python lessons use four stages (predict, understand/trace, diagnose, apply); JavaScript lessons use three (understand, code, assess). Only the visited stage content is mounted and prior stage answers stay mounted when revisiting. The guided debug stage deliberately shows the source as read-only, since only the repair choice is graded; the single editable CodeMirror is deferred until apply. No question IDs, private answer keys, database schema, account records, or runtime gates were changed. The full course completion requirements remain server-enforced.

## M8.0B security maintenance

Registration has shared database-backed quotas before password hashing, and defensive browser headers are enabled. A **read-only-by-default** auth cleanup command handles expired sessions and stale login/registration counters only, never learner progress. Worker CI path coverage and scheduled dependency scanning have been expanded. See [M8.0B operations](docs/security/M8-0B-OPERATIONS.md) for the controls, safe invocation, rollback and remaining launch gates.

## M8.0C performance measurements

GitHub CI records real headless-Chrome lesson/editor loading and Docker execution timings, with downloadable JSON evidence. Disposable PostgreSQL tests record concurrent connection pool size and query wait distributions. Language-specific CodeMirror grammars now load on demand. Database connection max (10) and sandbox resource ceilings remain unchanged until comparable measurements justify revision. See [methodology](docs/qa/M8-0C-PERFORMANCE.md).

## M8.1: Counterfactual Transfer Evidence

Six selected JavaScript/Java/Python lessons now add a separate, login-gated **two-output prediction** lab after guided completion. Students explain *why* and indicate confidence; the explanation is local-only and not graded. A first correct independent case is distinct from guided completion; an additional new case after at least 24 hours yields delayed transfer evidence. Only metadata is persisted. Requires additive `db/migrations/0007_transfer_evidence.sql` after 0006. No public learner code execution. See [evidence model](docs/learning/M8-1-COUNTERFACTUAL-EVIDENCE.md).

## M8.2 Adaptive Misconception Lab

Wrong output predictions now lead to an author-reviewed, A- or B-focused concept experiment. Twelve focused variants cover six JS/Java/Python lessons. Coached success never grants independent evidence; it instead unlocks a fresh unguided problem. Authenticated challenges use one-time IDs to reject stale answers without saving raw responses. Additive migration 0008 follows 0007. See [design and operational limits](docs/learning/M8-2-ADAPTIVE-PROBES.md). No public source execution is enabled.

## M8.3: Independent code-writing transfer

Six concept-aligned JavaScript/Python/Java tasks now ask students to author actual function behavior and pass a trusted worker's public **and hidden** tests. Proof is derived from completed, owner-scoped job records created after an independent counterfactual pass, never from client-reported success. Public code execution remains disabled; the new feature can earn a verified code-writing result only in an explicitly enabled, isolated localhost laboratory. Read [M8.3 operational design](docs/learning/M8-3-INDEPENDENT-CODE-TRANSFER.md).

## M8.4 gVisor staging profile (not public)

An optional `gvisor-staging` execution profile inserts Docker `--runtime=runsc` for JS/Python/Java worker sandboxes. The worker checks Docker runtime registration before claiming any jobs and fails closed when missing. The existing `docker-lab` default is unchanged; **public/production execution remains disabled**, and untrusted users cannot choose the runtime. An explicit three-language canary can be run on a separate disposable Linux staging host with pinned images. See [M8.4 isolated staging runbook](docs/security/M8-4-GVISOR-STAGING.md).

## M8.5 Learning Studio 2.0

Six JavaScript, Python and Java concepts now include a responsive prediction-first line-by-line trace studio. Learners enter two outputs before seeing program state, inspect variables and console changes, compare causal errors and try three reviewed input variants. All 18 examples are verified with actual language runtimes in CI and the mobile interaction is exercised by headless Chrome. These authored traces are for teaching only and never grant independent grade or execute arbitrary student code. See [Learning Studio pedagogy and limits](docs/learning/M8-5-LEARNING-STUDIO.md).

## M8.5.1 Complete Studio Coverage

All **15 published JavaScript, Java and Python lessons** now have a reviewed prediction-first Learning Studio with three input variants per lesson (**45 runnable cases**). Every lesson also includes a conceptual mental model, a likely misconception, a contrast with a causal explanation, a reflection prompt with a reveal-on-demand answer, and a practical use case. CI checks the entire authored catalog against real language runtimes and mobile Chrome behavior. No arbitrary browser execution, new code grading, production deployment or DB migration. See [M8.5.1 implementation and editorial scope](docs/learning/M8-5-1-FULL-CURRICULUM.md).

## M8.6A · Olive & Earth design system

A light warm-cream learning surface, accessible olive navigation/actions, terracotta editorial accents and deep-cocoa code panels now establish the shared brand. Semantic tokens, local font stacks and typed ActionLink/SurfaceCard/SectionHeading/StatusPill primitives are documented in [the design system](docs/design/M8-6A-OLIVE-EARTH.md). Existing quiz, lessons, transfer lab, code editor and progress behavior is unchanged; no dependency or migration is required. Primary body/CTA/code contrast is validated in CI, alongside 320px+ browser smoke checks.

## M8.6A.1 · Dark espresso learning theme

DevAcademy now provides **Sistem / Açık / Koyu** appearance preferences. The dark palette combines espresso surfaces, legible sage-olive primary actions and copper-terracotta accents, with a darker code canvas. Choices survive navigation and refresh; System follows live OS color preference. The theme toggle does not change learning records or server state. See [dark theme design and testing](docs/design/M8-6A-1-DARK-THEME.md).

## M8.6B · Ana Sayfa ve Kurs Keşfi 2.0

The homepage offers a genuine authenticated resume-to-lesson panel (never invented progress), themed learning path comparisons for 3 real courses/15 lessons, a causal-learning walkthrough and explicitly labeled software news *sources* rather than fictional live headlines. The course catalog searches actual course and lesson content with direct lesson links. No new migrations, third-party data transmission or production deployment. [M8.6B product design](docs/design/M8-6B-HOME-DISCOVERY.md).
