-- M7: durable, per-owner review scheduling. Only public question IDs are stored.
BEGIN;
CREATE TABLE learning_review_schedule (
  learner_id uuid NOT NULL REFERENCES learner_accounts(id) ON DELETE CASCADE,
  exercise_id varchar(128) NOT NULL,
  lesson_id varchar(128) NOT NULL,
  stage integer NOT NULL DEFAULT 0 CHECK(stage BETWEEN 0 AND 5),
  lapses integer NOT NULL DEFAULT 0 CHECK(lapses >= 0),
  attempts integer NOT NULL DEFAULT 0 CHECK(attempts >= 0),
  due_at timestamptz NOT NULL,
  last_answer_correct boolean NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(learner_id,exercise_id),
  CONSTRAINT learning_review_exercise_nonempty CHECK(length(btrim(exercise_id))>0),
  CONSTRAINT learning_review_lesson_nonempty CHECK(length(btrim(lesson_id))>0)
);
CREATE INDEX learning_review_due_by_owner ON learning_review_schedule(learner_id,due_at,exercise_id);
COMMENT ON TABLE learning_review_schedule IS 'Owner-scoped deterministic retrieval schedule; delete cascades with learner. Does not store source or private correct options.';
COMMIT;
