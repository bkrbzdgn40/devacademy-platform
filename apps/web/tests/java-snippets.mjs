// CI-only: compile and execute repository-reviewed Java examples. Never pass user input here.
import assert from "node:assert/strict";
import {readFile,writeFile,mkdtemp,rm} from "node:fs/promises";
import {spawnSync} from "node:child_process";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {gradeSubmission} from "../src/server/grade.ts";
const base=fileURLToPath(new URL("../src/data/",import.meta.url));
const questions=JSON.parse(await readFile(join(base,"questions.json"),"utf8")).filter(x=>x.id.startsWith("java."));
const lessons=JSON.parse(await readFile(join(base,"lessons.json"),"utf8")).filter(x=>x.id.startsWith("lesson.java."));
const dir=await mkdtemp(join(tmpdir(),"devacademy-reviewed-java-"));
try {
  let verified=0;
  for(const snippet of [...lessons.map(x=>({id:x.id,code:x.code})),...questions]){
    await writeFile(join(dir,"Main.java"),snippet.code,{encoding:"utf8"});
    const compiled=spawnSync("javac",["-encoding","UTF-8","--release","21","-d",dir,join(dir,"Main.java")],{
      encoding:"utf8",timeout:9000,env:{...process.env,JAVA_TOOL_OPTIONS:""}
    });
    assert.equal(compiled.status,0,"Java compilation "+snippet.id+": "+compiled.stderr);
    const run=spawnSync("java",["-cp",dir,"Main"],{encoding:"utf8",timeout:9000,env:{...process.env,JAVA_TOOL_OPTIONS:""}});
    assert.equal(run.status,0,"Java execution "+snippet.id+": "+run.stderr);
    const actual=run.stdout.trim();
    if("options" in snippet){
      const match=snippet.options.find(x=>x.text===actual);
      assert.ok(match,"Java output missing from quiz choices "+snippet.id+" actual "+actual);
      const grade=gradeSubmission({questionId:snippet.id,optionId:match.id});
      assert.equal(grade.status,"graded");
      assert.equal(grade.correct,true,"Private answer key disagrees with actual Java output: "+snippet.id);
    }
    verified++;
  }
  console.log("Java reviewed snippets PASS: "+verified+" javac/java runs, all six answer keys agree.");
}finally{
  await rm(dir,{recursive:true,force:true,maxRetries:3,retryDelay:100});
}
