import test from "node:test";
import assert from "node:assert/strict";
import {nextReview} from "../src/server/review-algorithm.mjs";
const clock=new Date("2026-10-18T12:00:00.000Z");
const days=x=>new Date(clock.getTime()+x*86400000).toISOString();
test("correct answers move through a deterministic 1/3/7/14/30-day schedule",()=>{
  let state=nextReview(null,true,clock);
  assert.equal(state.stage,1);
  assert.equal(state.dueAt.toISOString(),days(1));
  for(const [step,period] of [[2,3],[3,7],[4,14],[5,30],[5,30]]){
    const at=new Date(state.dueAt);
    state=nextReview(state,true,at);
    assert.equal(state.stage,step);
    assert.equal(state.dueAt.toISOString(),new Date(at.getTime()+period*86400000).toISOString());
  }
});
test("a wrong answer resets the stage and appears for review in 10 minutes",()=>{
  const twoDays={stage:2,lapses:0,attempts:4,dueAt:days(3)};
  const next=nextReview(twoDays,false,clock);
  assert.equal(next.stage,0);
  assert.equal(next.lapses,1);
  assert.equal(next.attempts,5);
  assert.equal(next.dueAt.toISOString(),"2026-10-18T12:10:00.000Z");
  const corrected=nextReview(next,true,new Date("2026-10-18T12:10:00Z"));
  assert.equal(corrected.stage,1);
  assert.equal(corrected.dueAt.toISOString(),days(1).replace("12:00","12:10"));
});
test("premature successes cannot game review stage or delay the due card",()=>{
  const previous={stage:3,lapses:2,attempts:5,dueAt:days(7)};
  const next=nextReview(previous,true,clock);
  assert.equal(next.stage,3);
  assert.equal(next.attempts,6);
  assert.equal(next.dueAt.toISOString(),days(7));
});
test("invalid reviews are never scheduled",()=>{
  assert.throws(()=>nextReview({stage:999,lapses:0,attempts:0},true,clock),/INVALID/);
  assert.throws(()=>nextReview(null,"true",clock),/INVALID/);
});
