"use client";
import Link from "next/link";
import {useCallback,useEffect,useState} from "react";
import publicQuestions from "@/data/questions.json";
import {QuizCard} from "@/components/quiz-card";
type Due={exerciseId:string;lessonId:string;dueAt:string;stage:number;lapses:number};
type Learning={reviewDue:Due[];reviewSummary:{total:number;due:number}};
export function ReviewSession(){
 const [rows,setRows]=useState<Due[]>([]);
 const [total,setTotal]=useState(0);
 const [dueCount,setDueCount]=useState(0);
 const [status,setStatus]=useState<"loading"|"ready"|"login"|"unavailable">("loading");
 const [answered,setAnswered]=useState(false);
 const load=useCallback(async()=>{
  try{
   const response=await fetch("/api/progress",{cache:"no-store"});
   if(response.status===401){setStatus("login");return;}
   if(!response.ok){setStatus("unavailable");return;}
   const data=await response.json() as Learning;
   const list=Array.isArray(data.reviewDue)?data.reviewDue:[];
   setRows(list.filter(x=>publicQuestions.some(q=>q.id===x.exerciseId)));
   setTotal(data.reviewSummary?.total??0);
   setDueCount(data.reviewSummary?.due??0);
   setAnswered(false);
   setStatus("ready");
  }catch{setStatus("unavailable");}
 },[]);
 useEffect(()=>{void load();},[load]);
 if(status==="loading")return <p role="status">Tekrar planın yükleniyor…</p>;
 if(status==="login")return <div className="review-card"><h2>Tekrar planın hesapla saklanır.</h2><p>Hatalarını ve ilerlemeni başka kişilerle karıştırmamak için oturum açmalısın.</p><Link href="/hesap">Hesabıma git →</Link></div>;
 if(status==="unavailable")return <div className="review-card" role="status"><h2>Tekrar planına ulaşılamadı.</h2><p>Hesap ve PostgreSQL bağlantısı olmadan sahte bir tekrar listesi gösterilmiyor.</p><button type="button" className="subtle-action" onClick={()=>void load()}>Tekrar dene</button></div>;
 const current=rows[0],question=current&&publicQuestions.find(q=>q.id===current.exerciseId);
 return <div className="review-card">
    <div className="review-meta">Bugün tekrar edilecek: {dueCount} · Takip edilen konu sorusu: {total}</div>
    {!question?<><h2>Şu anda tekrar bekleyen soru yok.</h2>
     <p>{total===0?"Bir dersin sorusunu cevapla; ilk tekrarın otomatik planlanır.":"Sonraki tekrarlar yanıtlarına göre planlanacak. Yeni derse devam edebilirsin."}</p>
     <div className="review-links"><Link href="/kurslar">Kurslara dön →</Link><button type="button" className="subtle-action" onClick={()=>void load()}>Yenile</button></div>
    </>:<>
      <h2>{answered?"Sonuç değerlendirildi":"Hatırladığını kanıtla"}</h2>
      <p>Yanıtı hatırlamaya çalış. Yanlışsa kısa süre sonra yeniden karşılaşacaksın; doğruysa tekrar aralığı uzayacak.</p>
      <QuizCard key={current.exerciseId} question={question} number={1} onGraded={()=>setAnswered(true)}/>
      {answered&&<div className="review-links"><button type="button" className="primary-button" onClick={()=>void load()}>Sıradaki tekrarı göster →</button><Link href="/kurslar">Derslere dön</Link></div>}
    </>}
  </div>;
}
