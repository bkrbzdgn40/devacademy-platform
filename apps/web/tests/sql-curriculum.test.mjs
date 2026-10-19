import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {gradeSubmission,answerKeyIds} from "../src/server/grade.ts";
import courses from "../src/data/courses.json" with {type:"json"};
import lessons from "../src/data/lessons.json" with {type:"json"};
import questions from "../src/data/questions.json" with {type:"json"};
const sql=courses.find(x=>x.id==="course.sql.fundamentals");
const chosen=lessons.filter(x=>x.id.startsWith("lesson.sql."));
const assigned=questions.filter(x=>x.id.startsWith("sql."));
test("M11 SQL course has honest, PostgreSQL-only edited-not-executed capability",()=>{
  assert.ok(sql);
  assert.equal(sql.lessonIds.length,4);
  assert.deepEqual(sql.lessonIds,chosen.map(x=>x.id));
  assert.equal(sql.editorLanguage,"plain");
  assert.equal(sql.runtimeId,null);
  assert.deepEqual(sql.capabilities,{editor:true,run:false,codeAssessment:false});
  const component=readFileSync(new URL("../src/components/course-lesson.tsx",import.meta.url),"utf8");
  assert.match(component,/course.languageId==="language.sql"/);
  assert.match(component,/editorLanguage!=="plain"/);
  assert.match(component,/sql-ornek-veri/);
  assert.equal(assigned.length,8);
});
test("M11 SQL four topics preserve ordered prerequisites and private answer keys",()=>{
  assert.equal(new Set(chosen.map(x=>x.slug)).size,4);
  for(const [i,lesson] of chosen.entries()){
    assert.equal(lesson.questionIds.length,2);
    assert.deepEqual(lesson.prerequisites,i?[chosen[i-1].id]:[]);
    assert.ok(lesson.objective.length>35);
    for(const qid of lesson.questionIds){
      const q=assigned.find(x=>x.id===qid);
      assert.ok(q&&q.lessonId===lesson.id);
      assert.ok(answerKeyIds().includes(qid));
      assert.equal(q.options.length,3);
      assert.ok(!("correctOptionId" in q));
      assert.equal(q.options.filter(x=>gradeSubmission({questionId:qid,optionId:x.id}).correct).length,1);
    }
  }
});
test("SQL dataset routes render only static fictional data, never user query execution",()=>{
  const page=readFileSync(new URL("../src/app/sql-ornek-veri/page.tsx",import.meta.url),"utf8");
  assert.match(page,/musteriler/);
  assert.match(page,/siparisler/);
  assert.match(page,/Kurgusal|kurgusal/);
  assert.doesNotMatch(page,/fetch\(|new Client|dangerouslySetInnerHTML/);
});
