// Genuine Postgres lifecycle for student-owned transfer evidence.
import test from "node:test";
import assert from "node:assert/strict";
import {randomBytes} from "node:crypto";
import {database} from "../src/server/db.mjs";
import {createAccount} from "../src/server/auth.mjs";
import {recordAttempt,updateLessonProgress,getLearningProgress} from "../src/server/learning-store.mjs";
import {gradeSubmission} from "../src/server/grade.ts";
import {getTransferState,startTransfer,submitTransfer} from "../src/server/transfer-store.mjs";
import {transferProblem} from "../src/server/transfer-missions.mjs";

const password="A-Long-Test-Passphrase-2026";
const id="lesson.javascript.let-const";
async function solve(owner,stage,correct=true) {
  const row=await database().query(
    "SELECT variant_seed FROM learning_transfer_trials WHERE learner_id=$1 AND lesson_id=$2 AND stage=$3",
    [owner,id,stage]);
  const expected=transferProblem(id,row.rows[0].variant_seed).expected;
  return submitTransfer(owner,{lessonId:id,stage,answerA:correct?expected[0]:"-123456",
    answerB:correct?expected[1]:"-123456",confidence:"high"});
}
test("transfer proves distinct correct cases after guided completion and cannot bypass 24h",async()=>{
  const a=await createAccount("transa_"+randomBytes(6).toString("hex"),password);
  const b=await createAccount("transb_"+randomBytes(6).toString("hex"),password);
  assert.equal(a.status,"created");
  assert.equal(b.status,"created");
  try {
    assert.equal((await startTransfer(a.learnerId,id)).status,"locked");
    assert.equal((await startTransfer(b.learnerId,id)).status,"locked");
    for(const [questionId,optionId] of [["js.binding.increment","b"],["js.binding.object","c"]]){
      const grade=gradeSubmission({questionId,optionId});
      await recordAttempt(a.learnerId,grade,optionId);
    }
    assert.equal((await updateLessonProgress(a.learnerId,id,"complete")).status,"completed");
    const ready=await getTransferState(a.learnerId,id);
    assert.equal(ready.status,"ready");
    assert.equal(ready.stage,0);
    assert.equal((await startTransfer(a.learnerId,id)).status,"active");
    const first=await getTransferState(a.learnerId,id);
    assert.equal(first.problem.stage,0);
    assert.equal("expected" in first.problem,false);
    assert.deepEqual((await startTransfer(a.learnerId,id)).problem,first.problem);
    assert.equal((await submitTransfer(a.learnerId,{lessonId:id,stage:0,answerA:"1+1",
      answerB:"1",confidence:"high"})).status,"invalid");
    const beforeWrong=await database().query(
      "SELECT variant_seed,attempt_count FROM learning_transfer_trials WHERE learner_id=$1 AND lesson_id=$2 AND stage=0",
      [a.learnerId,id]);
    const bad=await solve(a.learnerId,0,false);
    assert.equal(bad.correct,false);
    assert.equal(bad.expected.length,2);
    assert.ok(bad.explanation.length>15);
    const afterWrong=await database().query(
      "SELECT variant_seed,attempt_count FROM learning_transfer_trials WHERE learner_id=$1 AND lesson_id=$2 AND stage=0",
      [a.learnerId,id]);
    assert.equal(afterWrong.rows[0].attempt_count,beforeWrong.rows[0].attempt_count+1);
    assert.notEqual(afterWrong.rows[0].variant_seed,beforeWrong.rows[0].variant_seed);
    const valid=await solve(a.learnerId,0,true);
    assert.equal(valid.correct,true);
    assert.equal((await getTransferState(a.learnerId,id)).status,"waiting");
    assert.equal((await startTransfer(a.learnerId,id)).status,"waiting");
    assert.equal((await submitTransfer(a.learnerId,{lessonId:id,stage:0,answerA:"0",
      answerB:"0",confidence:"high"})).status,"unavailable");
    assert.equal((await getTransferState(b.learnerId,id)).status,"locked");
    assert.equal((await getLearningProgress(a.learnerId)).transferSummary.first,1);
    assert.equal((await getLearningProgress(a.learnerId)).transferSummary.retained,0);
    // Simulate one day passing in throwaway DB only.
    await database().query(
      "UPDATE learning_transfer_trials SET passed_at=now()-interval '25 hours' WHERE learner_id=$1 AND lesson_id=$2 AND stage=0",
      [a.learnerId,id]);
    assert.equal((await getTransferState(a.learnerId,id)).stage,1);
    assert.equal((await startTransfer(a.learnerId,id)).problem.stage,1);
    assert.equal((await solve(a.learnerId,1,true)).correct,true);
    assert.equal((await getTransferState(a.learnerId,id)).status,"retained");
    assert.equal((await getLearningProgress(a.learnerId)).transferSummary.retained,1);
    assert.equal((await getLearningProgress(b.learnerId)).transferSummary.first,0);
    assert.equal((await getLearningProgress(b.learnerId)).transferSummary.retained,0);
    await database().query("DELETE FROM learner_accounts WHERE id=$1",[a.learnerId]);
    assert.equal((await database().query("SELECT count(*)::int AS n FROM learning_transfer_trials WHERE learner_id=$1",[a.learnerId])).rows[0].n,0);
  } finally {
    await database().query("DELETE FROM learner_accounts WHERE id=ANY($1::uuid[])",[[a.learnerId,b.learnerId]]);
  }
});
test("cooldown is owner-scoped and expires after 24 hours",async()=>{
  const a=await createAccount("transc_"+randomBytes(6).toString("hex"),password);
  try {
    for(const [questionId,optionId] of [["js.binding.increment","b"],["js.binding.object","c"]])
      await recordAttempt(a.learnerId,gradeSubmission({questionId,optionId}),optionId);
    await updateLessonProgress(a.learnerId,id,"complete");
    await startTransfer(a.learnerId,id);
    await database().query("UPDATE learning_transfer_trials SET attempt_count=8,updated_at=now() WHERE learner_id=$1 AND lesson_id=$2 AND stage=0",[a.learnerId,id]);
    assert.equal((await getTransferState(a.learnerId,id)).status,"cooldown");
    assert.equal((await startTransfer(a.learnerId,id)).status,"cooldown");
    await database().query("UPDATE learning_transfer_trials SET updated_at=now()-interval '25 hours' WHERE learner_id=$1 AND lesson_id=$2 AND stage=0",[a.learnerId,id]);
    assert.equal((await startTransfer(a.learnerId,id)).problem.attemptsRemaining,8);
  } finally {
    await database().query("DELETE FROM learner_accounts WHERE id=$1",[a.learnerId]);
  }
});
test.after(async()=>{await database().end();});
