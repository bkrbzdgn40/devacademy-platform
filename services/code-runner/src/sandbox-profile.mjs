// M8.4: strictly named execution profile. Staging is NOT public launch approval.
// Docker's fallback default is never used when gVisor is requested.
import {execFile} from "node:child_process";
import {promisify} from "node:util";
const execFileAsync=promisify(execFile);
export const PROFILES=Object.freeze(["docker-lab","gvisor-staging"]);
export function validateSandboxProfile(value="docker-lab") {
  if(!PROFILES.includes(value))throw Error("SANDBOX_PROFILE_UNSUPPORTED");
  return value;
}
export function sandboxRuntimeArgs(profile="docker-lab") {
  validateSandboxProfile(profile);
  return profile==="gvisor-staging"?["--runtime=runsc"]:[];
}
async function inspectDockerRuntimes() {
  // No shell, no user-controlled arguments, and no command output logging.
  const {stdout}=await execFileAsync("docker",
    ["info","--format","{{json .Runtimes}}"],
    {encoding:"utf8",timeout:4000,maxBuffer:16*1024,
      env:{PATH:process.env.PATH||"/usr/bin:/bin"}});
  return stdout;
}
export async function assertSandboxHostReady(profile="docker-lab",{inspect=inspectDockerRuntimes}={}) {
  validateSandboxProfile(profile);
  if(profile==="docker-lab")return {profile,requiresGvisor:false};
  if(process.platform!=="linux")throw Error("GVISOR_STAGING_REQUIRES_LINUX");
  let runtimes;
  try {
    const output=await inspect();
    if(typeof output!=="string"||output.length>16000)throw Error("bad-output");
    runtimes=JSON.parse(output);
  }catch{throw Error("GVISOR_STAGING_DOCKER_INFO_UNAVAILABLE");}
  if(!runtimes || Array.isArray(runtimes) || typeof runtimes!=="object" ||
     !Object.hasOwn(runtimes,"runsc"))
    throw Error("GVISOR_STAGING_RUNSC_NOT_REGISTERED");
  return {profile,requiresGvisor:true};
}
