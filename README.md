# DevAcademy

**Interactive software learning, practice, assessment and industry awareness.**

> Status: local development preview. Two shared course paths (JavaScript and Java), authenticated progress, and a localhost-only experimental JavaScript sandbox/assessment are implemented. Public code execution and production deployment remain disabled.

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
- All sample catalog items explicitly report **no runnable runtime**. Anonymous quiz responses are not persisted; authenticated quiz responses are stored if the local database is configured. Public registration/abuse controls remain incomplete.
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
