// Execute every authored source with the real runtime rather than trusting the
// hand-authored trace alone. This is CI-only reviewed source, NOT learner code.
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {studioLessons,buildStudioScenario,normalizeStudioAnswer}
  from "../src/lib/studio-scenarios.mjs";

function run(cmd,args,opts={}) {
  const result=spawnSync(cmd,args,{encoding:"utf8",timeout:9000,maxBuffer:16384,...opts});
  assert.equal(result.status,0,(result.error?.message??"")+"\n"+result.stderr);
  return result.stdout.trim().split(/\r?\n/);
}
let checked=0;
for(const lesson of studioLessons) {
  for(let variant=0;variant<3;variant++) {
    const scenario=buildStudioScenario(lesson,variant);
    let stdout;
    if(lesson.includes(".javascript.")){
      stdout=run(process.execPath,["-e",scenario.code]);
    }else if(lesson.includes(".python.")){
      stdout=run("python",["-c",scenario.code]);
    }else{
      const dir=mkdtempSync(join(tmpdir(),"devacademy-studio-"));
      try {
        writeFileSync(join(dir,"Main.java"),scenario.code,{flag:"wx"});
        run("javac",["Main.java"],{cwd:dir});
        stdout=run("java",["-cp",dir,"Main"],{cwd:dir});
      }finally{rmSync(dir,{recursive:true,force:true});}
    }
    const actual=stdout.slice(-2).map(normalizeStudioAnswer);
    const predicted=scenario.expected.map(normalizeStudioAnswer);
    assert.deepEqual(actual,predicted,lesson+" variant "+variant);
    const trace=scenario.steps.at(-1).outputs.map(x=>normalizeStudioAnswer(x.value));
    assert.deepEqual(trace,stdout.map(normalizeStudioAnswer),
      lesson+" trace misses real console side effects");
    checked++;
  }
}
console.log("M8.5 studio real-runtime fixtures PASS: "+checked+" independent Node/Java/Python cases.");
