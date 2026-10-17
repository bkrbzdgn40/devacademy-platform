// Proof-of-isolation runner. DO NOT call from the Next.js API or run on its host.
// The Docker daemon belongs on an isolated, disposable machine with no app secrets.
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const LIMITS = Object.freeze({
  maxSourceBytes: 8192,
  maxOutputBytes: 8192,
  wallTimeMs: 1800,
  cpus: "0.5",
  memory: "128m",
  processCount: "32",
});
const NAME_PREFIX = "devacademy-sandbox-";

export function validateSource(source) {
  if (typeof source !== "string" || source.trim().length === 0) throw new Error("EMPTY_SOURCE");
  if (Buffer.byteLength(source, "utf8") > LIMITS.maxSourceBytes) throw new Error("SOURCE_LIMIT");
}

export function dockerArgs({name, scriptPath, image="node:24-alpine"}){
  if (!/^devacademy-sandbox-[a-f0-9]{24}$/.test(name)) throw new Error("INVALID_CONTAINER_NAME");
  if (typeof scriptPath !== "string" || !scriptPath.startsWith("/")) throw new Error("INVALID_SCRIPT_PATH");
  // Never use a shell or expose host credentials. Image is preinstalled and does not auto-pull.
  return [
    "run","--rm","--pull=never","--name",name,
    "--network=none","--read-only","--cap-drop=ALL","--cgroupns=private",
    "--security-opt=no-new-privileges","--pids-limit",LIMITS.processCount,
    "--cpus",LIMITS.cpus,"--memory",LIMITS.memory,"--memory-swap",LIMITS.memory,
    "--user","65534:65534","--ipc=none","--ulimit","nofile=64:64",
    "--tmpfs","/tmp:rw,noexec,nosuid,size=16m",
    "--mount",`type=bind,source=${scriptPath},target=/work/main.js,readonly`,
    "--workdir","/work",
    image,"node","--max-old-space-size=64","/work/main.js"
  ];
}

function removeContainer(name) {
  return new Promise((resolve)=>{
    const child=spawn("docker",["rm","-f",name],{stdio:"ignore"});
    child.once("error",()=>resolve());
    child.once("close",()=>resolve());
    // CI watchdog owns the overall timeout; this is best-effort cleanup.
  });
}

export async function runIsolatedJavaScript(source,{image="node:24-alpine"}={}){
  validateSource(source);
  const dir=await mkdtemp(join(tmpdir(),"devacademy-runner-"));
  const scriptPath=join(dir,"main.js");
  const name=NAME_PREFIX+randomBytes(12).toString("hex");
  const start=Date.now();
  let child=null;
  let timer=null;
  try {
    await writeFile(scriptPath,source,{encoding:"utf8",mode:0o644,flag:"wx"});
    const args=dockerArgs({name,scriptPath,image});
    child=spawn("docker",args,{stdio:["ignore","pipe","pipe"],env:{PATH:process.env.PATH || "/usr/bin:/bin"}});
    let stdout="",stderr="",timedOut=false,outputLimited=false,infraError=false;
    let stopped=false;
    const stop=()=>{
      if(stopped)return;
      stopped=true;
      child?.kill("SIGTERM");
      void removeContainer(name);
    };
    function capture(kind,buf){
      const previous=kind==="stdout"?stdout:stderr;
      const data=Buffer.concat([Buffer.from(previous,"utf8"),buf]);
      if(data.length>LIMITS.maxOutputBytes){
        if(kind==="stdout")stdout=data.subarray(0,LIMITS.maxOutputBytes).toString("utf8");
        else stderr=data.subarray(0,LIMITS.maxOutputBytes).toString("utf8");
        outputLimited=true; stop();
      } else if(kind==="stdout")stdout=data.toString("utf8");else stderr=data.toString("utf8");
    }
    child.stdout.on("data",data=>capture("stdout",data));
    child.stderr.on("data",data=>capture("stderr",data));
    timer=setTimeout(()=>{timedOut=true;stop();},LIMITS.wallTimeMs);
    const exitCode=await new Promise(resolve=>{
      child.once("error",()=>{infraError=true;resolve(null);});
      child.once("close",code=>resolve(code));
    });
    const status=timedOut?"timed_out":outputLimited?"output_limit":infraError||exitCode===125||exitCode===126||exitCode===127?"infrastructure_error":exitCode===0?"completed":"runtime_error";
    return {status,stdout,stderr,exitCode,durationMs:Date.now()-start};
  } finally {
    if(timer)clearTimeout(timer);
    if(child && child.exitCode===null) child.kill("SIGTERM");
    await removeContainer(name);
    await rm(dir,{recursive:true,force:true});
  }
}
