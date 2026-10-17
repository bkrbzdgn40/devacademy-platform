# DevAcademy

**Interactive software learning, practice, assessment and industry awareness.**

> Status: **Foundation / design baseline**. There is no working application, deployed site, code execution service or published curriculum yet.

DevAcademy connects **programming languages**, **software engineering concepts**, and **technology stacks** to interactive lessons, code exercises, skill checks, learning paths, and source-attributed technology updates. The initial audience is Turkish-speaking learners, with an architecture that supports English and additional locales.

## Principles

1. **Learning outcomes over content volume.** Learners must demonstrate skills, not merely read pages.
2. **One knowledge graph, multiple learning surfaces.** A concept can be taught across several languages and stacks.
3. **Capability honesty.** Catalog availability is not the same as executable runtime support.
4. **Safe-by-design execution.** Untrusted learner code never runs in the web app or database process.
5. **Traceable industry updates.** News has sources, publication dates and links to relevant learning material.
6. **Accessible and measurable.** Keyboard-first practice, progress and meaningful assessment.

## Plan

- [Product requirements](docs/requirements/PRD.md)
- [System architecture](docs/architecture/ARCHITECTURE.md)
- [Architecture decision record](docs/architecture/ADR-0001-foundation.md)
- [Content and knowledge graph model](docs/content/CONTENT_MODEL.md)
- [Threat model](docs/security/THREAT_MODEL.md)
- [Milestone roadmap](docs/roadmap/ROADMAP.md)
- [Contributor workflow](CONTRIBUTING.md)
- [Automation and agent rules](AGENTS.md)

## Proposed monorepo (not scaffolded yet)

```text
apps/web/                 # Next.js website and APIs
apps/worker/              # news, analytics and other queued jobs
services/code-runner/     # separately isolated untrusted code execution
packages/ui/              # accessible design system
packages/database/        # schemas and migrations
packages/learning-engine/ # evaluation domain logic
packages/shared/          # shared types and validation
content/                  # version-controlled lessons and exercises
docs/                     # project decisions and quality standards
```

Technical choices are recorded in ADR-0001. Package versions will be pinned and verified only when implementation starts.

## Initial target

The **MVP target** is five runnable language experiences (Python, JavaScript, TypeScript, Java and SQL), four curated paths, at least 30 reviewed interactive exercises, at least 100 accurate concept cards, accounts with saved progress, and a small verified technology feed. These are **targets**, not implemented features. The first development slice will be significantly smaller to validate the architecture and learning experience before scale.

## Development

Use a dedicated feature branch and a pull request. Prefer one coherent commit per PR. Never commit credentials; never force-push or bypass safeguards. Follow [AGENTS.md](AGENTS.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## License

**No open-source license has been granted.** The repository is private. Licensing must be explicitly decided before any public release or third-party content redistribution.
