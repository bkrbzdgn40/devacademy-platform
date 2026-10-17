# DevAcademy

**Interactive software learning, practice, assessment and industry awareness.**

> Status: **M1 development preview**. The web shell and an illustrative catalog have been scaffolded. No lessons, accounts, execution environment, code grading, database, or live news feed are deployed yet.

DevAcademy connects programming languages, software engineering concepts and modern technology stacks to interactive lessons, programming practice, skill checks, learning paths and attributed technology updates.

## Run locally (after the foundation PR merges)

Requires **Node.js 24** and **pnpm 10.34.7**.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. `pnpm check` runs lint, type checks, catalog unit tests and production build. `GET /api/health` checks the web process only, not future databases or workers.

## Current preview

- A Turkish landing page with three clear exploration routes.
- Catalog previews for languages, concepts and technologies, including the uncommon **COW** language.
- Responsive styling, keyboard skip link and basic semantic markup.
- All sample catalog items explicitly report **no runnable runtime**.
- Technology news is a truthful empty state, not a synthetic live feed.

## Proposed architecture (future work, not implemented)

```text
apps/web/                 # Next.js UI and HTTP endpoints (scaffolded)
apps/worker/              # queued jobs (planned)
services/code-runner/     # separately sandboxed untrusted code (planned)
packages/database/        # Postgres schema and migrations (planned)
packages/ui/              # shared UI components (planned)
packages/learning-engine/ # content grading and progress (planned)
content/                  # reviewed lessons and exercises (planned)
docs/                     # project decisions, risks and roadmap
```

Stack foundation: Next.js, React, TypeScript, pnpm and Turborepo. Runtime execution, authentication, PostgreSQL and Redis are deliberately **not active** until their security and data flows are implemented and verified.

## Planning and governance

- [Product requirements](docs/requirements/PRD.md)
- [Architecture](docs/architecture/ARCHITECTURE.md)
- [ADR-0001](docs/architecture/ADR-0001-foundation.md)
- [Content model](docs/content/CONTENT_MODEL.md)
- [Threat model](docs/security/THREAT_MODEL.md)
- [Roadmap](docs/roadmap/ROADMAP.md)
- [Contributor guide](CONTRIBUTING.md)
- [Agent instructions](AGENTS.md)

Develop on feature branches and merge through reviewed pull requests. Never execute user-submitted code in the web process. No secrets in repository history.

## License

All rights reserved until an explicit licensing decision is recorded.
