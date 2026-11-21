// Real isolated grading of the nine authored transfer functions.
// Never execute learner source on the Next server or on this CI host.
import assert from "node:assert/strict";
import {evaluateExercise} from "../src/evaluate-exercise.mjs";
import {runIsolatedJavaScript} from "../src/run-isolated.mjs";
import {runIsolatedLanguage} from "../src/run-multilang.mjs";
import {caseBank} from "../src/exercises-private.mjs";

const solutions=[
  ["transfer.js.snapshot","nodejs-24",
   "function snapshotScore(score,delta){const before=score;const profile={score};profile.score+=delta;return [before,profile.score]}"],
  ["transfer.js.equality","nodejs-24",
   "function matchNumericId(rawId,expectedId){if(typeof rawId==='string'&&rawId.trim()==='')return false;return Number(rawId)===expectedId;}"],
  ["transfer.js.map","nodejs-24",
   "function scaleCopy(values,factor){return values.map(n=>n*factor)}"],
  ["transfer.js.functions","nodejs-24",
   "function computePaceScore(laps,perLap=15,bonus=5){return laps*perLap+bonus;}"],
  ["transfer.js.scope","nodejs-24",
   "function trackQuota(initialQuota,localQuota,globalDelta){let quota=initialQuota;let localResult;{let quota=localQuota+2;localResult=quota;}quota+=globalDelta;return [localResult,quota];}"],
  ["transfer.js.filter","nodejs-24",
   "function sumQualifiedOrders(amounts,minAmount){return amounts.filter(n=>n>=minAmount).reduce((s,n)=>s+n,0);}"],
  ["transfer.js.async","nodejs-24",
   "async function resolveAlertBatch(urgentCount,normalCount,limit){const u=Math.max(0,urgentCount);const n=Math.max(0,normalCount);const cap=Math.max(0,limit);const accU=Math.min(u,cap);const accN=Math.min(n,cap-accU);return [accU,accN,u+n-accU-accN];}"],
  ["transfer.java.divide","java-21",
   "class Solution {public static double exactDivide(int n,int d){return (double)n/d;}}"],
  ["transfer.java.methods","java-21",
   "class Solution {public static int netShippingFee(int w,int r,int d){if(w<=0)return 0;int net=w*r-d;return net<0?0:net;}}"],
  ["transfer.java.overload","java-21",
   "class Base {int original;Base(int x){original=x;}int speak(){return original;}} "+
   "class Dog extends Base {int extra;Dog(int x,int y){super(x);extra=y;}int speak(int n){return n+extra;}} "+
   "class Solution {public static int combineSounds(int b,int e,int v){Dog d=new Dog(b,e);return d.speak()+d.speak(v);}}"],
  ["transfer.python.range","python-3.12",
   "def sum_exclusive(start,stop):\n    return sum(range(start,stop))"],
  ["transfer.python.return","python-3.12",
   "def return_product(value,factor):\n    return value * factor"],
  ["transfer.python.format-total","python-3.12",
   "def format_total(unit_price_text,quantity,delivery_fee):\n    return f\"{float(unit_price_text) * quantity + delivery_fee:.2f}\""],
  ["transfer.python.shipping-fee","python-3.12",
   "def shipping_fee(total):\n    if total >= 500:\n        return 0\n    elif total >= 200:\n        return 30\n    return 50"],
  ["transfer.python.low-stock","python-3.12",
   "def low_stock(stock,wanted,minimum):\n    return [n for n in wanted if stock.get(n, 0) < minimum]"]
];
const images={"nodejs-24":"node:24-alpine","python-3.12":"python:3.12-alpine",
  "java-21":"eclipse-temurin:21-jdk-alpine"};
for(const [exerciseId,runtimeId,source] of solutions) {
  const execute=runtimeId==="nodejs-24"?runIsolatedJavaScript:
    (program,{image})=>runIsolatedLanguage(program,{runtimeId,image});
  const result=await evaluateExercise({
    source,exerciseId,exerciseRevision:1,image:images[runtimeId],execute
  });
  assert.equal(result.status,"completed",JSON.stringify({exerciseId,result}));
  assert.equal(result.assessment.verdict,"passed",JSON.stringify({exerciseId,result}));
  assert.equal(result.assessment.passed,caseBank[exerciseId].cases.length);
  assert.equal(result.stdout,"");
  assert.equal(result.stderr,"");
  console.log("Independent code-writing PASS:",exerciseId,runtimeId,result.assessment.total+" cases");
}
// A hardcoded public-answer lookup must never earn code evidence.
const overfit=[
  ["transfer.js.snapshot","nodejs-24",
   "function snapshotScore(s,d){return s===6?[6,9]:s===8?[8,6]:[0,0]}"],
  ["transfer.java.divide","java-21",
   "class Solution {public static double exactDivide(int n,int d){return n==7?3.5:n==8?2:0;}}"],
  ["transfer.python.range","python-3.12",
   "def sum_exclusive(a,b):\n    return 9 if a==2 else 0"]
];
for(const [exerciseId,runtimeId,source] of overfit) {
  const execute=runtimeId==="nodejs-24"?runIsolatedJavaScript:
    (program,{image})=>runIsolatedLanguage(program,{runtimeId,image});
  const result=await evaluateExercise({source,exerciseId,exerciseRevision:1,image:images[runtimeId],execute});
  assert.equal(result.status,"completed");
  assert.equal(result.assessment.verdict,"failed",exerciseId);
  assert.equal(result.assessment.publicCases.every(c=>c.passed),true);
  assert.ok(result.assessment.passed<result.assessment.total);
  console.log("Public-example overfit correctly rejected:",exerciseId);
}
