"use client";

import { useState, type FormEvent } from "react";
import type { PublicQuestion } from "@/lib/lessons";

type GradeResponse = { status: "graded"; questionId: string; correct: boolean; correctOptionId: string; explanation: string; tailoredFeedback?: string|null; saved: boolean };

export function QuizCard({ question, number, hints=[], mode="predict", onGraded }: { question: PublicQuestion; number: number; hints?:readonly string[]; mode?:"predict"|"debug"; onGraded?:(correct:boolean)=>void }) {
  const [selected, setSelected] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<GradeResponse | null>(null);
  const [error, setError] = useState("");
  const [shownHints,setShownHints]=useState(0);
  const [wrongAttempts,setWrongAttempts]=useState(0);
  const [revealSolution,setRevealSolution]=useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || pending) return;
    setPending(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, optionId: selected }),
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Değerlendirme şu anda tamamlanamadı.");
      const body: unknown = await response.json();
      if (!body || typeof body !== "object" || !("status" in body) || body.status !== "graded") throw new Error("Beklenmeyen sonuç.");
      const grade=body as GradeResponse;
      setResult(grade);
      onGraded?.(grade.correct);
      setRevealSolution(false);
      if(!grade.correct)setWrongAttempts(count=>count+1);
    } catch {
      setError("Sonuç alınamadı. Lütfen tekrar dene.");
    } finally { setPending(false); }
  }

  return <form className="quiz-card" onSubmit={submit}>
    <div className="quiz-head"><span>Alıştırma {number}</span><span>{mode==="debug"?"Hata avcısı · Düzeltmeyi bul":"Çıktıyı tahmin et"}</span></div>
    <fieldset disabled={pending}>
      <legend>{question.prompt}</legend>
      <pre className="lesson-code"><code>{question.code}</code></pre>
      <div className="quiz-choices">{question.options.map((option) => <label key={option.id} className={`quiz-choice ${selected === option.id ? "selected" : ""}`}>
        <input type="radio" name={question.id} value={option.id} checked={selected === option.id} onChange={() => {setSelected(option.id);setResult(null);setError("");}} />
        <span>{option.text}</span>
      </label>)}</div>
    </fieldset>
    {hints.length>0 && <div className="hint-panel">
      <button type="button" className="subtle-action" onClick={()=>setShownHints(value=>Math.min(value+1,hints.length))}
        disabled={shownHints>=hints.length}>İpucu göster ({shownHints}/{hints.length})</button>
      {shownHints>0 && <ol className="hint-list">{hints.slice(0,shownHints).map((hint,i)=><li key={i}>{hint}</li>)}</ol>}
    </div>}
    <button type="submit" className="primary-button quiz-submit" disabled={!selected || pending}>{pending ? "Kontrol ediliyor…" : "Cevabımı kontrol et"}</button>
    <div aria-live="polite" aria-atomic="true">
      {error && <p className="quiz-error" role="alert">{error}</p>}
      {result && <div className={`quiz-feedback ${result.correct ? "is-correct" : "is-wrong"}`}>
        <strong>{result.correct ? "Doğru cevap." : "Henüz doğru değil."}</strong>
        {!result.correct && result.tailoredFeedback && <p><strong>Neden olmadı?</strong> {result.tailoredFeedback}</p>}
        {(result.correct || mode==="predict" || revealSolution) &&
          <p><strong>Doğru düşünme yolu:</strong> {result.explanation}</p>}
        {!result.correct&&mode==="debug"&&!revealSolution&&
          <button type="button" className="subtle-action quiz-reveal" onClick={()=>setRevealSolution(true)}>
            Çözüm açıklamasını göster
          </button>}
        {!result.correct && wrongAttempts>0 && <p className="retry-cue">Yanıtı yeniden seçerek tekrar deneyebilirsin. Hatalı deneme öğrenmenin bir parçası; önemli olan nedenini açıklayabilmen.</p>}
        <p className="quiz-save-state">{result.saved ? "Cevabın hesabına kaydedildi." : "Bu deneme kalıcı kaydedilmedi. Kayıt için oturum açmalısın."}</p>
        {!result.correct && (mode==="predict"||revealSolution) && <span>Doğru seçenek: {question.options.find((option) => option.id === result.correctOptionId)?.text}</span>}
      </div>}
    </div>
  </form>;
}
