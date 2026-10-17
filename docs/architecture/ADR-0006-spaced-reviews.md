# ADR-0006: M7 account-scoped spaced repetition

**Status:** Implemented for signed-in learners; no AI-driven mastery claims.

- Every graded knowledge-question attempt updates `learning_attempts` and an owner-scoped `learning_review_schedule` entry within the same PostgreSQL transaction.
- Incorrect responses reset retrieval stage and schedule the question 10 minutes later. Correct responses set 1, 3, 7, 14, then 30-day intervals; a correct answer submitted before due does **not** accelerate the interval.
- `/api/progress` reads at most 12 due cards sorted by due date, and a compact per-owner aggregate. `/tekrar` shows an accessible practice session, using the **public** question catalog and the existing server-side grader; the browser never receives private correct options except via existing graded responses.
- No localStorage/source code is persisted for this feature; account deletion cascades to the new table. Only enrolled/attempted questions are scheduled, never fictitious unanswered mastery.
- A 10-minute correction delay prevents a wrong response from staying immediately due. The UI refreshes from the server after an answer; multi-tab sessions synchronize on the next refresh.
- This is *simple deterministic recall scheduling*, not validated cognitive diagnosis. The "due" counter counts questions, not proof of topic mastery. Earlier correct attempts are used for simple intervals only; no algorithmic engagement pressure.
- Migration `0005_spaced_reviews.sql` must be applied to local PostgreSQL **before** the server starts writing new attempts. It is additive and uses `ON DELETE CASCADE`, no existing attempt records are overwritten. Legacy attempts are not automatically backfilled; new attempts enroll a question.
- Before production rollout, take a tested database backup and review migration/deployment order. No deployment is part of this PR.
