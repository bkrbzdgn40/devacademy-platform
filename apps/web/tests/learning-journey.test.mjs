import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {chooseLearningAction} from "../src/lib/learning-journey.ts";
const lessons=[
  {id:"py.vars",title:"Python değişkenler",href:"/kurslar/python-temelleri/degiskenler",courseId:"python",courseTitle:"Python Temelleri",independentLab:false},
  {id:"py.loops",title:"Python döngüler",href:"/kurslar/python-temelleri/donguler",courseId:"python",courseTitle:"Python Temelleri",independentLab:true},
  {id:"py.functions",title:"Python fonksiyonlar",href:"/kurslar/python-temelleri/fonksiyonlar",courseId:"python",courseTitle:"Python Temelleri",independentLab:true},
  {id:"java.vars",title:"Java değişkenler",href:"/kurslar/java-temelleri/degiskenler",courseId:"java",courseTitle:"Java Temelleri",independentLab:false}
];
const record=(lessonId,lastViewedAt,completedAt=null)=>({lessonId,lastViewedAt,completedAt});
const progress=(rows,extra={})=>({lessons:rows,reviewSummary:{total:0,due:0},...extra});
test("new learner receives first published lesson, not fictional achievement",()=>{
  const next=chooseLearningAction(lessons,progress([]));
  assert.equal(next.kind,"start");
  assert.equal(next.href,lessons[0].href);
  assert.doesNotMatch(next.description,/başardın|doğrulandı|tamamladın/i);
});
test("due reviews take priority over unfinished lessons",()=>{
  const next=chooseLearningAction(lessons,progress([
    record("py.loops","2026-10-18T18:00:00Z")
  ],{reviewSummary:{total:3,due:2}}));
  assert.equal(next.kind,"review");
  assert.equal(next.href,"/tekrar");
  assert.match(next.description,/2 soru tekrar bekliyor/);
  assert.match(next.description,/bağımsız kod yazma kanıtı değildir/);
});
test("last unfinished known lesson wins; unknown and invalid records do not",()=>{
  const next=chooseLearningAction(lessons,progress([
    record("py.vars","2026-10-18T14:00:00Z"),
    record("py.loops","2026-10-18T15:00:00Z"),
    record("foreign.lesson","2026-10-18T18:00:00Z"),
    record("py.functions","invalid")
  ]));
  assert.equal(next.kind,"resume");
  assert.equal(next.href,lessons[1].href);
  assert.match(next.description,/tamamlama bağımsız yeterlilik anlamına gelmez/i);
});
test("completed recent lesson offers the next unfinished lesson in same course",()=>{
  const next=chooseLearningAction(lessons,progress([
    record("py.vars","2026-10-18T14:00:00Z","2026-10-18T14:15:00Z")
  ]));
  assert.equal(next.kind,"next");
  assert.equal(next.href,lessons[1].href);
});
test("authored independent lab is recommended for status check, never declared failed",()=>{
  const next=chooseLearningAction(lessons,progress([
    record("py.vars","2026-10-18T12:00:00Z","2026-10-18T12:10:00Z"),
    record("py.loops","2026-10-18T13:00:00Z","2026-10-18T13:10:00Z"),
    record("py.functions","2026-10-18T14:00:00Z","2026-10-18T14:10:00Z")
  ],{transferSummary:{first:2,retained:2},codeTransferSummary:{verified:2}}));
  assert.equal(next.kind,"independent");
  assert.equal(next.href,lessons[2].href);
  assert.match(next.description,/durumunu kontrol et/);
  assert.match(next.description,/yalnızca yetkili yerel laboratuvarda/i);
  assert.doesNotMatch(next.description,/henüz geçmedin|eksik kanıt/i);
});
test("all lessons complete without authored independent tasks yields honest review",()=>{
  const entries=lessons.map(x=>({...x,independentLab:false}));
  const next=chooseLearningAction(entries,progress(entries.map(x=>
    record(x.id,"2026-10-18T14:00:00Z","2026-10-18T14:10:00Z"))));
  assert.equal(next.kind,"finished");
  assert.equal(next.href,"/tekrar");
  assert.match(next.description,/bağımsız kod yazma yeterliliğinin/);
});
test("no published lesson means no invented first lesson",()=>{
  const next=chooseLearningAction([],progress([]));
  assert.equal(next.kind,"finished");
  assert.equal(next.href,"/kurslar");
});
test("learning dashboard distinguishes evidence levels without fake mastery score",()=>{
  const ui=readFileSync(new URL("../src/components/progress-dashboard.tsx",import.meta.url),"utf8");
  for(const phrase of ["Rehberli ders tamamlaması","İlk yardımsız çıktı tahmini",
    "Gecikmeli kavram doğrulaması","Bağımsız kod üretimi",
    "chooseLearningAction(journeyLessons,progress)"])
    assert.ok(ui.includes(phrase),phrase);
  assert.match(ui,/progress\.transferSummary\?\.first/);
  assert.match(ui,/progress\.codeTransferSummary\?\.verified/);
  assert.match(ui,/href=\{recommendation.href\}/);
  assert.doesNotMatch(ui,/Math\.random\(|localStorage\.setItem|masteryScore/);
});
