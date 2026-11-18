import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {absoluteUrl,canonicalFor,siteOrigin} from "../src/lib/site-url.mjs";

const read=(p)=>readFileSync(new URL("../src/"+p,import.meta.url),"utf8");

test("canonical URLs come only from a valid APP_ORIGIN",()=>{
  assert.equal(siteOrigin({}),null);
  assert.equal(siteOrigin({APP_ORIGIN:"not a url"}),null);
  assert.equal(siteOrigin({APP_ORIGIN:"javascript:alert(1)"}),null);
  assert.equal(siteOrigin({APP_ORIGIN:"https://devacademy.example/x"}),"https://devacademy.example");
  assert.deepEqual(canonicalFor("/radar",{}),{});
  assert.deepEqual(canonicalFor("/radar",{APP_ORIGIN:"https://devacademy.example"}),{alternates:{canonical:"/radar"}});
  assert.equal(absoluteUrl("/kurslar",{}),undefined);
  assert.equal(absoluteUrl("/kurslar",{APP_ORIGIN:"https://devacademy.example"}),"https://devacademy.example/kurslar");
  assert.match(read("app/layout.tsx"),/metadataBase:new URL\(origin\)/);
});
test("icon, default Open Graph image and course structured data are provided",()=>{
  assert.ok(existsSync(new URL("../src/app/icon.svg",import.meta.url)));
  const og=read("app/opengraph-image.tsx");
  assert.match(og,/ImageResponse/);
  assert.match(og,/export const alt=/);
  for(const page of ["app/kurslar/[courseSlug]/page.tsx","app/kurslar/[courseSlug]/[lessonSlug]/page.tsx"]){
    assert.match(read(page),/<CourseJsonLd course=\{course\}/,page);
    assert.match(read(page),/canonicalFor\(/,page);
  }
  const ld=read("components/course-json-ld.tsx");
  assert.match(ld,/"@type":"Course"/);
  assert.match(ld,/replace\(\/<\/g/);
});
