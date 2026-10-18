/*
 * M9: recommend an actionable learning step without inventing per-lesson
 * mastery or relying on a client-reported "verified" flag.
 */
export type JourneyLesson={
  id:string;title:string;href:string;courseId:string;courseTitle:string;
  independentLab:boolean;
};
export type JourneyRecord={lessonId:string;lastViewedAt:string;completedAt:string|null};
export type JourneyEvidence={
  lessons:JourneyRecord[];
  reviewSummary?:{total:number;due:number};
  transferSummary?:{first:number;retained:number};
  codeTransferSummary?:{verified:number};
};
export type LearningAction={
  kind:"review"|"resume"|"independent"|"next"|"start"|"finished";
  eyebrow:string;title:string;description:string;href:string;label:string;
};
function asTimestamp(date:string){const n=Date.parse(date);return Number.isFinite(n)?n:0;}
export function chooseLearningAction(
  lessons:readonly JourneyLesson[],evidence:JourneyEvidence
):LearningAction{
  const known=new Map(lessons.map(item=>[item.id,item]));
  const recorded=new Map<string,JourneyRecord>();
  for(const row of evidence.lessons??[]){
    if(!row||!known.has(row.lessonId))continue;
    const old=recorded.get(row.lessonId);
    if(!old||asTimestamp(row.lastViewedAt)>asTimestamp(old.lastViewedAt)){
      recorded.set(row.lessonId,row);
    }
  }
  const rows=[...recorded.values()].sort((a,b)=>
    asTimestamp(b.lastViewedAt)-asTimestamp(a.lastViewedAt));
  const latest=rows[0];
  const due=Math.max(0,Number(evidence.reviewSummary?.due)||0);
  if(due>0)return{
    kind:"review",eyebrow:"Şimdi tekrar zamanı",title:"Öğrendiğin bilgiyi hatırla.",
    description:due+" soru tekrar bekliyor. Tekrar puanı, bağımsız kod yazma kanıtı değildir.",
    href:"/tekrar",label:"Tekrar oturumuna geç"
  };
  const unfinished=rows.find(row=>!row.completedAt);
  if(unfinished){
    const lesson=known.get(unfinished.lessonId)!;
    return{
      kind:"resume",eyebrow:"Kaldığın ders",title:lesson.title,
      description:lesson.courseTitle+" dersinde rehberli öğrenmeye devam et. Tamamlama bağımsız yeterlilik anlamına gelmez.",
      href:lesson.href,label:"Derse devam et"
    };
  }
  // Prefer the same course after the most recently completed lesson.
  if(latest){
    const current=known.get(latest.lessonId)!;
    const next=lessons.find(item=>item.courseId===current.courseId&&!recorded.get(item.id)?.completedAt);
    if(next)return{
      kind:"next",eyebrow:"Sıradaki ders",title:next.title,
      description:next.courseTitle+" öğrenme yolunda yeni bir kavrama geç.",
      href:next.href,label:"Sıradaki dersi aç"
    };
    // There is an authored independent lab, but this summary does not reveal
    // which individual transfer lessons have already been verified. Treat it
    // as a reviewable opportunity, never as an unmet requirement.
    const eligible=lessons.filter(item=>item.courseId===current.courseId&&
      recorded.get(item.id)?.completedAt&&item.independentLab);
    if(eligible.length){
      const candidate=eligible.find(item=>item.id===current.id)??eligible[0];
      return{
        kind:"independent",eyebrow:"Bağımsız uygulama seçeneği",title:candidate.title,
        description:"Bu derste bağımsız çıktı tahmini ve kod yazma görevlerinin durumunu kontrol et. Kod doğrulaması yalnızca yetkili yerel laboratuvarda mümkündür.",
        href:candidate.href,label:"Bağımsız görevlere bak"
      };
    }
    const other=lessons.find(item=>!recorded.get(item.id)?.completedAt);
    if(other)return{
      kind:"next",eyebrow:"Yeni öğrenme yolu",title:other.title,
      description:other.courseTitle+" içinde yeni bir kavrama başla.",
      href:other.href,label:"Dersi aç"
    };
    return{
      kind:"finished",eyebrow:"Rehberli derslerini tamamladın",title:"Bilgini yeni koşullarda koru.",
      description:"Tüm derslerin tamamlandı; bu, bağımsız kod yazma yeterliliğinin veya uzun süreli kalıcılığın kanıtı değildir.",
      href:"/tekrar",label:"Tekrarları gözden geçir"
    };
  }
  const first=lessons[0];
  return first?{
    kind:"start",eyebrow:"İlk öğrenme adımı",title:first.title,
    description:first.courseTitle+" ile ilk kavramı incele, tahmin et ve dene.",
    href:first.href,label:"İlk dersi aç"
  }:{
    kind:"finished",eyebrow:"Öğrenme yolları",title:"Yeni içerikler hazırlanıyor.",
    description:"Henüz yayımlanmış bir ders bulunmuyor.",
    href:"/kurslar",label:"Kurslara göz at"
  };
}
