import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(p)=>readFileSync(new URL("../src/"+p,import.meta.url),"utf8");
const tokens=read("app/design-tokens.css");
const styles=read("app/globals.css");
const primitives=read("components/ui-primitives.tsx");
const home=read("app/page.tsx");
const layout=read("app/layout.tsx");
const course=read("app/kurslar/page.tsx");
const progress=read("components/progress-dashboard.tsx");

function value(name){
  const escaped=name.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&");
  const m=tokens.match(new RegExp(escaped+":(#[A-Fa-f0-9]{6})"));
  assert.ok(m,name+" missing literal theme color");
  return m[1];
}
function linear(n){return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}
function luminance(hex){
  const x=[1,3,5].map(i=>linear(parseInt(hex.slice(i,i+2),16)/255));
  return x[0]*.2126+x[1]*.7152+x[2]*.0722;
}
function contrast(a,b){const [high,low]=[luminance(value(a)),luminance(value(b))].sort((x,y)=>y-x);
  return (high+.05)/(low+.05);
}

test("olive and earth semantic colors remain legible for normal text",()=>{
  const textPairs=[
    ["--color-ink","--color-cream"],
    ["--color-ink-muted","--color-cream"],
    ["--color-olive-800","--color-paper"],
    ["--color-terracotta-700","--color-paper"],
    ["--color-paper","--color-olive-800"],
    ["--color-code-ink","--color-code-bg"]
  ];
  for(const [fg,bg] of textPairs)
    assert.ok(contrast(fg,bg)>=4.5,fg+" on "+bg+" failed text contrast: "+contrast(fg,bg).toFixed(2));
  assert.match(tokens,/color-scheme:light/);
  assert.ok(!/https?:\/\/|@font-face|url\s*\(/.test(tokens),"local system fonts only");
});
test("semantic tokens cover spacing, type, radii, focus, shadow and motion",()=>{
  for(const token of [
    "--ui-canvas","--ui-surface","--ui-ink","--ui-ink-subtle","--ui-action",
    "--ui-focus","--ui-border","--ui-code","--font-body","--font-display",
    "--font-code","--space-4","--space-8","--radius-md","--radius-lg",
    "--shadow-card","--motion-quick"
  ])assert.ok(tokens.includes(token+":"),token+" missing");
  assert.match(styles,/^@import "\.\/design-tokens\.css";/);
  assert.doesNotMatch(styles,/:root\{color-scheme:dark/);
  assert.match(styles,/prefers-reduced-motion:reduce/);
  assert.match(styles,/min-height:44px/);
});
test("shared basic components are used in actual pages, not merely authored",()=>{
  for(const prop of ["ui-button-primary","ui-button-secondary","ui-button-text",
    "ui-card","ui-eyebrow","ui-pill"])assert.ok(primitives.includes(prop),prop);
  assert.match(home,/ActionLink href="\/kurslar"/);
  assert.match(home,/SectionHeading eyebrow="Yolculuğun başlangıcı"/);
  assert.match(home,/feature-card ui-card/);
  assert.match(layout,/StatusPill tone="terracotta"/);
  assert.match(course,/catalog-card ui-card/);
  assert.match(progress,/dashboard-stat ui-card/);
  assert.match(styles,/\.studio-code\{background:var\(--ui-code\)/);
});
