import type {Metadata} from "next";
import Link from "next/link";
import {CourseExplorer} from "@/components/course-explorer";
import {learningPaths} from "@/lib/learning-paths.mjs";
export const metadata:Metadata={
  title:"Öğrenme yolları ve kurs keşfi",
  description:"JavaScript, Java ve Python kurslarını ve mevcut derslerini arayarak sana uygun öğrenme yolunu seç."
};
export default function CourseList(){
  const count=learningPaths.reduce((n:number,p:{lessonCount:number})=>n+p.lessonCount,0);
  return <section className="shell listing-page course-discovery-page">
    <Link href="/" className="back-link">← Ana sayfa</Link>
    <header className="listing-header discovery-header">
      <p className="overline">Öğrenme yolları · DevAcademy</p>
      <h1>Önce ne öğrenmek istediğini bul.</h1>
      <p>Web geliştirme, nesne yönelimli programlama veya Python ile problem çözme. Bütün kurslar gerçek derslerden oluşur; aradığın kavramı doğrudan açabilirsin.</p>
      <div className="discovery-facts">
        <span><strong>{learningPaths.length}</strong> yayımlanmış kurs</span>
        <span><strong>{count}</strong> ders</span>
        <span><strong>3</strong> programlama dili</span>
      </div>
    </header>
    <CourseExplorer/>
    <aside className="discovery-guidance">
      <h2>Nereden başlayacağından emin değil misin?</h2>
      <p>Okunaklı sözdizimi ve genel problem çözme ilgini çekiyorsa Python; web üzerinde etkileşimler oluşturmak istiyorsan JavaScript; türler ve nesne yönelimli düşünmeyle ilerlemek istiyorsan Java uygun başlangıç seçenekleridir.</p>
      <Link href="/kutuphane/kavramlar">Önce temel kavramlara göz at →</Link>
    </aside>
  </section>;
}
