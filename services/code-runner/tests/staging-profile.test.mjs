import test from "node:test";
import assert from "node:assert/strict";
import {validateSandboxProfile,sandboxRuntimeArgs,assertSandboxHostReady}
  from "../src/sandbox-profile.mjs";
import {dockerArgs} from "../src/run-isolated.mjs";
import {multiDockerArgs} from "../src/run-multilang.mjs";
import {processOne,validateWorkerConfig} from "../src/worker-loop.mjs";

const name="devacademy-sandbox-"+"a".repeat(24);
const scriptPath="/tmp/deva-reviewed-script";
const image="node@sha256:"+"b".repeat(64);
const base={origin:"http://127.0.0.1:3000",token:"reviewed-test-token-long-enough-to-validate",
  image};
test("profiles are fixed, never client-selected Docker flags",()=>{
  assert.deepEqual(sandboxRuntimeArgs(),[]);
  assert.deepEqual(sandboxRuntimeArgs("docker-lab"),[]);
  assert.deepEqual(sandboxRuntimeArgs("gvisor-staging"),["--runtime=runsc"]);
  assert.equal(validateSandboxProfile("gvisor-staging"),"gvisor-staging");
  for(const bad of ["runc","runsc","--privileged","gvisor-prod","",null]) {
    assert.throws(()=>validateSandboxProfile(bad),/SANDBOX_PROFILE_UNSUPPORTED/);
    assert.throws(()=>validateWorkerConfig({...base,sandboxProfile:bad}),/SANDBOX_PROFILE_UNSUPPORTED/);
  }
});
test("host preflight rejects missing runsc and malformed Docker metadata",async()=>{
  assert.deepEqual(await assertSandboxHostReady("docker-lab",{inspect:()=>{throw Error("must not be called")}}),
    {profile:"docker-lab",requiresGvisor:false});
  await assert.rejects(()=>assertSandboxHostReady("gvisor-staging",{inspect:async()=>JSON.stringify({runc:{}})}),
    /RUNSC_NOT_REGISTERED/);
  for(const input of ["not-json","[]","null","a".repeat(16001)]) {
    await assert.rejects(()=>assertSandboxHostReady("gvisor-staging",{inspect:async()=>input}),
      /DOCKER_INFO_UNAVAILABLE|RUNSC_NOT_REGISTERED/);
  }
  assert.deepEqual(await assertSandboxHostReady("gvisor-staging",{
    inspect:async()=>JSON.stringify({runc:{path:"runc"},runsc:{path:"/usr/bin/runsc"}})}),
    {profile:"gvisor-staging",requiresGvisor:true});
});
test("all runtimes require gVisor in staging while retaining hardened Docker flags",()=>{
  const args=[
    dockerArgs({name,scriptPath,image,sandboxProfile:"gvisor-staging"}),
    ...["python-3.12","java-21"].map(runtimeId=>multiDockerArgs({
      name,scriptPath,image:"python@sha256:"+"c".repeat(64),runtimeId,sandboxProfile:"gvisor-staging"}))
  ];
  for(const a of args) {
    assert.ok(a.includes("--runtime=runsc"));
    assert.equal(a.filter(x=>x.startsWith("--runtime=")).length,1);
    for(const flag of ["--network=none","--read-only","--cap-drop=ALL",
      "--security-opt=no-new-privileges","--memory","--memory-swap",
      "--cpus","--pids-limit","--user","--pull=never","--cgroupns=private"])
      assert.ok(a.includes(flag),flag);
    assert.equal(a[a.indexOf("--user")+1],"65534:65534");
    assert.ok(!a.includes("--privileged"));
  }
  for(const args of [
    dockerArgs({name,scriptPath,image}),
    multiDockerArgs({name,scriptPath,image:"python:3.12-alpine",runtimeId:"python-3.12"})
  ])assert.ok(!args.includes("--runtime=runsc"));
  assert.throws(()=>dockerArgs({name,scriptPath,image,sandboxProfile:"insecure"}),/SANDBOX_PROFILE_UNSUPPORTED/);
  assert.throws(()=>multiDockerArgs({name,scriptPath,image,runtimeId:"java-21",sandboxProfile:"insecure"}),/SANDBOX_PROFILE_UNSUPPORTED/);
});
test("staging worker forwards gVisor profile through isolated executor, never as student code",async()=>{
  const id="66ee2ecc-1234-43ab-83de-82c3c0123488";
  const claim={id,mode:"run",exerciseId:null,exerciseRevision:null,
    runtimeId:"nodejs-24",source:"console.log(42)",leaseToken:"d".repeat(64)};
  const calls=[];
  const transport=async(url,opts)=>{
    if(url.endsWith("/claim"))return Response.json(claim);
    calls.push(JSON.parse(opts.body));return Response.json({accepted:true});
  };
  const exec=[];
  const result=await processOne({...base,sandboxProfile:"gvisor-staging",transport,
    execute:async(source,options)=>{exec.push({source,options});
      return {status:"completed",stdout:"42\n",stderr:"",exitCode:0,durationMs:23};}});
  assert.equal(result.status,"processed");
  assert.deepEqual(exec,[{source:"console.log(42)",
    options:{image,sandboxProfile:"gvisor-staging"}}]);
  assert.equal(calls[0].status,"completed");
  assert.ok(!JSON.stringify(result).includes(base.token));
});
