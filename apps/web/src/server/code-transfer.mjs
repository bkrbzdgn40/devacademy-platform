// Evidence derives exclusively from trusted local-runner assessment records.
import {database} from "./db.mjs";
import {executionLabEnabled} from "./execution-store.mjs";
import practice from "../data/practice.json" with {type:"json"};

const byLesson=new Map(practice.filter(x=>typeof x.transferLessonId==="string")
  .map(x=>[x.transferLessonId,x]));
export const codeTransferLessons=Object.freeze([...byLesson.keys()]);
export const supportsCodeTransfer=(lessonId)=>typeof lessonId==="string"&&byLesson.has(lessonId);
export function publicCodeTransferTask(lessonId) {
  const task=byLesson.get(lessonId);
  if(!task)return null;
  return {id:task.id,revision:task.revision,language:task.language,title:task.title,
    functionName:task.functionName,starterCode:task.starterCode,
    description:task.description,publicCases:task.publicCases};
}
export async function getCodeTransferState(learnerId,lessonId) {
  const task=byLesson.get(lessonId);
  if(!task)return {status:"unsupported"};
  const client=database();
  const first=await client.query(
    "SELECT passed_at FROM learning_transfer_trials WHERE learner_id=$1 AND lesson_id=$2 AND stage=0",
    [learnerId,lessonId]);
  if(!first.rows[0]?.passed_at)return {status:"locked",labEnabled:executionLabEnabled()};
  const result=await client.query(
    "SELECT j.id AS \"jobId\",j.completed_at AS \"completedAt\""+
    " FROM execution_jobs j INNER JOIN learning_transfer_trials t"+
    " ON t.learner_id=j.learner_id AND t.lesson_id=$2 AND t.stage=0"+
    " WHERE j.learner_id=$1 AND j.mode='assess' AND j.exercise_id=$3"+
    " AND j.exercise_revision=$4 AND j.created_at>=t.passed_at"+
    " AND j.status='completed' AND j.source_code=''"+
    " AND j.assessment->>'verdict'='passed'"+
    " AND (j.assessment->>'passed')::int=(j.assessment->>'total')::int"+
    " ORDER BY j.completed_at DESC,j.id DESC LIMIT 1",
    [learnerId,lessonId,task.id,task.revision]);
  if(result.rowCount)return {status:"verified",completedAt:result.rows[0].completedAt,
    jobId:result.rows[0].jobId,labEnabled:executionLabEnabled()};
  return {status:"ready",labEnabled:executionLabEnabled()};
}
export async function codeTransferSummary(learnerId) {
  const tasks=[...byLesson.values()];
  const result=await database().query(
    "SELECT COUNT(DISTINCT t.lesson_id)::int AS verified"+
    " FROM learning_transfer_trials t"+
    " JOIN unnest($2::text[],$3::text[],$4::int[])"+
    " AS mapping(lesson_id,exercise_id,revision) ON mapping.lesson_id=t.lesson_id"+
    " JOIN execution_jobs j ON j.learner_id=t.learner_id"+
    " AND j.exercise_id=mapping.exercise_id AND j.exercise_revision=mapping.revision"+
    " WHERE t.learner_id=$1 AND t.stage=0 AND t.passed_at IS NOT NULL"+
    " AND j.created_at>=t.passed_at AND j.mode='assess'"+
    " AND j.status='completed' AND j.source_code=''"+
    " AND j.assessment->>'verdict'='passed'"+
    " AND (j.assessment->>'passed')::int=(j.assessment->>'total')::int",
    [learnerId,tasks.map(x=>x.transferLessonId),
      tasks.map(x=>x.id),tasks.map(x=>x.revision)]);
  return result.rows[0];
}
