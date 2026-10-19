// CI-only fixture verification. Never execute submitted student code here.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
const fixture=JSON.parse(readFileSync(new URL("./fixtures/m9-python-pilot-cases.json",import.meta.url),"utf8"));
const python=process.env.PYTHON_BIN||"python";
assert.equal(fixture.status,"not-piloted");
assert.equal(fixture.cases.length,5);
assert.equal(fixture.transfers.length,3);
const expectedLessons=["lesson.python.variables","lesson.python.conditions","lesson.python.loops","lesson.python.functions","lesson.python.collections"];
let count=0;
function actual(source,label){
  const run=spawnSync(python,["-I","-B","-c",source],{encoding:"utf8",timeout:6000,maxBuffer:65536,env:{...process.env,PYTHONIOENCODING:"utf-8"}});
  assert.equal(run.error,undefined,label+" Python unavailable: "+run.error);
  assert.equal(run.status,0,label+" execution failed: "+run.stderr);
  assert.equal(run.stderr,"",label+" unexpected stderr");
  count++;
  return run.stdout.replace(/\\r\\n/g,"\\n").trimEnd();
}
for(const [index,lesson] of fixture.cases.entries()){
  assert.equal(lesson.lessonId,expectedLessons[index]);
  assert.deepEqual(lesson.forms.map(x=>x.id),["A","B","C"]);
  assert.equal(new Set(lesson.forms.map(x=>x.expected)).size,3,lesson.lessonId+" expected outputs must differ");
  for(const form of lesson.forms){
    const label=lesson.lessonId+"/"+form.id;
    assert.ok(form.context.length>=35,label+" context too short");
    assert.ok(form.reasoningKey.length>=30,label+" reasoning key missing");
    assert.ok(form.likelyError.length>=25,label+" misconception missing");
    assert.equal(actual(form.code,label),form.expected,label+" stdout differs");
  }
}
for(const form of fixture.transfers){
  assert.ok(form.referenceCode.includes("return "),form.id+" reference must return a value");
  assert.ok(!form.starterCode.includes("return "),form.id+" starter must not solve task");
  assert.equal(actual(form.referenceCode,"transfer/"+form.id),form.expected);
}
assert.equal(count,18);
console.log("M9 Python pilot fixtures PASS: 15 unseen prediction forms + 3 model code-transfer programs (trusted reference only). Pilot results: NONE.");
