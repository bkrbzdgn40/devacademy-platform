import test from "node:test";
import assert from "node:assert/strict";
import {transferLessonIds,transferProblem,evaluateTransfer,normalizedAnswer}
  from "../src/server/transfer-missions.mjs";
import {stateFor,supportsTransfer} from "../src/server/transfer-store.mjs";

test("independently parameterized cases across six lessons and 3 languages",()=>{
  assert.equal(transferLessonIds.length,6);
  for(const lessonId of transferLessonIds) {
    assert.ok(supportsTransfer(lessonId));
    const codes=new Set();
    for(let seed=1;seed<=60;seed++) {
      const problem=transferProblem(lessonId,seed);
      assert.ok(problem.code.length>50);
      assert.equal(problem.expected.length,2);
      assert.ok(evaluateTransfer(problem,...problem.expected)?.correct);
      assert.equal(evaluateTransfer(problem,"-99999","-99999")?.correct,false);
      codes.add(problem.code);
    }
    assert.ok(codes.size>=4,lessonId+" is not sufficiently variable");
  }
});
test("only bounded typed numeric or None answers are accepted",()=>{
  assert.equal(normalizedAnswer(" 02.500 "),"2.5");
  assert.equal(normalizedAnswer("none"),"none");
  assert.equal(normalizedAnswer("2,5"),"2.5");
  for(const unsafe of ["1+1","__proto__","NaN","Infinity","0x1","1,2,3","", "a".repeat(30)])
    assert.equal(normalizedAnswer(unsafe),null);
});
test("24 hour retention proof and cooldown cannot be unlocked client-side",()=>{
  const first={stage:0,variant_seed:123,attempt_count:1,passed_at:new Date("2026-01-01T10:00:00Z")};
  const completedAt=new Date("2025-12-30T10:00:00Z");
  const justBefore=new Date("2026-01-02T09:59:59Z");
  assert.equal(stateFor(transferLessonIds[0],null,[],justBefore).status,"locked");
  const waiting=stateFor(transferLessonIds[0],completedAt,[first],justBefore);
  assert.equal(waiting.status,"waiting");
  assert.equal(stateFor(transferLessonIds[0],completedAt,[first],new Date("2026-01-02T10:00:00Z")).stage,1);
  const second={stage:1,variant_seed:234,attempt_count:8,passed_at:null,
    updated_at:new Date("2026-01-03T10:00:00Z")};
  assert.equal(stateFor(transferLessonIds[0],completedAt,[first,second],
    new Date("2026-01-03T11:00:00Z")).status,"cooldown");
  assert.equal(stateFor(transferLessonIds[0],completedAt,[first,second],
    new Date("2026-01-04T10:00:00Z")).retry,true);
  second.passed_at=new Date("2026-01-04T11:00:00Z");
  assert.equal(stateFor(transferLessonIds[0],completedAt,[first,second],
    new Date("2026-01-04T12:00:00Z")).status,"retained");
});
