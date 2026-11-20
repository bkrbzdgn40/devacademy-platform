import Link from "next/link";
import {ViewTransition} from "react";
import { lessonsForCourse, type Course } from "@/lib/courses";
import { CourseProgress } from "@/components/course-progress";
import { PredictLine } from "@/components/predict-line";

// The first few lines of a lesson's example, up to its first printed value.
// The answer stays in the lesson; the row only asks the question.
const OUTPUT_LINE=/^(.*?(?:console\.log|print|System\.out\.println)\(.*?\);?)\s*(?:\/\/|#)\s*.+$/;
function previewOf(code:string){
  const lines=code.split("\n");
  const at=lines.findIndex(line=>OUTPUT_LINE.test(line));
  if(at<0||at>3)return null;
  const head=lines.slice(0,at).filter(line=>line.trim());
  return [...head,lines[at].replace(OUTPUT_LINE,"$1").trimEnd()].join("\n");
}

export function CourseOverview({course,legacy=false}:{course:Course;legacy?:boolean}){
  const entries=lessonsForCourse(course);
  return <section className="shell listing-page">
    <Link className="back-link" href="/kurslar" transitionTypes={["title-morph"]}>← Tüm kurslar</Link>
    <div className="listing-header">
      <ViewTransition name={"course-title-"+course.slug} share={{"title-morph":"title-morph",default:"none"}} default="none">
        <h1>{course.title}</h1>
      </ViewTransition>
      <p>{course.summary}</p>
    </div>
    <div className="availability-note" role="status">{course.capabilities.editor?
      "Kod örneklerini editörde değiştirebilirsin. Bu kurs için kod çalıştırma ve otomatik kod testi halka açık değildir.":
      "Bu kursta editör ve çalıştırma bulunmuyor."}
    </div>
    <CourseProgress courseSlug={course.slug} lessons={entries.map(x=>({id:x.id,slug:x.slug,title:x.title}))}/>
    <ol className="lesson-list">{entries.map((lesson,index)=><li key={lesson.id}>
      <Link href={legacy?"/dersler/"+lesson.slug:"/kurslar/"+course.slug+"/"+lesson.slug} className="lesson-item ui-card" transitionTypes={["title-morph"]}>
        <span className="lesson-number">{String(index+1).padStart(2,"0")}</span>
        <span className="lesson-item-body"><ViewTransition name={"lesson-title-"+course.slug+"-"+lesson.slug} share={{"title-morph":"title-morph",default:"none"}} default="none"><strong>{lesson.title}</strong></ViewTransition><span>{lesson.summary}</span>
          {(()=>{const preview=previewOf(lesson.code);return preview&&<PredictLine still code={preview} language={course.languageId.replace(/^language\./,"")}/>;})()}
          <small>{lesson.durationMinutes} dk · {lesson.questionIds.length} soru</small></span>
        <span aria-hidden="true" className="lesson-arrow">→</span>
      </Link>
    </li>)}</ol>
  </section>;
}
