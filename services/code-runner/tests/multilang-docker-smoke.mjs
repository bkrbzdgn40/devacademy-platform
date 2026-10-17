import assert from "node:assert/strict";
import {evaluateExercise} from "../src/evaluate-exercise.mjs";
import {runIsolatedLanguage} from "../src/run-multilang.mjs";
const images={"python-3.12":"python:3.12-alpine","java-21":"eclipse-temurin:21-jdk-alpine"};
const cases=[
  {id:"python.sum-even",runtimeId:"python-3.12",
   correct:"def sum_even(numbers):\n    return sum(n for n in numbers if n % 2 == 0)",
   overfit:"def sum_even(numbers):\n    return 2 if numbers and numbers[0] == -3 else 0",
   crash:"def sum_even(numbers):\n    raise RuntimeError('student-private-string')"},
  {id:"java.clamp",runtimeId:"java-21",
   correct:"class Solution { public static int clamp(int v,int mn,int mx) { return Math.max(mn,Math.min(mx,v)); } }",
   overfit:"class Solution { public static int clamp(int v,int mn,int mx) { return v == 12 ? 10 : v == -4 ? 0 : 999; } }",
   crash:"class Solution { public static int clamp(int v,int mn,int mx) { throw new RuntimeException(\"student-private-string\"); } }"}
];
for(const testcase of cases){
  const args={exerciseId:testcase.id,exerciseRevision:1,image:images[testcase.runtimeId],
    execute:(source,{image})=>runIsolatedLanguage(source,{runtimeId:testcase.runtimeId,image})};
  const correct=await evaluateExercise({...args,source:testcase.correct});
  assert.equal(correct.status,"completed",JSON.stringify(correct));
  assert.equal(correct.assessment.verdict,"passed",JSON.stringify(correct));
  assert.equal(correct.assessment.passed,4);
  const overfit=await evaluateExercise({...args,source:testcase.overfit});
  assert.equal(overfit.status,"completed",JSON.stringify(overfit));
  assert.equal(overfit.assessment.verdict,"failed");
  assert.equal(overfit.assessment.passed,2);
  const fail=await evaluateExercise({...args,source:testcase.crash});
  assert.equal(fail.status,"runtime_error");
  assert.equal(fail.assessment,null);
  assert.ok(!JSON.stringify(fail).includes("student-private-string"));
  const secret=await runIsolatedLanguage(
    testcase.runtimeId==="python-3.12"?
      "import os\nprint(os.environ.get('RUNNER_WORKER_TOKEN','no-worker-secret'))":
      'public class Main {public static void main(String[] a) {System.out.println(System.getenv("RUNNER_WORKER_TOKEN")==null?"no-worker-secret":"leak");}}',
    {runtimeId:testcase.runtimeId,image:images[testcase.runtimeId]});
  assert.equal(secret.status,"completed",JSON.stringify(secret));
  assert.equal(secret.stdout.trim(),"no-worker-secret");
  console.log("Multilang sandbox PASS:",testcase.runtimeId,"correct/overfit/crash/no-secret");
}
