# Roadmap and release gates

**Version:** 0.1 · **Date:** 2026-10-17  
This is a dependency-driven plan, not a promise of dates.

## M0 — Product and architecture baseline

**Deliver:** PRD, ADR, architecture, content model, security baseline, contributor/agent rules and initial backlog.

**Gate:** Documents agree on scope; no claims that planned services exist; every consequential choice is traceable. No deployment.

## M1 — Minimal technical foundation

**Deliver:** pnpm/Turborepo workspace, Next.js app, TS strict settings, format/lint/typecheck/unit-test scaffolding, accessible shell, basic route, database setup/migrations and CI checks.

**Gate:** Fresh checkout installs deterministically with pinned versions; checks pass; environment example uses fake values; no secret leakage; smoke page renders. No execution support claimed.

## M2 — One complete learning loop

**Deliver:** 1 language (select Python or JavaScript based on sandbox proof), >= 3 reviewed concepts, >= 4 meaningful exercises, edit/submit/result UI, sign-in and resume, data model for lessons/attempts.

**Gate:** User can discover -> learn -> attempt -> receive accurate feedback -> resume. Deterministic tests and basic accessibility verification. Runner security gate passes before remote executable exercises; otherwise use safe deterministic non-execution exercises first.

## M3 — Safe execution and evaluation

**Deliver:** Isolated runner integration, queue, quotas, per-language health, stdout/stderr/status contract, evaluator with private tests, abuse test fixtures, telemetry and rollback plan.

**Gate:** Every control in security threat model verified with evidence. Failure paths test cleanly. Security sign-off before enabling user-submitted remote execution.

## M4 — Content graph and curriculum scale

**Deliver:** language/concept/technology discovery, search, canonical links, prerequisites, four paths, content review workflow, Turkish curriculum and localization capabilities.

**Gate:** Reviewed learning objectives, accurate snippets, tested graph integrity (no prerequisite cycles), missing locale states clear.

## M5 — Industry radar

**Deliver:** trusted source ingestion, dedupe, publish/fetch dates, editorial queue, attribution, links to lessons, staleness handling and correction pathway.

**Gate:** Each item has real canonical origin and grounded summary; feed never treats fetched text as agent instructions.

## M6 — Private beta quality pass

**Deliver:** pilot feedback, reliability/accessibility/privacy/security reviews and operating playbook.

**MVP goals:** 5 verified language runtimes (Python, JS, TS, Java, SQL), 4 paths, >=30 tested interactive exercises, >=100 reviewed concept cards, working progress and curated source-backed feed. Do not declare the milestone complete solely because a UI demo exists.

**Gate:** Verified runtime matrix, all essential learning user stories working end-to-end, critical defects closed, privacy controls documented and operator can recover from outage.

## M7 — Expansion hypotheses

COW/MOO/esoteric coverage (possibly educational interpreters), more languages and stacks, spaced repetition, project labs, AI guidance and communities. Each expansion requires learning value and cost assessment.

## Immediate backlog (after M0 review)

1. Initialize monorepo with deterministic checks and no production services.
2. Establish shared catalog/content schema, validators and sample polymorphism content.
3. Deliver basic responsive accessible lesson shell and exercise UI with **non-executing** checks.
4. Create runner proof-of-isolation spike before enabling code execution.
5. Add persistence and learner progress slice, then grow languages and sources.

## Definition of done

- User-facing acceptance criteria demonstrated.
- Code, security and content reviewed as appropriate.
- Tests for changed behavior and relevant regressions pass.
- Docs and metadata updated.
- No open severity-1/critical finding; limitations explicit.
- Small focused PR with preferably one coherent commit; avoid merging unverified changes.
