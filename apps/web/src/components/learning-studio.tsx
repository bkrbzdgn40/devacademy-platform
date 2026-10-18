"use client";
import {useMemo,useState,type FormEvent} from "react";
import {buildStudioScenario,gradeStudioPrediction,studioVariantCount}
  from "@/lib/studio-scenarios.mjs";

type Snapshot={line:number;variables:Record<string,string|number>;
  outputs:{label:string;value:string}[];message:string};
type Scenario={title:string;question:string;hint:string;topics:string[];
  codeLines:string[];steps:Snapshot[];expected:string[];variantCount:number};
type Phase="predict"|"trace";
const variants=["Örnek 1 · Başlangıç","Örnek 2 · Farklı girdiler","Örnek 3 · Sınır durumu"];
export function LearningStudio({lessonId}:{lessonId:string}) {
  const [variant,setVariant]=useState(0);
  const [predictionA,setPredictionA]=useState("");
  const [predictionB,setPredictionB]=useState("");
  const [confidence,setConfidence]=useState<"low"|"medium"|"high">("medium");
  const [phase,setPhase]=useState<Phase>("predict");
  const [cursor,setCursor]=useState(-1);
  const [hint,setHint]=useState(false);
  const [error,setError]=useState("");
  const scenario=useMemo(()=>buildStudioScenario(lessonId,variant) as Scenario|null,[lessonId,variant]);
  if(!scenario)return null;
  const current=cursor<0?null:scenario.steps[cursor];
  const finished=phase==="trace"&&cursor===scenario.steps.length-1;
  const predictionResult=finished?gradeStudioPrediction(scenario,predictionA,predictionB):null;

  function reset(nextVariant:number) {
    if(nextVariant<0||nextVariant>=studioVariantCount(lessonId))return;
    setVariant(nextVariant);setPredictionA("");setPredictionB("");setConfidence("medium");
    setPhase("predict");setCursor(-1);setHint(false);setError("");
  }
  function lockPrediction(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const results=gradeStudioPrediction(scenario,predictionA,predictionB);
    if(!results){setError("A ve B için geçerli sayısal sonuçlar gir. Python'daki None da kabul edilir.");return;}
    setError("");setPhase("trace");setCursor(-1);
  }
  return <section className="learning-studio" aria-labelledby={"studio-"+lessonId}>
    <header className="studio-header">
      <span className="overline">ÖĞRENME STÜDYOSU · ADIM ADIM</span>
      <h3 id={"studio-"+lessonId}>{scenario.title}</h3>
      <p>Önce iki sonucu kendi başına tahmin et. Ardından her satırda değişkenlerin nasıl değiştiğini izleyerek düşünceni test et.</p>
    </header>
    <div className="studio-toolbar">
      <label htmlFor={"studio-variant-"+lessonId}>Deneydeki girdiler</label>
      <select id={"studio-variant-"+lessonId} value={variant}
        onChange={e=>reset(Number(e.target.value))}>
        {variants.slice(0,scenario.variantCount).map((label,index)=>
          <option key={index} value={index}>{label}</option>)}
      </select>
      <span className="studio-mode">Kayıtsız öğrenme deneyi · bağımsız sınama değil</span>
    </div>
    <div className="studio-workspace">
      <div className="studio-source">
        <div className="studio-pane-title">
          <strong>Kod</strong>
          <span>{phase==="predict"?"Önce tahmin et":"Aktif satır işaretleniyor"}</span>
        </div>
        <div className="studio-code" role="region" aria-label="İncelenecek programın kaynak kodu" tabIndex={0}>
          {scenario.codeLines.map((line,i)=><div key={i} data-studio-line={i+1}
            className={"studio-code-row"+(current?.line===i+1?" studio-code-active":"")}>
            <span className="studio-line-number" aria-hidden="true">{i+1}</span>
            <code>{line||" "}</code>
            {current?.line===i+1&&<span className="studio-code-pointer" aria-hidden="true">←</span>}
          </div>)}
        </div>
        <div className="studio-concept"><span>Odak:</span> {scenario.question}</div>
      </div>
      <div className="studio-inspector">
        {phase==="predict"?<form onSubmit={lockPrediction} className="studio-predict">
          <div className="studio-pane-title"><strong>Önce tahmin</strong><span>Sonuçlar gizli</span></div>
          <p>A ve B yorumlarının bulunduğu satırlar hangi değerleri yazdırır?</p>
          <div className="studio-inputs">
            <label>A çıktısı<input required autoComplete="off" maxLength={24}
              value={predictionA} onChange={e=>setPredictionA(e.target.value)} placeholder="A sonucunu yaz"/></label>
            <label>B çıktısı<input required autoComplete="off" maxLength={24}
              value={predictionB} onChange={e=>setPredictionB(e.target.value)} placeholder="B sonucunu yaz"/></label>
          </div>
          <fieldset className="studio-confidence"><legend>Tahmininden ne kadar eminsin?</legend>
            {([["low","Emin değilim"],["medium","Biraz eminim"],["high","Çok eminim"]] as const).map(([key,text])=>
              <label key={key}><input type="radio" name={"studio-confidence-"+lessonId}
                checked={confidence===key} onChange={()=>setConfidence(key)}/>{text}</label>)}
          </fieldset>
          <button type="button" className="studio-hint-action" onClick={()=>setHint(x=>!x)}
            aria-expanded={hint}>{hint?"İpucunu gizle":"Bir düşünme ipucu göster"}</button>
          {hint&&<p className="studio-hint">{scenario.hint}</p>}
          {error&&<p role="alert" className="quiz-error">{error}</p>}
          <button className="primary-button" type="submit">Tahminimi kilitle ve kodu izle →</button>
        </form>:<div className="studio-execution">
          <div className="studio-pane-title"><strong>Canlı durum</strong><span>
            {cursor<0?"Hazır":(cursor+1)+" / "+scenario.steps.length+" adım"}
          </span></div>
          <p aria-live="polite" className="studio-execution-note">
            {current?current.message:"Değişkenler ilk satırdan itibaren adım adım görünecek."}
          </p>
          <h4>Değişkenler</h4>
          {current&&Object.keys(current.variables).length>0?
            <dl className="studio-variable-grid">{Object.entries(current.variables).map(([name,value])=>
              <div key={name}><dt>{name}</dt><dd>{String(value)}</dd></div>)}</dl>:
            <p className="studio-placeholder">Henüz bir değişken atanmadı.</p>}
          <h4>Konsol çıktısı</h4>
          {current?.outputs.length?
            <ol className="studio-console">{current.outputs.map((output,i)=>
              <li key={i}><span>{output.label}</span><code>{output.value}</code></li>)}</ol>:
            <p className="studio-placeholder">Henüz konsola bir şey yazdırılmadı.</p>}
          <div className="studio-step-actions">
            <button type="button" className="subtle-action" disabled={cursor<0}
              onClick={()=>setCursor(x=>Math.max(-1,x-1))}>← Önceki</button>
            <button type="button" className="primary-button" disabled={finished}
              data-studio-next onClick={()=>setCursor(x=>Math.min(scenario.steps.length-1,x+1))}>
              {cursor<0?"İlk satırı çalıştır →":"Sonraki satır →"}
            </button>
          </div>
        </div>}
      </div>
    </div>
    {phase==="trace"&&<div className="studio-progress">
      <progress value={cursor+1} max={scenario.steps.length} aria-label="İzlenen yürütme adımları"/>
      <span>{cursor+1}/{scenario.steps.length} adım</span>
    </div>}
    {finished&&predictionResult&&<div className="studio-review" role="status" aria-live="polite">
      <h4>Tahmininle yürütmeyi karşılaştır</h4>
      <div className="studio-review-grid">
        {(["A","B"] as const).map((label,index)=><div key={label}>
          <strong>{label} · {predictionResult[index]?"Doğru tahmin":"Yeniden incele"}</strong>
          <p>Senin tahminin: <code>{index===0?predictionA:predictionB}</code></p>
          <p>Gerçek sonuç: <code>{scenario.expected[index]}</code></p>
          {!predictionResult[index]&&<p className="studio-misconception">
            İlgili nokta: <strong>{scenario.topics[index]}</strong>. Aktif kod satırlarını geriye sarıp bu değerin nerede değiştiğini incele.
          </p>}
        </div>)}
      </div>
      {confidence==="high"&&!predictionResult.every(Boolean)&&
        <p className="studio-confidence-note">Yanlış tahminden çok emin olmak, sorgulanmaya değer bir varsayımı işaret ediyor. Hangi satır bu varsayımı çürüttü?</p>}
      <div className="studio-reset-actions">
        <button type="button" className="subtle-action" onClick={()=>{setCursor(-1);setPhase("predict");setError("");}}>
          Aynı girdilerle tekrar tahmin et
        </button>
        <button type="button" className="primary-button"
          onClick={()=>reset((variant+1)%scenario.variantCount)}>
          Farklı girdilerle yeni deney →
        </button>
      </div>
      <p className="studio-small-print">Bu simülasyon, gözden geçirilmiş örneklerin açıklayıcı izidir. Kod editöründeki serbest kodu çalıştırmaz; başarı puanı veya sertifika üretmez.</p>
    </div>}
  </section>;
}
