-- DevAcademy schema baseline for authenticated learning records.
-- Migration 0001: DDL only, not connected to the running web application.
-- PostgreSQL 16+, no user-created code or secrets stored.

BEGIN;

CREATE TABLE learner_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT learner_account_timestamps CHECK (updated_at >= created_at)
);

CREATE TABLE learning_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id uuid NOT NULL REFERENCES learner_accounts(id) ON DELETE CASCADE,
  lesson_id varchar(128) NOT NULL,
  exercise_id varchar(128) NOT NULL,
  exercise_revision integer NOT NULL,
  selected_option_id varchar(32) NOT NULL,
  is_correct boolean NOT NULL,
  evaluator_version integer NOT NULL DEFAULT 1,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT learning_attempt_lesson_id_valid CHECK (length(btrim(lesson_id)) > 0),
  CONSTRAINT learning_attempt_exercise_id_valid CHECK (length(btrim(exercise_id)) > 0),
  CONSTRAINT learning_attempt_option_id_valid CHECK (length(btrim(selected_option_id)) > 0),
  CONSTRAINT learning_attempt_revision_positive CHECK (exercise_revision >= 1),
  CONSTRAINT learning_attempt_evaluator_positive CHECK (evaluator_version >= 1)
);

CREATE INDEX learning_attempts_learner_recent_idx
  ON learning_attempts (learner_id, attempted_at DESC);
CREATE INDEX learning_attempts_exercise_lookup_idx
  ON learning_attempts (exercise_id, exercise_revision);

CREATE TABLE lesson_progress (
  learner_id uuid NOT NULL REFERENCES learner_accounts(id) ON DELETE CASCADE,
  lesson_id varchar(128) NOT NULL,
  last_viewed_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  PRIMARY KEY (learner_id, lesson_id),
  CONSTRAINT lesson_progress_id_valid CHECK (length(btrim(lesson_id)) > 0)
);

CREATE INDEX lesson_progress_learner_recent_idx
  ON lesson_progress (learner_id, last_viewed_at DESC);

COMMENT ON TABLE learner_accounts IS 'Opaque learner IDs; authentication provider records are not implemented here.';
COMMENT ON TABLE learning_attempts IS 'Minimal answer attempts: never persist raw untrusted source or session tokens here.';
COMMENT ON TABLE lesson_progress IS 'Per-learner lesson state; access must be ownership-scoped in the future authenticated API.';

COMMIT;
