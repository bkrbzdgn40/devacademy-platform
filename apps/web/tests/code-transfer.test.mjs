import test from "node:test";
import assert from "node:assert/strict";
import {codeTransferLessons,publicCodeTransferTask,supportsCodeTransfer}
  from "../src/server/code-transfer.mjs";
import {transferLessonIds} from "../src/server/transfer-missions.mjs";
import practice from "../src/data/practice.json" with {type:"json"};
test("every independent concept has one authored, revision-pinned code task",()=>{
  assert.deepEqual([...codeTransferLessons].sort(),[...transferLessonIds].sort());
  for(const lessonId of codeTransferLessons) {
    assert.ok(supportsCodeTransfer(lessonId));
    const task=publicCodeTransferTask(lessonId);
    assert.ok(task?.starterCode?.length>20);
    assert.equal(task.revision,1);
    assert.equal(task.publicCases.length,2);
    assert.ok(["javascript","python","java"].includes(task.language));
    assert.ok(practice.some(x=>x.id===task.id));
    assert.equal("hiddenCases" in task,false);
    assert.equal("cases" in task,false);
  }
  assert.equal(supportsCodeTransfer("not-a-lesson"),false);
});
test("public metadata never contains the trusted worker's private bank",()=>{
  const task=publicCodeTransferTask(codeTransferLessons[0]);
  assert.equal(JSON.stringify(task).includes("private"),false);
});
