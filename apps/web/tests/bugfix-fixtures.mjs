// CI-only: independently execute reviewed corrections for each authored diagnostic.
// Source below is maintained by curriculum authors, never learner-submitted code.
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtemp,writeFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {readFileSync} from "node:fs";
import {gradeSubmission} from "../src/server/grade.ts";

const guide=JSON.parse(readFileSync(new URL("../src/data/lesson-guides.json",import.meta.url),"utf8"));
const questions=JSON.parse(readFileSync(new URL("../src/data/questions.json",import.meta.url),"utf8"));
const samples={
 "debug.java.variables":{lang:"java",code:'class Main {public static void main(String[] args){double result=5.0/2; System.out.println(result);}}',out:"2.5"},
 "debug.java.methods":{lang:"java",code:'class Main {static int square(int n){return n*n;} public static void main(String[] args){System.out.println(square(4));}}',out:"16"},
 "debug.java.polymorphism":{lang:"java",code:'class Main {static class Animal{String speak(){return "?";}} static class Dog extends Animal{@Override String speak(){return "Woof";}}public static void main(String[] args){Animal a=new Dog();System.out.println(a.speak());}}',out:"Woof"},
 "debug.python.variables":{lang:"python",code:'age = 20\nprint(f"Yaş: {age}")',out:"Yaş: 20"},
 "debug.python.conditions":{lang:"python",code:'age = 20\nif age >= 18:\n    print("Yetişkin")\nelse:\n    print("Genç")',out:"Yetişkin"},
 "debug.python.loops":{lang:"python",code:'total = 0\nfor n in range(1, 6):\n    total += n\nprint(total)',out:"15"},
 "debug.python.functions":{lang:"python",code:'def double(n):\n    return n * 2\n\nresult = double(4)\nprint(result)',out:"8"},
 "debug.python.collections":{lang:"python",code:'person = {"name": "Ada"}\nprint(person.get("city", "bilinmiyor"))',out:"bilinmiyor"}
};
assert.deepEqual(Object.keys(samples).sort(),guide.map(x=>x.questionId).sort());
const dir=await mkdtemp(join(tmpdir(),"devacademy-reviewed-debug-"));
try{
 let verified=0;
 for(const [id,fixture] of Object.entries(samples)){
   const question=questions.find(x=>x.id===id);
   assert.ok(question,"No published diagnostic "+id);
   const correct=question.options.filter(o=>gradeSubmission({questionId:id,optionId:o.id}).correct);
   assert.equal(correct.length,1,"Each reviewed task must have one correct option");
   const wrong=question.options.filter(o=>o.id!==correct[0].id);
   assert.ok(wrong.every(o=>gradeSubmission({questionId:id,optionId:o.id}).tailoredFeedback));
   let run;
   if(fixture.lang==="python"){
     run=spawnSync(process.env.PYTHON_BIN || "python",["-I","-B","-c",fixture.code],{
       cwd:dir,encoding:"utf8",timeout:9000,env:{...process.env,PYTHONIOENCODING:"utf-8"}
     });
   }else{
     await writeFile(join(dir,"Main.java"),fixture.code);
     const compiled=spawnSync("javac",["-encoding","UTF-8","--release","21","-d",dir,join(dir,"Main.java")],{
       cwd:dir,encoding:"utf8",timeout:9000,env:{...process.env,JAVA_TOOL_OPTIONS:""}
     });
     assert.equal(compiled.status,0,id+" failed compilation: "+compiled.stderr);
     run=spawnSync("java",["-cp",dir,"Main"],{cwd:dir,encoding:"utf8",timeout:9000,env:{...process.env,JAVA_TOOL_OPTIONS:""}});
   }
   assert.equal(run.error,undefined,"missing runtime for "+id);
   assert.equal(run.status,0,id+" failed execution: "+run.stderr);
   assert.equal(run.stdout.trim(),fixture.out,"trusted fix output differs for "+id);
   verified++;
 }
 console.log("Guided bugfix fixtures PASS: "+verified+" reviewed Java/Python corrections and key mappings.");
}finally{await rm(dir,{recursive:true,force:true,maxRetries:5,retryDelay:100});}
