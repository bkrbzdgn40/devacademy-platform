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
  // M8.5: inspect a real hydrated prediction-first studio at 320px.
  await cdp.send("Page.navigate",{url:base+"/kurslar/javascript-temelleri/degiskenler"},sessionId);
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:
      "document.readyState==='complete' && !!document.querySelector('.learning-studio .studio-predict')",
      returnByValue:true},sessionId);
    return r.result?.value===true;
  },"Learning Studio did not hydrate in JavaScript lesson");
  const studioStart=await cdp.send("Runtime.evaluate",{expression:
    "({hasLockedSource:!!document.querySelector('.studio-code'),revealed:!!document.querySelector('.studio-review'),inputs:document.querySelectorAll('.studio-inputs input').length})",
    returnByValue:true},sessionId);
  assert.deepEqual(studioStart.result.value,{hasLockedSource:true,revealed:false,inputs:2});
  for(const [index,value] of [[0,"7"],[1,"9"]]){
    await cdp.send("Runtime.evaluate",{expression:
      "document.querySelectorAll('.studio-inputs input')["+index+"].focus()",returnByValue:true},sessionId);
    await cdp.send("Input.insertText",{text:value},sessionId);
  }
  await cdp.send("Runtime.evaluate",{expression:
    "document.querySelector('.studio-predict button[type=submit]').click()",returnByValue:true},sessionId);
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:
      "!!document.querySelector('.studio-execution [data-studio-next]')",
      returnByValue:true},sessionId);
    return r.result?.value===true;
  },"Learning Studio did not lock student prediction");
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:
      "(() => {const next=document.querySelector('[data-studio-next]');if(next&&!next.disabled)next.click();return !!document.querySelector('.studio-review');})()",
      returnByValue:true},sessionId);
    return r.result?.value===true;
  },"Learning Studio did not reveal output comparison after tracing",100);
  const studioFinal=await cdp.send("Runtime.evaluate",{expression:
    "({results:[...document.querySelectorAll('.studio-review-grid>div')].map(el=>el.textContent),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1})",
    returnByValue:true},sessionId);
  assert.equal(studioFinal.result.value.overflow,false,"Studio overflows 320px mobile");
  assert.equal(studioFinal.result.value.results.length,2);
  assert.ok(studioFinal.result.value.results.every(x=>x.includes("Doğru tahmin")),
    "Learning Studio expected 7/9 for the initial JS case");

  // M8.5.1: representative new lessons in all three languages must display
  // their own authored trace and deeper concept lens at 320px.
  for(const [path,stepIndex] of [
    ["/kurslar/javascript-temelleri/esitlik",0],
    ["/kurslar/java-temelleri/metotlar-ve-return",1],
    ["/kurslar/python-temelleri/listeler-ve-sozlukler",1]
  ]){
    await cdp.send("Page.navigate",{url:base+path},sessionId);
    await waitFor(async()=>{
      const result=await cdp.send("Runtime.evaluate",{expression:
        "(() => {if(document.readyState!=='complete')return false;"+
        "const b=document.querySelector('[data-lesson-step=\""+stepIndex+"\"]');"+
        "if(b&&b.getAttribute('aria-current')!=='step')b.click();"+
        "return !!document.querySelector('.lesson-step-panel:not([hidden]) .learning-studio .studio-predict') && "+
        "!!document.querySelector('.lesson-step-panel:not([hidden]) .lesson-depth');})()",
        returnByValue:true},sessionId);
      return result.result?.value===true;
    },"M8.5.1 studio and concept lens did not load at 320px: "+path,100);
    const result=await cdp.send("Runtime.evaluate",{expression:
      "({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,"+
      "inputs:document.querySelectorAll('.lesson-step-panel:not([hidden]) .studio-inputs input').length,"+
      "details:document.querySelectorAll('.lesson-step-panel:not([hidden]) .lesson-depth details').length})",
      returnByValue:true},sessionId);
    assert.deepEqual(result.result.value,{overflow:false,inputs:2,details:2},
      "M8.5.1 mobile content integration mismatch at "+path);
  }

  // M8.6A: check computed styles, not just raw CSS declarations.
  await cdp.send("Page.navigate",{url:base+"/"},sessionId);
  const renderedTheme=await waitFor(async()=>{
    const result=await cdp.send("Runtime.evaluate",{expression:
      "(() => {const root=getComputedStyle(document.documentElement);"+
      "const button=document.querySelector('.ui-button-primary');"+
      "const card=document.querySelector('.feature-card.ui-card');"+
      "if(document.readyState!=='complete'||!button||!card)return null;"+
      "return {scheme:root.colorScheme,olive:root.getPropertyValue('--color-olive-800').trim(),"+
      "canvas:root.getPropertyValue('--color-cream').trim(),"+
      "text:getComputedStyle(document.body).color,"+
      "action:getComputedStyle(button).backgroundColor,"+
      "card:getComputedStyle(card).backgroundColor};})()",
      returnByValue:true},sessionId);
    return result.result?.value||null;
  },"Olive Earth palette not loaded in production browser");
  assert.deepEqual(renderedTheme,{
    scheme:"light",olive:"#485c32",canvas:"#f8f5ef",
    text:"rgb(47, 42, 34)",action:"rgb(72, 92, 50)",
    card:"rgb(255, 253, 250)"
  },"M8.6A warm theme did not reach the rendered UI");

  await cdp.send("Page.navigate",{url:base+"/kurslar/javascript-temelleri/degiskenler"},sessionId);
  await waitFor(async()=>{
    const result=await cdp.send("Runtime.evaluate",{expression:
      "document.readyState==='complete' && !!document.querySelector('.lesson-step-panel:not([hidden]) .learning-studio')",
      returnByValue:true},sessionId);
    return result.result?.value===true;
  },"M8.6A studio theme page did not hydrate");
  const studioPalette=await cdp.send("Runtime.evaluate",{expression:
    "(() => {const sample=document.querySelector('.studio-code');"+
    "const panel=document.querySelector('.learning-studio');"+
    "return {sample:getComputedStyle(sample).backgroundColor,panel:getComputedStyle(panel).backgroundColor};})()",
    returnByValue:true},sessionId);
  assert.deepEqual(studioPalette.result.value,{
    sample:"rgb(37, 31, 26)",panel:"rgb(255, 253, 250)"
  },"Warm studio chrome must retain a readable cocoa code surface");

  // M8.6A.1: real Chrome interaction, persistence, OS-following preference.
  // Start with system: no persisted theme and a light OS at this point.
  await cdp.send("Page.navigate",{url:base+"/"},sessionId);
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:
      "document.readyState==='complete' && !!document.querySelector('.theme-control select')",
      returnByValue:true},sessionId);
    return r.result?.value===true;
  },"Theme switcher did not hydrate");
  const selectTheme=(value)=>cdp.send("Runtime.evaluate",{expression:
    "(() => {const x=document.querySelector('.theme-control select'); x.value="+JSON.stringify(value)+
    ";x.dispatchEvent(new Event('change',{bubbles:true}));return true;})()",
    returnByValue:true},sessionId);
  // M8.6B.1: native <option> popup must inherit the actual chosen scheme
  // and carry explicit theme colors, not the browser's default white menu.
  const optionPalette=async()=> {
    const response=await cdp.send("Runtime.evaluate",{expression:
      "(() => {const select=document.querySelector('.theme-control select');"+
      "const option=select.querySelector('option[value=system]');"+
      "const s=getComputedStyle(select),o=getComputedStyle(option);"+
      "return {scheme:s.colorScheme,selectBg:s.backgroundColor,"+
      "optionBg:o.backgroundColor,optionInk:o.color};})()",
      returnByValue:true},sessionId);
    return response.result.value;
  };
  assert.deepEqual(await optionPalette(),{
    scheme:"light",selectBg:"rgb(255, 253, 250)",
    optionBg:"rgb(255, 253, 250)",optionInk:"rgb(47, 42, 34)"
  },"Light appearance dropdown options must use warm paper and dark ink");
  await selectTheme("dark");
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:
      "document.documentElement.dataset.theme==='dark' && localStorage.getItem('devacademy-theme')==='dark'",
      returnByValue:true},sessionId);
    return r.result?.value===true;
  },"Selecting dark mode did not persist and apply");
  const darkColors=await waitFor(async()=>{
    const result=await cdp.send("Runtime.evaluate",{expression:
      "(() => {const root=document.documentElement; const style=getComputedStyle(root);"+
      "const panel=document.querySelector('.feature-card');"+
      "const button=document.querySelector('.ui-button-primary');"+
      "return {scheme:style.colorScheme,background:getComputedStyle(document.body).color,"+
      "panel:getComputedStyle(panel).backgroundColor,action:getComputedStyle(button).backgroundColor,"+
      "select:document.querySelector('.theme-control select').value,overflow:root.scrollWidth>root.clientWidth+1};})()",
      returnByValue:true},sessionId);
    // CTA background-color transitions for 140ms. Inspect its *settled* color,
    // not a transitional frame immediately after changing the HTML attribute.
    return result.result?.value?.action==="rgb(186, 204, 150)"?result.result.value:null;
  },"Dark olive primary button did not settle after theme switch");
  assert.deepEqual(darkColors,{scheme:"dark",background:"rgb(245, 239, 229)",
    panel:"rgb(41, 39, 32)",action:"rgb(186, 204, 150)",select:"dark",overflow:false},
    "Dark olive/espresso palette did not render correctly");
  assert.deepEqual(await optionPalette(),{
    scheme:"dark",selectBg:"rgb(41, 39, 32)",
    optionBg:"rgb(41, 39, 32)",optionInk:"rgb(245, 239, 229)"
  },"Dark appearance dropdown options must use espresso and warm light text");
  await cdp.send("Page.navigate",{url:base+"/kurslar/javascript-temelleri/degiskenler"},sessionId);
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:
      "document.readyState==='complete' && document.documentElement.dataset.theme==='dark' && "+
      "!!document.querySelector('.lesson-step-panel:not([hidden]) .learning-studio')",
      returnByValue:true},sessionId);
    return r.result?.value===true;
  },"Dark selection was lost on a new lesson page");
  const darkLesson=await cdp.send("Runtime.evaluate",{expression:
    "(() => {const e=document.documentElement; return {"+
    "studio:getComputedStyle(document.querySelector('.learning-studio')).backgroundColor,"+
    "source:getComputedStyle(document.querySelector('.studio-code')).backgroundColor,"+
    "overflow:e.scrollWidth>e.clientWidth+1};})()",
    returnByValue:true},sessionId);
  assert.deepEqual(darkLesson.result.value,{
    studio:"rgb(41, 39, 32)",source:"rgb(21, 18, 15)",overflow:false
  },"Learning Studio dark surfaces are inconsistent");

  // Switching to System follows a simulated OS setting without storing an override.
  await cdp.send("Emulation.setEmulatedMedia",{
    features:[{name:"prefers-color-scheme",value:"dark"}]},sessionId);
  await selectTheme("system");
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:
      "document.documentElement.dataset.theme==='dark' && "+
      "document.documentElement.dataset.themePreference==='system' && "+
      "localStorage.getItem('devacademy-theme')===null",
      returnByValue:true},sessionId);
    return r.result?.value===true;
  },"System preference did not clear manual override");
  await cdp.send("Emulation.setEmulatedMedia",{
    features:[{name:"prefers-color-scheme",value:"light"}]},sessionId);
  const emulated=await cdp.send("Runtime.evaluate",{expression:
    "window.matchMedia('(prefers-color-scheme: dark)').matches",
    returnByValue:true},sessionId);
  assert.equal(emulated.result.value,false,"Chrome did not emulate a light OS scheme");
  // CDP emulation does not always raise MediaQueryList 'change' like a real
  // OS setting change. The app also rechecks when the tab regains focus.
  await cdp.send("Runtime.evaluate",{expression:
    "window.dispatchEvent(new Event('focus'))",returnByValue:true},sessionId);
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:
      "document.documentElement.dataset.theme==='light' && document.documentElement.dataset.themePreference==='system'",
      returnByValue:true},sessionId);
    return r.result?.value===true;
  },"System theme did not follow OS media change");

  // Explicit light always wins over a dark system preference.
  await cdp.send("Emulation.setEmulatedMedia",{
    features:[{name:"prefers-color-scheme",value:"dark"}]},sessionId);
  await selectTheme("light");
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:
      "document.documentElement.dataset.theme==='light' && localStorage.getItem('devacademy-theme')==='light'",
      returnByValue:true},sessionId);
    return r.result?.value===true;
  },"Explicit light preference did not override dark OS");

  // M8.6B: actual search/clear and directly linked lesson interaction on 320px.
  await cdp.send("Emulation.setDeviceMetricsOverride",{
    width:320,height:850,deviceScaleFactor:1,mobile:true
  },sessionId);
  await cdp.send("Page.navigate",{url:base+"/kurslar"},sessionId);
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:
      "document.readyState==='complete' && !!document.querySelector('#course-search') && "+
      "document.querySelectorAll('.path-card').length===3",
      returnByValue:true},sessionId);
    return r.result?.value===true;
  },"M8.6B explorer did not render three verified courses");
  await cdp.send("Runtime.evaluate",{expression:
    "document.querySelector('#course-search').focus()",returnByValue:true},sessionId);
  await cdp.send("Input.insertText",{text:"Promise"},sessionId);
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:
      "document.querySelectorAll('.path-card').length===1 && "+
      "!!document.querySelector('.path-matches a[href$=\"asenkron-temeller\"]')",
      returnByValue:true},sessionId);
    return r.result?.value===true;
  },"M8.6B Promise search failed to link to its actual lesson");
  let mobile=await cdp.send("Runtime.evaluate",{expression:diagnostic,returnByValue:true},sessionId);
  assert.ok(mobile.result.value.scrollWidth<=mobile.result.value.viewport+1,
    "M8.6B course search overflows at 320px: "+JSON.stringify(mobile.result.value));
  await cdp.send("Runtime.evaluate",{expression:
    "document.querySelector('.explorer-search-row button').click()",
    returnByValue:true},sessionId);
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:
      "document.querySelectorAll('.path-card').length===3 && !document.querySelector('#course-search').value",
      returnByValue:true},sessionId);
    return r.result?.value===true;
  },"M8.6B course-search clear control did not work");
  await cdp.send("Runtime.evaluate",{expression:
    "document.querySelector('#course-search').focus()",returnByValue:true},sessionId);
  await cdp.send("Input.insertText",{text:"olmayan yazılım"},sessionId);
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:
      "document.querySelectorAll('.path-card').length===0 && !!document.querySelector('.explorer-empty')",
      returnByValue:true},sessionId);
    return r.result?.value===true;
  },"M8.6B empty search state did not render");
  // Verify home progression never fabricates account completion when no DB exists.
  await cdp.send("Page.navigate",{url:base+"/"},sessionId);
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:
      "document.readyState==='complete' && !!document.querySelector('.journey-card') && "+
      "!document.querySelector('.journey-card [role=status]')",
      returnByValue:true},sessionId);
    return r.result?.value===true;
  },"M8.6B home personalized panel did not resolve its initial state");
  const discoveryHome=await cdp.send("Runtime.evaluate",{expression:
    "(() => {const d=document.documentElement;return {"+
    "paths:document.querySelectorAll('.home-path-grid .path-card').length,"+
    "radar:document.querySelectorAll('.radar-source').length,"+
    "newsPlaceholder:document.body.textContent.includes('Canlı haber akışı henüz bağlı değil'),"+
    "resume:!!document.querySelector('.journey-card a[href=\"/kurslar\"]'),"+
    "overflow:d.scrollWidth>d.clientWidth+1};})()",
    returnByValue:true},sessionId);
  assert.deepEqual(discoveryHome.result.value,{paths:3,radar:3,
    newsPlaceholder:true,resume:true,overflow:false},
    "M8.6B home orientation/radar unconfigured state invalid");
  // The same new cards must render dark; keep earlier theme tests intact.
  await cdp.send("Runtime.evaluate",{expression:
    "(() => {const x=document.querySelector('.theme-control select');"+
    "x.value='dark';x.dispatchEvent(new Event('change',{bubbles:true}));})()",
    returnByValue:true},sessionId);
  await waitFor(async()=>{
    const r=await cdp.send("Runtime.evaluate",{expression:
      "document.documentElement.dataset.theme==='dark' && "+
      "getComputedStyle(document.querySelector('.home-path-grid .path-card')).backgroundColor==='rgb(41, 39, 32)'",
      returnByValue:true},sessionId);
    return r.result?.value===true;
  },"M8.6B new course cards do not inherit the dark palette");
  await cdp.send("Runtime.evaluate",{expression:
    "(() => {const x=document.querySelector('.theme-control select');"+
    "x.value='light';x.dispatchEvent(new Event('change',{bubbles:true}));})()",
    returnByValue:true},sessionId);

  console.log("Responsive Chrome smoke PASS: "+count+" page/viewport cases plus open discovery, guided Apply mobile Learning Studio, and M8.5.1 expanded lessons.");
} catch(error){
  console.error("Production server output:",serverLog);
  throw error;
} finally{
  socket?.close();
  chrome?.kill("SIGTERM");
  next.kill("SIGTERM");
  await rm(profile,{force:true,recursive:true,maxRetries:5,retryDelay:200});
}
