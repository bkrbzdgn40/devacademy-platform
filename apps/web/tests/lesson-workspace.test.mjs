import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import courses from "../src/data/courses.json" with {type:"json"};
import lessons from "../src/data/lessons.json" with {type:"json"};
const read=name=>readFileSync(new URL("../src/"+name,import.meta.url),"utf8");
const page=read("components/course-lesson.tsx");
const map=read("components/lesson-course-map.tsx");
const stepper=read("components/lesson-stepper.tsx");
const css=read("app/globals.css");
test("every published lesson has a real linked course map",()=>{
  const ids=new Set(lessons.map(l=>l.id));
  for(const course of courses)assert.ok(course.lessonIds.every(id=>ids.has(id)));
  assert.match(page,/<LessonCourseMap courseTitle=\{course.title\}/);
  assert.match(page,/currentIndex=\{index\}/);
  assert.match(map,/aria-current=\{i===currentIndex\?"page":undefined\}/);
  assert.match(map,/<details className="course-map-mobile">/);
  assert.match(map,/className="course-map-desktop"/);
  assert.match(map,/href=\{lessonBase\+"\/"\+entry.slug\}/);
  assert.match(map,/Konumun gösteriliyor, tamamlama puanı değil/);
  assert.doesNotMatch(map,/completedAt|localStorage|fetch\(/);
  assert.match(css,/\.course-map-desktop\{position:sticky/);
});
test("course lesson preserves assessments while collapsing supplementary reading",()=>{
  for(const snippet of [
    'questionCount={questions.length}','predictionQuestions.slice(1)',
    'questions.map(','<CompleteLesson lessonId={lesson.id}',
    '<TransferLab lessonId={lesson.id}','<CodeTransferLab lessonId={lesson.id}',
    'starterCode={lesson.code}','<LearningStudio lessonId={lesson.id}'
  ])assert.ok(page.includes(snippet),"lost existing lesson behavior "+snippet);
  assert.match(page,/className="lesson-supplement lesson-sample-disclosure"/);
  assert.match(page,/className="lesson-supplement lesson-depth-disclosure"/);
  assert.match(page,/className="lesson-workspace-main"/);
  assert.doesNotMatch(page,/<main className="lesson-workspace-main"/);
});
test("stage keyboard navigation, focus and answer retention survive redesign",()=>{
  assert.match(stepper,/aria-label="Ders aşamaları"/);
  assert.match(stepper,/aria-current=\{active===index\?"step":undefined\}/);
  assert.match(stepper,/visited\.includes\(index\)/);
  assert.match(stepper,/hidden=\{active!==index\}/);
  assert.match(stepper,/data-stage-previous/);
  assert.match(stepper,/data-stage-next/);
  assert.match(stepper,/ArrowLeft/);
  assert.match(stepper,/ArrowRight/);
  assert.match(stepper,/event.key==="Home"/);
  assert.match(stepper,/event.key==="End"/);
  assert.match(stepper,/focus\(\{preventScroll:true\}\)/);
  assert.match(stepper,/Aşama \{active\+1\} \/ \{steps.length\}/);
  assert.match(css,/scroll-snap-type:x proximity/);
  assert.match(css,/overscroll-behavior-x:contain/);
});
