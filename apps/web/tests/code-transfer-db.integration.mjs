import test from "node:test";
import assert from "node:assert/strict";
import {randomBytes,randomUUID} from "node:crypto";
import {database} from "../src/server/db.mjs";
import {createAccount} from "../src/server/auth.mjs";
import {enqueueExecution,claimExecution,completeExecution,getExecution} from "../src/server/execution-store.mjs";
import {getCodeTransferState,codeTransferSummary,publicCodeTransferTask}
  from "../src/server/code-transfer.mjs";
const lesson="lesson.javascript.let-const";
const pw="Valid-Independent-Code-Transfer-Passphrase-2026";
const task=publicCodeTransferTask(lesson);
test("proof requires trusted completed hidden-test pass AFTER independent transfer",async()=>{
  const a=await createAccount("codea_"+randomBytes(6).toString("hex"),pw);
  const b=await createAccount("codeb_"+randomBytes(6).toString("hex"),pw);
  assert.equal(a.status,"created");assert.equal(b.status,"created");
  try {
    assert.equal((await getCodeTransferState(a.learnerId,lesson)).status,"locked");
    for(const person of [a,b]) {
      await database().query(
        "INSERT INTO lesson_progress(learner_id,lesson_id,completed_at) VALUES($1,$2,now())",
        [person.learnerId,lesson]);
      await database().query(
        "INSERT INTO learning_transfer_trials(learner_id,lesson_id,stage,variant_seed,passed_at) VALUES($1,$2,0,12345,now()-interval '1 minute')",
        [person.learnerId,lesson]);
    }
    const started=await enqueueExecution(a.learnerId,{
      source:"function snapshotScore(s,d){return [s,s+d]}",requestId:randomUUID(),
      mode:"assess",exerciseId:task.id,exerciseRevision:task.revision});
    assert.equal(started.status,"queued");
    assert.equal((await getCodeTransferState(a.learnerId,lesson)).status,"ready");
    assert.equal((await codeTransferSummary(a.learnerId)).verified,0);
    const claimed=await claimExecution();
    assert.equal(claimed.id,started.job.id);
    assert.equal(claimed.exerciseId,task.id);
    assert.equal(await completeExecution({
      id:claimed.id,leaseToken:claimed.leaseToken,status:"completed",stdout:"",
      stderr:"",exitCode:0,durationMs:160,
      assessment:{verdict:"passed",passed:5,total:5,
        publicCases:task.publicCases.map(c=>({label:c.label,passed:true}))}
    }),true);
    const verified=await getCodeTransferState(a.learnerId,lesson);
    assert.equal(verified.status,"verified");
    assert.equal(verified.jobId,claimed.id);
    assert.equal((await codeTransferSummary(a.learnerId)).verified,1);
    assert.equal((await getCodeTransferState(b.learnerId,lesson)).status,"ready");
    assert.equal((await codeTransferSummary(b.learnerId)).verified,0);
    assert.equal((await getExecution(b.learnerId,claimed.id)),null);
    const stored=await database().query("SELECT source_code,assessment FROM execution_jobs WHERE id=$1",[claimed.id]);
    assert.equal(stored.rows[0].source_code,"");
    assert.equal(stored.rows[0].assessment.verdict,"passed");
    // A passing job created before the first independent pass is not evidence.
    await database().query("UPDATE execution_jobs SET created_at=now()-interval '2 hours' WHERE id=$1",[claimed.id]);
    assert.equal((await getCodeTransferState(a.learnerId,lesson)).status,"ready");
    assert.equal((await codeTransferSummary(a.learnerId)).verified,0);
    await database().query("DELETE FROM learner_accounts WHERE id=$1",[a.learnerId]);
    assert.equal((await database().query("SELECT count(*)::int AS n FROM execution_jobs WHERE learner_id=$1",[a.learnerId])).rows[0].n,0);
  } finally {
    await database().query("DELETE FROM learner_accounts WHERE id=ANY($1::uuid[])",[[a.learnerId,b.learnerId]]);
  }
});
test.after(async()=>database().end());
