import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>JSON.parse(readFileSync(new URL("../src/data/"+p,import.meta.url),"utf8"));
const walkthroughs=read("lesson-walkthroughs.json");
const lessons=read("lessons.json");
const depth=read("lesson-depth.json");

const OFFICIAL_DOC_PREFIXES=[
  /^https:\/\/docs\.python\.org\/3\//,
  /^https:\/\/developer\.mozilla\.org\/en-US\/docs\/Web\/JavaScript\//,
  /^https:\/\/docs\.oracle\.com\//,
  /^https:\/\/dev\.java\//,
  /^https:\/\/www\.postgresql\.org\/docs\//
];

test("every walkthrough lesson has a worked example, edge case and official reference",()=>{
  const lessonIds=new Set(lessons.map(l=>l.id));
  const python=lessons.filter(l=>l.id.startsWith("lesson.python.")).map(l=>l.id);
  const walkthroughIds=walkthroughs.map(w=>w.id);
  assert.equal(new Set(walkthroughIds).size,walkthroughIds.length,"duplicate walkthrough id");
  for(const id of python)assert.ok(walkthroughIds.includes(id),"missing Python walkthrough "+id);
  for(const w of walkthroughs){
    assert.ok(lessonIds.has(w.id),"unknown lesson "+w.id);
    assert.ok(w.scenario.length>=40,w.id+" scenario too short");
    assert.ok(w.steps.length>=3,w.id+" needs at least three worked steps");
    assert.ok(w.steps.every(s=>s.code.trim()&&s.note.length>=20),w.id+" step incomplete");
    assert.ok(w.edgeCase&&w.edgeCase.code.trim()&&w.edgeCase.note.length>=30,w.id+" edge case missing");
    assert.ok(w.references.length>=1&&w.references.length<=2,w.id+" needs 1-2 references");
    for(const r of w.references){
      assert.ok(r.title.length>=4);
      assert.ok(OFFICIAL_DOC_PREFIXES.some(re=>re.test(r.url)),w.id+" reference must be official docs: "+r.url);
    }
    assert.ok(depth.some(d=>(d.lessonId??d.id)===w.id),w.id+" mental model source missing");
  }
});
