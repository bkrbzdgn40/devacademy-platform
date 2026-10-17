# DevAcademy

**Interactive software learning, practice, assessment and industry awareness.**

> Status: **M1 development preview**. The web shell, illustrative catalog, three JavaScript lessons and six server-graded output-prediction exercises have been scaffolded. Local PostgreSQL account sessions, a visual learning dashboard and persistent learning progress are available only after database configuration; no public service, code execution environment or live news feed is deployed.

DevAcademy connects programming languages, software engineering concepts and modern technology stacks to interactive lessons, programming practice, skill checks, learning paths and attributed technology updates.

## Run locally (after the foundation PR merges)

Requires **Node.js 24** and **pnpm 10.34.7**.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. `pnpm check` runs lint, type checks, catalog unit tests and production build. For accounts, configure local PostgreSQL 16 as described in [identity and progress setup](docs/architecture/IDENTITY-AND-PROGRESS.md); do not use real public user data in this development preview. `GET /api/health` checks the web process only, not future databases or workers.

## Current preview

- A Turkish landing page with a seven-lesson JavaScript learning path and three exploration routes.
- Catalog previews for languages, concepts and technologies, including the uncommon **COW** language.
- Seven reviewed JavaScript lessons and fourteen output-prediction exercises with server-side scoring and explanations.
- Three function-writing challenges under `/pratik`, with open examples and worker-only hidden test cases. Evaluation is available only in an explicitly configured **local sandbox laboratory**, never in production.
- PostgreSQL migrations for learner/attempt/progress, username credentials and server-side sessions, plus local registration/login, saved quiz attempts and account deletion. These features are active only with a configured database. Answers are not shipped in public question JSON.
- Responsive styling, keyboard skip link and basic semantic markup.
- All sample catalog items explicitly report **no runnable runtime**. Anonymous quiz responses are not persisted; authenticated quiz responses are stored if the local database is configured. Public registration/abuse controls remain incomplete.
- Technology news is a truthful empty state, not a synthetic live feed.

## Proposed architecture (future work, not implemented)

```text
apps/web/                 # Next.js UI, session APIs and authenticated learning flows
apps/worker/              # queued jobs (planned)
services/code-runner/     # separately sandboxed untrusted code (planned)
packages/database/        # Postgres schema and migrations (planned)
packages/ui/              # shared UI components (planned)
packages/learning-engine/ # content grading and progress (planned)
content/                  # reviewed lessons and exercises (planned)
docs/                     # project decisions, risks and roadmap
```

Stack foundation: Next.js, React, TypeScript, pnpm and Turborepo. Runtime execution and Redis are **not active**. Authentication and PostgreSQL storage operate in a configured local development environment, not a public hosted deployment.

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
