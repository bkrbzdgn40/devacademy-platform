import {randomInt} from "node:crypto";
import {database,transaction} from "./db.mjs";
import {transferProblem,transferLessonIds,evaluateTransfer} from "./transfer-missions.mjs";

const DELAY_MS=24*60*60*1000, MAX_ATTEMPTS=8;
export const supportsTransfer=(lessonId)=>
  typeof lessonId==="string" && transferLessonIds.includes(lessonId);
const seed=()=>randomInt(1,2147483647);
function publicProblem(lessonId,row) {
  const {title,code,promptA,promptB}=transferProblem(lessonId,row.variant_seed);
  return {title,code,promptA,promptB,stage:row.stage,
    attemptsRemaining:Math.max(0,MAX_ATTEMPTS-row.attempt_count)};
}
async function rowsFor(client,learnerId,lessonId,lock=false) {
  const q=await client.query(
    "SELECT stage,variant_seed,attempt_count,passed_at,updated_at,last_confidence FROM learning_transfer_trials WHERE learner_id=$1 AND lesson_id=$2 ORDER BY stage"+(lock?" FOR UPDATE":""),
    [learnerId,lessonId]);
  return q.rows;
}
export function stateFor(lessonId,completedAt,rows,now=new Date()) {
  if(!completedAt)return {status:"locked"};
  const first=rows.find(r=>r.stage===0),second=rows.find(r=>r.stage===1);
  if(second?.passed_at)return {status:"retained",passedAt:second.passed_at};
  if(first?.passed_at&&!second) {
    const due=new Date(new Date(first.passed_at).getTime()+DELAY_MS);
    if(now<due)return {status:"waiting",dueAt:due.toISOString()};
    return {status:"ready",stage:1};
  }
  const active=second??first;
  if(!active)return {status:"ready",stage:0};
  if(active.attempt_count>=MAX_ATTEMPTS) {
    const due=new Date(new Date(active.updated_at).getTime()+DELAY_MS);
    if(now<due)return {status:"cooldown",dueAt:due.toISOString()};
    return {status:"ready",stage:active.stage,retry:true};
  }
  return {status:"active",problem:publicProblem(lessonId,active)};
}
export async function getTransferState(learnerId,lessonId) {
  if(!supportsTransfer(lessonId))return {status:"unsupported"};
  const client=database();
  const [completed,rows]=await Promise.all([
    client.query("SELECT completed_at FROM lesson_progress WHERE learner_id=$1 AND lesson_id=$2",
      [learnerId,lessonId]),
    rowsFor(client,learnerId,lessonId)
  ]);
  return stateFor(lessonId,completed.rows[0]?.completed_at,rows);
}
export async function startTransfer(learnerId,lessonId) {
  if(!supportsTransfer(lessonId))return {status:"unsupported"};
  return transaction(async client=>{
    // Lock the progress row to serialize all start/submit transitions per owner.
    const progress=await client.query(
      "SELECT completed_at FROM lesson_progress WHERE learner_id=$1 AND lesson_id=$2 FOR UPDATE",
      [learnerId,lessonId]);
    if(!progress.rows[0]?.completed_at)return {status:"locked"};
    const rows=await rowsFor(client,learnerId,lessonId,true);
    const status=stateFor(lessonId,progress.rows[0].completed_at,rows);
    if(status.status==="ready") {
      if(status.retry) {
        await client.query(
          "UPDATE learning_transfer_trials SET attempt_count=0,variant_seed=$4,updated_at=now() WHERE learner_id=$1 AND lesson_id=$2 AND stage=$3",
          [learnerId,lessonId,status.stage,seed()]);
      } else {
        await client.query(
          "INSERT INTO learning_transfer_trials(learner_id,lesson_id,stage,variant_seed) VALUES($1,$2,$3,$4) ON CONFLICT (learner_id,lesson_id,stage) DO NOTHING",
          [learnerId,lessonId,status.stage,seed()]);
      }
    }
    return stateFor(lessonId,progress.rows[0].completed_at,
      await rowsFor(client,learnerId,lessonId));
  });
}
export async function submitTransfer(learnerId,input) {
  if(!input||typeof input!=="object"||Array.isArray(input)||
     !supportsTransfer(input.lessonId)||typeof input.answerA!=="string"||
     typeof input.answerB!=="string"||input.answerA.length>24||input.answerB.length>24||
     !["low","medium","high"].includes(input.confidence)||![0,1].includes(input.stage))
    return {status:"invalid"};
  return transaction(async client=>{
    const progress=await client.query(
      "SELECT completed_at FROM lesson_progress WHERE learner_id=$1 AND lesson_id=$2 FOR UPDATE",
      [learnerId,input.lessonId]);
    if(!progress.rows[0]?.completed_at)return {status:"locked"};
    const rows=await rowsFor(client,learnerId,input.lessonId,true);
    const status=stateFor(input.lessonId,progress.rows[0].completed_at,rows);
    if(status.status!=="active"||status.problem.stage!==input.stage)return {status:"unavailable"};
    const item=rows.find(r=>r.stage===input.stage);
    const task=transferProblem(input.lessonId,item.variant_seed);
    const result=evaluateTransfer(task,input.answerA,input.answerB);
    if(!result)return {status:"invalid"};
    if(result.correct) {
      await client.query(
        "UPDATE learning_transfer_trials SET attempt_count=attempt_count+1,passed_at=now(),last_confidence=$4,updated_at=now() WHERE learner_id=$1 AND lesson_id=$2 AND stage=$3",
        [learnerId,input.lessonId,input.stage,input.confidence]);
    } else {
      await client.query(
        "UPDATE learning_transfer_trials SET attempt_count=attempt_count+1,variant_seed=$4,last_confidence=$5,updated_at=now() WHERE learner_id=$1 AND lesson_id=$2 AND stage=$3",
        [learnerId,input.lessonId,input.stage,seed(),input.confidence]);
    }
    return {status:"graded",correct:result.correct,
      expected:task.expected,explanation:task.explanation,
      confidence:input.confidence,stage:input.stage};
  });
}
