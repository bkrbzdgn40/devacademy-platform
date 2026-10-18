"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {CodePlayground} from "@/components/code-playground";

type Task={id:string;revision:number;language:"javascript"|"java"|"python";
  title:string;description:string;functionName:string;starterCode:string;
  publicCases:{label:string;args:unknown[];expected:unknown}[]};
type State={status:"locked"|"ready"|"verified";labEnabled:boolean;completedAt?:string};
type FetchStatus="loading"|"ready"|"signedout"|"unavailable";
export function CodeTransferLab({lessonId,task}:{lessonId:string;task:Task}) {
  const [fetchStatus,setFetchStatus]=useState<FetchStatus>("loading");
  const [status,setStatus]=useState<State|null>(null);
  const [updating,setUpdating]=useState(false);
  const refresh=useCallback(async(signal?:AbortSignal)=>{
    const res=await fetch("/api/code-transfer?lessonId="+encodeURIComponent(lessonId),
      {cache:"no-store",signal});
    if(signal?.aborted)return;
    if(res.status===401){setFetchStatus("signedout");return;}
    if(!res.ok){setFetchStatus("unavailable");return;}
    const next=await res.json() as State;
    if(signal?.aborted)return;
    setStatus(next);
    setFetchStatus("ready");
  },[lessonId]);
  useEffect(()=>{
    const abort=new AbortController();
    void fetch("/api/code-transfer?lessonId="+encodeURIComponent(lessonId),
      {cache:"no-store",signal:abort.signal})
      .then(async res=>{
        if(res.status===401)return {status:"signedout" as const};
        if(!res.ok)return {status:"unavailable" as const};
        return {status:"ready" as const,value:await res.json() as State};
      }).then(result=>{
        if(abort.signal.aborted)return;
        setFetchStatus(result.status);
        if(result.status==="ready")setStatus(result.value);
      }).catch(()=>{if(!abort.signal.aborted)setFetchStatus("unavailable");});
    return ()=>abort.abort();
  },[lessonId]);
  async function verify() {
    setUpdating(true);
    try {await refresh();}catch{setFetchStatus("unavailable");}
    finally{setUpdating(false);}
  }
  return <section className="code-transfer-lab" aria-labelledby={"code-transfer-"+task.id}>
    <p className="overline">BAĞIMSIZ KOD ÜRETİMİ · M8.3</p>
    <h2 id={"code-transfer-"+task.id}>Bu kez kodu sen yaz</h2>
    <p>Çıktıyı tahmin etmekten farklı olarak, bir fonksiyonun davranışını kendin oluştur. Gizli sınır durumları da doğruysa ayrı bir <strong>kod üretimi kanıtı</strong> elde edersin.</p>
    {fetchStatus==="loading"&&<p role="status">Kanıt durumu okunuyor…</p>}
    {fetchStatus==="signedout"&&<p>Görev sonucunu doğrulamak için <Link href="/hesap">oturum aç</Link>.</p>}
    {fetchStatus==="unavailable"&&<p role="status">Kanıt kaydına şu anda ulaşılamıyor. Yerel laboratuvar veritabanını kontrol et.</p>}
    {fetchStatus==="ready"&&status?.status==="locked"&&<p role="status">
      Bu görev, ilgili kavramın <strong>ilk yardımsız transfer sınamasını</strong> geçince açılır. Teşhis deneyinin doğru çözülmesi tek başına yeterli değildir.
      Kanıt döngüsünde ilerledikten sonra <button type="button" className="inline-action" onClick={()=>void verify()}>durumu yeniden kontrol et</button>.
    </p>}
    {fetchStatus==="ready"&&status?.status==="verified"&&<div className="code-transfer-verified" role="status">
      <strong>Kod üretimi davranış kanıtı doğrulandı.</strong>
      <p>Yetkilendirilmiş Docker worker, bu görevin açık ve gizli testlerini başarıyla tamamladı. Bu bir genel programlama sertifikası veya kullanılan algoritmanın ispatı değildir.</p>
    </div>}
    {fetchStatus==="ready"&&status?.status==="ready"&&<>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <div className="code-transfer-examples">
        <strong>Yayınlanmış iki örnek</strong>
        <ul>{task.publicCases.map(test=><li key={test.label}>
          <span>{test.label}</span>
          <code>{task.functionName+"("+test.args.map(x=>JSON.stringify(x)).join(", ")+") → "+JSON.stringify(test.expected)}</code>
        </li>)}</ul>
      </div>
      <p className="small-note">{status.labEnabled?
        "Yerel laboratuvar açık. Kodu bitirince bütün açık ve gizli testlerden geçir.":
        "Şu anda kodu yazıp düzenleyebilirsin ancak değerlendirme kapalı. Sunucu, çalıştırılmamış kod için başarı kanıtı vermez."}</p>
      <CodePlayground starterCode={task.starterCode} exerciseId={task.id}
        exerciseRevision={task.revision} language={task.language}
        label={task.title+" bağımsız çözüm editörü"} onAssessmentFinished={()=>void verify()}/>
      <button type="button" className="subtle-action" disabled={updating}
        onClick={()=>void verify()}>{updating?"Kontrol ediliyor…":"Kod kanıtımı yeniden kontrol et"}</button>
    </>}
  </section>;
}
