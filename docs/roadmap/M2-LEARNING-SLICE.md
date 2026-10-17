# M2 learning slice: JavaScript fundamentals (pilot)

**Status:** Implementation PR in progress; not the complete M2 milestone.

## What this slice delivers

- Three Turkish beginner lessons: `let/const`, `==/===`, `Array.map`.
- Six independently submitted multiple-choice output-prediction exercises.
- A dedicated `/dersler` index and `/dersler/[slug]` instructional pages.
- A bounded JSON `POST /api/assess` endpoint returning deterministic verdict, explanatory feedback and correct option after submission.
- Private assessment keys in `apps/web/src/server/grade.ts` rather than the public question catalog.
- Data contract and feedback tests, with a production server HTTP smoke test.

## Deliberately absent

- The JavaScript code displayed on lesson cards is **not executed**. Node.js `vm` appears only in CI tests against trusted, version-controlled static snippets; it is **not** a security sandbox or a student runner.
- Quiz submissions are not persisted. Accounts and progress tracking remain planned.
- Anonymous API has no distributed rate limiting yet. It must not be publicly deployed as a hardened production assessment service before abuse controls are introduced.
- Answers are returned to a submitting user. This is appropriate for learning multiple-choice questions; future hidden code tests stay separate and server-only.

## Manual acceptance checklist

1. Start app locally with documented pnpm commands.
2. Keyboard-navigate `/dersler` and each of the three lessons.
3. Tab through radio inputs; submit a wrong answer and observe explanatory feedback.
4. Change the answer and resubmit; observe success.
5. Try direct unknown lesson routes; expect 404.
6. Confirm mobile wrapping and reduced-motion settings.
7. Verify no user progress is implied or stored in UI.

Automated CI covers server rendering and grading. Visual and assistive-technology checks still require manual verification; do not claim WCAG conformance from markup alone.

## Next delivery after this slice

Build the PostgreSQL/Drizzle schema and migrations for stable content IDs, versioned attempts, user identities and owner-scoped progress. Add API integration tests with a disposable database. Do not expose real users' data until authorization, retention and deletion/export flows have been reviewed.
