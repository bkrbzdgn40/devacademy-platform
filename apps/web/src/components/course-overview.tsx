import Link from "next/link";
import { lessonsForCourse, type Course } from "@/lib/courses";
import { CourseProgress } from "@/components/course-progress";

export function CourseOverview({course,legacy=false}:{course:Course;legacy?:boolean}){
  const entries=lessonsForCourse(course);
  return <section className="shell listing-page">
    <Link className="back-link" href="/kurslar">← Tüm kurslar</Link>
    <div className="listing-header">
      <p className="overline">{course.title} · Türkçe içerik · Geliştirme önizlemesi</p>
      <h1>{course.title}</h1>
      <p>{course.summary}</p>
    </div>
    <div className="availability-note" role="status">{course.capabilities.editor?
      "Kod örneklerini editörde değiştirebilirsin. Bu kurs için kod çalıştırma ve otomatik kod testi halka açık değildir.":
      "Bu kursta editör ve çalıştırma bulunmuyor."}
    </div>
    <CourseProgress courseSlug={course.slug} lessons={entries.map(x=>({id:x.id,slug:x.slug,title:x.title}))}/>
    <ol className="lesson-list">{entries.map((lesson,index)=><li key={lesson.id}>
      <Link href={legacy?"/dersler/"+lesson.slug:"/kurslar/"+course.slug+"/"+lesson.slug} className="lesson-item ui-card">
        <span className="lesson-number">{String(index+1).padStart(2,"0")}</span>
        <span className="lesson-item-body"><strong>{lesson.title}</strong><span>{lesson.summary}</span>
          <small>{lesson.durationMinutes} dk · {lesson.questionIds.length} soru</small></span>
        <span aria-hidden="true" className="lesson-arrow">↗</span>
      </Link>
    </li>)}</ol>
  </section>;
}
