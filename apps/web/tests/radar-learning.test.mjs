import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {selectRadarLearning} from "../src/lib/radar-learning.mjs";
import {matchRadarTopic,radarTopics} from "../src/lib/radar-feed.mjs";

const lessons=JSON.parse(readFileSync(new URL("../src/data/lessons.json",import.meta.url),"utf8"));
const courses=JSON.parse(readFileSync(new URL("../src/data/courses.json",import.meta.url),"utf8"));
const catalog=JSON.parse(readFileSync(new URL("../src/data/catalog.json",import.meta.url),"utf8"));
const linkOk=(href)=>{
  const bits=href.split("/").filter(Boolean);
  if(bits[0]==="kurslar"){
    const course=courses.find(x=>x.slug===bits[1]);
    assert.ok(course,"Missing course: "+href);
    if(bits[2])assert.ok(lessons.some(x=>course.lessonIds.includes(x.id)&&x.slug===bits[2]),
      "Missing linked lesson: "+href);
  }else if(bits[0]==="kutuphane"){
    assert.ok(["diller","kavramlar","teknolojiler"].includes(bits[1]),"Missing catalog route: "+href);
    const target={diller:"language",kavramlar:"concept",teknolojiler:"technology"}[bits[1]];
    assert.ok(catalog.some(x=>x.kind===target),"Missing catalog group: "+href);
  }else{assert.fail("Unrecognized learning link: "+href);}
};
const classify=(title,tags=[])=>{
  const topic=matchRadarTopic(title,tags);
  assert.ok(topic,"No broad topic for "+title);
  return {topic,learning:selectRadarLearning({title,tags,topicKey:topic.key})};
};
test("all curated learning destinations resolve to real lessons or honestly labeled catalog previews",()=>{
  for(const topic of radarTopics){
    const result=selectRadarLearning({title:topic.label,topicKey:topic.key});
    assert.ok(result,topic.key);
    assert.ok(result.context.length>=40);
    assert.ok(result.why.length>=40);
    assert.ok(result.question.length>=25);
    assert.ok(result.coverage);
    assert.equal(result.basis,"Başlık ve varsa etiket eşleşmesi");
    linkOk(result.primary.href);
    if(result.secondary)linkOk(result.secondary.href);
  }
});
test("Python asyncio is never misrepresented as JavaScript Promise instruction",()=>{
  const {topic,learning}=classify("Python asyncio: async def and coroutines");
  assert.equal(topic.key,"python");
  assert.equal(learning.label,"Python'da asyncio ve eşzamanlılık");
  assert.equal(learning.primary.href,"/kurslar/python-temelleri/fonksiyonlar");
  assert.equal(learning.coverage,"temel hazırlık");
  assert.doesNotMatch(learning.context,/Promise dersi bu konunun doğrudan karşılığıdır/i);
  assert.match(learning.context,/doğrudan karşılığı değildir/);
});
test("Python subtopics connect to different appropriate lessons",()=>{
  const pairs=[
    ["Python pandas DataFrame operations","/kurslar/python-temelleri/listeler-ve-sozlukler"],
    ["NumPy arrays and Python data processing","/kurslar/python-temelleri/listeler-ve-sozlukler"],
    ["Python pytest unit testing","/kurslar/python-temelleri/fonksiyonlar"],
    ["Python 3.15 release notes","/kurslar/python-temelleri/degiskenler-ve-turler"],
    ["Python condition truthiness","/kurslar/python-temelleri/kosullar"],
    ["Python range loops","/kurslar/python-temelleri/donguler"],
    ["Python security CVE-2026-12345","/kurslar/python-temelleri"],
    ["Python: a tool with no matching lesson","/kurslar/python-temelleri"]
  ];
  for(const [headline,href] of pairs){
    const {learning,topic}=classify(headline);
    assert.equal(topic.key,"python");
    assert.equal(learning.primary.href,href,headline);
    linkOk(learning.primary.href);
  }
});
test("JavaScript array operations and asynchronous events have separate lesson bridges",()=>{
  const pairs=[
    ["JavaScript Promise microtask","/kurslar/javascript-temelleri/asenkron-temeller"],
    ["JavaScript Array.map()","/kurslar/javascript-temelleri/dizilerde-map"],
    ["JavaScript Array.filter()","/kurslar/javascript-temelleri/dizilerde-filter"],
    ["Node.js runtime update","/kurslar/javascript-temelleri"]
  ];
  for(const [headline,expected] of pairs)assert.equal(classify(headline).learning.primary.href,expected);
  assert.equal(classify("Java polymorphism override").learning.primary.href,
    "/kurslar/java-temelleri/polymorphism");
  assert.equal(classify("Binary search algorithm").learning.primary.href,"/kurslar/veri-yapilari-algoritmalar/ikili-arama");
  assert.equal(classify("Data structures overview").learning.primary.href,"/kurslar/veri-yapilari-algoritmalar");
  assert.equal(classify("Spring Boot Java features").learning.primary.href,
    "/kurslar/java-temelleri/metotlar-ve-return");
});
test("unsupported TypeScript/React/Docker courses are not advertised as completed lessons",()=>{
  for(const headline of ["TypeScript 6 releases","React compiler",
    "Docker containers"]){
    const {learning}=classify(headline);
    assert.equal(learning.primary.kind,"Katalog önizlemesi",headline);
    assert.match(learning.coverage,/katalog/);
    assert.ok(learning.primary.href.startsWith("/kutuphane/"));
  }
});
test("official release mappings are distinct, repo-scoped and still link to existing pages",()=>{
  const cases=[
    ["nodejs/node","javascript","Node.js sürüm duyurusu"],
    ["microsoft/TypeScript","typescript","TypeScript sürüm duyurusu"],
    ["facebook/react","react","React sürüm duyurusu"],
    ["astral-sh/ruff","python","Ruff sürüm duyurusu"],
    ["spring-projects/spring-boot","java","Spring Boot sürüm duyurusu"]
  ];
  for(const [releaseRepo,topicKey,label] of cases){
    const link=selectRadarLearning({title:"untrusted release title",topicKey,releaseRepo});
    assert.equal(link.label,label);
    assert.equal(link.basis,"Doğrulanmış depo sürüm kaydı");
    assert.ok(link.context.includes("sürüm"));
    linkOk(link.primary.href);
    if(link.secondary)linkOk(link.secondary.href);
  }
  assert.equal(selectRadarLearning({title:"PostgreSQL schema changes",topicKey:"postgres"}).primary.href,"/kurslar/sql-temelleri");
  assert.equal(selectRadarLearning({title:"unknown",topicKey:"unsupported"}),null);
  assert.equal(selectRadarLearning({title:"Python",topicKey:"python",releaseRepo:"fake-owner/fake-repo"}).basis,
    "Başlık ve varsa etiket eşleşmesi");
});
test("UI labels source-derived hints as hints, exposes an article-reading question and keeps outbound HTML inert",()=>{
  const html=readFileSync(new URL("../src/app/radar/page.tsx",import.meta.url),"utf8");
  assert.match(html,/item\.learning\.context/);
  assert.match(html,/item\.learning\.why/);
  assert.match(html,/item\.learning\.question/);
  assert.match(html,/item\.learning\.coverage/);
  assert.match(html,/item\.learning\.basis/);
  assert.match(html,/item\.learning\.primary\.kind/);
  assert.match(html,/item\.learning\.secondary/);
  assert.match(html,/Kaynağı|Kaynağı okurken/);
  assert.match(html,/makale özeti değildir/);
  assert.doesNotMatch(html,/dangerouslySetInnerHTML/);
});
