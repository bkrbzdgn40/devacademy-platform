// Production viewport smoke: Chrome DevTools Protocol via Node 24 WebSocket, no extra packages.
// Runs after pnpm build; checks document width across real rendered pages and a hydrated editor.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const cwd = fileURLToPath(new URL("../", import.meta.url));
const widths = [320, 375, 390, 600, 768, 960, 1024];
const paths = ["/", "/dersler", "/dersler/degiskenler", "/laboratuvar", "/hesap", "/kutuphane/diller", "/pratik", "/tekrar", "/pratik/cift-sayilari-topla", "/pratik/python-cift-topla", "/pratik/java-araliga-sinirla", "/kurslar", "/kurslar/java-temelleri", "/kurslar/java-temelleri/degiskenler-ve-turler", "/kurslar/javascript-temelleri/degiskenler", "/kurslar/python-temelleri", "/kurslar/python-temelleri/degiskenler-ve-turler"];
const diagnostic = "(() => { const doc=document.documentElement; const nav=document.querySelector('.nav-links'); return { ready:document.readyState, viewport:doc.clientWidth, windowWidth:window.innerWidth, scrollWidth:doc.scrollWidth, bodyScrollWidth:document.body.scrollWidth, navRight:nav ? nav.getBoundingClientRect().right : null, hasEditor:!!document.querySelector('.cm-editor'), offenders:[...document.body.querySelectorAll('*')].filter(el => { const r=el.getBoundingClientRect(); return r.width && r.right>doc.clientWidth+2; }).slice(0,6).map(el=>el.tagName.toLowerCase()+'.'+el.className.toString().slice(0,45)) }; })()";

async function availablePort() {
  const server=createServer();
  server.listen(0,"127.0.0.1");
  await once(server,"listening");
  const address=server.address();
  assert.ok(address && typeof address!=="string");
  const port=address.port;
  server.close();
  await once(server,"close");
  return port;
}

async function waitFor(predicate, message, count=100) {
  for(let i=0;i<count;i++){
    const value=await predicate().catch(()=>null);
    if(value)return value;
    await sleep(150);
  }
  throw Error(message);
}

class CDP {
  constructor(socket){
    this.socket=socket;
    this.counter=0;
    this.pending=new Map();
    socket.addEventListener("message",(event)=>{
      const message=JSON.parse(event.data);
      if(!message.id)return;
      const pending=this.pending.get(message.id);
      if(!pending)return;
      this.pending.delete(message.id);
      clearTimeout(pending.timeout);
      if(message.error)pending.reject(Error(JSON.stringify(message.error)));
      else pending.resolve(message.result ?? {});
    });
  }
  send(method,params={},sessionId=null){
    const id=++this.counter;
    return new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>{this.pending.delete(id);reject(Error("CDP timed out: "+method));},15000);
      this.pending.set(id,{resolve,reject,timeout});
      const payload={id,method,params};
      if(sessionId)payload.sessionId=sessionId;
      this.socket.send(JSON.stringify(payload));
    });
  }
}

