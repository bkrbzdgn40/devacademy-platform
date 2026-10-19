import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,mkdir,readFile,writeFile,rm} from "node:fs/promises";
import {spawnSync} from "node:child_process";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {createDraft,preparePublication} from "../../../scripts/course-tool.mjs";

const root=fileURLToPath(new URL("../../../",import.meta.url));
const cli=join(root,"scripts/course-cli.mjs");
async function json(path){return JSON.parse(await readFile(path,"utf8"));}
async function source(){
  const data=join(root,"apps/web/src/data");
  const [courses,lessons,questions,catalog,answers]=await Promise.all([
    json(join(data,"courses.json")),json(join(data,"lessons.json")),
    json(join(data,"questions.json")),json(join(data,"catalog.json")),
    json(join(root,"apps/web/src/server/answer-keys.json"))
  ]);
  return {courses,lessons,questions,catalog,answers};
}
function complete({publicDraft,privateDraft}){
  const pub=structuredClone(publicDraft),priv=structuredClone(privateDraft);
  const replace=v=>{
    if(typeof v==="string")return v.replaceAll("[[DRAFT]]","").trim();
    if(Array.isArray(v))return v.map(replace);
    if(v && typeof v==="object")return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,replace(x)]));
    return v;
  };
  priv.review.contentReviewed=true;
  priv.review.codeExamplesVerified=true;
  return {pub:replace(pub),priv:replace(priv)};
}
test("generator emits safely disabled isolated curriculum drafts",async()=>{
  const base=await source();
  const draft=createDraft({languageSlug:"python",courseSlug:"python-ileri",title:"Python İleri",catalog:base.catalog});
  assert.equal(draft.publicDraft.language,null);
  assert.equal(draft.publicDraft.course.languageId,"language.python");
  assert.equal(draft.publicDraft.course.capabilities.run,false);
  assert.equal(draft.publicDraft.course.capabilities.codeAssessment,false);
  assert.equal(draft.publicDraft.course.editorLanguage,"python");
  assert.equal(draft.privateDraft.review.contentReviewed,false);
  assert.equal(draft.privateDraft.review.codeExamplesVerified,false);
  assert.ok(!Object.hasOwn(draft.publicDraft.questions[0],"correctOptionId"));
  assert.throws(()=>preparePublication(base,draft.publicDraft,draft.privateDraft),/reviewed/);
  const {pub,priv}=complete(draft);
  const result=preparePublication(base,pub,priv);
  assert.equal(result.courses.length,6);
  assert.equal(result.lessons.length,24);
  assert.equal(result.questions.length,55);
  assert.equal(result.catalog.length,base.catalog.length);
  assert.equal(result.answers[pub.questions[0].id].optionId,"a");
});
test("new language is catalogued without advertising any runner",async()=>{
  const base=await source();
  const pair=createDraft({languageSlug:"rust",courseSlug:"rust-temelleri",title:"Rust Temelleri",catalog:base.catalog});
  const {pub,priv}=complete(pair);
  const result=preparePublication(base,pub,priv);
  assert.equal(result.catalog.length,base.catalog.length+1);
  assert.equal(result.catalog.at(-1).runnable,false);
  assert.equal(result.courses.at(-1).runtimeId,null);
  assert.equal(result.courses.at(-1).editorLanguage,"plain");
});
test("publish rejects unsafe, incomplete, duplicate, or leaking content",async()=>{
  const base=await source();
  const draft=createDraft({languageSlug:"python",courseSlug:"python-ileri",title:"Python Temelleri",catalog:base.catalog});
  const {pub,priv}=complete(draft);
  const attempt=(change)=>{const a=structuredClone(pub),b=structuredClone(priv);change(a,b);
    assert.throws(()=>preparePublication(base,a,b),/COURSE_AUTHORING_INVALID|CURRICULUM_INVALID/);};
  attempt(a=>{a.course.capabilities.run=true;});
  attempt(a=>{a.course.capabilities.codeAssessment=true;});
  attempt(a=>{a.questions[0].correctOptionId="a";});
  attempt(a=>{a.questions[0].answerKey={optionId:"a"};});
  attempt((a,b)=>{b.answers[a.questions[0].id].optionId="missing";});
  attempt((a,b)=>{delete b.answers[a.questions[0].id];});
  attempt(a=>{a.course.slug="java-temelleri";});
  attempt(a=>{a.lessons[0].prerequisites=["lesson.java.methods"];});
  attempt(a=>{a.lessons[0].code="[[DRAFT]]";});
  attempt((a,b)=>{b.review.codeExamplesVerified=false;});
});
test("CLI creates ignored drafts and publishes only after review with no answer leaks",async()=>{
  const base=await source();
  const work=await mkdtemp(join(tmpdir(),"devacademy-course-authoring-"));
  const data=join(work,"apps/web/src/data");
  const server=join(work,"apps/web/src/server");
  const runner=(...args)=>spawnSync(process.execPath,[cli,...args],{cwd:work,encoding:"utf8",timeout:10000});
  try{
    await mkdir(data,{recursive:true});await mkdir(server,{recursive:true});
    for(const file of ["courses","lessons","questions","catalog"])
      await writeFile(join(data,file+".json"),JSON.stringify(base[file]));
    await writeFile(join(server,"answer-keys.json"),JSON.stringify(base.answers));
    const gen=runner("new","python","python-ileri","Python Temelleri");
    assert.equal(gen.status,0,gen.stderr);
    assert.equal(runner("new","python","python-ileri","Again").status,1);
    assert.equal(runner("new","../bad","bad","Danger").status,1);
    const pubPath=join(work,"content/course-drafts/python-ileri/public.json");
    const privPath=join(work,"content/course-drafts/python-ileri/private.json");
    const pair={publicDraft:await json(pubPath),privateDraft:await json(privPath)};
    assert.equal(runner("publish","python-ileri","--reviewed").status,1);
    assert.deepEqual(await json(join(data,"courses.json")),base.courses);
    const {pub,priv}=complete(pair);
    await writeFile(pubPath,JSON.stringify(pub));
    await writeFile(privPath,JSON.stringify(priv));
    const check=runner("check","python-ileri");
    assert.equal(check.status,0,check.stderr);
    assert.equal(runner("publish","python-ileri").status,1);
    const publish=runner("publish","python-ileri","--reviewed");
    assert.equal(publish.status,0,publish.stderr);
    const courses=await json(join(data,"courses.json"));
    const questions=await json(join(data,"questions.json"));
    assert.equal(courses.length,6);
    assert.ok(questions.some(q=>q.id===pub.questions[0].id));
    const publicData=await readFile(join(data,"questions.json"),"utf8");
    assert.ok(!publicData.includes("correctOptionId"));
    assert.ok(!publicData.includes("explanation"));
    const answers=await json(join(server,"answer-keys.json"));
    assert.ok(answers[pub.questions[0].id]);
    assert.equal(runner("publish","python-ileri","--reviewed").status,1);
  }finally{await rm(work,{recursive:true,force:true,maxRetries:5,retryDelay:100});}
});
