import Link from "next/link";
import { allLessons } from "@/lib/lessons";
import { courses, lessonsForCourse, lessonHref } from "@/lib/courses";
import { summarizeProgress, type ProgressLesson, type ProgressAttempt } from "@/lib/progress-summary";

type Props = { progress: { lessons: ProgressLesson[]; recentAttempts: ProgressAttempt[]; reviewSummary?:{total:number;due:number};transferSummary?:{first:number;retained:number};codeTransferSummary?:{verified:number} } | null };
const dateText=(value:string)=>{const d=new Date(value);return Number.isNaN(d.getTime())?"Bilinmiyor":new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"short",year:"numeric"}).format(d);};
export function ProgressDashboard({progress}:Props){
  if(!progress)return <p role="status">İlerleme verileri alınamadı. Daha sonra yeniden dene.</p>;
  const s=summarizeProgress(allLessons.length,progress.lessons,progress.recentAttempts);
  const records=new Map(progress.lessons.map(x=>[x.lessonId,x]));
  return <div className="learning-dashboard">
    <div className="dashboard-stats">
      <div className="dashboard-stat ui-card"><span>Tamamlanan dersler</span><strong>{s.completed}/{s.total}</strong></div>
      <div className="dashboard-stat"><span>Başlanan dersler</span><strong>{s.started}</strong></div>
      <div className="dashboard-stat"><span>Son kayıtlı denemeler</span><strong>{s.recentAttemptCount}</strong></div>
      <div className="dashboard-stat"><span>Son denemelerde başarı</span><strong>{s.recentCorrectPercent===null?"Henüz yok":`%${s.recentCorrectPercent}`}</strong></div>
    </div>
    <div className="dashboard-overall ui-card"><div className="dashboard-progress-label"><strong>Öğrenme yolu ilerlemesi</strong><span>%{s.percent}</span></div>
      <progress aria-label="Tamamlanan ders yüzdesi" max={Math.max(1,allLessons.length)} value={s.completed}>{s.percent}%</progress>
      <p>Deneme başarı oranı sadece son {s.recentAttemptCount} kayıtlı sonucu (en fazla 50) kapsar. Ders ilerlemesi tüm dersler üzerinden hesaplanır.</p>
    </div>
    <aside className="dashboard-reviews ui-card" aria-label="Kişisel tekrar planı">
       <strong>Zamanlanmış tekrar</strong>
       <p>{progress.reviewSummary?.due??0} soru bugün tekrar bekliyor · {progress.reviewSummary?.total??0} soru takip ediliyor</p>
       <Link href="/tekrar">Tekrar oturumuna başla →</Link>
    </aside>
    <aside className="dashboard-reviews" aria-label="Bağımsız transfer kanıtı">
      <strong>Karşı-Olgusal Kanıt Döngüsü</strong>
      <p>{progress.transferSummary?.first??0} kavramda ilk bağımsız kanıt · {progress.transferSummary?.retained??0} kavramda gecikmeli doğrulama</p>
      <p>Bu kanıtlar rehberli ders tamamlamasından ayrıdır. Gecikmeli doğrulama için 24 saat sonra yeni bir görev çözülür.</p>
      <p><strong>{progress.codeTransferSummary?.verified??0} kavram</strong> için bağımsız kod üretimi davranış kanıtı. Bu kayıt yalnızca yerel Docker laboratuvarında geçen açık ve gizli testlere dayanır.</p>
    </aside>
    <h3>Kursların ve derslerin</h3>
    {courses.map(course=><section key={course.id} aria-label={course.title} className="dashboard-course ui-card">
      <h4><Link href={"/kurslar/"+course.slug}>{course.title}</Link></h4>
      {(()=>{
        const items=lessonsForCourse(course);
        const completed=items.filter(item=>records.get(item.id)?.completedAt).length;
        const next=items.find(item=>!records.get(item.id)?.completedAt);
        return <div className="dashboard-course-signal">
          <span>{completed}/{items.length} ders · %{Math.round(100*completed/Math.max(1,items.length))}</span>
          <progress max={Math.max(1,items.length)} value={completed} aria-label={course.title+" tamamlanan dersler"}/>
          {next&&<Link href={lessonHref(next.id)}>Sıradaki: {next.title} →</Link>}
        </div>;
      })()}
      <ol className="dashboard-lessons">{lessonsForCourse(course).map((lesson,i)=>{
      const found=records.get(lesson.id);
      return <li key={lesson.id} className="dashboard-lesson"><span className="dashboard-index">{String(i+1).padStart(2,"0")}</span>
        <div><Link href={lessonHref(lesson.id)}><strong>{lesson.title}</strong></Link><small>{found?`Son etkinlik: ${dateText(found.lastViewedAt)}`:"Henüz kayıt yok"}</small></div>
        <span className={found?.completedAt?"progress-done":"progress-pending"}>{found?.completedAt?"Tamamlandı":found?"Devam ediyor":"Başlanmadı"}</span>
      </li>;
    })}</ol></section>)}
  </div>;
}
