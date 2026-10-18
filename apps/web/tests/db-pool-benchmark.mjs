// Disposable-DB query pressure measurement. Never reads/writes learner data.
import assert from "node:assert/strict";
import {performance} from "node:perf_hooks";
import {appendFileSync} from "node:fs";
import {database} from "../src/server/db.mjs";

const pool=database(),count=40;
const times=[];
let maxTotal=0,maxIdle=0,maxWaiting=0;
function sample() {
  maxTotal=Math.max(maxTotal,pool.totalCount);
  maxIdle=Math.max(maxIdle,pool.idleCount);
  maxWaiting=Math.max(maxWaiting,pool.waitingCount);
}
const interval=setInterval(sample,5);
try {
  const completed=await Promise.all(Array.from({length:count},async()=>{
    const started=performance.now();
    await pool.query("SELECT pg_sleep(0.025)");
    times.push(performance.now()-started);
    sample();
  }));
  assert.equal(completed.length,count);
  sample();
  assert.ok(maxTotal<=10,"Pool connection limit unexpectedly exceeded");
  assert.equal(pool.waitingCount,0);
  const sorted=times.sort((a,b)=>a-b);
  const pct=(n)=>Math.round(sorted[Math.ceil(n*sorted.length)-1]*10)/10;
  const data={mode:"throwaway-postgres",queries:count,configuredMax:10,
    peakConnections:maxTotal,peakIdle:maxIdle,peakWaiting:maxWaiting,
    p50Ms:pct(.5),p95Ms:pct(.95),maxMs:pct(1)};
  console.log("M8.0C DB pool:",JSON.stringify(data));
  if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    "\n### M8.0C PostgreSQL pool baseline (disposable instance)\n\n"+
    "40 concurrent 25ms read-only queries. Peak connections: **"+maxTotal+
    "/10**, waiting: **"+maxWaiting+"**, p50 **"+data.p50Ms+
    "ms**, p95 **"+data.p95Ms+"ms**. Not production load data.\n");
} finally {
  clearInterval(interval);
  await pool.end();
}
