-- Usernames, password verifiers and opaque server-side sessions.
-- Migrates the baseline UUID-only learners into an opt-in account system.
BEGIN;
CREATE TABLE learner_credentials (
  learner_id uuid PRIMARY KEY REFERENCES learner_accounts(id) ON DELETE CASCADE,
  username varchar(24) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT username_format CHECK (username ~ '^[a-z][a-z0-9_]{2,23}$'),
  CONSTRAINT password_hash_format CHECK (password_hash LIKE 'scrypt$%')
);
CREATE TABLE learner_sessions (
  token_hash char(64) PRIMARY KEY,
  learner_id uuid NOT NULL REFERENCES learner_accounts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  CONSTRAINT token_hash_format CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT session_expiry_order CHECK (expires_at > created_at)
);
CREATE INDEX learner_sessions_learner_idx ON learner_sessions (learner_id);
CREATE INDEX learner_sessions_expiry_idx ON learner_sessions (expires_at);
-- Throttle password verification even across concurrent processes.
CREATE TABLE auth_attempt_limits (
  key_hash char(64) PRIMARY KEY,
  attempt_count integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT limit_key_format CHECK (key_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT limit_count_nonnegative CHECK (attempt_count >= 0)
);
COMMENT ON TABLE learner_credentials IS 'Store only salted slow password hashes, never plaintext passwords.';
COMMENT ON TABLE learner_sessions IS 'Store only SHA-256 digests of cryptographically random bearer tokens.';
COMMENT ON TABLE auth_attempt_limits IS 'Login throttle by hashed normalized username; no IP or raw identifiers.';
COMMIT;
