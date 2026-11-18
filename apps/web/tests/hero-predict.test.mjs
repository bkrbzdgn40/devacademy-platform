import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const hero=readFileSync(new URL("../src/components/hero-predict.tsx",import.meta.url),"utf8");
const codeBlock=hero.slice(hero.indexOf("const codeLines=["),hero.indexOf("];",hero.indexOf("const codeLines=[")));
const codeLines=[...codeBlock.matchAll(/^\s*"(.*)",$/gm)].map(m=>m[1]);
const optionBlock=hero.slice(hero.indexOf("const options=["),hero.indexOf("const trace=["));
const options=[...optionBlock.matchAll(/\{id:"(\w+)",label:"([^"]*)",correct:(true|false)/g)].map(m=>({id:m[1],label:m[2],correct:m[3]==="true"}));
const traceLines=[...hero.matchAll(/\{line:(\d+),text:/g)].map(m=>Number(m[1]));

test("hero question is not answerable by reading the call site",()=>{
  assert.equal(options.length,3);
  assert.equal(options.filter(o=>o.correct).length,1);
  assert.notEqual(options.findIndex(o=>o.correct),0,"correct answer must not be the first option");
  const mainStart=codeLines.findIndex(line=>line.startsWith("void main"));
  assert.ok(mainStart>0);
  const callSite=codeLines.slice(mainStart).join("\n");
  for(const option of options)assert.ok(!callSite.includes(option.label),"call site must not print an option verbatim");
  assert.ok(codeLines.some(line=>line.includes("@Override")),"Dog overrides a concrete Animal method");
});
test("hero trace points at existing code lines and keeps accessible feedback",()=>{
  assert.ok(traceLines.length>=3);
  for(const line of traceLines)assert.ok(line>=1&&line<=codeLines.length&&codeLines[line-1].trim(),"trace line "+line);
  assert.match(hero,/aria-live="polite"/);
  assert.match(hero,/type="radio"/);
  for(const block of optionBlock.matchAll(/feedback:"([^"]+)"/g))assert.doesNotMatch(block[1],/[—–]/);
});
