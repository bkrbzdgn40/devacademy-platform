// Exercises Next.js HTTP handlers against a throwaway, migrated PostgreSQL instance.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const server = createServer();
server.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
assert.ok(address && typeof address !== "string");
const port = address.port;
server.close();
await once(server, "close");

const root = fileURLToPath(new URL("../", import.meta.url));
const base = `http://127.0.0.1:${port}`;
const cli = join(root,"node_modules","next","dist","bin","next");
const app = spawn(process.execPath,[cli,"start","--hostname","127.0.0.1","--port",String(port)],{
  cwd:root,env:{...process.env,APP_ORIGIN:base,NEXT_TELEMETRY_DISABLED:"1"},stdio:["ignore","pipe","pipe"]
});
let output = "";
app.stdout.on("data",(chunk)=>{output=(output+chunk.toString()).slice(-4000);});
app.stderr.on("data",(chunk)=>{output=(output+chunk.toString()).slice(-4000);});

async function post(path,body,{cookie="",origin=base}={}) {
  return fetch(base+path,{method:"POST",headers:{"Content-Type":"application/json","Origin":origin,...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});
}
async function read(path,cookie="") {
  return fetch(base+path,{headers:cookie?{Cookie:cookie}:{}});
}
const usernameA="alice_"+randomBytes(5).toString("hex");
const usernameB="bob_"+randomBytes(5).toString("hex");
const password="A-Safely-Long-Passphrase-2026";
function sessionCookie(response) {
  const cookie=response.headers.get("set-cookie");
  assert.ok(cookie,"Missing session cookie");
  assert.match(cookie,/HttpOnly/);
  assert.match(cookie,/SameSite=Lax/);
  assert.match(cookie,/Path=\//);
  const item=cookie.split(";")[0];
  assert.match(item,/^devacademy_session=[a-f0-9]{64}$/);
  return item;
}

try {
  let online=false;
  for(let i=0;i<100;i++){
    if(app.exitCode!==null) throw Error("Web process exited: "+output);
    try {if((await fetch(base+"/api/health")).ok){online=true;break;}}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  assert.ok(online,"Web startup failed: "+output);
  assert.equal((await read("/api/me")).status,200);
  assert.equal((await read("/api/progress")).status,401);
  assert.equal((await post("/api/auth/register",{username:usernameA,password},{origin:"https://evil.example"})).status,403);
  assert.equal((await post("/api/auth/register",{username:usernameA,password:"short"})).status,400);

  const registeredA=await post("/api/auth/register",{username:usernameA,password});
  assert.equal(registeredA.status,201);
  const cookieA=sessionCookie(registeredA);
  const registeredB=await post("/api/auth/register",{username:usernameB,password});
  assert.equal(registeredB.status,201);
  const cookieB=sessionCookie(registeredB);
  assert.equal((await post("/api/auth/register",{username:usernameA,password})).status,409);
  const meA=await read("/api/me",cookieA);
  assert.equal((await meA.json()).username,usernameA);
  assert.equal((await post("/api/progress",{lessonId:"lesson.javascript.let-const",operation:"complete"},{cookie:cookieA})).status,409);
  assert.equal((await post("/api/progress",{lessonId:"lesson.javascript.let-const",operation:"view"},{cookie:cookieA})).status,200);

  for(const [questionId,optionId] of [["js.binding.increment","b"],["js.binding.object","c"]]){
    const response=await post("/api/assess",{questionId,optionId},{cookie:cookieA});
    assert.equal(response.status,200);
    const grade=await response.json();
    assert.equal(grade.correct,true);
    assert.equal(grade.saved,true);
  }
  const completed=await post("/api/progress",{lessonId:"lesson.javascript.let-const",operation:"complete"},{cookie:cookieA});
  assert.equal(completed.status,200);
  const progressA=await (await read("/api/progress",cookieA)).json();
  const progressB=await (await read("/api/progress",cookieB)).json();
  assert.equal(progressA.lessons.length,1);
  assert.equal(progressA.recentAttempts.length,2);
  assert.ok(progressA.lessons[0].completedAt);
  assert.deepEqual(progressB.lessons,[]);
  assert.deepEqual(progressB.recentAttempts,[]);
  assert.equal((await post("/api/progress",{lessonId:"lesson.javascript.let-const",operation:"complete",learnerId:"spoofed"},{cookie:cookieB})).status,409);

  // Same authenticated HTTP flow also saves a second language without mixing owners.
  const javaView=await post("/api/progress",{lessonId:"lesson.java.variables",operation:"view"},{cookie:cookieB});
  assert.equal(javaView.status,200);
  for(const [questionId,optionId] of [["java.variables.increment","b"],["java.variables.division","b"],["debug.java.variables","a"]]){
    const response=await post("/api/assess",{questionId,optionId},{cookie:cookieB});
    assert.equal(response.status,200);
    assert.equal((await response.json()).saved,true);
  }
  assert.equal((await post("/api/progress",{lessonId:"lesson.java.variables",operation:"complete"},{cookie:cookieB})).status,200);
  const ownerJava=await (await read("/api/progress",cookieB)).json();
  assert.ok(ownerJava.lessons.some(item=>item.lessonId==="lesson.java.variables"&&item.completedAt));
  assert.equal((await (await read("/api/progress",cookieA)).json()).lessons.some(item=>item.lessonId==="lesson.java.variables"),false);

  assert.equal((await post("/api/auth/delete",{confirmation:"DELETE",password:"wrong-password-too-long"},{cookie:cookieA})).status,401);
  assert.equal((await read("/api/me",cookieA)).status,200);
  assert.equal((await post("/api/auth/logout",{}, {cookie:cookieA})).status,200);
  assert.equal((await read("/api/progress",cookieA)).status,401);
  const reLogin=await post("/api/auth/login",{username:usernameA,password});
  assert.equal(reLogin.status,200);
  const restored=sessionCookie(reLogin);
  const restoredProgress=await (await read("/api/progress",restored)).json();
  assert.equal(restoredProgress.lessons.length,1);
  const deleted=await post("/api/auth/delete",{confirmation:"DELETE",password},{cookie:restored});
  assert.equal(deleted.status,200);
  assert.equal((await deleted.json()).deleted,true);
  assert.equal((await read("/api/progress",restored)).status,401);
  assert.equal((await post("/api/auth/login",{username:usernameA,password})).status,401);
  assert.equal((await read("/api/me",cookieB)).status,200);
  assert.equal((await post("/api/auth/delete",{confirmation:"DELETE",password},{cookie:cookieB})).status,200);
  assert.equal((await read("/api/progress",cookieB)).status,401);

  console.log("Authenticated HTTP integration PASS: CSRF, registration, cookie session, isolation, persistence, logout, delete.");
} catch(error){
  console.error("Web logs:",output);
  throw error;
} finally {
  app.kill("SIGTERM");
}
