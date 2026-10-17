import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateCourseCatalog} from "../src/server/course-validator.mjs";
import {answerKeyIds} from "../src/server/grade.ts";
const load=(name)=>JSON.parse(readFileSync(new URL("../src/data/"+name,import.meta.url),"utf8"));
const reference={
  courses:load("courses.json"),
  lessons:load("lessons.json"),
  questions:load("questions.json"),
  catalog:load("catalog.json"),answerKeyIds:answerKeyIds()
};
const clone=()=>structuredClone(reference);
test("three courses share lesson/assessment contract with no JS identity migration",()=>{
  assert.deepEqual(validateCourseCatalog(reference),{courseCount:3,lessonCount:15,questionCount:38});
  const oldJs=load("lessons.json").filter(x=>x.id.startsWith("lesson.javascript."));
  assert.equal(reference.courses[0].lessonIds.length,7);
  assert.deepEqual(reference.courses[0].lessonIds,oldJs.map(x=>x.id));
  assert.equal(reference.courses[1].lessonIds.length,3);
  assert.ok(reference.courses[1].capabilities.run===false);
  assert.equal(reference.courses[2].languageId,'language.python');
  assert.equal(reference.courses[2].lessonIds.length,5);
  assert.equal(reference.courses[2].editorLanguage,'python');
  assert.equal(reference.courses[2].capabilities.run,false);
});
test("curriculum validator blocks orphaned lessons and stale IDs",()=>{
  const c=clone();c.courses[1].lessonIds.push("lesson.java.unknown");
  assert.throws(()=>validateCourseCatalog(c),/CURRICULUM_INVALID/);
});
test("validator blocks duplicate lesson identity and slug",()=>{
  const c=clone();c.lessons.push({...c.lessons[0]});
  assert.throws(()=>validateCourseCatalog(c),/duplicate lesson ID/);
  const d=clone();d.lessons.find(x=>x.id==="lesson.java.methods").slug="degiskenler-ve-turler";
  assert.throws(()=>validateCourseCatalog(d),/duplicate lesson slug/);
});
test("validator rejects forward/cyclic prerequisites and orphan questions",()=>{
  const c=clone();c.lessons.find(x=>x.id==="lesson.java.variables").prerequisites=["lesson.java.polymorphism"];
  assert.throws(()=>validateCourseCatalog(c),/prerequisite/);
  const d=clone();d.questions.push({...d.questions[0],id:"js.orphan"});
  assert.throws(()=>validateCourseCatalog(d),/private answer key coverage|orphan/);
});
test("validator rejects any answer key leak or falsely advertised Java execution",()=>{
  const c=clone();c.questions[0].correctOptionId="a";
  assert.throws(()=>validateCourseCatalog(c),/invalid public question/);
  const d=clone();d.courses[1].capabilities.run=true;
  assert.throws(()=>validateCourseCatalog(d),/invalid course/);
  const e=clone();e.courses[1].runtimeId="java-21";
  assert.throws(()=>validateCourseCatalog(e),/Unsupported runtime advertised/);
});
