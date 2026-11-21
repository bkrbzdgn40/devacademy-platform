import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(p)=>readFileSync(new URL("../src/"+p,import.meta.url),"utf8");

test("ders aşaması adreste tutulur ve yenilemede geri yüklenir",()=>{
  const stepper=read("components/lesson-stepper.tsx");
  assert.ok(stepper.includes('const STAGE_PARAM="asama"'));
  assert.ok(stepper.includes('new URLSearchParams(window.location.search).get(STAGE_PARAM)'));
  // Aşama değişimi geri tuşu geçmişini doldurmaz; aşama 01 parametreyi siler.
  assert.ok(stepper.includes('replaceSearchParam(STAGE_PARAM,index===0?null:steps[index].id)'));
});
test("kurs araması adreste tutulur, geri tuşundan sonra korunur",()=>{
  const explorer=read("components/course-explorer.tsx");
  assert.ok(explorer.includes('const SEARCH_PARAM="ara"'));
  assert.ok(explorer.includes('new URLSearchParams(window.location.search).get(SEARCH_PARAM)'));
  assert.ok(explorer.includes('replaceSearchParam(SEARCH_PARAM,value.trim()?value:null)'));
});
test("adres güncellemesi Next yönlendiricisini tetiklemez (donma regresyonu)",()=>{
  // replaceState(null,...) Next'in restore geçişini başlatıp sonraki tıklama ve
  // tuş vuruşlarını donduruyordu; mevcut state'i (__NA) geçirmek bunu atlatır.
  const helper=read("lib/url-state.ts");
  assert.ok(helper.includes('window.history.replaceState(window.history.state,"",url)'));
  for(const file of ["components/lesson-stepper.tsx","components/course-explorer.tsx"])
    assert.doesNotMatch(read(file),/history\.replaceState/,file+" yardımcıyı kullanmalı");
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
