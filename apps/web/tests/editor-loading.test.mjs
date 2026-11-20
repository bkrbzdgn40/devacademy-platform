import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../src/components/code-playground.tsx",import.meta.url),"utf8");
test("editor loads one runtime grammar on demand",()=>{
  for(const name of ["javascript","java","python"]){
    assert.ok(source.includes('await import("@codemirror/lang-'+name+'")'));
    assert.ok(!source.includes('from "@codemirror/lang-'+name+'";'));
  }
  assert.match(source,/grammar\?\.language === language/);
  assert.match(source,/cancelled = true/);
  // Editor renders only once its grammar is ready, from the same import (no second lazy suspension = no CLS).
  assert.match(source,/ready \? <ready\.Editor/);
  assert.ok(!source.includes("next/dynamic"));
});
