import test from "node:test";
import assert from "node:assert/strict";
import {caseBank} from "../src/exercises-private.mjs";
import {evaluateExercise,harnessPython,harnessJava} from "../src/evaluate-exercise.mjs";
import {multiDockerArgs} from "../src/run-multilang.mjs";

test("Python/Java harnesses receive public/private inputs, not trusted expectations",()=>{
  const py=harnessPython("def sum_even(numbers):\n return sum(numbers)","sum_even",[[2,3]]);
  assert.ok(py.includes("sum_even(*[[2,3]])"));
  assert.ok(!py.includes("expected"));
  const java=harnessJava("class Solution { static int clamp(int a,int b,int c){return a;} }","clamp",[7,0,10]);
  assert.ok(java.includes("Solution.clamp(7,0,10)"));
  assert.ok(java.includes("public class Main"));
  assert.throws(()=>harnessJava("x","clamp",["malicious"]),/INVALID_SUBMISSION/);
  assert.throws(()=>harnessPython("x".repeat(6001),"sum_even",[[1]]),/INVALID_SUBMISSION/);
});
test("trusted grader accepts correct Python/Java cases and rejects public-only cheating",async()=>{
  for(const exerciseId of ["python.sum-even","java.clamp"]){
    const bank=caseBank[exerciseId];
    assert.equal(bank.cases.length,4);
    assert.equal(bank.cases.filter(c=>c.public).length,2);
    const makeExecute=(overfit=false)=>{
      let seen=0;
      return async(script,{image})=>{
        assert.equal(image,"test-image");
        assert.ok(!script.includes("expected"));
        const index=seen++;
        return {status:"completed",exitCode:0,stdout:JSON.stringify(overfit&&index>=2?999:bank.cases[index].expected),stderr:"",durationMs:250};
      };
    };
    const accepted=await evaluateExercise({source:"sample code",exerciseId,exerciseRevision:1,image:"test-image",execute:makeExecute()});
    assert.equal(accepted.assessment.verdict,"passed");
    assert.equal(accepted.assessment.passed,4);
    const overfit=await evaluateExercise({source:"sample code",exerciseId,exerciseRevision:1,image:"test-image",execute:makeExecute(true)});
    assert.equal(overfit.assessment.verdict,"failed");
    assert.equal(overfit.assessment.passed,2);
    assert.equal(overfit.stdout,"");
    assert.ok(!JSON.stringify(overfit).includes("999"));
  }
});
test("Python/Java hardened Docker flags deny network, privilege and credentials",()=>{
  const name="devacademy-sandbox-"+"b".repeat(24);
  for(const runtimeId of ["python-3.12","java-21"]){
    const flags=multiDockerArgs({name,scriptPath:"/tmp/trusted-fixture",image:"python:3.12-alpine",runtimeId});
    for(const flag of ["--network=none","--read-only","--cap-drop=ALL","--cgroupns=private","--security-opt=no-new-privileges","--pids-limit","--memory","--memory-swap","--tmpfs","--pull=never","--user"])
      assert.ok(flags.includes(flag),runtimeId+" missing "+flag);
    assert.ok(!flags.includes("--privileged"));
    assert.equal(flags[flags.indexOf("--user")+1],"65534:65534");
  }
});
