"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
// Only the selected editor language loads its grammar package.
type EditorLanguage = "javascript" | "java" | "python" | "plain";
type GrammarExtension = ReturnType<(typeof import("@codemirror/lang-javascript"))["javascript"]>;
async function loadLanguage(language: EditorLanguage): Promise<GrammarExtension[]> {
  switch (language) {
    case "javascript": return [(await import("@codemirror/lang-javascript")).javascript()];
    case "java": return [(await import("@codemirror/lang-java")).java()];
    case "python": return [(await import("@codemirror/lang-python")).python()];
    case "plain": return [];
  }
}
// Grammar plus a11y: the editable surface gets an accessible name. Code surfaces are
// dark brown in both site themes (home card, lesson code), so the editor always uses
// the same studio palette; every token colour clears 5:1 on both code surfaces.
type EditorComponent = (typeof import("@uiw/react-codemirror"))["default"];
// The editor component comes from the same import as the extensions, so it renders
// in one step once ready: no second lazy suspension that collapses and re-expands the page.
async function loadGrammar(language: EditorLanguage, label: string): Promise<{extensions:GrammarExtension[];Editor:EditorComponent;theme:GrammarExtension}> {
  const [grammar, {default: Editor, EditorView}, {HighlightStyle, syntaxHighlighting}, {tags: t}] = await Promise.all([
    loadLanguage(language), import("@uiw/react-codemirror"), import("@codemirror/language"), import("@lezer/highlight"),
  ]);
  const studioTheme = EditorView.theme({
    "&": {color: "var(--ui-code-ink)", backgroundColor: "var(--color-code-surface)"},
    ".cm-content": {caretColor: "var(--color-tan)"},
    ".cm-cursor, .cm-dropCursor": {borderLeftColor: "var(--color-tan)"},
    ".cm-gutters": {backgroundColor: "var(--color-code-surface)", color: "#B5A797", border: "none", borderRight: "1px solid rgba(242,232,216,.12)"},
    ".cm-activeLine": {backgroundColor: "rgba(242,232,216,.05)"},
    ".cm-activeLineGutter": {backgroundColor: "rgba(242,232,216,.07)", color: "var(--ui-code-ink)"},
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection": {backgroundColor: "rgba(202,161,123,.32)"},
    ".cm-matchingBracket": {backgroundColor: "rgba(202,161,123,.22)", outline: "1px solid rgba(202,161,123,.5)"},
    ".cm-foldPlaceholder": {backgroundColor: "transparent", border: "1px solid rgba(242,232,216,.2)", color: "#C7B9A6"},
    ".cm-tooltip": {backgroundColor: "#2A231D", color: "var(--ui-code-ink)", border: "1px solid rgba(242,232,216,.18)"},
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": {backgroundColor: "rgba(202,161,123,.28)", color: "var(--ui-code-ink)"},
  }, {dark: true});
  const studioHighlight = HighlightStyle.define([
    {tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.moduleKeyword], color: "#E8A27C"},
    {tag: [t.string, t.special(t.string), t.regexp], color: "#B9C98A"},
    {tag: [t.number, t.bool, t.null, t.atom], color: "#E6C07B"},
    {tag: [t.comment, t.lineComment, t.blockComment], color: "#B5A797", fontStyle: "italic"},
    {tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#8FC1B5"},
    {tag: [t.definition(t.variableName), t.className, t.typeName], color: "#E4B6D0"},
    {tag: [t.propertyName], color: "#D9C4A8"},
    {tag: [t.operator, t.punctuation, t.bracket], color: "#C7B9A6"},
    {tag: t.invalid, color: "#F2E8D8", textDecoration: "underline wavy #E8A27C"},
  ]);
  const extensions = [...grammar, EditorView.contentAttributes.of({"aria-label": label})] as GrammarExtension[];
  const theme = [studioTheme, syntaxHighlighting(studioHighlight)] as unknown as GrammarExtension;
  return {extensions, Editor, theme};
}

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

export function CodePlayground({ starterCode, label = "JavaScript kod editörü",  exerciseId, exerciseRevision, language="javascript", displayLanguage,onAssessmentFinished }: { starterCode: string; label?: string; exerciseId?: string; exerciseRevision?: number; language?:"javascript"|"java"|"python"|"plain"; displayLanguage?:string;onAssessmentFinished?:()=>void }) {
  const [code, setCode] = useState(starterCode);
  const [capability, setCapability] = useState<Capability | null>(null);
  const [job,setJob]=useState<ExecutionJob | null>(null);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  // Sıfırlamadan önceki kod: öğrenci yanlışlıkla bastıysa tek tıkla geri alabilir.
  const [undoCode,setUndoCode]=useState<string|null>(null);
  const shell=useRef<HTMLElement>(null);
  const controller=useRef<AbortController | null>(null);
  const [grammar, setGrammar] = useState<{language:EditorLanguage;extensions:GrammarExtension[];Editor:EditorComponent;theme:GrammarExtension} | null>(null);
  const ready = grammar?.language === language ? grammar : null;
  useEffect(() => {
    let cancelled = false;
    void loadGrammar(language, label).then((value) => {
      if (!cancelled) setGrammar({language,...value});
    }).catch(() => {
      if (!cancelled) setError("Dil araçları yüklenemedi. Sayfayı yenileyip tekrar deneyin.");
    });
    return () => {cancelled = true;};
  }, [language, label]);
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
        if(finalStatuses.has(status.status)){
          if(status.status==="completed"&&status.assessment?.verdict==="passed")onAssessmentFinished?.();
          return;
        }
      }
      setError("İşlem yanıt vermedi. Kuyruk durumunu tekrar kontrol etmek için sayfayı yenileyebilirsin.");
    }catch{
      if(!signal?.aborted)setError("Çalıştırma sonucu alınamadı.");
    }finally{
      if(!signal?.aborted)setBusy(false);
    }
  }

  return <section ref={shell} aria-label={label} className="editor-shell">
    <div className="editor-toolbar">
      <div><strong>{displayLanguage ?? (language==="java"?"Java":language==="python"?"Python":language==="plain"?"Genel kod":"JavaScript")} editörü</strong><span>CodeMirror 6 · {language==="plain"?"Düz metin modu":(displayLanguage ?? (language==="java"?"Java":language==="python"?"Python":"JavaScript"))+" sözdizimi renklendirme"}</span></div>
      <button type="button" onClick={()=>{setUndoCode(code);setCode(starterCode);setJob(null);setError("");}} disabled={!changed} title={changed?undefined:"Kodu değiştirdiğinde etkinleşir"}>Örneği sıfırla</button>
    </div>
    {undoCode!==null&&<p className="editor-undo" role="status">Kod başlangıç örneğine döndü.
      <button type="button" onClick={()=>{setCode(undoCode);setUndoCode(null);setJob(null);setError("");
        // Düğme kaybolunca odak sayfa başına düşmesin: editöre dön.
        shell.current?.querySelector<HTMLElement>(".cm-content")?.focus();}}>Geri al</button></p>}
    {ready ? <ready.Editor
      value={code} theme={ready.theme} extensions={ready.extensions} height="320px"
      basicSetup={{lineNumbers:true,highlightActiveLine:true,foldGutter:true,autocompletion:true}}
      onChange={value=>{setCode(value);setUndoCode(null);if(!busy){setJob(null);setError("");}}}
      aria-label={label} indentWithTab={false}
    /> : <p role="status" className="editor-loading">Kod editörü yükleniyor…</p>}
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
