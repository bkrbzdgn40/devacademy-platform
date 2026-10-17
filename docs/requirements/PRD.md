# DevAcademy — Product requirements (PRD)

**Version:** 0.1 · **Date:** 2026-10-17 · **Status:** Initial approved design baseline; implementation pending

## 1. Problem and product promise

Learning developers jump between tutorials, playgrounds, quiz sites, framework docs, and unreliable trend posts. DevAcademy combines discoverable knowledge, instruction, practice, feedback, progress, and source-backed industry context.

**Promise:** After a lesson, the learner should be able to explain the concept, predict behavior, implement it independently and receive objective feedback.

## 2. Audiences and jobs to be done

| Audience | Need | Success behavior |
| --- | --- | --- |
| Beginner | Understand fundamentals with a coherent path | Completes a small task without copying a solution |
| University student | Practice OOP, algorithms, data structures and SQL | Diagnoses errors and passes tests |
| Working developer | Compare how concepts map across languages and stacks | Applies a known idea in a new ecosystem |
| Curious explorer | Discover languages, including esoteric ones | Understands syntax, history and runtime availability |

Initial teaching language: **Turkish**. The model supports English content without silently claiming untranslated lessons are localized. Content must not assume the user already knows English.

## 3. Information architecture

Three distinct, cross-linked catalogs:

1. **Languages:** Python, Java, JS, TS and many additional mainstream or esoteric languages. HTML and CSS are classified as markup/style technologies, not falsely described as programming languages; SQL as a query language.
2. **Concepts:** syntax fundamentals, OOP (inheritance, encapsulation, polymorphism, abstraction), SOLID, composition, algorithms, data structures, error handling, concurrency, APIs, testing, security, architecture.
3. **Stacks and tools:** frontend, backend, mobile, infrastructure, databases, CI/CD, cloud and developer tooling.

Catalog support, instructional examples, in-browser editing, remote execution and automatic assessment are **separate capability flags**. A catalog page must never present a non-existent runner as available.

## 4. Priority scope

### P0 — MVP release target

- Search and browse languages, concepts and stacks with tags, prerequisites, related content and difficulty.
- Structured lesson pages: outcome, explanation, minimal example, misconceptions, interactive check, references.
- Code editor with clearly labeled language, run availability, output/errors and execution limits.
- Assessments: output prediction, multiple choice, code completion, repair and tests with server-side hidden criteria.
- Four curated learning paths: programming fundamentals, OOP, web basics, SQL/data basics.
- Accounts, attempts and progress; ability to resume; privacy-friendly optional anonymous browsing.
- Source-attributed industry feed: title, canonical source URL, original publication date, date checked, why it matters, relevant lesson.
- Responsive layouts and accessibility target of WCAG 2.2 AA; keyboard controls, readable contrast, non-color-only feedback.
- Turkish UI and initial lessons. Locale keys and content identity work across translations.

**MVP content goals:** >= 100 reviewed concept cards, >= 30 interactive exercises, 5 verified executable language experiences: Python, JavaScript, TypeScript, Java, SQL. A release gate checks actual verified runtimes rather than claiming coverage based on a catalog entry.

### P1 — After MVP

- Spaced repetition based on demonstrated weaknesses.
- Verified project labs, debugging exercises and advanced learning paths.
- Multiple language comparisons on the same concept.
- Personalized recommendations, stronger search and editorial moderation.
- Broader runtime support and experimental languages such as **COW** and **MOO** with appropriate categorization.

### P2 — Future hypothesis, not a commitment

- AI mentor, code review and personalized tutoring.
- Peer collaboration, competitions, community discussions and portfolios.
- Advanced engineering simulations.

## 5. Critical end-to-end user stories

**US-01: Discover** — As a learner, I can search for 'polymorphism', see concept and Java lesson results separately, and open a lesson without logging in.

**US-02: Learn and predict** — I can read a concise Java polymorphism explanation, predict an output, submit once, and receive an explanation addressing my answer.

**US-03: Run** — For a supported language, I can edit an example, submit it for execution, receive stdout/stderr and explicit success/error/timeout status. For unsupported languages the run control is disabled with a helpful explanation.

**US-04: Validate** — I can attempt an exercise; public test results tell me what passed; private evaluator details and expected answers are not sent to the browser before submission.

**US-05: Resume** — When signed in, I can revisit a path and see server-persisted completion and recent attempts.

**US-06: Stay current** — I can open a technology item and see the original source, when it was published, when it was verified and what I can learn next.

## 6. Acceptance and measurable outcomes

| Dimension | MVP acceptance / provisional goal |
| --- | --- |
| Understanding | Pilot users can solve a novel exercise after a lesson; baseline and target measured before launch |
| Runner safety | No production learner execution until isolation, abuse cases and resource limits pass security review |
| Assessment integrity | Hidden tests are not available in public client bundles or unauthenticated read APIs |
| Reliability | Deterministic scoring for deterministic tasks; failures surfaced, not mislabeled success |
| Content quality | Technical review, tested snippets and maintained references for released lessons |
| News integrity | Every item links to a real source and shows publication date; no fabricated or unlabeled AI claims |
| Accessibility | Keyboard-only task flow works; WCAG 2.2 AA audit before public MVP |
| Observability | Request, worker and runner events traceable without logging private code by default |

Latency/SLO budgets will be baselined with actual infrastructure and pilot data; no invented performance guarantees.

## 7. Important non-goals

- Compiling every language on day one.
- Shipping a production IDE or arbitrary internet-connected compute environment.
- Unreviewed AI-generated curricula.
- Scraping and republishing entire articles from other publishers.
- Social feed, certificates, leaderboards or paid subscriptions in the first vertical slice.

## 8. Constraints and risks

- Running untrusted programs requires strong process/VM/container isolation; framework-level validation alone is not sufficient.
- Java and SQL entail different evaluation mechanics from browser-based JS/Python; each runtime needs an explicit threat review.
- Translation, license rights, source freshness and content correction are first-class editorial concerns.
- Avoid designing a general-purpose microservice mesh before validated product behavior.
- Young or underage learner support and age-related compliance require deliberate policy before public launch.

## 9. Delivery sequence

The authoritative sequence, verification gates and definition of done are in [ROADMAP](../roadmap/ROADMAP.md). Scope changes must update this PRD and, for architectural changes, create a new ADR.
