import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>JSON.parse(readFileSync(new URL("../src/data/"+p,import.meta.url),"utf8"));
const walkthroughs=read("lesson-walkthroughs.json");
const lessons=read("lessons.json");
const depth=read("lesson-depth.json");

test("every Python fundamentals lesson has a worked example, edge case and official reference",()=>{
  const python=lessons.filter(l=>l.id.startsWith("lesson.python.")).map(l=>l.id).sort();
  assert.deepEqual(walkthroughs.map(w=>w.id).sort(),python);
  for(const w of walkthroughs){
    assert.ok(w.scenario.length>=40,w.id+" scenario too short");
    assert.ok(w.steps.length>=3,w.id+" needs at least three worked steps");
    assert.ok(w.steps.every(s=>s.code.trim()&&s.note.length>=20),w.id+" step incomplete");
    assert.ok(w.edgeCase&&w.edgeCase.code.trim()&&w.edgeCase.note.length>=30,w.id+" edge case missing");
    assert.ok(w.references.length>=1&&w.references.length<=2,w.id+" needs 1-2 references");
    for(const r of w.references){
      assert.ok(r.title.length>=4);
      assert.match(r.url,/^https:\/\/docs\.python\.org\/3\//,w.id+" reference must be official Python docs");
    }
    assert.ok(depth.some(d=>(d.lessonId??d.id)===w.id),w.id+" mental model source missing");
  }
});
