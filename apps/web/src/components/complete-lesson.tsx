"use client";
import { useState } from "react";
import Link from "next/link";

export function CompleteLesson({ lessonId, questionCount=2 }: { lessonId: string; questionCount?: number }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  async function complete() {
    setPending(true); setMessage("");
    try {
      const response = await fetch("/api/progress", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, operation: "complete" }),
      });
      const data = (await response.json()) as { error?: string };
      if (response.status === 401) setMessage("İlerlemeyi saklamak için önce oturum açmalısın.");
      else if (!response.ok) setMessage(data.error || "Ders tamamlanamadı.");
      else { setDone(true); setMessage("Ders tamamlandı ve hesabına kaydedildi."); }
    } catch { setMessage("İlerleme kaydedilemedi."); }
    finally { setPending(false); }
  }
  return <section className="completion-card" aria-labelledby="completion-title">
    <h2 id="completion-title">Dersi bitirmeye hazır mısın?</h2>
    <p>{questionCount} soruyu doğru çözdüğünde tamamlanma durumunu hesabına kaydedebilirsin.</p>
    <button className="primary-button" type="button" onClick={complete} disabled={pending || done}>{done ? "Tamamlandı ✓" : pending ? "Kontrol ediliyor…" : "Dersi tamamla"}</button>
    {message && <p role="status">{message} {message.includes("oturum") && <Link href="/hesap">Hesabıma git →</Link>}</p>}
  </section>;
}
