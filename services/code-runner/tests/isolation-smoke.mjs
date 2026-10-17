import assert from "node:assert/strict";
import { LIMITS, dockerArgs, runIsolatedJavaScript, validateSource } from "../src/run-isolated.mjs";

const flags=dockerArgs({name:"devacademy-sandbox-"+"a".repeat(24),scriptPath:"/tmp/runner-fixture.js"});
for(const flag of ["--network=none","--read-only","--cap-drop=ALL","--security-opt=no-new-privileges","--pids-limit","--cpus","--memory","--memory-swap","--user","--ipc=none","--tmpfs","--pull=never"]){
  assert.ok(flags.includes(flag), `missing sandbox flag: ${flag}`);
}
assert.equal(flags[flags.indexOf("--user")+1],"65534:65534");
assert.ok(!flags.includes("--privileged"));
assert.ok(!flags.includes("--network=host"));
assert.throws(()=>validateSource("x".repeat(LIMITS.maxSourceBytes+1)),/SOURCE_LIMIT/);
assert.throws(()=>validateSource(" "),/EMPTY_SOURCE/);
const start=Date.now();
const ok=await runIsolatedJavaScript("console.log('runner-ok')");
assert.equal(ok.status,"completed",JSON.stringify(ok));
assert.equal(ok.stdout.trim(),"runner-ok");
const noSecret=await runIsolatedJavaScript("console.log(process.env.DATABASE_URL || 'no-secrets')");
assert.equal(noSecret.stdout.trim(),"no-secrets");
const network=await runIsolatedJavaScript(`const net = require('node:net');
const s=net.connect({host:'1.1.1.1',port:443});
s.on('error',()=>console.log('network-blocked'));
s.setTimeout(300,()=>{s.destroy();console.log('network-blocked')});`);
assert.equal(network.status,"completed",JSON.stringify(network));
assert.match(network.stdout,/network-blocked/);
const timeout=await runIsolatedJavaScript("while(true) {}");
assert.equal(timeout.status,"timed_out",JSON.stringify(timeout));
const flood=await runIsolatedJavaScript("console.log('A'.repeat(30000))");
assert.equal(flood.status,"output_limit",JSON.stringify(flood));
assert.ok(flood.stdout.length<=LIMITS.maxOutputBytes);
console.log("Runner isolation smoke PASS: bounded source, no host secret, disabled network, CPU/wall timeout and output quota.");
