import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(p)=>readFileSync(new URL("../src/"+p,import.meta.url),"utf8");

test("ders aşaması adreste tutulur ve yenilemede geri yüklenir",()=>{
  const stepper=read("components/lesson-stepper.tsx");
  assert.ok(stepper.includes('const STAGE_PARAM="asama"'));
  assert.ok(stepper.includes('new URLSearchParams(window.location.search).get(STAGE_PARAM)'));
  // replaceState: aşama değişimi geri tuşu geçmişini doldurmaz.
  assert.ok(stepper.includes('window.history.replaceState(null,"",url)'));
  assert.ok(stepper.includes('url.searchParams.delete(STAGE_PARAM)'));
});
test("kurs araması adreste tutulur, geri tuşundan sonra korunur",()=>{
  const explorer=read("components/course-explorer.tsx");
  assert.ok(explorer.includes('const SEARCH_PARAM="ara"'));
  assert.ok(explorer.includes('new URLSearchParams(window.location.search).get(SEARCH_PARAM)'));
  assert.ok(explorer.includes('window.history.replaceState(null,"",url)'));
});
test("Örneği sıfırla geri alınabilir; yeni düzenleme geri almayı iptal eder",()=>{
  const playground=read("components/code-playground.tsx");
  assert.ok(playground.includes('onClick={()=>{setUndoCode(code);setCode(starterCode);'));
  assert.ok(playground.includes('className="editor-undo" role="status"'));
  assert.ok(playground.includes('onClick={()=>{setCode(undoCode);setUndoCode(null);'));
  assert.ok(playground.includes('onChange={value=>{setCode(value);setUndoCode(null);'));
  // Geri al düğmesi kaybolunca odak editöre döner.
  assert.ok(playground.includes('shell.current?.querySelector<HTMLElement>(".cm-content")?.focus()'));
});
