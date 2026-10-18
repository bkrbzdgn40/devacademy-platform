// Synthetic real-browser performance baseline against the production Next server.
// No credentials or learner data are accessed. Report measurements, not assertions
// about Core Web Vitals or production latencies.
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {once} from "node:events";
import {mkdtemp,readFile,rm,writeFile,appendFile} from "node:fs/promises";
import {createServer} from "node:net";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const pause=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
async function freePort() {
  const server=createServer();
  server.listen(0,"127.0.0.1");
  await once(server,"listening");
  const address=server.address();
  assert.ok(address && typeof address!=="string");
  server.close();
  await once(server,"close");
  return address.port;
}
class CDP {
  constructor(socket) {
    this.socket=socket;
    this.nextId=0;
    this.pending=new Map();
    socket.addEventListener("message",(event)=>{
      const msg=JSON.parse(event.data);
      if(!msg.id)return;
      const item=this.pending.get(msg.id);
      if(!item)return;
      this.pending.delete(msg.id);
      clearTimeout(item.timeout);
      if(msg.error)item.reject(Error(JSON.stringify(msg.error)));
      else item.resolve(msg.result ?? {});
    });
  }
  send(method,params={},sessionId) {
    const id=++this.nextId;
    return new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>{
        this.pending.delete(id);
        reject(Error("CDP timeout: "+method));
      },15000);
      this.pending.set(id,{resolve,reject,timeout});
      this.socket.send(JSON.stringify({id,method,params,sessionId}));
    });
  }
}
const cwd=fileURLToPath(new URL("../",import.meta.url));
const port=await freePort();
const url="http://127.0.0.1:"+port;
const nextCli=join(cwd,"node_modules","next","dist","bin","next");
const server=spawn(process.execPath,[nextCli,"start","--hostname","127.0.0.1","--port",String(port)],
  {cwd,env:{...process.env,APP_ORIGIN:url,NEXT_TELEMETRY_DISABLED:"1"},stdio:"ignore"});
const profile=await mkdtemp(join(tmpdir(),"m8-perf-chrome-"));
let chrome=null,socket=null;
async function eventually(check,message) {
  for(let i=0;i<130;i++) {
    const result=await check().catch(()=>null);
    if(result)return result;
    await pause(150);
  }
  throw Error(message);
}
try {
  await eventually(async()=>{if(server.exitCode!==null)throw Error("Next server exited");return (await fetch(url+"/api/health")).ok;},
    "production Next server failed to start");
  chrome=spawn(process.env.CHROME_BIN||"google-chrome",[
    "--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-background-networking",
    "--disable-extensions","--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=0","--user-data-dir="+profile,"about:blank"
  ],{stdio:"ignore"});
  const info=await eventually(async()=>{
    if(chrome.exitCode!==null)throw Error("Chrome exited");
    const lines=(await readFile(join(profile,"DevToolsActivePort"),"utf8")).trim().split("\n");
    return {port:lines[0],path:lines[1]};
  },"Chrome debugging endpoint unavailable");
  socket=new WebSocket("ws://127.0.0.1:"+info.port+info.path);
  await new Promise((resolve,reject)=>{
    socket.addEventListener("open",resolve,{once:true});
    socket.addEventListener("error",reject,{once:true});
  });
  const cdp=new CDP(socket);
  const target=await cdp.send("Target.createTarget",{url:"about:blank"});
  const attached=await cdp.send("Target.attachToTarget",{targetId:target.targetId,flatten:true});
  const session=attached.sessionId;
  await cdp.send("Page.enable",{},session);
  await cdp.send("Runtime.enable",{},session);
  await cdp.send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true},session);
  async function evaluate(expression) {
    const result=await cdp.send("Runtime.evaluate",{expression,returnByValue:true},session);
    if(result.exceptionDetails)throw Error("JS evaluation failed: "+expression.slice(0,90));
    return result.result?.value;
  }
  const measure=async()=>evaluate("(() => {const n=performance.getEntriesByType('navigation')[0]; const r=performance.getEntriesByType('resource').filter(x=>x.name.includes('/_next/static/') && x.name.includes('.js')); return {domContentLoadedMs:Math.round(n?.domContentLoadedEventEnd||0),loadEndMs:Math.round(n?.loadEventEnd||0),jsTransferBytes:r.reduce((a,x)=>a+x.transferSize,0),jsEncodedBytes:r.reduce((a,x)=>a+x.encodedBodySize,0),jsResources:r.length};})()");
  const samples=[];
  for(let i=0;i<3;i++) {
    await cdp.send("Page.navigate",{url:url+"/kurslar/python-temelleri/degiskenler-ve-turler"},session);
    await eventually(()=>evaluate("document.readyState==='complete' && !!document.querySelector('[data-lesson-step=\"3\"]')"),
      "Python lesson did not hydrate");
    const before=await measure();
    assert.equal(await evaluate("!!document.querySelector('.cm-editor')"),false,
      "Editor should not mount before Apply");
    await evaluate("(() => {window.__m8ApplyStart=performance.now();document.querySelector('[data-lesson-step=\"3\"]').click();return true;})()");
    await eventually(()=>evaluate("!!document.querySelector('.lesson-step-panel:not([hidden]) .cm-editor')"),
      "Python editor did not become ready");
    const applyMs=Math.round(await evaluate("performance.now()-window.__m8ApplyStart"));
    const after=await measure();
    assert.ok(applyMs>=0);
    samples.push({sample:i+1,initial:before,applyToEditorReadyMs:applyMs,
      incrementalEditorJsTransferBytes:Math.max(0,after.jsTransferBytes-before.jsTransferBytes),
      incrementalEditorJsEncodedBytes:Math.max(0,after.jsEncodedBytes-before.jsEncodedBytes)});
  }
  const median=key=>samples.map(s=>s[key]).sort((a,b)=>a-b)[1];
  const result={environment:"GitHub Actions headless Chrome 390px, local production Next",
    caveat:"synthetic navigation; cached transfers may be zero; not field Core Web Vitals",
    samples,medianApplyMs:median("applyToEditorReadyMs"),
    medianIncrementalEditorJsTransferBytes:median("incrementalEditorJsTransferBytes")};
  await writeFile(new URL("../perf-results.json",import.meta.url),JSON.stringify(result,null,2)+"\n");
  console.log("M8.0C browser baseline:",JSON.stringify(result));
  if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,
    "\n### M8.0C Browser performance baseline (390px Chrome)\n\n"+
    "3 real Python lesson navigations; median Apply-to-CodeMirror: **"+result.medianApplyMs+
    " ms**, incremental JavaScript transfer: **"+result.medianIncrementalEditorJsTransferBytes+
    " bytes**.\n\nSee browser artifact for individual navigation and encoded/transfer sizes. Synthetic, not production Web Vitals.\n");
} finally {
  socket?.close();
  chrome?.kill("SIGTERM");
  server.kill("SIGTERM");
  await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:150});
}
