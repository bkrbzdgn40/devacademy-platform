import test from "node:test";
import assert from "node:assert/strict";
import depth from "../src/data/lesson-depth.json" with {type:"json"};
import lessons from "../src/data/lessons.json" with {type:"json"};
import {readFileSync} from "node:fs";
const component=readFileSync(new URL("../src/components/course-lesson.tsx",import.meta.url),"utf8");
const lens=readFileSync(new URL("../src/components/lesson-depth.tsx",import.meta.url),"utf8");

test("all 15 existing lessons have distinct reviewed conceptual explanations",()=>{
  assert.equal(depth.length,15);
  assert.deepEqual(depth.map(x=>x.id).sort(),lessons.map(x=>x.id).sort());
  assert.equal(new Set(depth.map(x=>x.model)).size,depth.length);
  for(const item of depth) {
    for(const field of ["model","pitfall","contrast","why","challenge","answer","application"]){
      assert.equal(typeof item[field],"string",item.id+" missing "+field);
      assert.ok(item[field].trim().length>=45,item.id+" shallow "+field);
      assert.ok(!/lorem ipsum|TODO|placeholder/i.test(item[field]),item.id+" placeholder");
    }
    assert.notEqual(item.pitfall,item.why,item.id+" explanation duplicates mistake");
    assert.notEqual(item.challenge,item.answer,item.id+" reveals its own answer");
  }
});
test("counterexample and answer are opt-in and never grade independent evidence",()=>{
  assert.match(lens,/<details className="lesson-depth-contrast">/);
  assert.match(lens,/<summary>Önce kendin düşün, sonra açıklamayı aç<\/summary>/);
  assert.match(lens,/content.answer/);
  assert.doesNotMatch(lens,/fetch\(|\/api\/transfer|submitTransfer/);
  assert.equal((component.match(/<LessonDepth lessonId=\{lesson.id\}\/>/g)||[]).length,2);
});
