// Only the TRUSTED worker evaluates outputs. Never run learner code in this process;
// every case delegates to a new network-disabled container. Expected outputs remain here.
import { isDeepStrictEqual } from "node:util";
import { caseBank } from "./exercises-private.mjs";
import { validateSource } from "./run-isolated.mjs";

const MAX_SUBMISSION_BYTES=6000;
export function validExercise(id, revision) {
  return typeof id==="string" && Number.isInteger(revision) &&
    Object.hasOwn(caseBank,id) && caseBank[id].revision===revision;
}
export function harness(source,functionName,args) {
  if(!/^[a-zA-Z_$][\w$]*$/.test(functionName))throw Error("INVALID_ENTRYPOINT");
  if(typeof source!=="string" || Buffer.byteLength(source,"utf8")>MAX_SUBMISSION_BYTES || !source.trim())
    throw Error("INVALID_SUBMISSION");
  // No secret expected values, hidden-case names or scoring code are sent to the sandbox.
  const program="const __fn = (() => { \"use strict\";\n"+source+"\n; return typeof "+functionName+"===\"function\" ? "+functionName+" : null; })();\n"+
    "if(!__fn){process.stderr.write(\"Missing required function\");process.exitCode=1;}\n"+
    "else {Promise.resolve().then(()=>__fn(..."+JSON.stringify(args)+")).then(v=>{"+
    "if(v===undefined || typeof v===\"bigint\"){process.stderr.write(\"Unsupported result\");process.exitCode=1;return;}"+
    "process.stdout.write(JSON.stringify(v));}).catch(()=>{process.stderr.write(\"Function threw an error\");process.exitCode=1;});}\n";
  validateSource(program);
  return program;
}
// The source, exact arguments and a small result serializer are the ONLY code
// sent into a sandbox. Hidden expected values stay with the trusted worker.
export function harnessPython(source,functionName,args) {
  if(!/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(functionName))throw Error("INVALID_ENTRYPOINT");
  if(typeof source!=="string" ||Buffer.byteLength(source,"utf8")>6000 ||!source.trim())
    throw Error("INVALID_SUBMISSION");
  const program=source+"\n\nimport json as _devacademy_json\n"+
    "_devacademy_result="+functionName+"(*"+JSON.stringify(args)+")\n"+
    "print(_devacademy_json.dumps(_devacademy_result, allow_nan=False, ensure_ascii=False))\n";
  validateSource(program);
  return program;
}
export function harnessJava(source,functionName,args){
  if(!/^[a-zA-Z_$][\w$]*$/.test(functionName))throw Error("INVALID_ENTRYPOINT");
  if(typeof source!=="string"||Buffer.byteLength(source,"utf8")>6000||!source.trim()||
    !Array.isArray(args)||args.some(x=>!Number.isInteger(x)||Math.abs(x)>1000000))
    throw Error("INVALID_SUBMISSION");
  const program=source+"\n\npublic class Main { public static void main(String[] args) {"+
    "System.out.print(Solution."+functionName+"("+args.join(",")+"));"+
    "} }\n";
  validateSource(program);
  return program;
}
export function harnessForRuntime(source,functionName,args,runtimeId){
  if(runtimeId==="python-3.12")return harnessPython(source,functionName,args);
  if(runtimeId==="java-21")return harnessJava(source,functionName,args);
  if(runtimeId==="nodejs-24")return harness(source,functionName,args);
  throw Error("UNKNOWN_RUNTIME");
}

export async function evaluateExercise({source,exerciseId,exerciseRevision,image,execute}) {
  if(!validExercise(exerciseId,exerciseRevision))throw Error("UNKNOWN_EXERCISE");
  const definition=caseBank[exerciseId];
  const publicCases=[];
  let passed=0;
  let durationMs=0;
  for(const scenario of definition.cases) {
    const runtimeId=definition.runtimeId??"nodejs-24";
    const program=harnessForRuntime(source,definition.functionName,scenario.args,runtimeId);
    let output;
    try {output=await execute(program,{image});}
    catch {return {status:"infrastructure_error",stdout:"",stderr:"Sandbox unavailable.",exitCode:null,durationMs:0,assessment:null};}
    durationMs+=Math.max(0,Number(output?.durationMs)||0);
    if(output?.status==="timed_out"||output?.status==="output_limit"||output?.status==="infrastructure_error") {
      // A transient/inconclusive execution MUST NEVER be counted as incorrect learner code.
      return {status:output.status,stdout:"",stderr:"",exitCode:output.exitCode??null,durationMs:Math.min(10000,Math.round(durationMs)),assessment:null};
    }
    if(output?.status==="runtime_error")return {
      status:"runtime_error",stdout:"",stderr:"Function failed in a test.",
      exitCode:output.exitCode??1,durationMs:Math.min(10000,Math.round(durationMs)),assessment:null
    };
    let success=false;
    if(output?.status==="completed" && output.exitCode===0 &&
       typeof output.stdout==="string" && !output.stderr) {
      try {success=isDeepStrictEqual(JSON.parse(output.stdout),scenario.expected);}
      catch {success=false;}
    }
    if(success)passed++;
    if(scenario.public)publicCases.push({label:scenario.label,passed:success});
  }
  const total=definition.cases.length;
  return {
    status:"completed",stdout:"",stderr:"",exitCode:0,durationMs:Math.min(10000,Math.round(durationMs)),
    assessment:{verdict:passed===total?"passed":"failed",passed,total,publicCases}
  };
}
