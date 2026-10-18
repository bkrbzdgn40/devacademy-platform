"use client";
import {useCallback,useEffect,useState,type FormEvent} from "react";
import Link from "next/link";

type Task={title:string;code:string;promptA:string;promptB:string;stage:number;attemptsRemaining:number};
type State={status:"locked"|"ready"|"active"|"waiting"|"retained"|"cooldown"|"unsupported";
  stage?:number;retry?:boolean;problem?:Task;dueAt?:string;passedAt?:string};
type Feedback={correct:boolean;expected:string[];explanation:string;confidence:"low"|"medium"|"high";stage:number};
type Status="loading"|"signedout"|"unavailable"|"ready";
const when=(value:string)=>new Intl.DateTimeFormat("tr-TR",
  {day:"numeric",month:"long",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Istanbul"}).format(new Date(value));

export function TransferLab({lessonId}:{lessonId:string}) {
  const [loadStatus,setLoadStatus]=useState<Status>("loading");
  const [state,setState]=useState<State|null>(null);
  const [answerA,setAnswerA]=useState("");
  const [answerB,setAnswerB]=useState("");
  const [reflection,setReflection]=useState("");
  const [confidence,setConfidence]=useState<"low"|"medium"|"high">("medium");
  const [feedback,setFeedback]=useState<Feedback|null>(null);
  const [error,setError]=useState("");
  const [pending,setPending]=useState(false);

  const refresh=useCallback(async(signal?:AbortSignal)=>{
    const response=await fetch("/api/transfer?lessonId="+encodeURIComponent(lessonId),
      {cache:"no-store",signal});
    if(response.status===401){setLoadStatus("signedout");return;}
    if(!response.ok){setLoadStatus("unavailable");return;}
    const result=await response.json() as State;
    if(signal?.aborted)return;
    setState(result);setLoadStatus("ready");
  },[lessonId]);
  useEffect(()=>{
    const abort=new AbortController();
    void refresh(abort.signal).catch(()=>{if(!abort.signal.aborted)setLoadStatus("unavailable");});
    return ()=>abort.abort();
  },[refresh]);

  async function post(payload:Record<string,unknown>) {
    const response=await fetch("/api/transfer",{
      method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",
      body:JSON.stringify({lessonId,...payload})
    });
    const result=await response.json();
    if(!response.ok)throw Error(
      result?.status==="locked"?"Önce rehberli dersi tamamlamalısın.":
      result?.status==="cooldown"?"Günlük deneme sınırına ulaştın.":
      result?.error||"İşlem tamamlanamadı.");
    return result;
  }
  async function start() {
    setPending(true);setError("");setFeedback(null);
    try {
      setState(await post({operation:"start"}) as State);
      setAnswerA("");setAnswerB("");setReflection("");
    } catch(e){setError(e instanceof Error?e.message:"Başlatılamadı.");}
    finally{setPending(false);}
  }
  async function submit(e:FormEvent) {
    e.preventDefault();
    if(state?.status!=="active"||pending)return;
    if(reflection.trim().length<12){
      setError("Tahmininin nedenini en az birkaç kelimeyle yaz. Bu açıklama notlandırılmaz.");
      return;
    }
    setPending(true);setError("");
    try {
      const grade=await post({operation:"submit",stage:state.problem?.stage,
        answerA,answerB,confidence}) as Feedback & {status:string};
      setFeedback(grade);
      setAnswerA("");setAnswerB("");setReflection("");
      await refresh();
    } catch(e){setError(e instanceof Error?e.message:"Yanıt gönderilemedi.");}
    finally{setPending(false);}
  }

  return <section className="transfer-lab" aria-labelledby="transfer-title">
    <div className="transfer-heading"><span className="overline">DENEYSEL · KANIT DÖNGÜSÜ</span>
      <h2 id="transfer-title">Ezberi boz: tek değişiklik, iki sonuç</h2>
      <p>Hazır seçenek yok. Kodun iki farklı sonucunu tahmin et, nedenini kendi cümlelerinle açıkla ve eminlik düzeyini belirt. Sunucu burada öğrenci kodu çalıştırmaz.</p>
    </div>
    {loadStatus==="loading"&&<p role="status">Bağımsız görev durumun okunuyor…</p>}
    {loadStatus==="signedout"&&<p>Bu kanıtı hesabına bağlamak için <Link href="/hesap">oturum aç</Link>.</p>}
    {loadStatus==="unavailable"&&<div><p role="status">Bu oturumda kayıtlı bağımsız doğrulama açılamadı. Yerel veritabanında migration 0007 gerekli olabilir.</p>
      <button className="subtle-action" type="button" onClick={()=>{setLoadStatus("loading");void refresh().catch(()=>setLoadStatus("unavailable"));}}>Yeniden dene</button></div>}
    {loadStatus==="ready"&&state?.status==="locked"&&<div>
      <p>Önce bu dersin rehberli sorularını tamamlayıp <strong>Dersi tamamla</strong> düğmesine bas. İlerleme kaydedildikten sonra kanıt görevini açabilirsin.</p>
      <button className="subtle-action" type="button" onClick={()=>void refresh().catch(()=>setLoadStatus("unavailable"))}>Ders durumunu yeniden kontrol et</button>
    </div>}
    {loadStatus==="ready"&&state?.status==="ready"&&<div>
      <p>{state.stage===0?"İlk bağımsız kanıtın hazır. Daha önceki sorulardan farklı sayılar kullanılıyor.":
        "Aradan en az 24 saat geçti. Aynı düşünme becerisini yeni değişkenlerle tekrar sınayacağız."}</p>
      <button type="button" className="primary-button" disabled={pending} onClick={start}>
        {pending?"Görev hazırlanıyor…":state.stage===0?"Bağımsız deneyi başlat":"Gecikmeli deneyi başlat"}
      </button>
    </div>}
    {loadStatus==="ready"&&state?.status==="waiting"&&<p role="status">
      <strong>İlk transfer kanıtı alındı.</strong> Kalıcılık henüz doğrulanmadı.
      Yeni, bağımsız görev {state.dueAt?when(state.dueAt):"24 saat sonra"} açılacak.
    </p>}
    {loadStatus==="ready"&&state?.status==="retained"&&<p role="status">
      <strong>Gecikmeli transfer kanıtı elde edildi.</strong> Aynı kavramı en az 24 saat sonra
      yeni bir örnekte yeniden çözdün. Bu, gerçek kod yazma sertifikası değildir.
    </p>}
    {loadStatus==="ready"&&state?.status==="cooldown"&&<p role="status">
      Bu aşamadaki sekiz denemeyi kullandın. Yeni örnekler {state.dueAt?when(state.dueAt):"24 saat sonra"}
      kullanılabilir. Konuyu tekrar etmek için önceki aşamalara dön.
    </p>}
    {loadStatus==="ready"&&state?.status==="active"&&state.problem&&
      <form className="transfer-form" onSubmit={submit}>
        <p className="transfer-phase">{state.problem.stage===0?"1 / 2 · Bağımsız transfer":
          "2 / 2 · Gecikmeli transfer"} · Kalan deneme: {state.problem.attemptsRemaining}</p>
        <h3>{state.problem.title}</h3>
        <pre className="lesson-code"><code>{state.problem.code}</code></pre>
        <div className="transfer-answers">
          <label>{state.problem.promptA}<input required maxLength={24} autoComplete="off" value={answerA}
            onChange={e=>setAnswerA(e.target.value)} placeholder="A sonucu"/></label>
          <label>{state.problem.promptB}<input required maxLength={24} autoComplete="off" value={answerB}
            onChange={e=>setAnswerB(e.target.value)} placeholder="B sonucu"/></label>
        </div>
        <label className="transfer-reflection">Sence A ve B neden farklı sonuç veriyor?
          <textarea required maxLength={700} rows={3} value={reflection}
            onChange={e=>setReflection(e.target.value)}
            placeholder="Değişen işlemi ve etkisini kendi sözlerinle açıkla…"/>
          <small>Açıklaman yalnızca düşünmeni görünür kılmak içindir; sunucuya gönderilmez ve puanlanmaz.</small>
        </label>
        <fieldset className="transfer-confidence"><legend>Tahmininden ne kadar eminsin?</legend>
          {([["low","Emin değilim"],["medium","Kısmen eminim"],["high","Çok eminim"]] as const).map(([value,label])=>
            <label key={value}><input type="radio" name={"confidence-"+lessonId} value={value}
              checked={confidence===value} onChange={()=>setConfidence(value)}/>{label}</label>)}
        </fieldset>
        <button className="primary-button" type="submit" disabled={pending}>
          {pending?"İki sonuç doğrulanıyor…":"Tahminimi doğrula"}</button>
      </form>}
    {feedback&&<div className="transfer-feedback" role="status" aria-live="polite">
      <strong>{feedback.correct?"İki çıktı da doğru.":"Tahminlerden en az biri beklenenden farklı."}</strong>
      <p>Beklenen sonuç: <strong>A = {feedback.expected[0]}, B = {feedback.expected[1]}</strong></p>
      <p>{feedback.explanation}</p>
      {feedback.confidence==="high"&&!feedback.correct&&
        <p>Yüksek güvenle yapılan yanlış tahmin, gözden geçirmen gereken bir varsayımı işaret ediyor.</p>}
      {feedback.correct&&feedback.stage===0&&<p>İlk kanıt kaydedildi. Kalıcılık için farklı bir görev daha gerekecek.</p>}
    </div>}
    {error&&<p className="quiz-error" role="alert">{error}</p>}
  </section>;
}
