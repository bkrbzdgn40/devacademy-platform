import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(p)=>readFileSync(new URL("../src/"+p,import.meta.url),"utf8");
const nav=read("components/site-nav.tsx");
const layout=read("app/layout.tsx");
const styles=read("app/globals.css");

test("header navigation marks the current section with aria-current",()=>{
  assert.match(layout,/<SiteNav\/>/);
  assert.match(nav,/usePathname/);
  assert.match(nav,/within\(pathname,"\/kurslar"\)\)return "learn"/);
  assert.match(nav,/within\(pathname,"\/kutuphane"\)\|\|within\(pathname,"\/radar"\)\)return "discover"/);
  assert.match(nav,/<summary aria-current=\{current\("discover"\)\}>Keşfet<\/summary>/);
  assert.match(styles,/\.nav-links>a\[aria-current="page"\]/);
});
