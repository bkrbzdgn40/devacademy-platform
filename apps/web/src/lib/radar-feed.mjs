/*
 * M10 Sektör Radarı: fixed, read-only source adapters. All external text is
 * untrusted metadata; it is never treated as instructions or rendered as HTML.
 * The server does not proxy arbitrary user-provided URLs or article bodies.
 */
export const radarSources = Object.freeze([
  {key:"hn",name:"Hacker News",kind:"Topluluk tartışması",href:"https://news.ycombinator.com/"},
  {key:"dev",name:"DEV Community",kind:"Topluluk yazısı",href:"https://dev.to/"},
  {key:"github",name:"GitHub Releases",kind:"Resmî depo sürümü",href:"https://github.com/"}
]);

export const radarTopics = Object.freeze([
  {key:"typescript",label:"TypeScript",href:"/kutuphane/diller",
    reason:"Tipli JavaScript ekosistemini, temel JavaScript bilgisi üzerine araştırabilirsin.",
    pattern:/\btypescript\b/i},
  {key:"react",label:"React",href:"/kutuphane/teknolojiler",
    reason:"Bileşen tabanlı arayüzleri JavaScript temelleriyle ilişkilendir.",
    pattern:/\breact(?:\.js)?\b/i},
  {key:"python",label:"Python",href:"/kurslar/python-temelleri/fonksiyonlar",
    reason:"Python fonksiyonları ve veri işleme temellerini yeni araçlarla ilişkilendir.",
    pattern:/\bpython\b|\bpytest\b/i},
  {key:"postgres",label:"SQL ve veritabanları",href:"/kutuphane/diller",
    reason:"Veri sorgulama ve kayıt tutma kavramlarını SQL bağlamında keşfet.",
    pattern:/\b(?:postgres(?:ql)?|sql|database|sqlite)\b/i},
  {key:"docker",label:"Docker",href:"/kutuphane/teknolojiler",
    reason:"Konteynerlerle uygulama paketleme ve çalıştırma kavramlarını keşfet.",
    pattern:/\b(?:docker|containers?|kubernetes)\b/i},
  {key:"async",label:"Asenkron JavaScript",href:"/kurslar/javascript-temelleri/asenkron-temeller",
    reason:"Promise ve asenkron çalışma sırasına dair mevcut dersi tekrar incele.",
    pattern:/\b(?:promises?|async\/await|event loop)\b/i},
  {key:"javascript",label:"JavaScript",href:"/kurslar/javascript-temelleri/degiskenler",
    reason:"JavaScript davranışını ve temel söz dizimini öğrendiklerinle karşılaştır.",
    pattern:/\b(?:javascript|ecmascript|node\.js|nodejs|npm)\b/i},
  {key:"java",label:"Java",href:"/kurslar/java-temelleri/metotlar-ve-return",
    reason:"Java metotları ve JVM temellerini ekosistem gelişmeleriyle ilişkilendir.",
    pattern:/\b(?:java|jvm|spring boot)\b/i}
]);

const releaseRepos=[
  {repo:"nodejs/node",topic:"javascript",label:"Node.js"},
  {repo:"microsoft/TypeScript",topic:"typescript",label:"TypeScript"},
  {repo:"facebook/react",topic:"react",label:"React"}
];
const REFRESH_MS=15*60_000;
const RETRY_MS=2*60_000;
const STALE_MS=6*60*60_000;
const DAY=24*60*60_000;
const globalCache=new Map();

