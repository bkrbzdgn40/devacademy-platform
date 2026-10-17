import type { Metadata } from "next";
import Link from "next/link";
import { lessons } from "@/lib/lessons";

export const metadata: Metadata = { title: "JavaScript dersleri", description: "JavaScript temellerini örnekler ve kısa değerlendirmelerle öğren." };

export default function LessonIndex() {
  return <section className="shell listing-page">
    <Link className="back-link" href="/">← Ana sayfa</Link>
    <div className="listing-header"><p className="overline">İlk öğrenme yolu · JavaScript</p><h1>Öğren, tahmin et, kavra.</h1><p>Gerçek kod örnekleriyle üç temel konuyu öğren ve altı kısa alıştırmayla bilgini kontrol et.</p></div>
    <div className="availability-note" role="status">Bu ilk etkileşimli içerik önizlemesidir. Kod çalıştırma ve hesaplara kayıt henüz yoktur; ilerleme bu sürümde saklanmaz.</div>
    <ol className="lesson-list">{lessons.map((lesson, index) => <li key={lesson.id}>
      <Link href={`/dersler/${lesson.slug}`} className="lesson-item"><span className="lesson-number">{String(index + 1).padStart(2,"0")}</span><span className="lesson-item-body"><strong>{lesson.title}</strong><span>{lesson.summary}</span><small>{lesson.durationMinutes} dk · {lesson.questionIds.length} alıştırma</small></span><span aria-hidden="true" className="lesson-arrow">↗</span></Link>
    </li>)}</ol>
  </section>;
}
