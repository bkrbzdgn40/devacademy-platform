import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import courses from "../src/data/courses.json" with {type:"json"};
import {courseOfferPhrase,courseCount,languageCount,languageCourseNames,topicCourseTitles} from "../src/lib/course-summary.mjs";

const read=(p)=>readFileSync(new URL("../src/"+p,import.meta.url),"utf8");

test("course copy is derived from course data, including SQL and algorithms",()=>{
  assert.equal(courseCount,courses.length);
  assert.equal(languageCount,new Set(courses.map(c=>c.languageId)).size);
  assert.equal(languageCourseNames.length+topicCourseTitles.length,courses.length);
  const phrase=courseOfferPhrase();
  for(const name of ["JavaScript","Java","Python","SQL","Veri Yapıları ve Algoritmalar"])assert.ok(phrase.includes(name),name);
});
test("pages no longer hard-code course lists, language counts or milestone codes",()=>{
  const home=read("app/page.tsx"),list=read("app/kurslar/page.tsx");
  for(const source of [home,list,read("app/kutuphane/[category]/page.tsx")]){
    assert.doesNotMatch(source,/JavaScript, Java ve Python/);
    assert.match(source,/courseOfferPhrase\(\)/);
  }
  assert.match(list,/\{languageCount\}<\/strong> dil/);
  assert.doesNotMatch(list,/programlama dili/);
  assert.doesNotMatch(home,/eyebrow="Sektör radarı"/);
  for(const page of ["app/radar/page.tsx","app/sql-ornek-veri/page.tsx","components/code-transfer-lab.tsx"])
    assert.doesNotMatch(read(page),/overline">[^<]*\bM\d/,page);
  for(const page of ["app/pratik/page.tsx","app/laboratuvar/page.tsx","components/course-overview.tsx"])
    assert.doesNotMatch(read(page),/Geliştirme önizlemesi/,page);
  assert.match(read("app/layout.tsx"),/Geliştirme önizlemesi/);
  assert.doesNotMatch(read("lib/radar-learning.mjs"),/genel temel|temel hazırlık/i);
});
