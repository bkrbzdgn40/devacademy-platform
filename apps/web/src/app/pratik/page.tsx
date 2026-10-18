import type { Metadata } from "next";
import Link from "next/link";
import practice from "@/data/practice.json";
export const metadata: Metadata={title:"Kod pratiği",description:"JavaScript, Python ve Java fonksiyonları yazma alıştırmaları."};
export default function PracticeIndex(){
  return <section className="shell listing-page">
    <Link href="/dersler" className="back-link">← Derslere dön</Link>
    <div className="listing-header">
      <p className="overline">Gerçek kod pratiği · Geliştirme önizlemesi</p>
      <h1>Kodu kendin yaz.</h1>
      <p>Bir fonksiyon geliştir, açık örneklere göre kontrol et, gizli sınır durumlarına karşı ne kadar sağlam olduğunu öğren.</p>
    </div>
    <div className="availability-note">Kod değerlendirme yalnızca özel yerel laboratuvarda çalışır. Normal önizlemede alıştırmaları okuyup çözüm düzenleyebilirsin; sonuç gönderme kapalıdır.</div>
    <p className="practice-lab-link"><Link href="/laboratuvar">Serbest JavaScript laboratuvarını aç →</Link></p>
    <ol className="practice-list">{practice.map((exercise,i)=>
      <li key={exercise.id} className="practice-card">
        <span className="overline">Görev {i+1} · {exercise.level}</span>
        <strong>{exercise.title}</strong><p>{exercise.description}</p>
        <Link href={`/pratik/${exercise.slug}`}>Görevi aç →</Link>
      </li>)}</ol>
  </section>;
}
