// CI-only, repository authored/trusted Python snippets: NEVER run user submissions here.
import assert from "node:assert/strict";
import {mkdtemp,rm} from "node:fs/promises";
import {spawnSync} from "node:child_process";
import {tmpdir} from "node:os";
import {join} from "node:path";
import applied from "../src/data/python-applied-path.json" with {type:"json"};

const dir=await mkdtemp(join(tmpdir(),"devacademy-python-applied-"));
const python=process.env.PYTHON_BIN||"python";
let runs=0;
function evaluate(code,tag){
  const processResult=spawnSync(python,["-I","-B","-c",code],{
    cwd:dir,encoding:"utf8",timeout:6000,maxBuffer:64*1024,
    env:{...process.env,PYTHONIOENCODING:"utf-8"}
  });
  assert.equal(processResult.error,undefined,tag+" Python runtime unavailable: "+processResult.error);
  assert.equal(processResult.status,0,tag+" failed: "+processResult.stderr);
  assert.equal(processResult.stderr.trim(),"",tag+" unexpected stderr");
  runs++;
  return processResult.stdout.trim();
}
try{
  assert.equal(applied.length,5);
  for(const path of applied){
    assert.equal(path.levels.length,3);
    for(const task of path.levels){
      const tag=path.lessonId+"/"+task.id;
      const output=evaluate(task.code,tag);
      assert.equal(output,task.expected,"Real Python stdout differs from reviewed expected output: "+tag);
      assert.equal(task.choices.filter(c=>c.text===output).length,1,
        "Exactly one choice must be correct based on actual Python execution: "+tag);
      for(const answer of task.choices)
        assert.ok(answer.feedback.length>=30,"Meaningful feedback required for "+tag);
    }
    const own=path.independent;
    assert.equal(evaluate(own.modelCode,path.lessonId+"/reference"),own.expectedOutput,
      "Student-facing reference solution disagrees with expected example");
    assert.equal(evaluate(own.variationCode,path.lessonId+"/changed-input"),own.variationExpected,
      "Modified input scenario must have checked expected result");
    // Stubs have valid Python syntax without needing to produce a correct value.
    const syntax=spawnSync(python,["-I","-B","-c",
      "import ast,sys; ast.parse(sys.stdin.read())"],{
      input:own.starterCode,cwd:dir,encoding:"utf8",timeout:6000,maxBuffer:64*1024
    });
    assert.equal(syntax.status,0,path.lessonId+" starter invalid Python syntax: "+syntax.stderr);
  }
  assert.equal(runs,25);
  console.log("M9 Python applied path PASS: "+runs+
    " real Python executions (15 tier challenges and 10 independent reference/variant cases) + 5 starter syntax checks.");
}finally{
  await rm(dir,{force:true,recursive:true,maxRetries:3,retryDelay:100});
}