const port=await availablePort();
const base="http://127.0.0.1:"+port;
const nextCli=join(cwd,"node_modules","next","dist","bin","next");
const next=spawn(process.execPath,[nextCli,"start","--hostname","127.0.0.1","--port",String(port)],{
  cwd,env:{...process.env,APP_ORIGIN:base,NEXT_TELEMETRY_DISABLED:"1"},stdio:["ignore","pipe","pipe"]
});
let serverLog="";
for(const output of [next.stdout,next.stderr])output.on("data",data=>{serverLog=(serverLog+data.toString()).slice(-3000);});
const profile=await mkdtemp(join(tmpdir(),"devacademy-mobile-chrome-"));
let chrome=null,socket=null;
let browserError=null;
try{
  await waitFor(async()=>{
    if(next.exitCode!==null)throw Error("Next exited unexpectedly: "+serverLog);
    try{return (await fetch(base+"/api/health")).ok;}catch{return false;}
  },"Production Next server did not start: "+serverLog,100);
  chrome=spawn(process.env.CHROME_BIN || "google-chrome",[
    "--headless=new","--no-sandbox","--disable-dev-shm-usage",
    "--disable-background-networking","--no-first-run","--no-default-browser-check",
    "--disable-extensions","--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=0","--user-data-dir="+profile,"about:blank"
  ],{stdio:"ignore"});
  chrome.on("error",(error)=>{browserError=error;});
  const config=await waitFor(async()=>{
    if(browserError)throw browserError;
    if(chrome.exitCode!==null)throw Error("Chrome exited: "+chrome.exitCode);
    const contents=await readFile(join(profile,"DevToolsActivePort"),"utf8");
    const [debugPort,browserPath]=contents.trim().split("\n");
    return {debugPort,browserPath};
  },"Chrome DevTools endpoint was not created",100);
  socket=new WebSocket("ws://127.0.0.1:"+config.debugPort+config.browserPath);
  await new Promise((resolve,reject)=>{
    socket.addEventListener("open",resolve,{once:true});
    socket.addEventListener("error",reject,{once:true});
  });
  const cdp=new CDP(socket);
  const target=await cdp.send("Target.createTarget",{url:"about:blank"});
  const attach=await cdp.send("Target.attachToTarget",{targetId:target.targetId,flatten:true});
  const sessionId=attach.sessionId;
  await cdp.send("Page.enable",{},sessionId);
  await cdp.send("Runtime.enable",{},sessionId);
  let count=0;
  for(const width of widths){
    await cdp.send("Emulation.setDeviceMetricsOverride",{
      width,height:850,deviceScaleFactor:1,mobile:width<=600
    },sessionId);
    for(const path of paths){
      await cdp.send("Page.navigate",{url:base+path},sessionId);
      // Lesson editors are lazy-mounted in their "Kodla/Uygula" stage.
      // On initial page load only the standalone lab and practice tasks include an editor.
      const needsEditor=path==="/laboratuvar" || path.startsWith("/pratik/");
      const data=await waitFor(async()=>{
        const evaluation=await cdp.send("Runtime.evaluate",{expression:diagnostic,returnByValue:true},sessionId);
        const result=evaluation.result?.value;
        return result?.ready==="complete" && (!needsEditor || result.hasEditor) ? result : null;
      },"Page/editor did not finish loading: "+width+"px "+path,100);
      assert.ok(data.windowWidth<=width+1 && data.windowWidth>=width-1,
        "Incorrect viewport at "+path+": "+JSON.stringify({width,...data}));
      assert.ok(data.scrollWidth<=data.viewport+1,
        "Horizontal page overflow at "+width+"px "+path+": "+JSON.stringify(data));
      assert.ok(data.navRight===null || data.navRight<=data.viewport+1,
        "Navigation beyond viewport at "+width+"px "+path+": "+JSON.stringify(data));
      count++;
    }
  }
  // An opened mobile discovery menu must not extend beyond the 320px viewport.
  await cdp.send("Emulation.setDeviceMetricsOverride",{
    width:320,height:850,deviceScaleFactor:1,mobile:true
  },sessionId);
  await cdp.send("Page.navigate",{url:base},sessionId);
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:"document.readyState==='complete' && !!document.querySelector('.nav-discovery')",returnByValue:true},sessionId);
    return r.result?.value===true;
  },"Home navigation did not load");
  await cdp.send("Runtime.evaluate",{expression:"document.querySelector('.nav-discovery').open=true",returnByValue:true},sessionId);
  const menu=await cdp.send("Runtime.evaluate",{expression:diagnostic,returnByValue:true},sessionId);
  assert.ok(menu.result.value.scrollWidth<=menu.result.value.viewport+1,
    "Open discovery menu overflows mobile viewport: "+JSON.stringify(menu.result.value));

  // Only the active step should be visible; navigating to Apply mounts CodeMirror.
  await cdp.send("Page.navigate",{url:base+"/kurslar/python-temelleri/degiskenler-ve-turler"},sessionId);
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:"document.readyState==='complete' && !!document.querySelector('[data-lesson-step=\"3\"]')",returnByValue:true},sessionId);
    return r.result?.value===true;
  },"Guided Python lesson did not load");
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:"(() => {const b=document.querySelector('[data-lesson-step=\"3\"]'); if(!b) return false; if(b.getAttribute('aria-current')==='step')return true; b.click();return false;})()",returnByValue:true},sessionId);
    return r.result?.value===true;
  },"Stage navigation did not respond",100);
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:"!!document.querySelector('.lesson-step-panel:not([hidden]) .cm-editor')",returnByValue:true},sessionId);
    return r.result?.value===true;
  },"CodeMirror did not lazy-mount in Apply stage");
  const applied=await cdp.send("Runtime.evaluate",{expression:diagnostic,returnByValue:true},sessionId);
  assert.ok(applied.result.value.scrollWidth<=applied.result.value.viewport+1,
    "Apply stage overflows mobile viewport: "+JSON.stringify(applied.result.value));
  console.log("Responsive Chrome smoke PASS: "+count+" page/viewport cases plus open discovery and guided Apply stage.");
} catch(error){
  console.error("Production server output:",serverLog);
  throw error;
} finally{
  socket?.close();
  chrome?.kill("SIGTERM");
  next.kill("SIGTERM");
  await rm(profile,{force:true,recursive:true,maxRetries:5,retryDelay:200});
}
