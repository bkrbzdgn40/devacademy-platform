"use client";
import {useId,useState,useSyncExternalStore,type FormEvent} from "react";

// Fully client-side "predict first" demo for the home hero. No API calls:
// the trace below is authored by hand and never executes code.
const codeLines=[
  "abstract class Animal {",
  "  abstract void speak();",
  "}",
  "",
  "class Dog extends Animal {",
  "  @Override",
  "  void speak() {",
  "    System.out.println(\"Woof!\");",
  "  }",
  "}",
  "",
  "Animal pet = new Dog();",
  "pet.speak();",
];
const options=[
  {id:"woof",label:"Woof!",correct:true,
    feedback:"Doğru. Değişkenin türü Animal olsa da çağrı nesnenin gerçek türü olan Dog'a gider."},
  {id:"nothing",label:"Hiçbir şey yazdırmaz",correct:false,
    feedback:"Tahminin tutmadı. Animal.speak soyut ve hiç çalışmaz. Çağrı, nesnenin gerçek türü olan Dog'daki metoda gider."},
  {id:"error",label:"Derleme hatası verir",correct:false,
    feedback:"Tahminin tutmadı. Soyut sınıf doğrudan örneklenmez; burada örneklenen Dog. Animal türünde bir değişkende tutulması geçerlidir."},
];
const trace=[
  {line:12,text:"new Dog() bir Dog nesnesi oluşturur. pet değişkeninin türü Animal."},
  {line:13,text:"pet.speak() çağrısı çalışma anında nesnenin gerçek türüne göre çözülür."},
  {line:8,text:"Dog içindeki speak çalışır ve konsola Woof! yazılır."},
];
const output="Woof!";

const subscribe=()=>()=>{};
// false on the server and during hydration, true once JS runs in the browser.
function useEnhanced(){return useSyncExternalStore(subscribe,()=>true,()=>false);}

export function HeroPredict(){
  const enhanced=useEnhanced();
  const baseId=useId();
  const [choice,setChoice]=useState("");
  const [locked,setLocked]=useState(false);
  const [step,setStep]=useState(0);
  const [error,setError]=useState("");
  const selected=options.find(option=>option.id===choice);
  const revealed=!enhanced||locked;
  const activeLine=enhanced&&locked?trace[step].line:0;

  function lock(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!selected){setError("Önce bir tahmin seç.");return;}
    setError("");setLocked(true);setStep(0);
  }
  function restart(){setChoice("");setLocked(false);setStep(0);setError("");}

  const announcement=!enhanced?"":error?error:locked&&selected
    ?`${selected.correct?"Tahminin doğru.":"Tahminin farklı çıktı."} Çıktı: ${output}. Adım ${step+1} / ${trace.length}, satır ${trace[step].line}: ${trace[step].text}`
    :"";

  return <div className="hero-visual hero-predict" role="group" aria-labelledby={baseId+"-title"}>
    <div className="code-heading"><span className="window-dots" aria-hidden="true">● ● ●</span><span>Polymorphism.java</span><span>Java</span></div>
    <div className="hero-predict-code" role="region" aria-label="Polymorphism.java kaynak kodu" tabIndex={0}>
      {codeLines.map((line,index)=><div key={index}
        className={"studio-code-row"+(activeLine===index+1?" studio-code-active":"")}
        aria-current={activeLine===index+1?"step":undefined}>
        <span className="studio-line-number" aria-hidden="true">{index+1}</span>
        <code>{line||" "}</code>
      </div>)}
    </div>
    <div className="hero-predict-panel">
      <p className="hero-predict-title" id={baseId+"-title"}>Önce tahmin et: bu program ne yazdırır?</p>
      {enhanced&&!locked&&<form className="hero-predict-form" onSubmit={lock}>
        <fieldset>
          <legend className="sr-only">Tahminini seç</legend>
          {options.map(option=><label key={option.id} className="hero-predict-option">
            <input type="radio" name={baseId+"-choice"} value={option.id}
              checked={choice===option.id} onChange={()=>{setChoice(option.id);setError("");}}/>
            <span>{option.label}</span>
          </label>)}
        </fieldset>
        {error&&<p className="hero-predict-error">{error}</p>}
        <button type="submit" className="hero-predict-button">Tahmini kilitle ve sonucu gör</button>
      </form>}
      {revealed&&<div className="hero-predict-result">
        <p className="hero-predict-output"><span>Çıktı</span><code>{output}</code></p>
        {enhanced&&selected&&<p className={"hero-predict-feedback"+(selected.correct?" is-correct":"")}>{selected.feedback}</p>}
        <ol className="hero-predict-trace">{trace.map((item,index)=>
          <li key={index} className={enhanced&&index===step?"is-active":undefined}>
            <span className="hero-predict-line">Satır {item.line}</span> {item.text}
          </li>)}</ol>
        {enhanced&&<div className="hero-predict-actions">
          <button type="button" onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}>Önceki adım</button>
          <button type="button" onClick={()=>setStep(s=>Math.min(trace.length-1,s+1))} disabled={step===trace.length-1}>Sonraki adım</button>
          <button type="button" onClick={restart}>Yeniden dene</button>
        </div>}
      </div>}
      <p className="sr-only" aria-live="polite">{announcement}</p>
    </div>
    <div className="code-footnote"><span>Tarayıcıda çalışan örnek</span><span>Kod çalıştırılmaz, iz önceden hazırlandı</span></div>
  </div>;
}
