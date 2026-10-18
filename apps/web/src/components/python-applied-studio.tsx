"use client";

import {useId,useState,type FormEvent} from "react";
import pythonApplied from "@/data/python-applied-path.json";
import javaApplied from "@/data/java-applied-path.json";
import javascriptApplied from "@/data/javascript-applied-path.json";
const applied=[...pythonApplied,...javaApplied,...javascriptApplied];
import {CodePlayground} from "@/components/code-playground";

const tierNames=["01 · Başlangıç","02 · Uygulama","03 · Yeni durum"] as const;

type Language="javascript"|"java"|"python";
export function AppliedLearningStudio({lessonId,language}:{lessonId:string;language:Language}){
  const displayLanguage=language==="javascript"?"JavaScript":language==="java"?"Java":"Python";
  const path=applied.find(entry=>entry.lessonId===lessonId);
  const [tier,setTier]=useState(0);
  const [selected,setSelected]=useState<Record<number,number>>({});
  const [submitted,setSubmitted]=useState<Record<number,number>>({});
  const [ownCodeOpen,setOwnCodeOpen]=useState(false);
  const id=useId();
  if(!path)return null;
  const lesson=path.levels[tier];
  const checked=submitted[tier];
  const isChecked=checked!==undefined;
  const correct=isChecked&&lesson.choices[checked]?.text===lesson.expected;
  function check(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(selected[tier]===undefined)return;
    setSubmitted(old=>({...old,[tier]:selected[tier]}));
  }
  function pick(index:number){
    setSelected(old=>({...old,[tier]:index}));
    setSubmitted(old=>{const next={...old};delete next[tier];return next;});
  }
  return <section className="python-applied-studio" aria-label={displayLanguage+" gerçek yaşam problem laboratuvarı"}>
    <header className="python-applied-header">
      <span className="ui-eyebrow">Gerçek yaşam laboratuvarı · {displayLanguage}</span>
      <h3>Bir kavram, üç farklı problem.</h3>
      <p>{path.topic}. Önce kodun çıktısını tahmin et, sonra kararının nedenini incele ve en sonda kendi çözümünü yaz.</p>
    </header>
    <nav className="python-applied-tier-nav" aria-label="Problem zorluk düzeyleri">
      {path.levels.map((item,i)=><button type="button" key={item.id}
        aria-pressed={tier===i} onClick={()=>setTier(i)}
        className={tier===i?"is-active":""}>
        <span>{tierNames[i]}</span>
        {submitted[i]!==undefined&&
          <small>{path.levels[i].choices[submitted[i]]?.text===item.expected?"Doğru tahmin":"Yeniden dene"}</small>}
      </button>)}
    </nav>
    <div className="python-applied-exercise" key={lesson.id}>
      <div className="python-applied-heading">
        <span>{lesson.tier}</span>
        <h4>{lesson.title}</h4>
        <p>{lesson.context}</p>
      </div>
      <div className="code-label">Çalıştırılabilir, gözden geçirilmiş {displayLanguage} örneği</div>
      <pre className="lesson-code"><code>{lesson.code}</code></pre>
      <form className="python-applied-answer" onSubmit={check}>
        <fieldset>
          <legend>Programın standart çıktısı hangisi?</legend>
          <div className="python-applied-choices">
            {lesson.choices.map((choice,i)=><label key={choice.text}
              className={selected[tier]===i?"is-picked":""}>
              <input type="radio" name={id+"-tier-"+tier} value={i}
                checked={selected[tier]===i} onChange={()=>pick(i)}/>
              <code>{choice.text}</code>
            </label>)}
          </div>
        </fieldset>
        <div className="python-applied-answer-actions">
          <button type="submit" className="ui-button ui-button-primary"
            disabled={selected[tier]===undefined}>Tahminimi kontrol et</button>
          <details className="python-applied-hint">
            <summary>İpucu gör</summary><p>{lesson.hint}</p>
          </details>
        </div>
      </form>
      {isChecked&&<div className={correct?"python-applied-feedback is-correct":"python-applied-feedback is-try-again"}
        aria-live="polite" role="status">
        <strong>{correct?"Doğru tahmin.":"Bu tahmin henüz doğru değil."}</strong>
        <p>{lesson.choices[checked]?.feedback}</p>
        {correct&&<p>{lesson.why}</p>}
        {!correct&&<p>İpucunu kullanabilir veya kodun hangi adımda farklı çalıştığını yeniden düşünebilirsin.</p>}
        <small>Bu anlık alıştırmanın sonucu hesaba kaydedilmez; bağımsız yeterlilik veya kod üretimi kanıtı değildir.</small>
      </div>}
      {correct&&tier<2&&<button type="button" className="ui-button ui-button-secondary python-applied-next"
        onClick={()=>setTier(current=>Math.min(2,current+1))}>Daha zor probleme geç →</button>}
    </div>
    <div className="python-applied-independent">
      <span className="ui-eyebrow">İlk kez kendi kodunla dene</span>
      <h4>{path.independent.title}</h4>
      <p>{path.independent.brief}</p>
      <div className="python-applied-public-checks">
        <div><strong>Örnek çıktı</strong><pre>{path.independent.expectedOutput}</pre></div>
        <div><strong>Değiştirilmiş girdiyle beklenen</strong><pre>{path.independent.variationExpected}</pre></div>
      </div>
      <p className="python-applied-caveat">Bu görevde kendi kodunu yazabilirsin; sonuç otomatik değerlendirilmiyor. Çalıştırma kapalıyken doğru çıktı veya bağımsız başarı kaydı oluşturulmaz. Değerlendirme için yalnızca uygun derslerde ayrıca sunulan yetkili laboratuvar görevleri geçerlidir.</p>
      <button type="button" className="ui-button ui-button-secondary"
        aria-expanded={ownCodeOpen} onClick={()=>setOwnCodeOpen(open=>!open)}>
        {ownCodeOpen?"Kod alanını kapat":"Kendi çözümümü yaz"}
      </button>
      {ownCodeOpen&&<div className="python-applied-code-work">
        <CodePlayground starterCode={path.independent.starterCode}
          language={language} displayLanguage={displayLanguage}
          label={path.independent.title+" bağımsız deneme alanı"}/>
        <p className="python-applied-reflection"><strong>Kendine sor:</strong> {path.independent.reflection}</p>
        <details className="python-applied-solution">
          <summary>Önce kendi kodunu yaz, sonra örnek çözümü incele</summary>
          <pre className="lesson-code"><code>{path.independent.modelCode}</code></pre>
          <p>Bu çözüm gözden geçirilmiş bir örnektir. Açılması, çalıştırılmamış öğrenci koduna başarı veya doğrulama vermez.</p>
        </details>
      </div>}
    </div>
  </section>;
}
