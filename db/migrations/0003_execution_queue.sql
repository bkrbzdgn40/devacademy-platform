-- M3 lab-only execution queue. Untrusted source is volatile and erased at terminal state.
-- Web process owns queue DB; an external worker communicates only through authenticated internal HTTP.
BEGIN;
CREATE TABLE execution_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id uuid NOT NULL REFERENCES learner_accounts(id) ON DELETE CASCADE,
  request_id uuid NOT NULL,
  runtime_id varchar(32) NOT NULL DEFAULT 'nodejs-24',
  source_code text NOT NULL,
  status varchar(32) NOT NULL DEFAULT 'queued',
  stdout text NOT NULL DEFAULT '',
  stderr text NOT NULL DEFAULT '',
  exit_code integer,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  lease_deadline timestamptz,
  lease_token_hash char(64),
  CONSTRAINT execution_runtime_only_js CHECK (runtime_id = 'nodejs-24'),
  CONSTRAINT execution_source_limit CHECK (octet_length(source_code) <= 8192),
  CONSTRAINT execution_state_valid CHECK (status IN ('queued','running','completed','runtime_error','timed_out','output_limit','infrastructure_error')),
  CONSTRAINT execution_output_bounds CHECK (octet_length(stdout) <= 8192 AND octet_length(stderr) <= 8192),
  CONSTRAINT execution_duration_bounds CHECK (duration_ms IS NULL OR duration_ms BETWEEN 0 AND 10000),
  CONSTRAINT execution_lease_state CHECK (
    (status='running' AND started_at IS NOT NULL AND lease_deadline IS NOT NULL AND lease_token_hash IS NOT NULL)
    OR (status<>'running' AND lease_deadline IS NULL AND lease_token_hash IS NULL)
  ),
  CONSTRAINT execution_finished_state CHECK ((status IN ('queued','running') AND completed_at IS NULL) OR (status NOT IN ('queued','running') AND completed_at IS NOT NULL)),
  CONSTRAINT execution_idempotency UNIQUE (learner_id,request_id)
);
CREATE INDEX execution_jobs_learner_recent ON execution_jobs(learner_id,created_at DESC);
CREATE INDEX execution_jobs_dispatch ON execution_jobs(created_at,id) WHERE status='queued';
CREATE INDEX execution_jobs_deadlines ON execution_jobs(lease_deadline) WHERE status='running';
CREATE INDEX execution_jobs_expiry ON execution_jobs(completed_at) WHERE completed_at IS NOT NULL;
COMMENT ON TABLE execution_jobs IS 'LAB ONLY. Temporary untrusted source accessible to trusted API/queue, erased on terminal state. No sandbox holds database credentials.';
COMMIT;
