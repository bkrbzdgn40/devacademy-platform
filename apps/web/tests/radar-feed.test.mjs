import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  getRadarFeed,radarSources,radarTopics,safeWebUrl,canonicalKey,
  matchRadarTopic,fetchGithubReleases,fetchDevCommunity
} from "../src/lib/radar-feed.mjs";

const NOW=Date.parse("2026-10-19T14:00:00Z");
const published=new Date(NOW-60_000).toISOString();
const old=new Date(NOW-130*86_400_000).toISOString();
const iso=()=>published;
const fixture={
  "https://hacker-news.firebaseio.com/v0/topstories.json":[41,42,43],
  "https://hacker-news.firebaseio.com/v0/item/41.json":{
    id:41,type:"story",title:"Python: Useful release notes for beginners",
    url:"https://dev.to/example/python-release?utm_source=hn",time:(NOW-120_000)/1000
  },
  "https://hacker-news.firebaseio.com/v0/item/42.json":{
    id:42,type:"story",title:"JavaScript event loop deep dive",
    url:"javascript:alert(1)",time:(NOW-65_000)/1000
  },
  "https://hacker-news.firebaseio.com/v0/item/43.json":{
    id:43,type:"job",title:"React engineer hiring",time:(NOW-65_000)/1000
  },
  "https://dev.to/api/articles/latest?per_page=100":[
    {id:11,title:"Python: Useful release notes for beginners",
      canonical_url:"https://dev.to/example/python-release",published_at:published,tag_list:["python"]},
    {id:12,title:"A new way to greet neighbors",url:"https://dev.to/foo/hello",published_at:published,tag_list:["personal"]},
    {id:13,title:"TypeScript sample",url:"https://dev.to/foo/old",published_at:old,tag_list:["typescript"]}
  ],
  "https://api.github.com/repos/nodejs/node/releases?per_page=4":[
    {id:7,tag_name:"v25.0.0",html_url:"https://github.com/nodejs/node/releases/tag/v25.0.0",
      published_at:published,draft:false,prerelease:false}
  ],
  "https://api.github.com/repos/microsoft/TypeScript/releases?per_page=4":[
    {id:8,tag_name:"v6.0.0",html_url:"https://github.com/microsoft/TypeScript/releases/tag/v6.0.0",
      published_at:published,draft:false,prerelease:false}
  ],
  "https://api.github.com/repos/facebook/react/releases?per_page=4":[
    {id:9,tag_name:"v19.0.0",html_url:"https://github.com/facebook/react/releases/tag/v19.0.0",
      published_at:published,draft:false,prerelease:false}
  ],
  "https://api.github.com/repos/astral-sh/ruff/releases?per_page=4":[
    {id:10,tag_name:"0.16.11",html_url:"https://github.com/astral-sh/ruff/releases/tag/0.16.11",
      published_at:published,draft:false,prerelease:false}
  ],
  "https://api.github.com/repos/spring-projects/spring-boot/releases?per_page=4":[
    {id:11,tag_name:"v4.1.1",html_url:"https://github.com/spring-projects/spring-boot/releases/tag/v4.1.1",
      published_at:published,draft:false,prerelease:false}
  ]
};
const successful=async url=>{
  assert.ok(url in fixture,"Unexpected upstream request: "+url);
  return {ok:true,json:async()=>fixture[url]};
};

