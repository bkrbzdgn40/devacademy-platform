import test from "node:test";
import assert from "node:assert/strict";
import {randomUUID,randomBytes} from "node:crypto";
import {createAccount} from "../src/server/auth.mjs";
import {database} from "../src/server/db.mjs";
import {enqueueExecution,claimExecution,completeExecution,getExecution} from "../src/server/execution-store.mjs";
const pw="M7-Multi-Runtime-Queue-2026-Password";
test("Python and Java assessment runtime IDs are selected by the trusted server, scoped by owner",async()=>{
 const a=await createAccount("pylab_"+randomBytes(6).toString("hex"),pw);
 const b=await createAccount("jlab_"+randomBytes(6).toString("hex"),pw);
 assert.equal(a.status,"created");assert.equal(b.status,"created");
 try{
   for(const [owner,id,source,runtime] of [
     [a.learnerId,"python.sum-even","def sum_even(numbers):\n return 0","python-3.12"],
     [b.learnerId,"java.clamp","class Solution {static int clamp(int a,int b,int c){return a;}}","java-21"]
   ]){
      const requestId=randomUUID();
      const queued=await enqueueExecution(owner,{source,requestId,mode:"assess",exerciseId:id,exerciseRevision:1,runtimeId:"nodejs-24"});
      assert.equal(queued.status,"queued");
      assert.equal(queued.job.runtimeId,runtime,"request-supplied runtime must have no authority");
      assert.equal((await getExecution(owner===a.learnerId?b.learnerId:a.learnerId,queued.job.id)),null);
      const ticket=await claimExecution();
      assert.equal(ticket.id,queued.job.id);
      assert.equal(ticket.runtimeId,runtime);
      assert.equal(ticket.exerciseId,id);
      assert.equal(ticket.source,source);
      const summary={verdict:"passed",passed:4,total:4,publicCases:[
        {label:runtime==="python-3.12"?"Pozitif ve negatif karışık":"Üst sınır dışı",passed:true},
        {label:runtime==="python-3.12"?"Hiç çift sayı yok":"Alt sınır dışı",passed:true}
      ]};
      assert.equal(await completeExecution({
        id:ticket.id,leaseToken:ticket.leaseToken,status:"completed",stdout:"",stderr:"",exitCode:0,durationMs:1500,assessment:summary
      }),true);
      const job=await getExecution(owner,ticket.id);
      assert.equal(job.assessment.verdict,"passed");
      assert.equal(job.runtimeId,runtime);
      const stored=await database().query("SELECT source_code FROM execution_jobs WHERE id=$1",[ticket.id]);
      assert.equal(stored.rows[0].source_code,"");
   }
 }finally{
  await database().query("DELETE FROM learner_accounts WHERE id=ANY($1::uuid[])",[[a.learnerId,b.learnerId]]);
 }
});
test.after(async()=>database().end());
