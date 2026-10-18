import test from "node:test";
import assert from "node:assert/strict";
import {transferLessonIds,evaluateTransfer} from "../src/server/transfer-missions.mjs";
import {adaptiveProblem,errorPattern,nextFocus,diagnosticHypothesis}
  from "../src/server/adaptive-probes.mjs";

test("all six concepts have two different, server-only and correct diagnostic interventions",()=>{
  assert.equal(transferLessonIds.length,6);
  for(const lessonId of transferLessonIds) {
    const codes=new Set();
    for(const focus of ["standard","a","b"])for(const seed of [37,2801,4199]) {
      const p=adaptiveProblem(lessonId,seed,focus);
      assert.ok(p.code.length>55);
      assert.equal(p.expected.length,2);
      assert.ok(evaluateTransfer(p,...p.expected)?.correct,lessonId+" "+focus);
      assert.equal(errorPattern(p,...p.expected),"none");
      assert.equal(errorPattern(p,"-123456",p.expected[1]),"a");
      assert.equal(errorPattern(p,p.expected[0],"-123456"),"b");
      assert.equal(errorPattern(p,"-123456","-123456"),"both");
      codes.add(p.code);
    }
    assert.ok(codes.size>=6,lessonId+" interventions collapsed");
    assert.notEqual(adaptiveProblem(lessonId,37,"a").code,adaptiveProblem(lessonId,37,"b").code);
  }
});
test("diagnosis is bounded to observable errors, high confidence not treated as proof",()=>{
  assert.equal(nextFocus("a",1),"a");
  assert.equal(nextFocus("b",1),"b");
  assert.equal(nextFocus("both",0),"a");
  assert.equal(nextFocus("both",1),"b");
  const diagnosis=diagnosticHypothesis(transferLessonIds[0],"b","b");
  assert.match(diagnosis.disclaimer,/kesin teşhis değildir/);
  assert.match(diagnosis.rationale,/nesnenin alanını/);
  assert.throws(()=>adaptiveProblem(transferLessonIds[0],31,"hacked"),/INVALID_FOCUS/);
});