test("fixed source definitions and topic links refer to published or previewed pages",()=>{
  assert.deepEqual(radarSources.map(x=>x.key),["hn","dev","github"]);
  const courses=JSON.parse(readFileSync(new URL("../src/data/courses.json",import.meta.url)));
  const lessons=JSON.parse(readFileSync(new URL("../src/data/lessons.json",import.meta.url)));
  for(const topic of radarTopics){
    assert.ok(topic.reason.length>20);
    if(topic.href.startsWith("/kurslar/")){
      const [,root,slug,lessonSlug]=topic.href.split("/");
      assert.equal(root,"kurslar");
      const course=courses.find(x=>x.slug===slug);
      assert.ok(course,"Invalid radar course link: "+topic.href);
      assert.ok(lessons.some(x=>course.lessonIds.includes(x.id)&&x.slug===lessonSlug),
        "Radar topic points to a nonexistent lesson: "+topic.href);
    }
  }
  assert.equal(matchRadarTopic("JavaScript is great")?.key,"javascript");
  assert.equal(matchRadarTopic("Java programming")?.key,"java");
  assert.equal(matchRadarTopic("TypeScript 6.0")?.key,"typescript");
});
test("URL allowlist rejects scripts and removes tracking for canonical dedupe",()=>{
  assert.equal(safeWebUrl("javascript:alert(1)"),null);
  assert.equal(safeWebUrl("http://example.com/unsafe"),null);
  assert.equal(safeWebUrl("https://user:password@example.com/"),null);
  assert.equal(canonicalKey("https://www.dev.to/a/?utm_source=hn#section"),
    canonicalKey("https://dev.to/a"));
});
test("real API-shaped fixtures yield dated, attributed items without duplicates",async()=>{
  const feed=await getRadarFeed({fetchImpl:successful,nowMs:NOW,cache:new Map()});
  assert.equal(feed.sources.length,3);
  assert.ok(feed.sources.every(x=>x.status==="fresh"&&x.checkedAt===new Date(NOW).toISOString()));
  assert.equal(feed.items.filter(x=>x.url.includes("python-release")).length,1);
  assert.equal(feed.items.find(x=>x.url.includes("python-release")).source,"dev");
  assert.equal(feed.items.find(x=>x.id==="hn-42")?.url,"https://news.ycombinator.com/item?id=42");
  assert.equal(feed.items.filter(x=>x.source==="github").length,5);
  assert.ok(feed.items.every(x=>x.publishedAt&&x.topic.href&&x.url.startsWith("https://")));
  assert.ok(feed.items.every(x=>!x.url.includes("utm_source")));
  assert.ok(!feed.items.some(x=>x.title.includes("neighbors")||x.title.includes("sample")));
});
test("refresh interval caches successful check; failed refresh marks stale, then expires",async()=>{
  const cache=new Map();let calls=0;
  const counting=async(...args)=>{calls++;return successful(...args);};
  const first=await getRadarFeed({fetchImpl:counting,nowMs:NOW,cache});
  const requested=calls;
  const reused=await getRadarFeed({fetchImpl:counting,nowMs:NOW+10_000,cache});
  assert.equal(calls,requested);
  assert.deepEqual(reused.items,first.items);
  const broken=async()=>{throw Error("network down");};
  const stale=await getRadarFeed({fetchImpl:broken,nowMs:NOW+16*60_000,cache});
  assert.equal(stale.sources[0].status,"stale");
  assert.equal(stale.sources[0].checkedAt,new Date(NOW).toISOString());
  assert.ok(stale.items.length>0);
  const unavailable=await getRadarFeed({fetchImpl:broken,nowMs:NOW+7*60*60_000,cache});
  assert.ok(unavailable.sources.every(x=>x.status==="unavailable"));
  assert.deepEqual(unavailable.items,[]);
});
test("empty or unreachable upstream never fabricates an article",async()=>{
  const empty=async()=>({ok:true,json:async()=>[]});
  const first=await getRadarFeed({fetchImpl:empty,nowMs:NOW,cache:new Map()});
  assert.equal(first.items.length,0);
  assert.ok(first.sources.some(x=>x.status==="empty"));
  const broken=async()=>{throw Error("timeout");};
  const result=await getRadarFeed({fetchImpl:broken,nowMs:NOW,cache:new Map()});
  assert.deepEqual(result.items,[]);
  assert.ok(result.sources.every(x=>x.status==="unavailable"&&x.checkedAt===null));
});
test("published timestamps and release status must be real, not plausible strings",async()=>{
  const oldData=[{id:1,title:"Python tutorial",url:"https://dev.to/foo/old",published_at:old,tag_list:["python"]}];
  const dev=await fetchDevCommunity(async()=>({ok:true,json:async()=>oldData}),NOW);
  assert.deepEqual(dev.items,[]);
  const releases=await fetchGithubReleases(async url=>({ok:true,json:async()=>[
    {id:100,tag_name:"prerelease",published_at:iso(),draft:false,prerelease:true,
      html_url:url.replace("api.github.com/repos/","github.com/")},
    {id:101,tag_name:"v1",published_at:old,draft:false,prerelease:false,
      html_url:"https://github.com/nodejs/node/releases/tag/v1"}]}),NOW);
  assert.deepEqual(releases.items,[]);
});
test("front-end never claims to have verified the full content of a story",()=>{
  const src=readFileSync(new URL("../src/app/radar/page.tsx",import.meta.url),"utf8");
  assert.match(src,/Haberlerin doğruluğunu bağımsız olarak teyit etmiyoruz/);
  assert.match(src,/Son başarılı kontrol/);
  assert.match(src,/role="status"/);
  assert.match(src,/target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(src,/dangerouslySetInnerHTML/);
});
