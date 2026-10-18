-- M8.2: add observable error pattern and current diagnostic-probe state.
-- Existing M8.1 trials retain their previously issued standard tasks.
BEGIN;
ALTER TABLE learning_transfer_trials
  ADD COLUMN probe_focus varchar(8) NOT NULL DEFAULT 'standard'
    CHECK(probe_focus IN ('standard','a','b')),
  ADD COLUMN last_error_pattern varchar(8)
    CHECK(last_error_pattern IN ('a','b','both')),
  ADD COLUMN challenge_token uuid NOT NULL DEFAULT gen_random_uuid();
COMMENT ON COLUMN learning_transfer_trials.probe_focus IS
  'standard: independent evidence; a/b: coached diagnostic probe, never independently credited.';
COMMENT ON COLUMN learning_transfer_trials.last_error_pattern IS
  'Observed incorrect outputs, not a psychological diagnosis; no raw answers saved.';
COMMIT;
