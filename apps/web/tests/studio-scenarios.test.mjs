import test from "node:test";
import assert from "node:assert/strict";
import lessons from "../src/data/lessons.json" with {type:"json"};
import {studioLessons,studioHasLesson,studioVariantCount,buildStudioScenario,
  gradeStudioPrediction,normalizeStudioAnswer} from "../src/lib/studio-scenarios.mjs";

test("studio has three distinct, bounded reviewed variants per supported concept",()=>{
  assert.equal(studioLessons.length,15);
  assert.deepEqual([...studioLessons].sort(),lessons.map(x=>x.id).sort(),
    "Every currently published lesson must have an independent authored trace.");
  assert.ok(studioLessons.some(x=>x.includes(".java.")));
  assert.ok(studioLessons.some(x=>x.includes(".python.")));
  assert.ok(studioLessons.some(x=>x.includes(".javascript.")));
  for(const lesson of studioLessons) {
    assert.equal(studioHasLesson(lesson),true);
    assert.equal(studioVariantCount(lesson),3);
    const unique=new Set();
    for(let i=0;i<3;i++) {
      const s=buildStudioScenario(lesson,i);
      assert.equal(s.variant,i);
      assert.ok(s.codeLines.length>=4);
      assert.equal(s.code,s.codeLines.join("\n"));
      assert.ok(s.steps.length>=4,lesson+" steps");
      assert.equal(s.expected.length,2);
      assert.equal(gradeStudioPrediction(s,...s.expected).every(Boolean),true);
      assert.deepEqual(gradeStudioPrediction(s,"123456","123456"),[false,false]);
      assert.ok(s.hint.length>25&&s.question.length>15);
      assert.deepEqual(s.topics.length,2);
      // Every displayed line pointer refers to a real source line.
      assert.ok(s.steps.every(step=>Number.isInteger(step.line)&&step.line>0&&
        step.line<=s.codeLines.length));
      assert.ok(s.steps.every(step=>step.variables&&typeof step.variables==="object"&&
        Array.isArray(step.outputs)&&step.message.length>10));
      // Timeline output is monotonic, and ends with exactly two labelled results.
      for(let j=1;j<s.steps.length;j++)
        assert.ok(s.steps[j].outputs.length>=s.steps[j-1].outputs.length);
      const outputs=s.steps.at(-1).outputs;
      assert.deepEqual(outputs.slice(-2).map(x=>x.label),["A","B"]);
      assert.deepEqual(outputs.slice(-2).map(x=>x.value),s.expected);
      unique.add(s.code);
    }
    assert.equal(unique.size,3,lesson+" repeated source across input changes");
    assert.throws(()=>buildStudioScenario(lesson,-1),/OUT_OF_RANGE/);
    assert.throws(()=>buildStudioScenario(lesson,3),/OUT_OF_RANGE/);
  }
  assert.equal(buildStudioScenario("lesson.unknown",0),null);
  assert.equal(studioVariantCount("lesson.unknown"),0);
});
test("A/B input validation accepts Turkish decimal separators and None, not code",()=>{
  assert.equal(normalizeStudioAnswer("  02,50 "), "2.5");
  assert.equal(normalizeStudioAnswer("none"),"None");
  for(const input of ["","1+1","2;process.exit()","NaN","Infinity","1,2,3","0xA",
    "3e9","a".repeat(30),null]){
    assert.equal(normalizeStudioAnswer(input),null);
  }
  const s=buildStudioScenario("lesson.java.variables",0);
  assert.deepEqual(gradeStudioPrediction(s,"3","3,5"),[true,true]);
  assert.equal(gradeStudioPrediction(s,"abc","2"),null);
});
test("python return traces show side-effect output before A/B, preventing false equivalence",()=>{
  const s=buildStudioScenario("lesson.python.functions",0);
  const out=s.steps.at(-1).outputs;
  assert.equal(out.length,3);
  assert.equal(out[0].label,"Ara çıktı");
  assert.equal(out[1].value,"None");
  assert.notEqual(out[1].value,out[0].value);
});

test("new teaching traces cover language-specific causal distinctions",()=>{
  const scope=buildStudioScenario("lesson.javascript.scope",0);
  assert.notEqual(scope.expected[0],scope.expected[1]);
  assert.match(scope.code,/let count =/);
  const async=buildStudioScenario("lesson.javascript.async",0);
  assert.ok(async.steps.findIndex(x=>x.line===6)<async.steps.findIndex(x=>x.line===3),
    "microtask must execute after later synchronous source line");
  const filter=buildStudioScenario("lesson.javascript.filter",1);
  assert.deepEqual(filter.expected,["0","0"]);
  const conditions=buildStudioScenario("lesson.python.conditions",0);
  assert.ok(conditions.steps.some(x=>x.line===5)&&!conditions.steps.some(x=>x.line===3));
  const dict=buildStudioScenario("lesson.python.collections",0);
  assert.match(dict.code,/get\("score"/);
  const java=buildStudioScenario("lesson.java.methods",2);
  assert.ok(java.expected.some(x=>x.startsWith("-")));
});
