import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import applied from "../src/data/python-applied-path.json" with {type:"json"};
import lessons from "../src/data/lessons.json" with {type:"json"};
const read=file=>readFileSync(new URL("../src/"+file,import.meta.url),"utf8");

test("all five published Python lessons have three graduated real-life examples and an independent program",()=>{
  const python=lessons.filter(l=>l.id.startsWith("lesson.python."));
  assert.equal(python.length,5);
  assert.equal(applied.length,python.length);
  assert.deepEqual(applied.map(t=>t.lessonId),python.map(l=>l.id));
  const ids=new Set();
  for(const track of applied){
    assert.equal(track.levels.length,3,track.lessonId);
    assert.ok(track.topic.length>12);
    assert.deepEqual(track.levels.map(l=>l.id),["guided","practice","challenge"]);
    for(const item of track.levels){
      const key=track.lessonId+":"+item.id;
      assert.ok(!ids.has(key));ids.add(key);
      assert.ok(item.context.length>=35,key+" needs a real context");
      assert.ok(item.code.includes("print("),key+" must expose actual program output");
      assert.equal(item.choices.length,3,key);
      assert.equal(new Set(item.choices.map(c=>c.text)).size,3,key);
      assert.equal(item.choices.filter(c=>c.text===item.expected).length,1,key);
      assert.ok(item.choices.every(c=>c.feedback.length>=50),key+" requires targeted feedback");
      assert.ok(item.hint.length>=30,key);
      assert.ok(item.why.length>=35,key);
    }
    const own=track.independent;
    for(const key of ["title","brief","starterCode","modelCode","variationCode",
      "expectedOutput","variationExpected","reflection"])
      assert.ok(typeof own[key]==="string"&&own[key].length>0,track.lessonId+" missing "+key);
    assert.ok(own.starterCode!==own.modelCode,"independent starter must not already solve task");
    assert.ok(own.brief.length>90,"independent task must specify observable output");
    assert.ok(own.reflection.length>30,"independent task needs reasoned reflection");
  }
});
test("all Python applied tasks belong to existing lessons; graded identity unchanged",()=>{
  const ui=read("components/course-lesson.tsx");
  assert.equal((ui.match(/<PythonAppliedStudio lessonId=\{lesson.id\}/g)||[]).length,2);
  assert.match(ui,/course.editorLanguage==="python"/);
  assert.match(ui,/<CompleteLesson lessonId=\{lesson.id\}/);
  assert.match(ui,/<TransferLab lessonId=\{lesson.id\}/);
  assert.match(ui,/<CodeTransferLab lessonId=\{lesson.id\}/);
  const component=read("components/python-applied-studio.tsx");
  assert.match(component,/name=\{id\+"-tier-"\+tier\}/);
  assert.match(component,/setSubmitted/);
  assert.match(component,/feedback/);
  assert.match(component,/if\(!path\)return null/);
  assert.match(component,/role="status"/);
  assert.match(component,/language="python"/);
  assert.match(component,/ownCodeOpen&&/);
  assert.match(component,/Bu görevde kendi kodunu yazabilirsin; sonuç otomatik değerlendirilmiyor/);
  assert.doesNotMatch(component,/fetch\(|localStorage|masteryScore|recordAttempt/);
});
