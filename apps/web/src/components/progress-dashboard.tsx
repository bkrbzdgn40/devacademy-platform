import Link from "next/link";
import { allLessons } from "@/lib/lessons";
import { courses, lessonsForCourse, lessonHref } from "@/lib/courses";
import { summarizeProgress, type ProgressLesson, type ProgressAttempt } from "@/lib/progress-summary";

type Props = { progress: { lessons: ProgressLesson[]; recentAttempts: ProgressAttempt[] } | null };
const dateText=(value:string)=>{const d=new Date(value);return Number.isNaN(d.getTime())?"Bilinmiyor":new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"short",year:"numeric"}).format(d);};
export function ProgressDashboard({progress}:Props){
  if(!progress)return <p role="status">İlerleme verileri alınamadı. Daha sonra yeniden dene.</p>;
  const s=summarizeProgress(allLessons.length,progress.lessons,progress.recentAttempts);
  const records=new Map(progress.lessons.map(x=>[x.lessonId,x]));
  return <div className="learning-dashboard">
    <div className="dashboard-stats">
      <div className="dashboard-stat"><span>Tamamlanan dersler</span><strong>{s.completed}/{s.total}</strong></div>
      <div className="dashboard-stat"><span>Başlanan dersler</span><strong>{s.started}</strong></div>
      <div className="dashboard-stat"><span>Son kayıtlı denemeler</span><strong>{s.recentAttemptCount}</strong></div>
      <div className="dashboard-stat"><span>Son denemelerde başarı</span><strong>{s.recentCorrectPercent===null?"Henüz yok":`%${s.recentCorrectPercent}`}</strong></div>
    </div>
    <div className="dashboard-overall"><div className="dashboard-progress-label"><strong>Öğrenme yolu ilerlemesi</strong><span>%{s.percent}</span></div>
      <progress aria-label="Tamamlanan ders yüzdesi" max={Math.max(1,allLessons.length)} value={s.completed}>{s.percent}%</progress>
      <p>Deneme başarı oranı sadece son {s.recentAttemptCount} kayıtlı sonucu (en fazla 50) kapsar. Ders ilerlemesi tüm dersler üzerinden hesaplanır.</p>
    </div>
    <h3>Kursların ve derslerin</h3>
    {courses.map(course=><section key={course.id} aria-label={course.title} className="dashboard-course">
      <h4><Link href={"/kurslar/"+course.slug}>{course.title}</Link></h4>
      <ol className="dashboard-lessons">{lessonsForCourse(course).map((lesson,i)=>{
      const found=records.get(lesson.id);
      return <li key={lesson.id} className="dashboard-lesson"><span className="dashboard-index">{String(i+1).padStart(2,"0")}</span>
        <div><Link href={lessonHref(lesson.id)}><strong>{lesson.title}</strong></Link><small>{found?`Son etkinlik: ${dateText(found.lastViewedAt)}`:"Henüz kayıt yok"}</small></div>
        <span className={found?.completedAt?"progress-done":"progress-pending"}>{found?.completedAt?"Tamamlandı":found?"Devam ediyor":"Başlanmadı"}</span>
      </li>;
    })}</ol></section>)}
  </div>;
}
