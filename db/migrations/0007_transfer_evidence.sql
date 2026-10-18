-- M8.1: owner-scoped counterfactual evidence. No old lesson records changed.
BEGIN;
CREATE TABLE learning_transfer_trials (
  learner_id uuid NOT NULL REFERENCES learner_accounts(id) ON DELETE CASCADE,
  lesson_id varchar(128) NOT NULL CHECK (length(btrim(lesson_id)) > 0),
  stage smallint NOT NULL CHECK (stage IN (0,1)),
  variant_seed integer NOT NULL CHECK (variant_seed BETWEEN 1 AND 2147483646),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count BETWEEN 0 AND 8),
  passed_at timestamptz,
  last_confidence varchar(8) CHECK (last_confidence IN ('low','medium','high')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (learner_id,lesson_id,stage)
);
CREATE INDEX learning_transfer_owner_passed_idx ON learning_transfer_trials(learner_id,stage,passed_at);
COMMENT ON TABLE learning_transfer_trials IS 'Minimal counterfactual evidence: no raw answers or source, cascading deletion.';
COMMIT;
