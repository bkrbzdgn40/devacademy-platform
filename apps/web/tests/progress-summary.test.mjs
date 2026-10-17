import test from "node:test";
import assert from "node:assert/strict";
import { summarizeProgress } from "../src/lib/progress-summary.ts";
const lesson=(lessonId,completedAt=null)=>({lessonId,completedAt,lastViewedAt:"2026-10-17T00:00:00Z"});
const attempt=correct=>({exerciseId:"demo",lessonId:"l1",correct,attemptedAt:"2026-10-17T00:00:00Z"});
test("dashboard handles zero and computes percentages accurately",()=>{
  assert.deepEqual(summarizeProgress(0,[],[]),{total:0,started:0,completed:0,percent:0,recentAttemptCount:0,recentCorrectCount:0,recentCorrectPercent:null});
  const s=summarizeProgress(7,[lesson("a","2026-10-17"),lesson("b"),lesson("c","2026-10-17")],[attempt(true),attempt(false),attempt(true)]);
  assert.equal(s.percent,29);assert.equal(s.recentCorrectPercent,67);assert.equal(s.started,3);
});
test("duplicate progress rows cannot inflate completion",()=>{
  const s=summarizeProgress(1,[lesson("a","2026-10-17"),lesson("a","2026-10-17")],[]);
  assert.equal(s.percent,100);assert.equal(s.completed,1);
});
