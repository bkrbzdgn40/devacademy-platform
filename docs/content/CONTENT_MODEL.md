# Content and knowledge graph contract — draft v0.1

**Status:** Design proposal; schemas and validators are not implemented.

## 1. Content categories

- `language`: programming/query languages with paradigm, origin, ecosystem and explicit runtime capabilities.
- `concept`: language-neutral technical idea, e.g. `oop.polymorphism`.
- `technology`: framework, tool, platform, database, protocol, markup or style technology.
- `lesson`: a localized instructional unit about one or more nodes.
- `exercise`: graded challenge with evaluator ID and version.
- `learning_path`: ordered or prerequisite-aware collection of lessons.
- `news_item`: attributable source summary related to language/concept/technology nodes.

Do **not** label HTML or CSS as general-purpose programming languages. Distinguish `COW` (esoteric language) and `MOO` (object-oriented MUD language) using stable IDs and disambiguating descriptions. Rare languages may be documented without executable support.

## 2. Identity and relationships

Every node needs a stable ID (never localized), a unique slug per catalog namespace, localized title/summary, category, difficulty, tags, status, owner/reviewer and last-reviewed timestamp. Relations include:

- `prerequisite_of` — directed, acyclic prerequisite graph for learning paths
- `related_to` — contextual, not necessarily acyclic
- `implemented_in` — concept -> language/technology with exact demonstrative lesson
- `part_of_stack` — technology -> reviewed stack relationship
- `explained_by` — catalog node -> lesson

A missing translation is represented explicitly as absent; do not automatically show untranslated text as if translated.

## 3. Example (illustrative, not yet a schema)

```yaml
id: concept.oop.polymorphism
kind: concept
slug: oop/polymorphism
difficulty: intermediate
tags: [oop, runtime-dispatch]
prerequisites:
  - concept.oop.inheritance
locales:
  tr:
    title: Çok biçimlilik
    summary: Aynı arayüzün farklı türlerde farklı davranışlar üretmesi.
  en:
    title: Polymorphism
    summary: The same interface may exhibit different behavior across types.
relatedLessonIds:
  - lesson.java.polymorphism.basics
review:
  status: draft
  lastReviewedAt: null
```

Publish only after reviewer, code-example test and accessibility checks.

## 4. Lesson structure

A lesson should contain:
1. Objective in observable terms.
2. Prerequisites with clickable references.
3. Plain-language concept explanation.
4. Minimal accurate and runnable code examples where supported.
5. Common misconception / counterexample.
6. Prediction or knowledge check with explained answer.
7. Practice exercise with progressively revealed hints.
8. Summary, references and next related concept.

Content and snippets are versioned. If a snippet uses code execution, specify `runtimeId`, version/image digest, expected output and tested status. Syntax highlighted code is **not automatically runnable**.

## 5. Exercise and evaluator model

Exercise metadata: `exerciseId`, immutable `revision`, `lessonId`, `languageId`, `runtimeId`, `evaluationMode`, starter source, public examples, constraints, hints, difficulty and estimated effort.

Grading modes include `multiple_choice`, `output_prediction`, `code_completion`, `bug_fix` and `unit_tests`. Private tests and scoring policy live server-side, outside downloadable content. Do not claim perfect automated evaluation of design-heavy tasks.

Attempt metadata: submission ID, exercise ID/revision, learner ID if logged in, bounded results, scoring version and timestamp. Separate first-try success from eventual completion for useful learning analytics.

## 6. Runtime capability matrix

A language can independently support:

| Capability | Meaning |
| --- | --- |
| `catalog` | Information page is available |
| `lessons` | Reviewed educational lessons exist |
| `editor` | Syntax-aware editing exists |
| `preview` | Local or other untrusted preview is available |
| `run` | Isolated execution path is deployed and verified |
| `grade` | Server-side evaluator is deployed and verified |

Never derive `run=true` merely from a known Judge0 language ID. Health checks, security gates, version pinning and production configuration must also pass.

## 7. Editorial process

Authors propose -> technical reviewer verifies correctness -> snippets/tests are run -> language/localization review -> accessibility review -> publish -> periodic re-review. Each page exposes date/revision and report-an-error route. Source licenses and attribution must be respected.

Initial public language catalog can be broad; fully reviewed interactive exercises must be grown carefully.
