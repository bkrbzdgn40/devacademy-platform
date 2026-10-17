import type { Metadata } from "next";
import Link from "next/link";
import { courses,lessonsForCourse } from "@/lib/courses";
export const metadata:Metadata={title:"Yazılım kursları",description:"Türkçe JavaScript, Java ve Python kurslarıyla programlama öğren."};
export default function CourseList(){
  return <section className="shell listing-page">
    <Link href="/" className="back-link">← Ana sayfa</Link>
    <div className="listing-header"><p className="overline">DevAcademy öğrenme yolları</p>
      <h1>Öğrenmek istediğin dili seç.</h1>
      <p>Her kurs aynı ders, soru ve ilerleme altyapısını kullanır. Kod çalıştırma desteği dil bazında ayrı değerlendirilir.</p>
    </div>
    <ul className="catalog-grid">{courses.map(course=><li className="catalog-card" key={course.id}>
      <div className="catalog-top"><span className="level-chip">{course.level}</span><span className="locked-chip">Kurs önizlemesi</span></div>
      <h2>{course.title}</h2><p>{course.summary}</p>
      <p>{lessonsForCourse(course).length} ders · {lessonsForCourse(course).reduce((n,x)=>n+x.questionIds.length,0)} bilgi sorusu</p>
      <Link className="catalog-lesson-link" href={"/kurslar/"+course.slug}>Kursa başla →</Link>
    </li>)}</ul>
  </section>;
}
