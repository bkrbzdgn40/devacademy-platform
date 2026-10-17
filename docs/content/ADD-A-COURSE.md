# Course Engine v1.1: review-gated course authoring

**Purpose:** Adding a programming-language course should require content review, not new Next.js routes, API code or database migrations. Use the CLI to prepare a **private draft**, validate all course/lesson/question relationships, then publish reviewed content into shared registries.

## Step 1: Generate an unpublished draft

Run from repository root (Node.js 24 required):

```powershell
node scripts/course-cli.mjs new python python-temelleri "Python Temelleri"
```

This creates two ignored working files in `content/course-drafts/python-temelleri/`:

- `public.json`: Language catalog metadata if the language is not already registered, course description, lesson outline, code example, questions and options. These become publicly visible once reviewed and published.
- `private.json`: Correct option IDs, detailed explanations, and two explicit editorial checkboxes. Never copy these answers to `src/data/questions.json`.

The draft directory is excluded by `.gitignore`. There is no accidental published course, no automatic AI-generated unverified curriculum, no runtime enabled, and no modification to existing students' progress.

## Step 2: Author and verify

Replace **every** `[[DRAFT]]` marker with technically correct and accessible content. Add as many lessons and quiz questions as needed while keeping stable unique IDs.

- Update the ordered `course.lessonIds` and each lesson's `questionIds`.
- Keep prerequisites in the same course and earlier than dependent lessons. Do not reuse another course's lesson IDs.
- Add every new question's answer/explanation to `private.json`. Verify each answer option against its question.
- Technically review code snippets and their correct outputs yourself or through a separate reviewer/test harness. **The CLI validates structure, not the semantics of arbitrary language examples.** Java examples included in the built-in starter course have additional Java 21 CI checks; new languages require their own reviewed fixture tests.
- Set `private.json` review flags to `true` **only after both content and examples are actually reviewed**.

## Step 3: Validate and publish

```powershell
node scripts/course-cli.mjs check python-temelleri
node scripts/course-cli.mjs publish python-temelleri --reviewed
corepack pnpm check
```

The `check` command is read-only. The `publish` command will refuse unfinished drafts, malformed keys, duplicates, prerequisites pointing into the future, missing/extra question answers, and attempts to enable execution. It computes and validates the entire updated catalog before writing **five JSON files**:

- `apps/web/src/data/catalog.json`
- `apps/web/src/data/courses.json`
- `apps/web/src/data/lessons.json`
- `apps/web/src/data/questions.json`
- `apps/web/src/server/answer-keys.json` (server-only private grading data)

Inspect the Git diff, review pedagogy, code correctness, accessibility and source licensing, then open **one PR** and require CI before merging. Publishing is a multi-file Git operation, **not** an atomic database transaction; use Git to review and recover changes if interrupted. The command does not push, create a PR, deploy, start a worker or grant execution rights.

## Result

- Course list: `/kurslar`
- Course: `/kurslar/<course-slug>`
- Lesson: `/kurslar/<course-slug>/<lesson-slug>`
- Common CodeMirror editor, knowledge checks and account-scoped progress without new route code.
- Java and JavaScript existing IDs/URLs are preserved.
- New languages default to **plain editing** with `runtimeId: null`, `run: false`, `codeAssessment: false`. Runtime and grading must undergo separate safety review; this CLI cannot enable them.
- This is a developer/operator content tool, **not a public-facing course editor or learner upload API**.

## Failure recovery

If validation fails, fix the draft and rerun check. If an interrupted write occurs, inspect `git diff` and revert only the affected generated files as appropriate; never indiscriminately discard other contributors' edits. If a course is already published, creating a draft under the same course slug or publishing a duplicate fails closed. This tool only adds courses; modifying a published curriculum or migrating its IDs needs a separate versioned review.
