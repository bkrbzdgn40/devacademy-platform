import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {javaLanguage} from "@codemirror/lang-java";
import {pythonLanguage} from "@codemirror/lang-python";
import {gradeSubmission,answerKeyIds} from "../src/server/grade.ts";

const read=name=>JSON.parse(readFileSync(new URL("../src/data/"+name,import.meta.url),"utf8"));
const guides=read("lesson-guides.json");
const lessons=read("lessons.json");
const questions=read("questions.json");
test("all Java and Python topics contain full guided learning and graded diagnostics",()=>{
  const expected=lessons.filter(l=>l.id.startsWith("lesson.java.")||l.id.startsWith("lesson.python."));
  assert.equal(expected.length,8);
  assert.equal(guides.length,8);
  assert.equal(new Set(guides.map(g=>g.lessonId)).size,8);
  const selected=new Set();
  for(const guide of guides){
    assert.ok(expected.some(l=>l.id===guide.lessonId));
    assert.ok(["java","python"].includes(guide.language));
    assert.equal(guide.trace.length,2);
    assert.equal(guide.hints.length,2);
    assert.ok(guide.trace.every(s=>s.length>=16));
    assert.ok(guide.hints.every(s=>s.length>=10));
    assert.ok(guide.reflection.length>20);
    const lesson=lessons.find(l=>l.id===guide.lessonId);
    assert.equal(lesson.questionIds.length,3);
    assert.ok(lesson.questionIds.includes(guide.questionId));
    const question=questions.find(q=>q.id===guide.questionId);
    assert.ok(question&&question.lessonId===guide.lessonId);
    assert.ok(question.id.startsWith("debug."));
    assert.ok(!("correctOptionId" in question)&&!("explanation" in question));
    assert.ok(question.options.length===3);
    selected.add(question.id);
    const responses=question.options.map(option=>gradeSubmission({questionId:question.id,optionId:option.id}));
    assert.equal(responses.filter(r=>r.correct).length,1);
    assert.equal(responses.filter(r=>!r.correct).length,2);
    for(const grade of responses){
      assert.equal(grade.status,"graded");
      if(grade.correct)assert.equal(grade.tailoredFeedback,null);
      else assert.ok(grade.tailoredFeedback.length>20);
      assert.ok(grade.explanation.length>20);
    }
  }
  assert.equal(selected.size,8);
  assert.equal(answerKeyIds().length,questions.length);
});
test("real Lezer Python/Java grammars are available for browser CodeMirror highlighting",()=>{
  for(const [parser,source] of [
    [pythonLanguage.parser,"def square(n):\n    return n*n\n"],
    [javaLanguage.parser,"class Demo { int add(int a, int b) { return a+b; } }"]
  ]){
    const tree=parser.parse(source);
    assert.equal(tree.length,source.length);
    assert.ok(tree.topNode.type.isTop,"language grammar must return a root syntax node");
    assert.ok(tree.toString().length>source.length/2);
  }
});
test("invalid debug IDs and answer IDs are refused",()=>{
  assert.deepEqual(gradeSubmission({questionId:"debug.python.variables",optionId:"d"}),{status:"invalid"});
  assert.deepEqual(gradeSubmission({questionId:"debug.python.nonexistent",optionId:"a"}),{status:"invalid"});
});
