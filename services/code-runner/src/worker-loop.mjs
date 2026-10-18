// Trusted queue orchestrator. Run separately from the Next server.
// Never pass APP_ORIGIN credentials or worker bearer into the untrusted Docker container.
import { runIsolatedJavaScript } from "./run-isolated.mjs";
import { evaluateExercise, validExercise } from "./evaluate-exercise.mjs";
import { caseBank } from "./exercises-private.mjs";
import { runIsolatedLanguage } from "./run-multilang.mjs";
import {validateSandboxProfile,assertSandboxHostReady} from "./sandbox-profile.mjs";

const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const TOKEN=/^[a-f0-9]{64}$/;
const DIGEST_IMAGE=/^node@sha256:[a-f0-9]{64}$/;
const PYTHON_DIGEST=/^python@sha256:[a-f0-9]{64}$/;
const JAVA_DIGEST=/^eclipse-temurin@sha256:[a-f0-9]{64}$/;

export function validateWorkerConfig({origin,token,image,pythonImage,javaImage,sandboxProfile="docker-lab"}) {
  if(typeof origin!=="string")throw Error("RUNNER_APP_ORIGIN_INVALID");
  let url;
  try {url=new URL(origin);}catch {throw Error("RUNNER_APP_ORIGIN_INVALID");}
  if(url.protocol!=="http:" || !["localhost","127.0.0.1","[::1]"].includes(url.hostname) ||
    url.username || url.password || url.pathname!=="/" || url.search || url.hash)
    throw Error("RUNNER_LOOPBACK_ONLY");
  if(typeof token!=="string" || token.length<32 || token.length>256)throw Error("RUNNER_TOKEN_INVALID");
  if(typeof image!=="string" || !DIGEST_IMAGE.test(image))throw Error("RUNNER_PINNED_IMAGE_REQUIRED");
  if(pythonImage!==undefined && !PYTHON_DIGEST.test(pythonImage))
    throw Error("RUNNER_PINNED_PYTHON_IMAGE_REQUIRED");
  if(javaImage!==undefined && !JAVA_DIGEST.test(javaImage))
    throw Error("RUNNER_PINNED_JAVA_IMAGE_REQUIRED");
  return {origin:url.origin,token,image,pythonImage,javaImage,
    sandboxProfile:validateSandboxProfile(sandboxProfile)};
}
const jsonHeaders=token=>({"Authorization":"Bearer "+token,"Content-Type":"application/json"});
const bounded = value=>Buffer.from(String(value??""),"utf8").subarray(0,8192).toString("utf8");
const statuses=new Set(["completed","runtime_error","timed_out","output_limit","infrastructure_error"]);

