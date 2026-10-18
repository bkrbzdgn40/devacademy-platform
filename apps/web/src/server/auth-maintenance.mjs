import { database } from "./db.mjs";

// Operator-only auth retention. Dry-run by default; no learner data removal.
export async function cleanupAuthState({ apply=false, batchSize=200, client=database() }={}) {
  if(!Number.isInteger(batchSize) || batchSize<1 || batchSize>1000)
    throw new RangeError("batchSize must be between 1 and 1000");
  if(typeof apply!=="boolean")throw new TypeError("apply must be boolean");
  if(!apply) {
    const sessions=await client.query("SELECT count(*)::int AS count FROM learner_sessions WHERE expires_at<=now()");
    const limits=await client.query("SELECT count(*)::int AS count FROM auth_attempt_limits WHERE window_start<now()-interval '24 hours'");
    return {applied:false,expiredSessions:sessions.rows[0].count,staleLimits:limits.rows[0].count};
  }
  const sessions=await client.query(
    "WITH chosen AS (SELECT token_hash FROM learner_sessions WHERE expires_at<=now() ORDER BY expires_at,token_hash LIMIT $1 FOR UPDATE SKIP LOCKED) DELETE FROM learner_sessions s USING chosen WHERE s.token_hash=chosen.token_hash",
    [batchSize]
  );
  const limits=await client.query(
    "WITH chosen AS (SELECT key_hash FROM auth_attempt_limits WHERE window_start<now()-interval '24 hours' ORDER BY window_start,key_hash LIMIT $1 FOR UPDATE SKIP LOCKED) DELETE FROM auth_attempt_limits l USING chosen WHERE l.key_hash=chosen.key_hash",
    [batchSize]
  );
  return {applied:true,expiredSessions:sessions.rowCount,staleLimits:limits.rowCount};
}
