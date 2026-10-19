import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import courses from "../src/data/courses.json" with {type:"json"};
import lessons from "../src/data/lessons.json" with {type:"json"};
import questions from "../src/data/questions.json" with {type:"json"};
import answerKeys from "../src/server/answer-keys.json" with {type:"json"};
import depth from "../src/data/lesson-depth.json" with {type:"json"};

const course=courses.find(x=>x.id==="course.algorithms.fundamentals");
const originals=lessons.filter(x=>x.id.startsWith("lesson.algorithms."));
const testQuestions=questions.filter(x=>x.id.startsWith("alg."));
function capture(code){
  const lines=[];
  vm.runInNewContext(code,{console:{log:(...args)=>lines.push(args.map(String).join(" "))}},
    {timeout:500});
  return lines;
}
test("new algorithm course remains an isolated authored path with stable quiz IDs",()=>{
  assert.ok(course);
  assert.equal(course.editorLanguage,"javascript");
  assert.equal(course.capabilities.run,false);
  assert.equal(course.capabilities.codeAssessment,false);
  assert.equal(course.lessonIds.length,4);
  assert.equal(new Set(course.lessonIds).size,4);
  assert.equal(testQuestions.length,8);
  assert.deepEqual(course.lessonIds,originals.map(l=>l.id));
  for(const lesson of originals){
    assert.equal(lesson.questionIds.length,2);
    assert.ok(lesson.objective.length>40);
    assert.ok(lesson.explanation.length>150);
    assert.equal(lesson.takeaways.length,3);
    assert.ok(depth.some(d=>d.id===lesson.id));
    for(const qid of lesson.questionIds)assert.ok(testQuestions.find(q=>q.id===qid));
  }
  assert.ok(course.lessonIds.every((id,i)=>i===0||
    originals[i].prerequisites.includes(course.lessonIds[i-1])));
});
test("every reviewed question computes exactly its private correct option in Node",()=>{
  for(const q of testQuestions){
    assert.ok(!("correctOptionId" in q)&&!("explanation" in q),q.id+" leaks answer");
    const output=capture(q.code);
    assert.equal(output.length,1,q.id+" must log one answer");
    const answer=answerKeys[q.id];
    assert.ok(answer&&typeof answer.explanation==="string"&&answer.explanation.length>35,q.id);
    const correct=q.options.find(x=>x.id===answer.optionId);
    assert.ok(correct,q.id+" correct option missing");
    assert.equal(output[0],correct.text,q.id+" does not match real JavaScript output");
    assert.equal(q.options.filter(x=>x.text===output[0]).length,1,q.id);
    for(const x of q.options.filter(x=>x.id!==answer.optionId))
      assert.ok(answer.wrongFeedback[x.id].length>20,q.id+" missing misconception feedback");
  }
});
test("the published four example programs run in real JS and match visible output annotations",()=>{
  const values=[
    ["lesson.algorithms.complexity",["4"]],
    ["lesson.algorithms.stack-queue",["sil","A"]],
    ["lesson.algorithms.map-set",["3","3"]],
    ["lesson.algorithms.binary-search",["3"]]
  ];
  for(const [id,expected] of values)assert.deepEqual(
    capture(originals.find(x=>x.id===id).code),expected,id);
});
test("algorithm boundaries: empty input, absent target, repeating frequency and FIFO",()=>{
  const binary=originals.find(x=>x.id==="lesson.algorithms.binary-search").code;
  const prefix=binary.slice(0,binary.lastIndexOf("console.log("));
  assert.deepEqual(capture(prefix+"console.log(search([],4));"),["-1"]);
  assert.deepEqual(capture(prefix+"console.log(search([2,4,6],7));"),["-1"]);
  assert.deepEqual(capture(prefix+"console.log(search([2,4,6],2));"),["0"]);
  assert.deepEqual(capture(prefix+"console.log(search([2,4,6],6));"),["2"]);
  assert.deepEqual(capture("const ids=[];console.log(new Set(ids).size);"),["0"]);
  assert.deepEqual(capture("const q=['first','second'];q.push('third');console.log(q.shift());"),["first"]);
});
test("teaching text labels complexity bounds and unverified student code honestly",()=>{
  const search=originals.find(x=>x.id==="lesson.algorithms.binary-search");
  assert.match(search.explanation,/sıralı|sıralanmış/i);
  assert.match(search.explanation,/lo <= hi/);
  const stack=originals.find(x=>x.id==="lesson.algorithms.stack-queue");
  assert.match(stack.explanation,/Array\.shift/);
  const bigO=originals.find(x=>x.id==="lesson.algorithms.complexity");
  assert.match(bigO.explanation,/O\(n\)/);
  assert.match(bigO.explanation,/O\(log n\)/);
  assert.ok(course.capabilities.run===false);
});
