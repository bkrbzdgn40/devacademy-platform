-- M7.2 local lab multilang assessments; no public execution authorization.
BEGIN;
ALTER TABLE execution_jobs DROP CONSTRAINT execution_runtime_only_js;
ALTER TABLE execution_jobs ADD CONSTRAINT execution_runtime_by_mode CHECK (
   (mode='run' AND runtime_id='nodejs-24') OR
   (mode='assess' AND runtime_id IN ('nodejs-24','python-3.12','java-21'))
);
COMMENT ON COLUMN execution_jobs.runtime_id IS 'LAB-ONLY. Server selects runtime from published exercise ID; clients cannot supply this value.';
COMMIT;
