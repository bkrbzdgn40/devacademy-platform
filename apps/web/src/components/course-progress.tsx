"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
type Row={id:string;slug:string;title:string};
type Saved={lessonId:string;completedAt:string|null;lastViewedAt:string};
type Api={lessons:Saved[]};
export function CourseProgress({courseSlug,lessons}:{courseSlug:string;lessons:Row[]}){
 const [state,setState]=useState<{status:"loading"|"signedout"|"ready"|"unavailable";rows:Saved[]}>({status:"loading",rows:[]});
 useEffect(()=>{
   const controller=new AbortController();
   fetch("/api/progress",{cache:"no-store",signal:controller.signal}).then(async response=>{
     if(response.status===401){setState({status:"signedout",rows:[]});return;}
     if(!response.ok){setState({status:"unavailable",rows:[]});return;}
     const data=(await response.json()) as Api;
     if(!controller.signal.aborted)setState({status:"ready",rows:Array.isArray(data.lessons)?data.lessons:[]});
   }).catch(()=>{if(!controller.signal.aborted)setState({status:"unavailable",rows:[]});});
   return ()=>controller.abort();
 },[]);
 if(state.status!=="ready")return <aside className="course-progress-card" aria-label="Kurs ilerlemesi">
   <strong>Kişisel öğrenme rotan</strong>
   <p>{state.status==="loading"?"Kayıtlı ilerlemen yükleniyor…":state.status==="signedout"?
     "Tamamladığın dersleri kaydetmek ve sıradaki adımı görmek için oturum aç.":"Bu oturumda kalıcı ilerleme verisi kullanılamıyor; dersler açık."}</p>
   {state.status==="signedout"&&<Link href="/hesap">Hesabına git →</Link>}
 </aside>;
 const saved=new Map(state.rows.filter(row=>lessons.some(l=>l.id===row.lessonId)).map(row=>[row.lessonId,row]));
 const completed=lessons.filter(l=>saved.get(l.id)?.completedAt).length;
 const next=lessons.find(l=>!saved.get(l.id)?.completedAt);
 return <aside className="course-progress-card" aria-label="Kurs ilerlemesi">
   <div className="course-progress-top"><strong>Kişisel öğrenme rotan</strong><span>{completed}/{lessons.length} ders tamamlandı</span></div>
   <progress max={Math.max(1,lessons.length)} value={completed} aria-label="Kurs tamamlanma düzeyi"/>
   {next?<p>Sıradaki öneri: <Link href={`/kurslar/${courseSlug}/${next.slug}`}>{next.title} →</Link></p>:
     <p>Bu kurstaki tüm dersleri tamamladın. Bilgini yeni örneklerle tazele.</p>}
   <ol className="course-checkpoints">{lessons.map((l,i)=><li key={l.id}>
     <span>{i+1}. {l.title}</span>
     <span className={saved.get(l.id)?.completedAt?"checkpoint-complete":"checkpoint-open"}>{
       saved.get(l.id)?.completedAt?"Tamamlandı":saved.has(l.id)?"Devam ediyor":"Başlanmadı"}</span>
   </li>)}</ol>
 </aside>;
}
