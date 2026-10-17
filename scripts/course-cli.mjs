#!/usr/bin/env node
// From repository root: node scripts/course-cli.mjs new|check|publish ...
// Editorial drafts stay gitignored; publication writes only reviewed JSON registries.
import {readFile,writeFile,mkdir,rename,rm,access} from "node:fs/promises";
import {join,dirname,resolve} from "node:path";
import {randomUUID} from "node:crypto";
import {createDraft,preparePublication,validSlug} from "./course-tool.mjs";

const root=process.cwd();
const data=join(root,"apps/web/src/data");
const answerPath=join(root,"apps/web/src/server/answer-keys.json");
const publicPath=name=>join(data,name+".json");
const draftPath=(slug,name)=>join(root,"content/course-drafts",slug,name+".json");
async function json(path){return JSON.parse(await readFile(path,"utf8"));}
const formatted=value=>JSON.stringify(value,null,2)+"\n";
async function snapshot(){
  const [courses,lessons,questions,catalog,answers]=await Promise.all([
    json(publicPath("courses")),json(publicPath("lessons")),
    json(publicPath("questions")),json(publicPath("catalog")),json(answerPath)
  ]);
  return {courses,lessons,questions,catalog,answers};
}
async function main(args){
  const [command,one,two,three,four]=args;
  if(command==="new"){
    if(!validSlug(one)||!validSlug(two)||typeof three!=="string"||!three.trim()||four!==undefined)
      throw Error('Usage: node scripts/course-cli.mjs new <language-slug> <course-slug> "<course title>"');
    const existing=await snapshot();
    if(existing.courses.some(c=>c.slug===two))throw Error("Course slug already published");
    const dir=dirname(draftPath(two,"public"));
    try{await access(dir);throw Error("Draft directory already exists: "+dir);}catch(error){
      if(error.code!=="ENOENT")throw error;
    }
    const {publicDraft,privateDraft}=createDraft({languageSlug:one,courseSlug:two,title:three,catalog:existing.catalog});
    await mkdir(dir,{recursive:true});
    try{
      await writeFile(draftPath(two,"public"),formatted(publicDraft),{flag:"wx",mode:0o600});
      await writeFile(draftPath(two,"private"),formatted(privateDraft),{flag:"wx",mode:0o600});
    }catch(error){await rm(dir,{force:true,recursive:true});throw error;}
    console.log("Draft created: content/course-drafts/"+two+"/ (not published; ignored by Git)");
    console.log("Complete public/private JSON, set both review gates, then run check and publish.");
    return;
  }
  if(command!=="check"&&command!=="publish")throw Error("Usage: node scripts/course-cli.mjs new|check|publish");
  if(!validSlug(one))throw Error("Invalid course slug");
  if((command==="check"&&two!==undefined) ||(command==="publish"&&(two!=="--reviewed"||three!==undefined)))
    throw Error("Usage: node scripts/course-cli.mjs "+command+" <course-slug>"+(command==="publish"?" --reviewed":""));
  const base=await snapshot();
  const pub=await json(draftPath(one,"public"));
  const priv=await json(draftPath(one,"private"));
  const after=preparePublication(base,pub,priv);
  if(command==="check"){
    console.log("Course validation PASS: "+pub.course.id+" ("+pub.lessons.length+" lessons, "+pub.questions.length+" questions)");
    return;
  }
  const files=[
    [publicPath("catalog"),after.catalog],
    [publicPath("courses"),after.courses],
    [publicPath("lessons"),after.lessons],
    [publicPath("questions"),after.questions],
    [answerPath,after.answers]
  ];
  // Pre-stage every file. Rename each only after all validation and writes succeed.
  // This is not cross-file transactionality: review the resulting Git diff before merging.
  const backup=[];
  const temps=[];
  try{
    for(const [path,content] of files){
      backup.push([path,await readFile(path,"utf8")]);
      const temp=join(dirname(path),"."+randomUUID()+".course-new");
      await writeFile(temp,formatted(content),{flag:"wx",mode:0o600});
      temps.push([temp,path]);
    }
    let changed=0;
    try{
      for(const [temp,path] of temps){await rename(temp,path);changed++;}
    }catch(error){
      for(let i=0;i<changed;i++)await writeFile(backup[i][0],backup[i][1]);
      throw error;
    }
  }finally{
    for(const [temp] of temps)await rm(temp,{force:true}).catch(()=>{});
  }
  console.log("Published reviewed course into registries: "+pub.course.id);
  console.log("Run corepack pnpm check; inspect Git diff and open a reviewed PR.");
}
main(process.argv.slice(2)).catch(error=>{
  console.error("Course tool failed: "+(error instanceof Error?error.message:"unknown"));
  process.exitCode=1;
});
