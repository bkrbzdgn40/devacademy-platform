// M7.2 LAB-ONLY untrusted Python/Java execution. Never import in Next.js.
// Docker daemon must live on a disposable host with no web/DB credentials.
// Docker itself is not a sufficient public security boundary.
import {spawn} from "node:child_process";
import {randomBytes} from "node:crypto";
import {mkdtemp,rm,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {sandboxRuntimeArgs} from "./sandbox-profile.mjs";
import {validateSource} from "./run-isolated.mjs";

const prefix="devacademy-sandbox-";
const specs=Object.freeze({
  "python-3.12":{filename:"main.py",time:4000,mem:"256m",cmd:["python","-I","-S","-B","/work/main.py"]},
  "java-21":{filename:"Main.java",time:7500,mem:"512m",
    // Only a constant command, NEVER untrusted source, is passed to sh.
    cmd:["sh","-c","javac -encoding UTF-8 -d /tmp /work/Main.java && java -Xmx128m -XX:ActiveProcessorCount=1 -cp /tmp Main"]}
});
export function multiDockerArgs({name,scriptPath,image,runtimeId,sandboxProfile="docker-lab"}){
  const spec=specs[runtimeId];
  if(!spec || !/^devacademy-sandbox-[a-f0-9]{24}$/.test(name) ||
     typeof scriptPath!=="string" || !scriptPath.startsWith("/") ||
     typeof image!=="string" || !/^[a-z][a-z0-9_.-]*(:[a-z0-9_.-]+|@sha256:[a-f0-9]{64})$/.test(image))
    throw Error("INVALID_MULTILANG_SANDBOX_ARGUMENTS");
  return ["run","--rm",...sandboxRuntimeArgs(sandboxProfile),"--pull=never","--name",name,
    "--network=none","--read-only","--cap-drop=ALL","--cgroupns=private",
    "--security-opt=no-new-privileges","--pids-limit","64",
    "--cpus","1","--memory",spec.mem,"--memory-swap",spec.mem,
    "--user","65534:65534","--ipc=none","--ulimit","nofile=64:64",
    "--tmpfs","/tmp:rw,noexec,nosuid,size=64m",
    "--mount","type=bind,source="+scriptPath+",target=/work/"+spec.filename+",readonly",
    "--workdir","/work",image,...spec.cmd];
}
function removeContainer(name){
 return new Promise(resolve=>{
  const p=spawn("docker",["rm","-f",name],{stdio:"ignore"});
  p.once("error",()=>resolve());
  p.once("close",()=>resolve());
 });
}
export async function runIsolatedLanguage(source,{runtimeId,image,sandboxProfile="docker-lab"}){
  validateSource(source);
  const spec=specs[runtimeId];
  if(!spec)throw Error("UNSUPPORTED_LANGUAGE_RUNTIME");
  const dir=await mkdtemp(join(tmpdir(),"devacademy-multilang-"));
  const scriptPath=join(dir,spec.filename);
  const name=prefix+randomBytes(12).toString("hex");
  let child=null,timer=null;
  const start=Date.now();
  try{
    await writeFile(scriptPath,source,{mode:0o644,flag:"wx"});
    child=spawn("docker",multiDockerArgs({name,scriptPath,image,runtimeId,sandboxProfile}),{
      stdio:["ignore","pipe","pipe"],env:{PATH:process.env.PATH||"/usr/bin:/bin"}
    });
    let stdout="",stderr="",timedOut=false,outputLimit=false,infra=false,stopped=false;
    const stop=()=>{if(stopped)return;stopped=true;child?.kill("SIGTERM");void removeContainer(name);};
    const capture=(kind,buffer)=>{
      const old=kind==="stdout"?stdout:stderr;
      const bytes=Buffer.concat([Buffer.from(old,"utf8"),buffer]);
      if(bytes.length>8192){outputLimit=true;stop();}
      const result=bytes.subarray(0,8192).toString("utf8");
      if(kind==="stdout")stdout=result;else stderr=result;
    };
    child.stdout.on("data",x=>capture("stdout",x));
    child.stderr.on("data",x=>capture("stderr",x));
    timer=setTimeout(()=>{timedOut=true;stop();},spec.time);
    const exit=await new Promise(resolve=>{
      child.once("error",()=>{infra=true;resolve(null);});
      child.once("close",code=>resolve(code));
    });
    const status=timedOut?"timed_out":outputLimit?"output_limit":
      infra||exit===125||exit===126||exit===127?"infrastructure_error":
      exit===0?"completed":"runtime_error";
    return {status,stdout,stderr,exitCode:exit,durationMs:Date.now()-start};
  }finally{
    if(timer)clearTimeout(timer);
    if(child && child.exitCode===null)child.kill("SIGTERM");
    await removeContainer(name);
    await rm(dir,{recursive:true,force:true});
  }
}
