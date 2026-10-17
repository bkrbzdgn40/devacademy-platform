import test from "node:test";
import assert from "node:assert/strict";
import { caseBank } from "../src/exercises-private.mjs";
import { evaluateExercise, harness, validExercise } from "../src/evaluate-exercise.mjs";
const source="function sumEven(numbers){return numbers.filter(n=>n%2===0).reduce((a,b)=>a+b,0)}";
const id="js.sum-even";
const image="node@sha256:"+"a".repeat(64);
function fakeExecution(values){
  let at=0;
  return async function(sourceText,{image:received}){
    assert.equal(received,image);
    assert.ok(sourceText.includes("const __fn"));
    assert.ok(!sourceText.includes("expected"));
    const value=values[at++];
    return {status:"completed",stdout:JSON.stringify(value),stderr:"",exitCode:0,durationMs:32};
  };
}
test("bank has public examples and worker-private hidden cases",()=>{
  for(const [key,entry] of Object.entries(caseBank)){
    assert.equal(validExercise(key,entry.revision),true);
    assert.equal(entry.cases.length,5);
    assert.equal(entry.cases.filter(c=>c.public).length,2);
    assert.equal(entry.cases.filter(c=>!c.public).length,3);
  }
  assert.equal(validExercise("unknown",1),false);
  assert.equal(validExercise(id,2),false);
  assert.ok(harness(source,"sumEven",[[1,2,3]]).includes("[1,2,3]"));
  assert.throws(()=>harness("x".repeat(6001),"sumEven",[[1]]),/INVALID_SUBMISSION/);
});
test("all pass results come from runner observations and trusted expectations",async()=>{
  const entry=caseBank[id];
  const out=await evaluateExercise({source,exerciseId:id,exerciseRevision:1,image,
    execute:fakeExecution(entry.cases.map(c=>c.expected))});
  assert.equal(out.status,"completed");
  assert.deepEqual(out.assessment,{verdict:"passed",passed:5,total:5,
    publicCases:[{label:"Karma pozitif ve negatifler",passed:true},{label:"Çift sayı bulunmuyor",passed:true}]});
  assert.equal(out.stdout,"");
  assert.equal(JSON.stringify(out).includes("2,4,6"),false);
});
test("a solution passing public tests but failing hidden cases must fail",async()=>{
  const entry=caseBank[id];
  const values=entry.cases.map((c,i)=>i<2?c.expected:999);
  const out=await evaluateExercise({source,exerciseId:id,exerciseRevision:1,image,execute:fakeExecution(values)});
  assert.equal(out.assessment.verdict,"failed");
  assert.equal(out.assessment.passed,2);
  assert.equal(out.assessment.total,5);
  assert.equal(out.assessment.publicCases.every(x=>x.passed),true);
  assert.equal(JSON.stringify(out).includes("999"),false);
});
test("runtime error, timeout and infrastructure failures never pass as wrong answers",async()=>{
  for(const status of ["runtime_error","timed_out","output_limit","infrastructure_error"]){
    const out=await evaluateExercise({source,exerciseId:id,exerciseRevision:1,image,
      execute:async()=>({status,stdout:"secret-string",stderr:"secret-string",exitCode:1,durationMs:20})});
    assert.equal(out.status,status);
    assert.equal(out.assessment,null);
    assert.equal(JSON.stringify(out).includes("secret-string"),false);
  }
});
test("malformed runner output cannot be counted as a passing test",async()=>{
  const out=await evaluateExercise({source,exerciseId:id,exerciseRevision:1,image,
    execute:async()=>({status:"completed",stdout:"not json",stderr:"",exitCode:0,durationMs:11})});
  assert.equal(out.assessment.verdict,"failed");
  assert.equal(out.assessment.passed,0);
});
