import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../src/",import.meta.url);
const read=(path)=>readFileSync(new URL(path,root),"utf8");
const lesson=read("components/course-lesson.tsx");
const stepper=read("components/lesson-stepper.tsx");
const nav=read("components/site-nav.tsx");
const questions=JSON.parse(read("data/questions.json"));
const guides=JSON.parse(read("data/lesson-guides.json"));
const lessons=JSON.parse(read("data/lessons.json"));

test("guided lessons preserve all existing assessment identities",()=>{
  assert.equal(guides.length,8);
  for(const guide of guides){
    const item=lessons.find(x=>x.id===guide.lessonId);
    assert.ok(item);
    assert.equal(item.questionIds.length,3);
    assert.ok(item.questionIds.includes(guide.questionId));
    assert.ok(item.questionIds.every(id=>questions.some(q=>q.id===id)));
  }
  assert.match(lesson,/questionCount=\{questions.length\}/);
  assert.match(lesson,/predictionQuestions.slice\(1\)/);
  assert.match(lesson,/questions.map\(/);
});
test("lesson stages have accessible navigation, preserve visited answers and lazy-mount editor",()=>{
  assert.match(stepper,/aria-label="Ders aşamaları"/);
  assert.match(stepper,/aria-current=\{active\s*===\s*index\s*\?\s*"step"/);
  assert.match(stepper,/visited.includes\(index\)/);
  assert.match(stepper,/hidden=\{active\s*!==\s*index\}/);
  assert.match(lesson,/id: "predict"/);
  assert.match(lesson,/id: "debug"/);
  assert.match(lesson,/id: "apply"/);
  assert.doesNotMatch(lesson,/<CodePlayground starterCode=\{diagnostic.code\}/);
});
test("main menu keeps four top-level actions and accessible discovery paths",()=>{
  for(const href of ["/kurslar","/pratik","/hesap","/kutuphane/diller","/kutuphane/kavramlar","/kutuphane/teknolojiler"]){
    assert.ok(nav.includes('href="'+href+'"'),href);
  }
  assert.match(nav,/<details ref={menu} className="nav-discovery"/);
  assert.ok(!nav.includes('href="/laboratuvar"'));
});
test("stage jumps land below the sticky stage bar",()=>{
  const styles=read("app/globals.css");
  assert.match(styles,/scroll-margin-top:var\(--lesson-stage-offset\)/);
  assert.match(stepper,/--lesson-stage-offset/);
  assert.match(stepper,/ResizeObserver/);
  assert.match(stepper,/panel.scrollIntoView\(\{block:"start"/);
});
test("layout aligns lesson width with the shell and keeps the footer at the bottom",()=>{
  const styles=read("app/globals.css");
  const notFound=read("app/not-found.tsx");
  assert.doesNotMatch(styles,/\.lesson-workspace-page\{width:/);
  assert.match(lesson,/className="shell lesson-page lesson-workspace-page"/);
  assert.match(styles,/body\{min-height:100vh;min-height:100dvh;display:flex;flex-direction:column\}/);
  assert.match(styles,/body>main\{flex:1 0 auto\}/);
  assert.match(styles,/\.radar-heading\{display:flex;align-items:center/);
  assert.ok(notFound.includes('href="/kutuphane/kavramlar"'));
});
