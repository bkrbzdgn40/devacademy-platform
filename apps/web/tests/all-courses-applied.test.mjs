import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import lessons from "../src/data/lessons.json" with {type:"json"};
import courses from "../src/data/courses.json" with {type:"json"};
import js from "../src/data/javascript-applied-path.json" with {type:"json"};
import java from "../src/data/java-applied-path.json" with {type:"json"};
import py from "../src/data/python-applied-path.json" with {type:"json"};

test("all 15 Java/JavaScript/Python lessons retain applied experiences; SQL has separate query cases",()=>{
  const all=[...js,...java,...py];
  assert.equal(all.length,15);
  assert.equal(new Set(all.map(x=>x.lessonId)).size,15);
  assert.deepEqual(all.map(x=>x.lessonId).sort(),lessons.filter(x=>!x.id.startsWith("lesson.sql.")).map(x=>x.id).sort());
  for(const track of all){
    const published=lessons.find(l=>l.id===track.lessonId);
    const course=courses.find(c=>c.editorLanguage===track.language);
    assert.ok(published && course?.lessonIds.includes(track.lessonId));
    assert.equal(track.levels.length,3,track.lessonId);
    assert.deepEqual(track.levels.map(x=>x.id),["guided","practice","challenge"]);
    assert.ok(track.topic.length>20,track.lessonId);
    for(const level of track.levels){
      const reason=track.lessonId+" "+level.id;
      assert.ok(level.context.length>=30,reason+" needs realistic context");
      assert.ok(level.code.length>=18,reason+" needs runnable program");
      assert.equal(level.choices.length,3,reason);
      assert.equal(new Set(level.choices.map(x=>x.text)).size,3,reason);
      assert.equal(level.choices.filter(x=>x.text===level.expected).length,1,reason);
      for(const x of level.choices)
        assert.ok(x.feedback.length>=30,reason+" needs explanation per alternative");
      assert.ok(level.hint.length>=30,reason);
      assert.ok(level.why.length>=40,reason);
    }
    const own=track.independent;
    assert.ok(own.brief.length>=90,track.lessonId);
    assert.ok(own.starterCode!==own.modelCode,track.lessonId);
    for(const field of ["title","modelCode","starterCode","expectedOutput",
      "variationCode","variationExpected","reflection"]){
      assert.ok(typeof own[field]==="string"&&own[field].length>0,
        track.lessonId+" missing "+field);
    }
  }
});
test("the shared studio appears in all course lesson flows, without altering grading",()=>{
  const read=p=>readFileSync(new URL("../src/"+p,import.meta.url),"utf8");
  const course=read("components/course-lesson.tsx");
  assert.equal((course.match(/<AppliedLearningStudio lessonId=\{lesson.id\} language=\{editorLanguage\}\/>/g)||[]).length,2);
  for(const original of ["<CompleteLesson lessonId={lesson.id}","<TransferLab lessonId={lesson.id}",
    "<CodeTransferLab lessonId={lesson.id}","<QuizCard question={diagnostic}",
    "<CodePlayground starterCode={lesson.code}"]){
    assert.ok(course.includes(original),"original grader removed: "+original);
  }
  const ui=read("components/python-applied-studio.tsx");
  for(const phrase of ["python-applied-path.json","java-applied-path.json",
    "javascript-applied-path.json",'language={language}',"setSubmitted",
    "Bu anlık alıştırmanın sonucu hesaba kaydedilmez","sonuç otomatik değerlendirilmiyor"]){
    assert.ok(ui.includes(phrase),"shared UI lost "+phrase);
  }
  assert.doesNotMatch(ui,/fetch\(|localStorage|recordAttempt|masteryScore/);
});
