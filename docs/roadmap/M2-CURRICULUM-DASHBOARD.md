# Curriculum and visual progress dashboard

**Scope:** Seven beginner JavaScript lessons (from three), fourteen server-graded output-prediction questions (from six), and a read-only progress dashboard for authenticated learners.

## Lessons added
- Function declarations, arrow functions and return values
- Lexical block scope and name shadowing
- Array.filter and Array.reduce
- Promise microtask scheduling

Each lesson preserves stable content IDs, links to its prerequisite and has two independently graded questions. Existing attempts remain valid, and no database migration is required.

## Progress semantics
The dashboard is a **view over the existing owner-scoped `GET /api/progress` response**, not a parallel progress store.
- Completion percentage = completed lesson IDs / total published lessons.
- Started lessons = unique IDs with saved progress rows.
- Recent attempt accuracy = correct attempts among the most recent **at most 50** submitted answers. It is not an all-time score.
- The dashboard does not reveal another learner's data or persist anything in the browser.
- Users without a database or signed-in account see the appropriate configuration or login state.

The native HTML `progress` element carries an accessible label; visual color is not the only state indicator. No browser manual accessibility certification is claimed.

## Verification
Unit tests verify IDs, prerequisites and public/private answer separation, and evaluate trusted teaching snippets. Progress calculation has edge-case tests. Production Next.js build, grading HTTP smoke, and multi-user PostgreSQL integration CI remain mandatory.