export async function processOne({origin,token,image,pythonImage,javaImage,sandboxProfile="docker-lab",transport=fetch,execute=runIsolatedJavaScript,executeLanguage=runIsolatedLanguage}) {
  const config=validateWorkerConfig({origin,token,image,pythonImage,javaImage,
    sandboxProfile});
  const claim=await transport(config.origin+"/api/internal/executions/claim",{
    method:"POST",headers:jsonHeaders(config.token),body:"{}",signal:AbortSignal.timeout(10000)
  });
  if(claim.status===204)return {status:"idle"};
  if(!claim.ok)throw Error("WORKER_CLAIM_HTTP_"+claim.status);
  const job=await claim.json();
  if(!UUID.test(job?.id??"") || !TOKEN.test(job?.leaseToken??"") ||
    !["nodejs-24","python-3.12","java-21"].includes(job?.runtimeId) ||
    typeof job.source!=="string" ||
    Buffer.byteLength(job.source,"utf8")>8192 ||
    !["run","assess"].includes(job.mode) ||
    (job.mode==="assess" && (!validExercise(job.exerciseId,job.exerciseRevision) ||
      (caseBank[job.exerciseId].runtimeId??"nodejs-24")!==job.runtimeId ||
      Buffer.byteLength(job.source,"utf8")>6000)) ||
    (job.mode==="run" && (job.runtimeId!=="nodejs-24" ||
      job.exerciseId!==null || job.exerciseRevision!==null)))
    throw Error("WORKER_JOB_CONTRACT_INVALID");
  const sandboxOptions=imageForJob=>config.sandboxProfile==="gvisor-staging"?
    {image:imageForJob,sandboxProfile:"gvisor-staging"}:{image:imageForJob};
  let result;
  try {
    if(job.mode==="assess"){
      const imageForJob=job.runtimeId==="python-3.12"?config.pythonImage:
        job.runtimeId==="java-21"?config.javaImage:config.image;
      if(!imageForJob)throw Error("WORKER_IMAGE_NOT_CONFIGURED");
      result=await evaluateExercise({
        source:job.source,exerciseId:job.exerciseId,exerciseRevision:job.exerciseRevision,
        image:imageForJob,
        execute:job.runtimeId==="nodejs-24"?
          (program,{image})=>execute(program,sandboxOptions(image)):
          (program,{image})=>executeLanguage(program,{runtimeId:job.runtimeId,...sandboxOptions(image)})
      });
    }else{
      result=await execute(job.source,sandboxOptions(config.image));
    }
  } catch {
    result={status:"infrastructure_error",stdout:"",stderr:"Runtime unavailable.",exitCode:null,durationMs:0};
  }
  if(!statuses.has(result?.status))result={status:"infrastructure_error",stdout:"",stderr:"Unexpected runner status.",exitCode:null,durationMs:0};
  const payload={
    id:job.id,leaseToken:job.leaseToken,status:result.status,
    stdout:bounded(result.stdout),stderr:bounded(result.stderr),
    exitCode:Number.isInteger(result.exitCode) && result.exitCode>=-128 && result.exitCode<=255 ? result.exitCode : null,
    durationMs:Number.isInteger(result.durationMs) ? Math.max(0,Math.min(result.durationMs,10000)) : 0,
    assessment:job.mode==="assess" ? (result.assessment??null) : null
  };
  const reply=await transport(config.origin+"/api/internal/executions/complete",{
    method:"POST",headers:jsonHeaders(config.token),body:JSON.stringify(payload),signal:AbortSignal.timeout(10000)
  });
  if(!reply.ok)throw Error("WORKER_COMPLETE_HTTP_"+reply.status);
  return {status:"processed",id:job.id,executionStatus:payload.status};
}

export async function runWorkerLoop() {
  // Worker must not inherit the web's DB credentials, even during local experiments.
  if(process.env.DATABASE_URL || process.env.APP_ORIGIN)throw Error("WORKER_MUST_NOT_HAVE_WEB_SECRETS");
  const config=validateWorkerConfig({
    origin:process.env.RUNNER_APP_ORIGIN,
    token:process.env.RUNNER_WORKER_TOKEN,
    image:process.env.RUNNER_RUNTIME_IMAGE,
    sandboxProfile:process.env.RUNNER_SANDBOX_PROFILE??"docker-lab",
    pythonImage:process.env.RUNNER_PYTHON_RUNTIME_IMAGE,
    javaImage:process.env.RUNNER_JAVA_RUNTIME_IMAGE
  });
  // Refuse to consume jobs if runsc is not registered. Never fall back to runc.
  await assertSandboxHostReady(config.sandboxProfile);
  let shutdown=false;
  const stop=()=>{shutdown=true;};
  process.once("SIGINT",stop);
  process.once("SIGTERM",stop);
  while(!shutdown){
    try{
      const result=await processOne(config);
      // Never log source, worker credential, lease capability or stdout/stderr.
      if(result.status==="processed")console.log("Execution processed:",result.executionStatus);
    }catch(error){
      console.error("Runner worker transport/runtime failed:",
        error instanceof Error ? error.message.replace(/Bearer\s+\S+/gi,"Bearer [redacted]") : "unknown");
    }
    if(!shutdown)await new Promise(resolve=>setTimeout(resolve,1200));
  }
}
