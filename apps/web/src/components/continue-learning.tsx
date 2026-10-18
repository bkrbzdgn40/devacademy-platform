"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {learningPaths,resolveLearningJourney} from "@/lib/learning-paths.mjs";

type Saved={lessonId:string;completedAt:string|null;lastViewedAt:string};
type Viewer={authenticated:boolean;configured:boolean};
type Ready={status:"ready";lessons:Saved[]};
type State={status:"loading"|"guest"|"unconfigured"|"error"}|Ready;
export function ContinueLearning(){
  const [state,setState]=useState<State>({status:"loading"});
  const [refreshKey,setRefreshKey]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    async function load(){
      try{
        const me=await fetch("/api/me",{cache:"no-store",signal:controller.signal});
        if(!me.ok)throw Error("me unavailable");
        const viewer=await me.json() as Viewer;
        if(!viewer.configured){if(!controller.signal.aborted)setState({status:"unconfigured"});return;}
        if(!viewer.authenticated){if(!controller.signal.aborted)setState({status:"guest"});return;}
        const progress=await fetch("/api/progress",{cache:"no-store",signal:controller.signal});
        if(!progress.ok)throw Error("progress unavailable");
        const body=await progress.json() as {lessons?:Saved[]};
        if(!controller.signal.aborted)setState({status:"ready",
          lessons:Array.isArray(body.lessons)?body.lessons:[]});
      }catch{if(!controller.signal.aborted)setState({status:"error"});}
    }
    void load();
    return ()=>controller.abort();
  },[refreshKey]);
  if(state.status==="loading")return <section className="journey-card ui-card" aria-label="Öğrenme devam noktası">
    <span className="ui-eyebrow">Sana özel öğrenme rotası</span>
    <p role="status">Öğrenme durumun kontrol ediliyor…</p>
  </section>;
  if(state.status!=="ready")return <section className="journey-card ui-card" aria-label="Öğrenme devam noktası">
    <span className="ui-eyebrow">Öğrenme rotan</span>
    <h3>{state.status==="guest"?"Kendi rotanı oluştur.":state.status==="unconfigured"?
      "Kurslar herkese açık.":"İlerlemene şu anda ulaşamıyoruz."}</h3>
    <p>{state.status==="guest"?"Dersleri hemen keşfedebilirsin. Hesabınla giriş yaptığında tamamladığın dersler ve kaldığın yer burada görünür.":
      state.status==="unconfigured"?"Bu ortamda hesap ve ilerleme servisi yapılandırılmamış. Dersleri inceleyebilirsin; kişisel ilerleme kaydı bulunmuyor.":
      "Kayıtları tahmin ederek göstermiyoruz. Kursları keşfedebilir veya durumu yeniden kontrol edebilirsin."}</p>
    <div className="journey-actions">
      <Link className="ui-button ui-button-primary" href="/kurslar">Kursları keşfet →</Link>
      {state.status==="guest"&&<Link href="/hesap" className="ui-button ui-button-secondary">Oturum aç</Link>}
      {state.status==="error"&&<button type="button" className="ui-button ui-button-secondary"
        onClick={()=>{setState({status:"loading"});setRefreshKey(n=>n+1);}}>Yeniden dene</button>}
    </div>
  </section>;
  const journey=resolveLearningJourney(learningPaths,state.lessons);
  return <section className="journey-card ui-card" aria-label="Kaydedilmiş öğrenme rotası">
    <div className="journey-card-top"><span className="ui-eyebrow">Hesabındaki öğrenme durumu</span>
      <span className="journey-count">{journey.completed}/{journey.total} ders tamamlandı</span></div>
    <progress value={journey.completed} max={Math.max(1,journey.total)}
      aria-label="Toplam tamamlanan dersler"/>
    {journey.kind==="finished"?<>
      <h3>Tüm mevcut dersleri bitirdin.</h3>
      <p>İlerlemeni tekrarlarla koruyabilir, bağımsız kavram görevlerinde kendini sınayabilirsin.</p>
      <Link className="ui-button ui-button-primary" href="/tekrar">Tekrara geç →</Link>
    </>:<>
      <h3>{journey.kind==="continue"?"Kaldığın yerden devam et.":journey.kind==="next"?
        "Sıradaki kavram seni bekliyor.":"İlk adımı birlikte seçelim."}</h3>
      <p>{journey.next?journey.next.courseTitle+" · "+journey.next.title:
        "Mevcut öğrenme yollarını inceleyerek başla."}</p>
      <div className="journey-actions">
        <Link className="ui-button ui-button-primary" href={journey.next?.href??"/kurslar"}>
          {journey.kind==="start"?"İlk dersi aç →":"Derse devam et →"}</Link>
        <Link href="/hesap" className="ui-button ui-button-secondary">Tüm ilerlemem</Link>
      </div>
    </>}
    <div className="journey-courses" aria-label="Kurs bazında tamamlanan dersler">
      {journey.stats.map(item=><Link href={item.href} className="journey-course" key={item.id}>
        <span>{item.title}</span><strong>{item.completed}/{item.lessonCount}</strong>
        <progress max={Math.max(1,item.lessonCount)} value={item.completed} aria-label={item.title+" ilerleme"}/>
      </Link>)}
    </div>
  </section>;
}
