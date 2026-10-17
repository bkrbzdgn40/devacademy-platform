// Lab-only end-to-end checks: authenticated owner -> queue -> authenticated worker -> result.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { randomUUID, randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const server=createServer();
server.listen(0,"127.0.0.1");
await once(server,"listening");
const address=server.address();
assert.ok(address && typeof address!=="string");
const port=address.port;
server.close();await once(server,"close");

const cwd=fileURLToPath(new URL("../",import.meta.url));
const base="http://127.0.0.1:"+port;
const token="M3-Test-Worker-Secret-"+randomBytes(30).toString("hex");
const next=join(cwd,"node_modules","next","dist","bin","next");
const app=spawn(process.execPath,[next,"dev","--hostname","127.0.0.1","--port",String(port)],{
  cwd,env:{...process.env,APP_ORIGIN:base,RUNNER_LAB_ENABLED:"1",RUNNER_WORKER_TOKEN:token,NEXT_TELEMETRY_DISABLED:"1"},
  stdio:["ignore","pipe","pipe"]
});
let log="";
for(const stream of [app.stdout,app.stderr])stream.on("data",b=>{log=(log+b.toString()).slice(-5500);});
async function post(path,body,{cookie="",worker=false,origin=base}={}){
  const headers={...(!worker?{"Origin":origin,"Content-Type":"application/json"}:{"Authorization":"Bearer "+token,"Content-Type":"application/json"}),...(cookie?{Cookie:cookie}:{})};
  return fetch(base+path,{method:"POST",headers,body:JSON.stringify(body)});
}
function cookie(response){
  const c=response.headers.get("set-cookie");assert.ok(c);
  return c.split(";")[0];
}
const password="Long-Testing-Passphrase-2026";
const tag=randomBytes(4).toString("hex");
try{
  let ready=false;
  for(let i=0;i<200;i++){
    if(app.exitCode!==null)throw Error("Next dev exited unexpectedly "+log);
    try{if((await fetch(base+"/api/health")).ok){ready=true;break;}}catch{}
    await new Promise(res=>setTimeout(res,200));
  }
  assert.ok(ready,"Next dev did not start "+log);
  const enabled=await (await fetch(base+"/api/executions/availability")).json();
  assert.equal(enabled.enabled,true);
  const registerA=await post("/api/auth/register",{username:"execa_"+tag,password});
  assert.equal(registerA.status,201,await registerA.text());
  const a=cookie(registerA);
  const registerB=await post("/api/auth/register",{username:"execb_"+tag,password});
  assert.equal(registerB.status,201,await registerB.text());
  const b=cookie(registerB);
  const requestId=randomUUID();
  const input={requestId,source:"console.log('lab-boundary')"};
  assert.equal((await post("/api/executions",input)).status,401);
  assert.equal((await post("/api/executions",input,{cookie:a,origin:"https://evil.example"})).status,403);
  assert.equal((await post("/api/executions",{...input,source:"x".repeat(8193)},{cookie:a})).status,400);
  const created=await post("/api/executions",input,{cookie:a});
  assert.equal(created.status,202,await created.clone().text());
  const job=await created.json();
  assert.equal(job.status,"queued");
  assert.equal(JSON.stringify(job).includes("lab-boundary"),false);
  const own=await fetch(base+"/api/executions/"+job.id,{headers:{cookie:a}});
  assert.equal(own.status,200);
  assert.equal((await fetch(base+"/api/executions/"+job.id,{headers:{cookie:b}})).status,404);
  assert.equal((await fetch(base+"/api/executions/"+job.id)).status,401);
  assert.equal((await post("/api/internal/executions/claim",{})).status,401);
  const claim=await post("/api/internal/executions/claim",{}, {worker:true});
  assert.equal(claim.status,200,await claim.clone().text());
  const ticket=await claim.json();
  assert.equal(ticket.id,job.id);
  assert.equal(ticket.source,input.source);
  assert.match(ticket.leaseToken,/^[a-f0-9]{64}$/);
  const outcome={id:job.id,leaseToken:ticket.leaseToken,status:"completed",stdout:"lab-boundary",stderr:"",exitCode:0,durationMs:56};
  assert.equal((await post("/api/internal/executions/complete",{...outcome,leaseToken:"f".repeat(64)},{worker:true})).status,409);
  assert.equal((await post("/api/internal/executions/complete",outcome,{worker:true})).status,200);
  assert.equal((await post("/api/internal/executions/complete",outcome,{worker:true})).status,409);
  const finished=await (await fetch(base+"/api/executions/"+job.id,{headers:{cookie:a}})).json();
  assert.equal(finished.status,"completed");
  assert.equal(finished.stdout,"lab-boundary");
  assert.equal(JSON.stringify(finished).includes(input.source),false);
  assert.equal((await post("/api/executions",input,{cookie:a})).status,200);
  const duplicate=await (await post("/api/executions",input,{cookie:a})).json();
  assert.equal(duplicate.id,job.id);
  // M4: assessment input is validated on the server; the worker owns the verdict.
  assert.equal((await post("/api/executions",{requestId:randomUUID(),source:"function f(){}",mode:"assess",exerciseId:"made-up",exerciseRevision:1},{cookie:a})).status,400);
  const assessmentRequest={requestId:randomUUID(),source:"function sumEven(numbers){return 0}",mode:"assess",exerciseId:"js.sum-even",exerciseRevision:1};
  const queuedAssessment=await post("/api/executions",assessmentRequest,{cookie:a});
  assert.equal(queuedAssessment.status,202,await queuedAssessment.clone().text());
  const assessJob=await queuedAssessment.json();
  assert.equal(assessJob.mode,"assess");
  assert.equal(assessJob.assessment,null);
  assert.equal((await fetch(base+"/api/executions/"+assessJob.id,{headers:{cookie:b}})).status,404);
  const assessmentClaim=await post("/api/internal/executions/claim",{}, {worker:true});
  assert.equal(assessmentClaim.status,200);
  const assessmentTicket=await assessmentClaim.json();
  assert.equal(assessmentTicket.exerciseId,"js.sum-even");
  assert.equal(assessmentTicket.exerciseRevision,1);
  const summary={verdict:"failed",passed:2,total:5,publicCases:[{label:"Karma pozitif ve negatifler",passed:true},{label:"Çift sayı bulunmuyor",passed:true}]};
  const graded={id:assessJob.id,leaseToken:assessmentTicket.leaseToken,status:"completed",stdout:"",stderr:"",exitCode:0,durationMs:210,assessment:summary};
  assert.equal((await post("/api/internal/executions/complete",{...graded,assessment:{...summary,total:0}},{worker:true})).status,400);
  assert.equal((await post("/api/internal/executions/complete",graded,{worker:true})).status,200);
  const ownerAssessment=await (await fetch(base+"/api/executions/"+assessJob.id,{headers:{cookie:a}})).json();
  assert.equal(ownerAssessment.assessment.verdict,"failed");
  assert.equal(ownerAssessment.assessment.passed,2);
  assert.equal(JSON.stringify(ownerAssessment).includes(assessmentRequest.source),false);
  assert.equal((await post("/api/auth/delete",{confirmation:"DELETE",password},{cookie:a})).status,200);
  assert.equal((await fetch(base+"/api/executions/"+job.id,{headers:{cookie:a}})).status,401);
  assert.equal((await post("/api/auth/delete",{confirmation:"DELETE",password},{cookie:b})).status,200);
  console.log("Execution HTTP integration PASS: same-origin, session owner, quotas, worker auth, lease, idempotency, deletion.");
}catch(error){console.error("Next logs:",log);throw error;}
finally{app.kill("SIGTERM");}
