import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { caseBank } from "../../../services/code-runner/src/exercises-private.mjs";
const published=JSON.parse(readFileSync(new URL("../src/data/practice.json",import.meta.url),"utf8"));
test("public coding catalog has validated stable IDs and matching worker revisions",()=>{
  assert.equal(published.length,11);
  assert.equal(new Set(published.map(x=>x.id)).size,published.length);
  assert.equal(new Set(published.map(x=>x.slug)).size,published.length);
  const transfer=published.filter(task=>task.transferLessonId);
  assert.equal(transfer.length,6);
  assert.equal(new Set(transfer.map(t=>t.transferLessonId)).size,6);
  for(const task of published){
    assert.equal(task.revision,caseBank[task.id].revision);
    assert.equal(task.functionName,caseBank[task.id].functionName);
    assert.ok((task.language==="python"&&task.starterCode.includes("def "+task.functionName)) ||
      (task.language==="java"&&task.starterCode.includes("class Solution")) ||
      ((!task.language||task.language==="javascript")&&task.starterCode.includes("function "+task.functionName)));
    assert.ok(!("cases" in task));
    assert.ok(!("hiddenCases" in task));
    const publicCases=caseBank[task.id].cases.filter(c=>c.public);
    assert.deepEqual(task.publicCases,publicCases.map(c=>({label:c.label,args:c.args,expected:c.expected})));
    assert.ok(caseBank[task.id].cases.some(c=>c.public===false));
  }
});
