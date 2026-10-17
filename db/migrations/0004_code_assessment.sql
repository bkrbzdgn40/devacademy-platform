-- M4: add lab-only assessment mode and summary. Hidden cases/expected outputs stay off web+DB.
BEGIN;
ALTER TABLE execution_jobs
  ADD COLUMN mode varchar(12) NOT NULL DEFAULT 'run',
  ADD COLUMN exercise_id varchar(128),
  ADD COLUMN exercise_revision integer,
  ADD COLUMN assessment jsonb;
ALTER TABLE execution_jobs ADD CONSTRAINT execution_mode_valid CHECK (mode IN ('run','assess'));
ALTER TABLE execution_jobs ADD CONSTRAINT execution_assessment_binding CHECK (
  (mode='run' AND exercise_id IS NULL AND exercise_revision IS NULL AND assessment IS NULL)
  OR (mode='assess' AND exercise_id IS NOT NULL AND exercise_revision>=1 AND
      octet_length(source_code)<=6000 AND
      (assessment IS NULL OR
        (jsonb_typeof(assessment)='object' AND octet_length(assessment::text)<=2048)))
);
CREATE INDEX execution_jobs_exercise ON execution_jobs(learner_id,exercise_id,created_at DESC)
  WHERE mode='assess';
COMMENT ON COLUMN execution_jobs.assessment IS 'Worker-scored public summary only; never expected outputs of hidden cases.';
COMMIT;
