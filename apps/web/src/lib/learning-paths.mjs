// M8.6B: Authored curriculum orientation, never fictional courses or mastery data.
import courses from "../data/courses.json" with {type:"json"};
import lessons from "../data/lessons.json" with {type:"json"};

const byLesson=new Map(lessons.map(x=>[x.id,x]));
const details={
  "course.javascript.fundamentals":{
    area:"Web ve etkileşim",mark:"JS",tone:"olive",
    payoff:"Arayüzlerdeki davranışın ve veri akışının temelini kur.",
    foundation:["Değişkenler ve kapsam","Dizi dönüşümleri","Promise ve asenkron sıralama"],
    next:"React ve TypeScript kavramlarına hazırlık"
  },
  "course.java.fundamentals":{
    area:"Nesne yönelimli düşünme",mark:"Jv",tone:"terra",
    payoff:"Tür, metot ve çok biçimliliği davranış üzerinden kavra.",
    foundation:["Türler ve dönüşümler","Metotlar ve return","Polymorphism"],
    next:"Nesne yönelimli tasarımın kavramsal temeli"
  },
  "course.sql.fundamentals":{
    area:"Veri sorgulama ve raporlama",mark:"DB",tone:"sand",
    payoff:"Müşterileri, siparişleri ve sonuç kümelerini SQL ile güvenilir biçimde sorgula.",
    foundation:["SELECT ve sıralama","WHERE ve JOIN","GROUP BY ve HAVING"],
    next:"Veritabanı tasarımı ve indekslere hazırlık"
  },
  "course.algorithms.fundamentals":{
    area:"Problem çözme ve veri yapıları",mark:"Alg",tone:"olive",
    payoff:"Veriyi doğru sırada, doğru maliyetle arayıp işleyen algoritmaları kavra.",
    foundation:["Doğrusal ve logaritmik maliyet","Stack, queue, Map ve Set","İkili arama ve sıralı veri önkoşulu"],
    next:"Küçük yazılım problemlerini bağımsız tasarlamaya hazırlık"
  },
  "course.python.fundamentals":{
    area:"Problem çözme ve otomasyon",mark:"Py",tone:"sand",
    payoff:"Okunaklı kodla koşul, döngü, fonksiyon ve veri yapılarını öğren.",
    foundation:["Veri türleri ve koşullar","Döngüler ve fonksiyonlar","Listeler ve sözlükler"],
    next:"Daha büyük otomasyon problemlerine hazırlık"
  }
};
export const learningPaths=Object.freeze(courses.map(course=>{
  const info=details[course.id];
  if(!info)throw Error("Unknown authored course: "+course.id);
  const entries=course.lessonIds.map(id=>{
    const lesson=byLesson.get(id);
    if(!lesson)throw Error("Missing authored lesson "+id);
    return {id,title:lesson.title,slug:lesson.slug,summary:lesson.summary,
      durationMinutes:lesson.durationMinutes,
      href:"/kurslar/"+course.slug+"/"+lesson.slug};
  });
  return {...info,id:course.id,slug:course.slug,title:course.title,
    summary:course.summary,level:course.level,
    href:"/kurslar/"+course.slug,lessons:entries,
    lessonCount:entries.length,
    questionCount:course.lessonIds.reduce((n,id)=>n+(byLesson.get(id)?.questionIds?.length??0),0),
    minutes:entries.reduce((n,x)=>n+x.durationMinutes,0)};
}));

function clean(value){return String(value??"").toLocaleLowerCase("tr-TR").normalize("NFC").trim();}
export function searchLearningPaths(paths,query){
  const q=clean(query);
  if(!q)return paths.map(p=>({...p,matches:[]}));
  return paths.map(path=>{
    const inCourse=[path.title,path.area,path.summary,path.payoff,
      ...path.foundation].some(v=>clean(v).includes(q));
    const matches=path.lessons.filter(l=>
      clean(l.title).includes(q)||clean(l.summary).includes(q));
    return (inCourse||matches.length)?{...path,matches}:null;
  }).filter(Boolean);
}
export function resolveLearningJourney(paths,rows){
  const valid=new Map(paths.flatMap(p=>p.lessons.map(l=>[l.id,{...l,courseTitle:p.title,courseHref:p.href}])));
  const saved=new Map();
  for(const row of Array.isArray(rows)?rows:[]){
    if(!row||!valid.has(row.lessonId))continue;
    const current=saved.get(row.lessonId);
    const when=Date.parse(row.lastViewedAt)||0;
    if(!current||when>(Date.parse(current.lastViewedAt)||0))saved.set(row.lessonId,row);
  }
  const stats=paths.map(p=>({
    id:p.id,title:p.title,href:p.href,lessonCount:p.lessonCount,
    started:p.lessons.filter(l=>saved.has(l.id)).length,
    completed:p.lessons.filter(l=>Boolean(saved.get(l.id)?.completedAt)).length
  }));
  const started=[...saved.values()].filter(r=>!r.completedAt)
    .sort((a,b)=>(Date.parse(b.lastViewedAt)||0)-(Date.parse(a.lastViewedAt)||0));
  const completed=stats.reduce((n,s)=>n+s.completed,0);
  const total=paths.reduce((n,p)=>n+p.lessonCount,0);
  if(started.length)return {kind:"continue",next:valid.get(started[0].lessonId),completed,total,stats};
  if(total&&completed===total)return {kind:"finished",next:null,completed,total,stats};
  // A completed last lesson can still be followed by a new lesson in its course.
  const recent=[...saved.values()].sort((a,b)=>(Date.parse(b.lastViewedAt)||0)-(Date.parse(a.lastViewedAt)||0));
  const last=recent[0]&&valid.get(recent[0].lessonId);
  const target=last&&paths.find(p=>p.href===last.courseHref);
  const next=target?.lessons.find(l=>!saved.get(l.id)?.completedAt)??paths
    .flatMap(p=>p.lessons).find(l=>!saved.get(l.id)?.completedAt)??null;
  return {kind:recent.length?"next":"start",next:next?valid.get(next.id):null,completed,total,stats};
}
