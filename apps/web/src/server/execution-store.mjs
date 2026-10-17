import { createHash, randomBytes } from "node:crypto";
import { database, transaction } from "./db.mjs";
import practice from "../data/practice.json" with { type: "json" };
const publicExercises = new Map(practice.map(exercise => [exercise.id,exercise.revision]));

export const MAX_SOURCE_BYTES = 8192;
const MAX_ACTIVE_PER_USER = 2;
const MAX_GLOBAL_ACTIVE = 32;
const FINISHED_STATUSES = new Set(["completed","runtime_error","timed_out","output_limit","infrastructure_error"]);
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const digest = value => createHash("sha256").update(value).digest("hex");
export const validExecutionId = value => typeof value === "string" && UUID.test(value);

export function executionLabEnabled() {
  if (process.env.RUNNER_LAB_ENABLED !== "1" || process.env.NODE_ENV === "production") return false;
  try {
    const origin = new URL(process.env.APP_ORIGIN || "");
    return origin.protocol === "http:" && ["localhost","127.0.0.1","[::1]"].includes(origin.hostname);
  } catch { return false; }
}
export function validSource(source) {
  return typeof source === "string" && source.trim().length > 0 &&
    Buffer.byteLength(source,"utf8") <= MAX_SOURCE_BYTES;
}
export function publicJob(row) {
  return {
    id: row.id,
    mode: row.mode,
    exerciseId: row.exercise_id ?? row.exerciseId ?? null,
    assessment: row.assessment ?? null,
    runtimeId: row.runtime_id ?? row.runtimeId,
    status: row.status,
    stdout: row.stdout,
    stderr: row.stderr,
    exitCode: row.exit_code ?? row.exitCode ?? null,
    durationMs: row.duration_ms ?? row.durationMs ?? null,
    createdAt: row.created_at ?? row.createdAt,
    completedAt: row.completed_at ?? row.completedAt ?? null
  };
}
async function expireStaleJobs(client) {
  await client.query(`UPDATE execution_jobs SET status='infrastructure_error', source_code='', stdout='',
    stderr='Execution worker lease expired.', lease_deadline=NULL, lease_token_hash=NULL,
    completed_at=now() WHERE status='running' AND lease_deadline < now()`);
  await client.query(`UPDATE execution_jobs SET status='infrastructure_error', source_code='', stdout='',
    stderr='Execution queue expired.', completed_at=now()
    WHERE status='queued' AND created_at < now()-interval '10 minutes'`);
}
export async function enqueueExecution(learnerId,{source,requestId,mode="run",exerciseId=null,exerciseRevision=null}) {
  if (!validSource(source) || !validExecutionId(requestId)) return {status:"invalid"};
  if (mode!=="run" && mode!=="assess")return {status:"invalid"};
  if (mode==="run" && (exerciseId!==null || exerciseRevision!==null))return {status:"invalid"};
  if (mode==="assess" && (publicExercises.get(exerciseId)!==exerciseRevision ||
      Buffer.byteLength(source,"utf8")>6000))return {status:"invalid"};
  return transaction(async client=>{
    // Serialize local lab quota checks, including requests from other API processes.
    await client.query("SELECT pg_advisory_xact_lock(574018)");
    await expireStaleJobs(client);
    const duplicate = await client.query(
      "SELECT * FROM execution_jobs WHERE learner_id=$1 AND request_id=$2",[learnerId,requestId]);
    if(duplicate.rowCount) return {status:"existing",job:publicJob(duplicate.rows[0])};
    const limits=await client.query(`SELECT
      (SELECT count(*)::int FROM execution_jobs WHERE learner_id=$1 AND status IN ('queued','running')) AS mine,
      (SELECT count(*)::int FROM execution_jobs WHERE status IN ('queued','running')) AS global,
      (SELECT count(*)::int FROM execution_jobs WHERE learner_id=$1 AND created_at>now()-interval '1 minute') AS recent`,
      [learnerId]);
    const {mine,global,recent}=limits.rows[0];
    if(mine>=MAX_ACTIVE_PER_USER || global>=MAX_GLOBAL_ACTIVE || recent>=6) return {status:"limited"};
    const inserted=await client.query(`INSERT INTO execution_jobs(learner_id,request_id,source_code,mode,exercise_id,exercise_revision)
      VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [learnerId,requestId,source,mode,exerciseId,exerciseRevision]);
    return {status:"queued",job:publicJob(inserted.rows[0])};
  });
}
export async function getExecution(learnerId,id) {
  if(!validExecutionId(id))return null;
  // Polls must also expire abandoned work when no worker is available to claim it.
  await database().query(`UPDATE execution_jobs SET
    status='infrastructure_error',source_code='',stdout='',
    stderr='Execution job expired before completion.',completed_at=now(),
    lease_deadline=NULL,lease_token_hash=NULL
    WHERE id=$1 AND learner_id=$2 AND
    ((status='queued' AND created_at<now()-interval '10 minutes')
      OR (status='running' AND lease_deadline<now()))`,[id,learnerId]);
  const result=await database().query("SELECT * FROM execution_jobs WHERE id=$1 AND learner_id=$2",
    [id,learnerId]);
  return result.rowCount?publicJob(result.rows[0]):null;
}
export async function claimExecution() {
  const token=randomBytes(32).toString("hex");
  return transaction(async client=>{
    await expireStaleJobs(client);
    const claimed=await client.query(`WITH next AS (
      SELECT id FROM execution_jobs WHERE status='queued'
      ORDER BY created_at,id LIMIT 1 FOR UPDATE SKIP LOCKED
    ) UPDATE execution_jobs j SET status='running',started_at=now(),
      lease_deadline=now()+interval '30 seconds', lease_token_hash=$1
      FROM next WHERE j.id=next.id
      RETURNING j.id,j.source_code AS source,j.runtime_id AS "runtimeId",
        j.mode,j.exercise_id AS "exerciseId",j.exercise_revision AS "exerciseRevision"`,[digest(token)]);
    return claimed.rowCount?{...claimed.rows[0],leaseToken:token}:null;
  });
}
export function validCompletion(input) {
  if(!input || typeof input!=="object" || Array.isArray(input) ||
     !validExecutionId(input.id) || !/^[a-f0-9]{64}$/.test(input.leaseToken??"") ||
     !FINISHED_STATUSES.has(input.status)) return false;
  if(typeof input.stdout!=="string" || typeof input.stderr!=="string" ||
     Buffer.byteLength(input.stdout,"utf8")>8192 || Buffer.byteLength(input.stderr,"utf8")>8192) return false;
  if(input.exitCode!==null && (!Number.isInteger(input.exitCode) || input.exitCode < -128 || input.exitCode>255)) return false;
  if(input.assessment!==undefined && input.assessment!==null) {
    const a=input.assessment;
    if(!a || typeof a!=="object" || Array.isArray(a) ||
       !["passed","failed"].includes(a.verdict) ||
       !Number.isInteger(a.passed) || !Number.isInteger(a.total) ||
       a.total<1 || a.total>10 || a.passed<0 || a.passed>a.total ||
       (a.verdict==="passed")!==(a.passed===a.total) ||
       !Array.isArray(a.publicCases) || a.publicCases.length>4 ||
       a.publicCases.some(c=>!c || typeof c.label!=="string" || c.label.length>64 || typeof c.passed!=="boolean") ||
       Buffer.byteLength(JSON.stringify(a),"utf8")>2048) return false;
  }
  return Number.isInteger(input.durationMs) && input.durationMs>=0 && input.durationMs<=10000;
}
export async function completeExecution(input) {
  if(!validCompletion(input))return false;
  const result=await database().query(`UPDATE execution_jobs SET
    status=$3,stdout=$4,stderr=$5,exit_code=$6,duration_ms=$7,assessment=$8,
    source_code='',lease_token_hash=NULL,lease_deadline=NULL,completed_at=now()
    WHERE id=$1 AND lease_token_hash=$2 AND status='running' AND lease_deadline>now()
    AND ((mode='run' AND $8::jsonb IS NULL) OR
         (mode='assess' AND
          (( $3='completed' AND $8::jsonb IS NOT NULL ) OR
           ( $3<>'completed' AND $8::jsonb IS NULL ))))
    RETURNING id`,
    [input.id,digest(input.leaseToken),input.status,input.stdout,input.stderr,input.exitCode,input.durationMs,
      input.assessment??null]);
  return result.rowCount===1;
}
