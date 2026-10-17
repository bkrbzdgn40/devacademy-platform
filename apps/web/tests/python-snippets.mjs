// CI-only: execute repository-reviewed educational Python snippets, never learner submissions.
import assert from "node:assert/strict";
import {readFile,mkdtemp,rm} from "node:fs/promises";
import {spawnSync} from "node:child_process";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {gradeSubmission} from "../src/server/grade.ts";

const base=fileURLToPath(new URL("../src/data/",import.meta.url));
const questions=JSON.parse(await readFile(join(base,"questions.json"),"utf8"))
  .filter(q=>q.id.startsWith("python."));
const lessons=JSON.parse(await readFile(join(base,"lessons.json"),"utf8"))
  .filter(l=>l.id.startsWith("lesson.python."));
const dir=await mkdtemp(join(tmpdir(),"devacademy-python-review-"));
try{
  assert.equal(lessons.length,5,"Python course must have five reviewed lessons");
  assert.equal(questions.length,10,"Python course must have ten reviewed quiz examples");
  let verified=0;
  for(const snippet of [...lessons.map(({id,code})=>({id,code})),...questions]){
    const python=process.env.PYTHON_BIN || "python";
    const run=spawnSync(python,["-I","-B","-c",snippet.code],{
      cwd:dir,encoding:"utf8",timeout:6000,maxBuffer:64*1024,
      env:{...process.env,PYTHONIOENCODING:"utf-8"}
    });
    assert.equal(run.error,undefined,"Python process unavailable for "+snippet.id+": "+run.error);
    assert.equal(run.status,0,"Python 3.12 execution failed for "+snippet.id+": "+run.stderr);
    assert.equal(run.stderr.trim(),"","Python wrote unexpected error output: "+snippet.id);
    const actual=run.stdout.trim();
    assert.ok(actual,"Python produced no output for "+snippet.id);
    if("options" in snippet){
      const match=snippet.options.find(o=>o.text===actual);
      assert.ok(match,"No public option matches real Python output for "+snippet.id+" ("+actual+")");
      const grade=gradeSubmission({questionId:snippet.id,optionId:match.id});
      assert.equal(grade.status,"graded");
      assert.equal(grade.correct,true,
        "Server-only answer key disagrees with Python output for "+snippet.id);
    }
    verified++;
  }
  console.log("Python reviewed snippets PASS: "+verified+" Python runs (five lessons, ten graded answer keys).");
}finally{
  await rm(dir,{recursive:true,force:true,maxRetries:3,retryDelay:100});
}
