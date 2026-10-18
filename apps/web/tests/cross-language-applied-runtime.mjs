// Run ONLY authored fixtures committed to the repository, never student code.
import assert from "node:assert/strict";
import {mkdtemp,rm,writeFile} from "node:fs/promises";
import {spawnSync} from "node:child_process";
import {tmpdir} from "node:os";
import {join} from "node:path";
import javascript from "../src/data/javascript-applied-path.json" with {type:"json"};
import java from "../src/data/java-applied-path.json" with {type:"json"};
const dir=await mkdtemp(join(tmpdir(),"devacademy-cross-language-applied-"));
let checked=0,syntax=0;
const binary=process.execPath;
function run(cmd,args,tag,options={}){
  const result=spawnSync(cmd,args,{
    cwd:dir,encoding:"utf8",timeout:12000,maxBuffer:64*1024,
    env:{...process.env,JAVA_TOOL_OPTIONS:""},...options
  });
  assert.equal(result.error,undefined,tag+": process failed "+result.error);
  assert.equal(result.status,0,tag+": "+(result.stderr||result.stdout));
  return result.stdout.trim();
}
async function evaluate(language,source,tag){
  let output;
  if(language==="javascript"){
    output=run(binary,["-e",source],tag);
  }else{
    await writeFile(join(dir,"Main.java"),source,{encoding:"utf8"});
    run("javac",["-encoding","UTF-8","--release","21","-d",dir,
      join(dir,"Main.java")],tag+"/compile");
    output=run("java",["-cp",dir,"Main"],tag+"/run");
  }
  checked++;
  return output;
}
try{
  assert.equal(javascript.length,7);assert.equal(java.length,3);
  for(const track of [...javascript,...java]){
    assert.equal(track.levels.length,3,track.lessonId);
    for(const level of track.levels){
      const tag=track.lessonId+"/"+level.id;
      const actual=await evaluate(track.language,level.code,tag);
      assert.equal(actual,level.expected,
        "Actual "+track.language+" stdout disagrees with expected answer: "+tag);
      assert.equal(level.choices.filter(x=>x.text===actual).length,1,
        "Exactly one answer must match actual runtime: "+tag);
    }
    const own=track.independent;
    assert.equal(await evaluate(track.language,own.modelCode,
      track.lessonId+"/reference"),own.expectedOutput);
    assert.equal(await evaluate(track.language,own.variationCode,
      track.lessonId+"/new-input"),own.variationExpected);
    if(track.language==="javascript"){
      run(binary,["--check","-"],track.lessonId+"/starter",{
        input:own.starterCode
      });
    }else{
      await writeFile(join(dir,"Main.java"),own.starterCode,{encoding:"utf8"});
      run("javac",["-encoding","UTF-8","--release","21","-d",dir,
        join(dir,"Main.java")],track.lessonId+"/starter-compile");
    }
    syntax++;
  }
  assert.equal(checked,50);
  assert.equal(syntax,10);
  console.log("M9 Java/JavaScript reviewed applied path PASS: "+checked+
    " actual runtimes (30 progressive + 20 reference/new-input cases), "+
    syntax+" starter syntax/compile checks.");
}finally{await rm(dir,{recursive:true,force:true,maxRetries:5,retryDelay:100});}
