"use client";

import { useState, type FormEvent } from "react";
import type { PublicQuestion } from "@/lib/lessons";

type GradeResponse = { status: "graded"; questionId: string; correct: boolean; correctOptionId: string; explanation: string };

export function QuizCard({ question, number }: { question: PublicQuestion; number: number }) {
  const [selected, setSelected] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<GradeResponse | null>(null);
  const [error, setError] = useState("");

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
      setResult(body as GradeResponse);
    } catch {
      setError("Sonuç alınamadı. Lütfen tekrar dene.");
    } finally { setPending(false); }
  }

  return <form className="quiz-card" onSubmit={submit}>
    <div className="quiz-head"><span>Alıştırma {number}</span><span>Çıktıyı tahmin et</span></div>
    <fieldset disabled={pending}>
      <legend>{question.prompt}</legend>
      <pre className="lesson-code"><code>{question.code}</code></pre>
      <div className="quiz-choices">{question.options.map((option) => <label key={option.id} className={`quiz-choice ${selected === option.id ? "selected" : ""}`}>
        <input type="radio" name={question.id} value={option.id} checked={selected === option.id} onChange={() => {setSelected(option.id);setResult(null);setError("");}} />
        <span>{option.text}</span>
      </label>)}</div>
    </fieldset>
    <button type="submit" className="primary-button quiz-submit" disabled={!selected || pending}>{pending ? "Kontrol ediliyor…" : "Cevabımı kontrol et"}</button>
    <div aria-live="polite" aria-atomic="true">
      {error && <p className="quiz-error" role="alert">{error}</p>}
      {result && <div className={`quiz-feedback ${result.correct ? "is-correct" : "is-wrong"}`}>
        <strong>{result.correct ? "Doğru cevap." : "Henüz doğru değil."}</strong>
        <p>{result.explanation}</p>
        {!result.correct && <span>Doğru seçenek: {question.options.find((option) => option.id === result.correctOptionId)?.text}</span>}
      </div>}
    </div>
  </form>;
}
