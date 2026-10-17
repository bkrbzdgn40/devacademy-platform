import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { database } from "../src/server/db.mjs";
import { createAccount } from "../src/server/auth.mjs";
import { enqueueExecution, getExecution, claimExecution, completeExecution, validCompletion, executionLabEnabled } from "../src/server/execution-store.mjs";
import { workerAuthorized } from "../src/server/execution-worker-auth.mjs";

const tag=randomBytes(5).toString("hex");
const password="Queue-Test-Passphrase-2026";
test("private queue respects ownership, idempotency, quotas, lease and account deletion",async()=>{
  const a=await createAccount("exec_a_"+tag,password);
  const b=await createAccount("exec_b_"+tag,password);
  assert.equal(a.status,"created");
  assert.equal(b.status,"created");
  try{
    const requestId=randomUUID();
    const first=await enqueueExecution(a.learnerId,{source:"console.log(123)",requestId});
    assert.equal(first.status,"queued");
    const second=await enqueueExecution(a.learnerId,{source:"console.log(999)",requestId});
    assert.equal(second.status,"existing");
    assert.equal(second.job.id,first.job.id);
    assert.equal(Object.hasOwn(first.job,"source"),false);
    assert.equal(Object.hasOwn(first.job,"source_code"),false);
    assert.equal(await getExecution(b.learnerId,first.job.id),null);
    assert.equal((await getExecution(a.learnerId,first.job.id)).status,"queued");
    const bJob=await enqueueExecution(b.learnerId,{source:"console.log(2)",requestId:randomUUID()});
    assert.equal(bJob.status,"queued");
    const secondA=await enqueueExecution(a.learnerId,{source:"console.log(3)",requestId:randomUUID()});
    assert.equal(secondA.status,"queued");
    assert.equal((await enqueueExecution(a.learnerId,{source:"console.log(4)",requestId:randomUUID()})).status,"limited");
    const claimed=await claimExecution();
    assert.equal(claimed.id,first.job.id);
    assert.equal(claimed.source,"console.log(123)");
    assert.equal(claimed.runtimeId,"nodejs-24");
    const correct={id:claimed.id,leaseToken:claimed.leaseToken,status:"completed",stdout:"123\\n",stderr:"",exitCode:0,durationMs:123};
    assert.equal(validCompletion({...correct,stdout:"x".repeat(8193)}),false);
    assert.equal(validCompletion({...correct,durationMs:-1}),false);
    assert.equal(await completeExecution({...correct,leaseToken:"a".repeat(64)}),false);
    assert.equal(await completeExecution(correct),true);
    assert.equal(await completeExecution(correct),false);
    const done=await getExecution(a.learnerId,first.job.id);
    assert.equal(done.status,"completed");
    assert.equal(done.stdout,"123\\n");
    const persisted=await database().query("SELECT source_code,lease_token_hash FROM execution_jobs WHERE id=$1",[claimed.id]);
    assert.equal(persisted.rows[0].source_code,"");
    assert.equal(persisted.rows[0].lease_token_hash,null);
    assert.equal(await getExecution(b.learnerId,first.job.id),null);
    assert.equal((await getExecution(b.learnerId,bJob.job.id)).status,"queued");
    await database().query("UPDATE execution_jobs SET created_at=now()-interval '11 minutes' WHERE id=$1",[secondA.job.id]);
    const expired=await getExecution(a.learnerId,secondA.job.id);
    assert.equal(expired.status,"infrastructure_error");
    const expiredSource=await database().query("SELECT source_code FROM execution_jobs WHERE id=$1",[secondA.job.id]);
    assert.equal(expiredSource.rows[0].source_code,"");
    await database().query("DELETE FROM learner_accounts WHERE id=$1",[a.learnerId]);
    assert.equal(await getExecution(a.learnerId,first.job.id),null);
    assert.ok(await getExecution(b.learnerId,bJob.job.id));
  }finally{
    await database().query("DELETE FROM learner_accounts WHERE id=ANY($1::uuid[])",[[a.learnerId,b.learnerId]]);
  }
});

test("worker bearer and lab gate reject absent tokens, production and non-loopback origin",()=>{
  const prior={...process.env};
  try{
    process.env.RUNNER_LAB_ENABLED="1";
    process.env.APP_ORIGIN="http://127.0.0.1:3000";
    process.env.NODE_ENV="development";
    process.env.RUNNER_WORKER_TOKEN="long-lab-worker-secret-"+randomBytes(20).toString("hex");
    assert.equal(executionLabEnabled(),true);
    const url="http://127.0.0.1:3000/api/internal/executions/claim";
    assert.equal(workerAuthorized(new Request(url)),false);
    assert.equal(workerAuthorized(new Request(url,{headers:{authorization:"Bearer bad-token"}})),false);
    assert.equal(workerAuthorized(new Request(url,{headers:{authorization:"Bearer "+process.env.RUNNER_WORKER_TOKEN}})),true);
    process.env.NODE_ENV="production";
    assert.equal(executionLabEnabled(),false);
    process.env.NODE_ENV="development";
    process.env.APP_ORIGIN="https://devacademy.example";
    assert.equal(executionLabEnabled(),false);
  }finally{
    for(const k of ["RUNNER_LAB_ENABLED","APP_ORIGIN","NODE_ENV","RUNNER_WORKER_TOKEN"]){
      if(prior[k]===undefined)delete process.env[k];else process.env[k]=prior[k];
    }
  }
});
test.after(async()=>{await database().end();});
