import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {learningPaths,searchLearningPaths,resolveLearningJourney}
  from "../src/lib/learning-paths.mjs";
import courses from "../src/data/courses.json" with {type:"json"};
import lessons from "../src/data/lessons.json" with {type:"json"};
const saved=(id,lastViewedAt,completedAt=null)=>({lessonId:id,lastViewedAt,completedAt});
const byId=id=>learningPaths.flatMap(p=>p.lessons).find(l=>l.id===id);
test("learning paths only expose real authored courses and lesson routes",()=>{
  assert.equal(learningPaths.length,courses.length);
  assert.deepEqual(learningPaths.map(x=>x.id),courses.map(x=>x.id));
  assert.equal(learningPaths.reduce((n,p)=>n+p.lessonCount,0),lessons.length);
  for(const p of learningPaths){
    const course=courses.find(c=>c.id===p.id);
    assert.deepEqual(p.lessons.map(l=>l.id),course.lessonIds);
    assert.equal(p.lessonCount,p.lessons.length);
    assert.ok(p.minutes>0);
    assert.ok(p.questionCount>0);
    assert.equal(p.foundation.length,3);
    for(const l of p.lessons){
      assert.equal(l.href,"/kurslar/"+p.slug+"/"+l.slug);
      assert.ok(byId(l.id));
    }
  }
});
test("course and lesson search includes title, subject and real lesson matches",()=>{
  const promise=searchLearningPaths(learningPaths,"Promise");
  assert.equal(promise.length,1);
  assert.equal(promise[0].id,"course.javascript.fundamentals");
  assert.deepEqual(promise[0].matches.map(x=>x.id),["lesson.javascript.async"]);
  const loop=searchLearningPaths(learningPaths,"döngüler");
  assert.equal(loop.length,1);
  assert.equal(loop[0].id,"course.python.fundamentals");
  const poly=searchLearningPaths(learningPaths,"polymorphism");
  assert.equal(poly.length,1);
  assert.equal(poly[0].id,"course.java.fundamentals");
  assert.equal(searchLearningPaths(learningPaths,"olmayan dil").length,0);
  assert.equal(searchLearningPaths(learningPaths,"").length,3);
  assert.deepEqual(searchLearningPaths(learningPaths,"jaVA").map(x=>x.id),[
    "course.javascript.fundamentals","course.java.fundamentals"]);
});
test("genuine progress chooses the most recently active unfinished lesson",()=>{
  const rows=[
    saved("lesson.python.loops","2026-10-17T13:00:00Z"),
    saved("lesson.javascript.scope","2026-10-18T13:00:00Z"),
    saved("lesson.java.variables","2026-10-18T15:00:00Z","2026-10-18T15:30:00Z")
  ];
  const progress=resolveLearningJourney(learningPaths,rows);
  assert.equal(progress.kind,"continue");
  assert.equal(progress.next.id,"lesson.javascript.scope");
  assert.equal(progress.completed,1);
  assert.equal(progress.total,15);
  assert.equal(progress.stats.find(s=>s.id==="course.java.fundamentals").completed,1);
});
test("empty and completed-only progress do not invent active unfinished records",()=>{
  const empty=resolveLearningJourney(learningPaths,[]);
  assert.equal(empty.kind,"start");
  assert.equal(empty.next.id,"lesson.javascript.let-const");
  const completed=resolveLearningJourney(learningPaths,[
    saved("lesson.python.variables","2026-10-18T14:00:00Z","2026-10-18T14:10:00Z")
  ]);
  assert.equal(completed.kind,"next");
  assert.equal(completed.next.id,"lesson.python.conditions");
  const all=resolveLearningJourney(learningPaths,learningPaths.flatMap(p=>p.lessons)
    .map(l=>saved(l.id,"2026-10-18T13:00:00Z","2026-10-18T13:00:00Z")));
  assert.equal(all.kind,"finished");
  assert.equal(all.next,null);
  assert.equal(all.completed,15);
});
test("foreign, malformed and duplicate progress cannot pollute recommendations",()=>{
  const rows=[saved("private.fake.lesson","2026-10-18T16:00:00Z"),
    saved("lesson.java.methods","2026-10-16T00:00:00Z"),
    saved("lesson.java.methods","2026-10-18T00:00:00Z"),
    {lessonId:null,lastViewedAt:"invalid",completedAt:null},
    saved("lesson.javascript.scope","invalid")];
  const j=resolveLearningJourney(learningPaths,rows);
  assert.equal(j.kind,"continue");
  assert.equal(j.next.id,"lesson.java.methods");
  assert.equal(j.stats.find(s=>s.id==="course.java.fundamentals").started,1);
});
test("no private progress fields, claims of live headlines or executable courses",()=>{
  const home=readFileSync(new URL("../src/app/page.tsx",import.meta.url),"utf8");
  const cont=readFileSync(new URL("../src/components/continue-learning.tsx",import.meta.url),"utf8");
  const coursesPage=readFileSync(new URL("../src/app/kurslar/page.tsx",import.meta.url),"utf8");
  assert.match(home,/Canlı haber akışı henüz bağlı değil/);
  assert.match(home,/target="_blank" rel="noopener noreferrer"/);
  assert.match(cont,/fetch\("\/api\/me"/);
  assert.match(cont,/fetch\("\/api\/progress"/);
  assert.match(cont,/!viewer\.authenticated/);
  assert.match(cont,/state\.status==="unconfigured"/);
  assert.match(coursesPage,/CourseExplorer/);
  assert.doesNotMatch(home,/fetch\(|api\/news|publishedAt:/);
});
