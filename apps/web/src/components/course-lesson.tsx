import Link from "next/link";
import { QuizCard } from "@/components/quiz-card";
import { CodePlayground } from "@/components/code-playground";
import { CompleteLesson } from "@/components/complete-lesson";
import { lessonsForCourse, type Course } from "@/lib/courses";
import { questionsForLesson, type Lesson } from "@/lib/lessons";

export function CourseLesson({course,lesson,legacy=false}:{course:Course;lesson:Lesson;legacy?:boolean}){
  const path=legacy?"/dersler":"/kurslar/"+course.slug;
  const entries=lessonsForCourse(course);
  const index=entries.findIndex(x=>x.id===lesson.id);
  if(index<0)throw new Error("Lesson not in course");
  const next=entries[index+1];
  const questions=questionsForLesson(lesson);
  const name=course.editorLanguage==="java"?"Java":course.editorLanguage==="javascript"?"JavaScript":course.title.replace(/ Temelleri$/,"");
  return <article className="shell lesson-page">
    <nav aria-label="İçerik konumu" className="breadcrumb">
      <Link href="/kurslar">Kurslar</Link><span aria-hidden="true">/</span>
      <Link href={path}>{course.title}</Link><span aria-hidden="true">/</span>
      <span aria-current="page">{lesson.title}</span>
    </nav>
    <header className="lesson-header">
      <p className="overline">{course.title} · Ders {index+1}/{entries.length}</p>
      <h1>{lesson.title}</h1><p>{lesson.summary}</p>
      <div className="lesson-meta"><span>{lesson.level}</span><span>{lesson.durationMinutes} dakika</span><span>{questions.length} soru</span></div>
    </header>
    <section className="lesson-section" aria-labelledby="objective-title"><h2 id="objective-title">Bu derste öğreneceksin</h2><p>{lesson.objective}</p></section>
    <section className="lesson-section" aria-labelledby="explanation-title">
      <h2 id="explanation-title">Konuyu anlayalım</h2><p>{lesson.explanation}</p>
      <div className="code-label">{name} · İncelenebilir örnek (otomatik çalıştırma kapalı)</div>
      <pre className="lesson-code"><code>{lesson.code}</code></pre>
    </section>
    <section className="lesson-section" aria-labelledby="editor-title">
      <h2 id="editor-title">Kod laboratuvarı</h2>
      <p>Örneği değiştir ve sözdizimini incele. Çalıştırma yalnızca ayrı güvenlik değerlendirmesi yapılmış dillerde ve laboratuvar ortamında açılır.</p>
      <CodePlayground starterCode={lesson.code} displayLanguage={name} language={course.editorLanguage==="java"?"java":course.editorLanguage==="javascript"?"javascript":"plain"} label={lesson.title+" "+name+" kod editörü"}/>
    </section>
    <section className="lesson-section" aria-labelledby="practice-title">
      <h2 id="practice-title">Kendini test et</h2><p>Önce sonucu tahmin et, ardından açıklamayı incele.</p>
      <div className="quiz-stack">{questions.map((question,i)=><QuizCard key={question.id} question={question} number={i+1}/>)}</div>
    </section>
    <section className="lesson-section takeaway-section" aria-labelledby="takeaway-title"><h2 id="takeaway-title">Aklında kalsın</h2>
      <ul>{lesson.takeaways.map(takeaway=><li key={takeaway}>{takeaway}</li>)}</ul>
    </section>
    <CompleteLesson lessonId={lesson.id} questionCount={questions.length}/>
    <nav aria-label="Ders gezinmesi" className="lesson-nav">
      <Link className="subtle-button" href={path}>← Kurs dersleri</Link>
      {next?<Link className="primary-button" href={path+"/"+next.slug}>Sonraki ders →</Link>:
        <Link className="primary-button" href="/kurslar">Kurslara dön →</Link>}
    </nav>
    <p className="small-note">Oturum açan öğrencilerin soru yanıtları ve ders ilerlemesi yapılandırılmış veritabanında saklanır. {name} kodunu yalnızca düzenleyebilirsin; yayın ortamında çalıştırma etkin değildir.</p>
  </article>;
}