export function safeWebUrl(raw){
  if(typeof raw!=="string"||raw.length>2048)return null;
  try{
    const url=new URL(raw);
    if(url.protocol!=="https:"||url.username||url.password||!url.hostname||url.hostname.length>253)return null;
    url.hash="";
    for(const key of [...url.searchParams.keys()])
      if(/^utm_|^(fbclid|gclid|mc_cid|mc_eid)$/i.test(key))url.searchParams.delete(key);
    return url.toString();
  }catch{return null;}
}
export function canonicalKey(url){
  const safe=safeWebUrl(url);
  if(!safe)return null;
  const parsed=new URL(safe);
  return parsed.hostname.toLowerCase().replace(/^www\./,"")+
    parsed.pathname.replace(/\/$/,"").toLowerCase()+parsed.search;
}
const plain=(value,max=180)=>typeof value==="string"?
  value.replace(/[\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max):"";
export function matchRadarTopic(title,tags=[]){
  const haystack=title+" "+(Array.isArray(tags)?tags.filter(x=>typeof x==="string").join(" "):"");
  return radarTopics.find(topic=>topic.pattern.test(haystack))??null;
}
function validDate(value,nowMs,maxDays){
  const time=typeof value==="number"?value*1000:Date.parse(value);
  if(!Number.isFinite(time)||time>nowMs+5*60_000||time<nowMs-maxDays*DAY)return null;
  return new Date(time).toISOString();
}
function article(input){
  if(!input||!input.title||!input.url||!input.publishedAt||!input.topic)return null;
  const url=safeWebUrl(input.url);
  const title=plain(input.title);
  if(!url||title.length<6)return null;
  return {...input,title,url};
}
async function requestJson(url,fetchImpl){
  // Endpoints are compile-time constants, never derived from user input.
  const response=await fetchImpl(url,{headers:{"Accept":"application/json",
    "User-Agent":"DevAcademy-SectorRadar/1.0 (read-only educational links)"},
    signal:AbortSignal.timeout(5000),next:{revalidate:900}});
  if(!response.ok)throw new Error("SOURCE_UNAVAILABLE");
  return response.json();
}
export async function fetchHackerNews(fetchImpl,nowMs){
  const ids=await requestJson("https://hacker-news.firebaseio.com/v0/topstories.json",fetchImpl);
  if(!Array.isArray(ids))throw new Error("HN_SHAPE");
  const top=ids.filter(Number.isSafeInteger).slice(0,24);
  const settled=await Promise.allSettled(top.map(id=>
    requestJson(`https://hacker-news.firebaseio.com/v0/item/${id}.json`,fetchImpl)));
  const items=[];
  for(let i=0;i<settled.length;i++){
    const row=settled[i];if(row.status!=="fulfilled")continue;
    const item=row.value;
    if(!item||item.type!=="story"||item.dead||item.deleted||item.id!==top[i])continue;
    const topic=matchRadarTopic(plain(item.title));
    const publishedAt=validDate(item.time,nowMs,35);
    const discussionUrl=`https://news.ycombinator.com/item?id=${item.id}`;
    const entry=article({id:"hn-"+item.id,source:"hn",title:item.title,
      url:safeWebUrl(item.url)??discussionUrl,discussionUrl,
      publishedAt,topic});
    if(entry)items.push(entry);
  }
  return {items:items.slice(0,9),partial:settled.some(x=>x.status==="rejected")};
}
export async function fetchDevCommunity(fetchImpl,nowMs){
  const data=await requestJson("https://dev.to/api/articles/latest?per_page=100",fetchImpl);
  if(!Array.isArray(data))throw new Error("DEV_SHAPE");
  const items=[];
  for(const raw of data.slice(0,100)){
    if(!raw||!Number.isSafeInteger(raw.id))continue;
    const topic=matchRadarTopic(plain(raw.title),raw.tag_list);
    const publishedAt=validDate(raw.published_at,nowMs,35);
    const entry=article({id:"dev-"+raw.id,source:"dev",title:raw.title,
      url:raw.canonical_url||raw.url,publishedAt,topic});
    if(entry)items.push(entry);
  }
  return {items:items.slice(0,9),partial:false};
}
export async function fetchGithubReleases(fetchImpl,nowMs){
  const settled=await Promise.allSettled(releaseRepos.map(r=>
    requestJson(`https://api.github.com/repos/${r.repo}/releases?per_page=4`,fetchImpl)));
  const items=[];
  for(let i=0;i<releaseRepos.length;i++){
    if(settled[i].status!=="fulfilled")continue;
    const response=settled[i].value;
    if(!Array.isArray(response))continue;
    const config=releaseRepos[i];
    const topic=radarTopics.find(x=>x.key===config.topic);
    const latest=response.find(x=>x&&!x.draft&&!x.prerelease&&x.published_at&&x.tag_name);
    if(!latest)continue;
    const publishedAt=validDate(latest.published_at,nowMs,120);
    const url=safeWebUrl(latest.html_url);
    if(!url||new URL(url).hostname!=="github.com")continue;
    const entry=article({id:"release-"+config.repo+"-"+latest.id,
      source:"github",title:`${config.label} • ${plain(latest.tag_name,75)}`,
      url,publishedAt,topic});
    if(entry)items.push(entry);
  }
  if(settled.every(x=>x.status==="rejected"))throw new Error("RELEASE_SOURCES_UNAVAILABLE");
  return {items,partial:settled.some(x=>x.status==="rejected"||
    (x.status==="fulfilled"&&!Array.isArray(x.value)))};
}
async function loadSource(source,loader,{fetchImpl,nowMs,cache}){
  const cached=cache.get(source.key);
  if(cached&&nowMs<cached.nextTryAt)return {...source,...cached.snapshot};
  try{
    const result=await loader(fetchImpl,nowMs);
    const snapshot={status:result.partial?"partial":result.items.length?"fresh":"empty",
      items:result.items,checkedAt:new Date(nowMs).toISOString(),attemptedAt:new Date(nowMs).toISOString()};
    cache.set(source.key,{snapshot,lastSuccessAt:nowMs,nextTryAt:nowMs+REFRESH_MS});
    return {...source,...snapshot};
  }catch{
    if(cached&&nowMs-cached.lastSuccessAt<=STALE_MS){
      const snapshot={...cached.snapshot,status:"stale",attemptedAt:new Date(nowMs).toISOString()};
      cache.set(source.key,{...cached,snapshot,nextTryAt:nowMs+RETRY_MS});
      return {...source,...snapshot};
    }
    const snapshot={status:"unavailable",items:[],checkedAt:null,attemptedAt:new Date(nowMs).toISOString()};
    cache.set(source.key,{snapshot,lastSuccessAt:-Infinity,nextTryAt:nowMs+RETRY_MS});
    return {...source,...snapshot};
  }
}
export async function getRadarFeed({fetchImpl=fetch,nowMs=Date.now(),cache=globalCache}={}){
  const loaders=[fetchHackerNews,fetchDevCommunity,fetchGithubReleases];
  const sources=await Promise.all(radarSources.map((source,i)=>
    loadSource(source,loaders[i],{fetchImpl,nowMs,cache})));
  // One canonical article can be submitted to both HN and DEV. Prefer the
  // primary publisher, then a repository release, then discussion-only links.
  const priority={dev:0,github:1,hn:2};
  const unique=new Map();
  for(const entry of sources.flatMap(s=>s.items).sort((a,b)=>
    priority[a.source]-priority[b.source])){
    const key=canonicalKey(entry.url);
    if(key&&!unique.has(key))unique.set(key,entry);
  }
  const items=[...unique.values()].sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).slice(0,18);
  return {items,sources:sources.map(({items:ignored,...status})=>status)};
}
