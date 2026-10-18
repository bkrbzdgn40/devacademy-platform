// Reviewed server-generated learning cases are executed in CI as real JS,
// Python and Java programs. No user-submitted code or untrusted runtime inputs.
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {transferLessonIds,normalizedAnswer} from "../src/server/transfer-missions.mjs";
import {adaptiveProblem} from "../src/server/adaptive-probes.mjs";

function run(program,args,options={}) {
  const result=spawnSync(program,args,{encoding:"utf8",timeout:8000,maxBuffer:8192,...options});
  assert.equal(result.status,0,(result.error?.message||"")+"\n"+result.stderr);
  return result.stdout.trim().split(/\r?\n/);
}
let validated=0;
for(const lessonId of transferLessonIds) {
  for(const focus of ["standard","a","b"]) for(const seed of [37,2801]) {
    const problem=adaptiveProblem(lessonId,seed,focus);
    let output;
    if(lessonId.startsWith("lesson.javascript.")) {
      output=run(process.execPath,["-e",problem.code]);
    }else if(lessonId.startsWith("lesson.python.")) {
      output=run("python",["-c",problem.code]);
    }else{
      const dir=mkdtempSync(join(tmpdir(),"devacademy-transfer-"));
      try {
        writeFileSync(join(dir,"Main.java"),problem.code);
        run("javac",["Main.java"],{cwd:dir});
        output=run("java",["-cp",dir,"Main"],{cwd:dir});
      }finally {rmSync(dir,{recursive:true,force:true});}
    }
    const lastTwo=output.slice(-2).map(normalizedAnswer);
    assert.deepEqual(lastTwo,problem.expected.map(normalizedAnswer),
      lessonId+" seed "+seed+" expected="+JSON.stringify(problem.expected));
    validated++;
  }
}
console.log("Counterfactual and adaptive diagnostic runtime PASS: "+validated+" real JS/Python/Java programs.");
