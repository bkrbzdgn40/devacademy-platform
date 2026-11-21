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
  const needle=name+":";
  const start=tokens.indexOf(needle);
  assert.ok(start>=0,name+" missing literal theme color");
  const hex=tokens.slice(start+needle.length,start+needle.length+7);
  assert.match(hex,/^#[A-Fa-f0-9]{6}$/,name+" invalid theme color");
  return hex;
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
  assert.match(home,/SectionHeading id="explore-title"/);
  for(const overline of ["Yolculuğun başlangıcı","Sana ait öğrenme rotası","DevAcademy öğrenme döngüsü","Sektör radarı"])
    assert.ok(!home.includes(overline),overline);
  assert.doesNotMatch(home,/href="\/[^"]*"[^>]*>[^<]*↗/);
  assert.doesNotMatch(read("components/hero-predict.tsx"),/window-dots/);
  assert.ok((home.match(/değil,/g)?.length??0)<=1,"X değil, Y en fazla bir kez");
  for(const note of ["home-method-note","radar-integrity","radar-disclaimer","gerçek"])assert.ok(!home.includes(note),note);
  assert.match(read("components/hero-predict.tsx"),/<span>Önceden hazırlanmış iz<\/span><\/div>/);
  assert.doesNotMatch(read("components/learning-path-card.tsx"),/path-mark/);
  // M8.7 fihrist dili: liste, ızgara ve panel öğeleri kutu kart değil.
  assert.match(home,/className="feature-card home-explore-row"/);
  assert.match(home,/className="radar-source-list"/);
  assert.match(layout,/StatusPill tone="terracotta"/);
  assert.match(course,/CourseExplorer/);
  const card=read("components/learning-path-card.tsx");
  // Fihrist düzeni: ders yolları kutu kart değil, numaralı liste satırı.
  assert.match(card,/"path-card path-"/);
  assert.doesNotMatch(card,/ui-card/);
  assert.match(card,/className="path-index-no" aria-hidden="true"/);
  assert.match(card,/className="path-cta"/);
  assert.match(home,/<ol className="path-index home-path-grid"/);
  assert.match(read("components/course-explorer.tsx"),/<ol className="path-index"/);
  assert.match(read("components/course-explorer.tsx"),/index=\{learningPaths\.findIndex\(p=>p\.id===path\.id\)\}/);
  assert.doesNotMatch(styles,/\.path-grid/);
  assert.match(progress,/className="dashboard-stat"/);
  for(const file of ["app/page.tsx","app/radar/page.tsx","app/hesap/page.tsx","app/laboratuvar/page.tsx",
    "components/course-overview.tsx","components/continue-learning.tsx","components/progress-dashboard.tsx"])
    assert.doesNotMatch(read(file),/ui-card/,file+" kutu kart kullanmamalı");
  const index=styles.slice(styles.indexOf("/* M8.7 | Fihrist dili"));
  assert.ok(index.length>0,"M8.7 fihrist katmanı eksik");
  for(const rule of [".lesson-list .lesson-item{background:transparent;border:0;border-radius:0;box-shadow:none",
    ".radar-health-card .radar-health-tag{background:transparent",".dashboard-stats>.dashboard-stat{background:transparent",
    "border-top:2px solid var(--ui-ink);border-radius:0;box-shadow:none"])assert.ok(index.includes(rule),rule);
  assert.match(index,/prefers-reduced-motion:reduce/);
  // 320px'te dört menü öğesi logo ve tema düğmesiyle tek satıra sığmıyor: menü alt satırda dört sütun.
  assert.match(styles,/@media\(max-width:420px\)\{[^}]*\.site-header \.nav-inner\{flex-wrap:wrap[\s\S]*?\.site-header \.nav-links\{order:2;flex:1 1 100%;display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  // Radar: haberler derse göre gruplanır; ders bloğu her grupta bir kez görünür.
  const radar=read("app/radar/page.tsx");
  assert.match(radar,/<ol className="radar-group-index"/);
  // learning.label sürüme özgü olduğu için neredeyse hiç birleştirmez; gruplar konu anahtarıyla kurulur.
  assert.match(radar,/const key=item\.topic\.key;/);
  assert.match(radar,/className="radar-group-no" aria-hidden="true"/);
  assert.match(radar,/<summary>Bu derse neden bağlandı\?<\/summary>/);
  assert.match(radar,/className="radar-health-strip"/);
  assert.doesNotMatch(radar,/radar-article-grid|Neden öğrenmeye değer\?/);
  assert.match(styles,/\.radar-topic-filters\{[^}]*overflow-x:auto/);
  assert.doesNotMatch(styles,/\.radar-article-grid/);
  assert.match(styles,/\.studio-code\{background:var\(--ui-code\)/);
});


test("dark espresso, olive and terracotta remain readable and coherent",()=>{
  const darkSection=tokens.slice(tokens.indexOf('html[data-theme="dark"]{'));
  assert.ok(darkSection.startsWith('html[data-theme="dark"]{'));
  function darkValue(token){
    const match=darkSection.match(new RegExp(token+":(#[0-9A-Fa-f]{6})"));
    assert.ok(match,token+" absent in dark palette");
    return match[1];
  }
  function ratio(a,b){
    const high=Math.max(luminance(darkValue(a)),luminance(darkValue(b)));
    const low=Math.min(luminance(darkValue(a)),luminance(darkValue(b)));
    return (high+.05)/(low+.05);
  }
  for(const [fg,bg] of [
    ["--color-ink","--color-cream"],
    ["--color-ink-muted","--color-cream"],
    ["--color-ink","--color-paper"],
    ["--color-olive-800","--color-paper"],
    ["--color-terracotta-700","--color-paper"],
    ["--color-code-ink","--color-code-bg"]
  ]) assert.ok(ratio(fg,bg)>=4.5,fg+" on "+bg+" dark contrast insufficient: "+ratio(fg,bg).toFixed(2));
  assert.match(darkSection,/--ui-action-ink:#[0-9A-Fa-f]{6}/);
  assert.match(darkSection,/color-scheme:dark/);
  assert.match(styles,/\.theme-control-menu\{/);
  assert.match(styles,/\.theme-control-option\{/);
  assert.match(styles,/\.theme-control-option\[aria-checked="true"\]/);
  assert.match(styles,/background:var\(--ui-surface\)/);
  assert.match(styles,/html\[data-theme="dark"\] \.studio-code/);
  assert.match(styles,/html\[data-theme="dark"\] \.editor-shell \.cm-editor/);
  assert.match(layout,/ThemeSwitcher/);
  assert.match(layout,/strategy="beforeInteractive"/);
});
test("theme choice is user-controlled and never touches learner records",()=>{
  const switcher=read("components/theme-switcher.tsx");
  assert.match(switcher,/devacademy-theme/);
  assert.match(switcher,/value:"system",label:"Sistem"/);
  assert.match(switcher,/value:"light",label:"Açık"/);
  assert.match(switcher,/value:"dark",label:"Koyu"/);
  assert.match(switcher,/role="menuitemradio"/);
  assert.match(switcher,/aria-checked=\{preference===choice.value\}/);
  assert.match(switcher,/aria-expanded=\{open\}/);
  assert.match(switcher,/event.key==="Escape"/);
  assert.doesNotMatch(switcher,/<select|<option/);
  assert.match(switcher,/prefers-color-scheme: dark/);
  assert.match(switcher,/useSyncExternalStore/);
  assert.doesNotMatch(switcher,/fetch\(|\/api\/|execution_jobs|document\.cookie/);
  const editor=read("components/code-playground.tsx");
  // Code surfaces are dark brown in both site themes, so the editor always uses the studio theme.
  assert.match(editor,/theme=\{ready\.theme\}/);
  assert.match(editor,/EditorView\.theme\(\{[\s\S]*\}, \{dark: true\}\)/);
});
test("theme boot disables transitions until the first frame",()=>{
  assert.match(layout,/root\.classList\.add\("theme-booting"\)/);
  assert.match(layout,/requestAnimationFrame\(function\(\)\{requestAnimationFrame\(function\(\)\{root\.classList\.remove\("theme-booting"\)/);
  assert.match(styles,/html\.theme-booting \*[^{]*\{\s*transition:none!important/);
});
