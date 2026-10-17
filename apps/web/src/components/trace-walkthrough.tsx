"use client";
import {useState} from "react";

export function TraceWalkthrough({steps}:{steps:readonly string[]}){
  const [shown,setShown]=useState(0);
  return <div className="trace-panel" aria-label="Kodu adım adım izle">
    <div className="trace-top"><strong>Kodun zihinsel izini çıkar</strong><span>{shown}/{steps.length} adım</span></div>
    <p>Bir sonraki satırda ne değişeceğini tahmin et, ardından açıklamayı aç.</p>
    <progress value={shown} max={steps.length} aria-label="Açılan kod izleme adımları"/>
    <ol>{steps.slice(0,shown).map((text,i)=><li key={i}><span className="trace-index">{i+1}</span>{text}</li>)}</ol>
    {shown<steps.length?
      <button type="button" className="subtle-action" onClick={()=>setShown(x=>Math.min(x+1,steps.length))}>
        {shown===0?"İlk adımı aç":"Sonraki adımı aç"} →
      </button>:<p className="trace-complete" role="status">İz tamamlandı. Şimdi aynı fikri başka örnekte kullan.</p>}
  </div>;
}
