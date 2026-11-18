import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {gradeSubmission} from "../src/server/grade.ts";

const read=path=>readFileSync(new URL("../src/"+path,import.meta.url),"utf8");
const questions=JSON.parse(read("data/questions.json"));
const grade=read("server/grade.ts");
const quiz=read("components/quiz-card.tsx");

test("every wrong option returns its own feedback and no generic fallback exists",()=>{
  assert.doesNotMatch(grade,/İşlem sırasını ve türleri tekrar kontrol et/);
  assert.match(grade,/wrongFeedback\?\.\[data\.optionId\]\?\?null/);
  for(const question of questions){
    const seen=new Set();
    for(const option of question.options){
      const result=gradeSubmission({questionId:question.id,optionId:option.id});
      assert.equal(result.status,"graded");
      if(result.correct){assert.equal(result.tailoredFeedback,null);continue;}
      assert.ok(result.tailoredFeedback&&result.tailoredFeedback.length>20,question.id+"/"+option.id);
      assert.doesNotMatch(result.tailoredFeedback,/[—–]/);
      seen.add(result.tailoredFeedback);
    }
    assert.equal(seen.size,question.options.length-1,question.id+" wrong options share one sentence");
  }
});
test("retry cue only appears while the correct answer is still hidden",()=>{
  assert.doesNotMatch(quiz,/Hatalı deneme öğrenmenin bir parçası/);
  assert.match(quiz,/wrongAttempts>0 && mode==="debug" && !revealSolution && <p className="retry-cue">/);
});
