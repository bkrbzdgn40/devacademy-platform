"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => <p role="status" className="editor-loading">Kod editörü yükleniyor…</p>,
});

type ExecutionJob = {
  id: string;
  mode: "run" | "assess";
  assessment: null | { verdict: "passed" | "failed"; passed: number; total: number; publicCases: {label:string;passed:boolean}[] };
  status: "queued" | "running" | "completed" | "runtime_error" | "timed_out" | "output_limit" | "infrastructure_error";
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number | null;
};
type Capability = { enabled: boolean; runtimeId: string; maxSourceBytes: number };
const finalStatuses = new Set(["completed","runtime_error","timed_out","output_limit","infrastructure_error"]);
const labels: Record<ExecutionJob["status"],string> = {
  queued:"Kuyrukta",running:"Çalışıyor",completed:"Tamamlandı",
  runtime_error:"Kod hatası",timed_out:"Süre aşıldı",
  output_limit:"Çıktı sınırına ulaşıldı",infrastructure_error:"Çalıştırıcı hatası",
};
const sleep = (ms:number) => new Promise<void>(resolve=>setTimeout(resolve,ms));

export function CodePlayground({ starterCode, label = "JavaScript kod editörü",  exerciseId, exerciseRevision, language="javascript", displayLanguage }: { starterCode: string; label?: string; exerciseId?: string; exerciseRevision?: number; language?:"javascript"|"java"|"python"|"plain"; displayLanguage?:string }) {
  const [code, setCode] = useState(starterCode);
  const [capability, setCapability] = useState<Capability | null>(null);
  const [job,setJob]=useState<ExecutionJob | null>(null);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const controller=useRef<AbortController | null>(null);
  const extensions = useMemo(() => language==="javascript" ? [javascript()] : language==="java" ? [java()] : language==="python" ? [python()] : [], [language]);
  const changed = code !== starterCode;
  const bytes = new TextEncoder().encode(code).byteLength;
  const assessmentMode=Boolean(exerciseId && exerciseRevision);
  const available=capability?.enabled===true &&
    (assessmentMode?["javascript","python","java"].includes(language):language==="javascript");

  useEffect(()=>{
    const abort=new AbortController();
    controller.current=abort;
    fetch("/api/executions/availability",{signal:abort.signal,cache:"no-store"})
      .then(async r=>r.ok ? await r.json() as Capability : null)
      .then(data=>{if(!abort.signal.aborted)setCapability(data);})
      .catch(()=>{if(!abort.signal.aborted)setCapability(null);});
    return ()=>abort.abort();
  },[]);

  async function runCode() {
    if(!available || busy)return;
    if(bytes>(assessmentMode?6000:8192) || !code.trim()){
      setError("Kod boş veya boyut sınırını aşıyor.");
      return;
    }
    setBusy(true);setJob(null);setError("");
    const signal=controller.current?.signal;
    try{
      const posted=await fetch("/api/executions",{
        method:"POST",headers:{"Content-Type":"application/json"},signal,
        body:JSON.stringify({requestId:crypto.randomUUID(),source:code,
          ...(assessmentMode?{mode:"assess",exerciseId,exerciseRevision}:{})})
      });
      if(!posted.ok){
        setError(posted.status===401?"Çalıştırma için önce oturum açmalısın.":posted.status===429?
          "Kota doldu. Mevcut işlemlerin tamamlanmasını bekle.":"İş kuyruğu isteği kabul etmedi.");
        return;
      }
      const accepted=(await posted.json()) as ExecutionJob;
      setJob(accepted);
      for(let i=0;i<160 && !signal?.aborted;i++){
        if(finalStatuses.has(accepted.status))break;
        await sleep(500);
        if(signal?.aborted)break;
        const response=await fetch("/api/executions/"+encodeURIComponent(accepted.id),{cache:"no-store",signal});
        if(!response.ok)throw Error("STATUS_UNAVAILABLE");
        const status=(await response.json()) as ExecutionJob;
        setJob(status);
        if(finalStatuses.has(status.status))return;
      }
      setError("İşlem yanıt vermedi. Kuyruk durumunu tekrar kontrol etmek için sayfayı yenileyebilirsin.");
    }catch{
      if(!signal?.aborted)setError("Çalıştırma sonucu alınamadı.");
    }finally{
      if(!signal?.aborted)setBusy(false);
    }
  }

  return <section aria-label={label} className="editor-shell">
    <div className="editor-toolbar">
      <div><strong>{displayLanguage ?? (language==="java"?"Java":language==="python"?"Python":language==="plain"?"Genel kod":"JavaScript")} editörü</strong><span>CodeMirror 6 · {language==="plain"?"Düz metin modu":(displayLanguage ?? (language==="java"?"Java":language==="python"?"Python":"JavaScript"))+" sözdizimi renklendirme"}</span></div>
      <button type="button" onClick={()=>{setCode(starterCode);setJob(null);setError("");}} disabled={!changed}>Örneği sıfırla</button>
    </div>
    <CodeMirror
      value={code} theme="dark" extensions={extensions} height="320px"
      basicSetup={{lineNumbers:true,highlightActiveLine:true,foldGutter:true,autocompletion:true}}
      onChange={value=>{setCode(value);if(!busy){setJob(null);setError("");}}}
      aria-label={label}
    />
    <div className="editor-footer">
      <span aria-live="polite">{bytes.toLocaleString("tr-TR")} bayt · {code.split("\n").length} satır</span>
      <button type="button" disabled={!available||busy||bytes>(assessmentMode?6000:8192)||!code.trim()}
        aria-disabled={!available||busy} title={!available?(assessmentMode?
          "Değerlendirme yalnızca ayrı ve yetkilendirilmiş yerel laboratuvarda etkinleşir.":
          "Bu dil için tek başına kod çalıştırma henüz etkin değil."):undefined}
        onClick={runCode}>{busy?"Değerlendiriliyor…":assessmentMode?
          (available?"Çözümü değerlendir (yerel lab)":"Değerlendirme (laboratuvar kapalı)"):
          (available?"Çalıştır (yerel laboratuvar)":language!=="javascript"?"Bu dilde çalıştırma kapalı":"Çalıştır (hazırlanıyor)")}</button>
    </div>
    {error && <p className="editor-error" role="alert">{error} {error.includes("oturum") && <Link href="/hesap">Hesabıma git →</Link>}</p>}
    {job && <div className="execution-output" role="status" aria-live="polite">
      <div><strong>İş durumu: {labels[job.status]}</strong>{job.durationMs!==null && <span>{job.durationMs} ms</span>}</div>
      {job.assessment && <div className="assessment-summary">
        <strong>{job.assessment.verdict==="passed"?"Çözüm bütün testlerden geçti.":"Çözüm henüz doğru değil."}</strong>
        <p>{job.assessment.passed}/{job.assessment.total} test başarılı. Gizli testlerin giriş ve beklenen sonuçları gösterilmez.</p>
        <ul>{job.assessment.publicCases.map(item=><li key={item.label}>
          {item.passed?"✓":"✗"} {item.label}: {item.passed?"Başarılı":"Başarısız"}
        </li>)}</ul>
      </div>}
      {finalStatuses.has(job.status) && !assessmentMode && <>
        <p>Standart çıktı</p><pre>{job.stdout || "(Çıktı yok)"}</pre>
        {!!job.stderr && <><p>Hata çıktısı</p><pre>{job.stderr}</pre></>}
        <small>Çıkış kodu: {job.exitCode===null?"Yok":job.exitCode}</small>
      </>}
    </div>}
    <p className="editor-privacy">{available?
      "Özel yerel laboratuvar etkin: Kod yalnızca oturumunla yetkilendirilen geçici bir işe gönderilir; izole çalışma sonrasında iş kaydından silinir. Genel kullanıma açık değildir.":
      "Bu editör kodu tarayıcıda düzenler. "+(assessmentMode?"Laboratuvar kapalı olduğu sürece çözüm hiçbir sunucuya gönderilmez. ":(language!=="javascript"?"Bu dilin bağımsız çalıştırılması desteklenmiyor. ":""))+"Değişiklikler sayfadan ayrılınca kaybolur."}</p>
  </section>;
}
