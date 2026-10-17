import Link from "next/link";
import { QuizCard } from "@/components/quiz-card";
import { CodePlayground } from "@/components/code-playground";
import { CompleteLesson } from "@/components/complete-lesson";
import { TraceWalkthrough } from "@/components/trace-walkthrough";
import guides from "@/data/lesson-guides.json";
import { lessonsForCourse, type Course } from "@/lib/courses";
import { questionsForLesson, type Lesson } from "@/lib/lessons";

export function CourseLesson({course,lesson,legacy=false}:{course:Course;lesson:Lesson;legacy?:boolean}){
  const path=legacy?"/dersler":"/kurslar/"+course.slug;
  const entries=lessonsForCourse(course);
  const index=entries.findIndex(x=>x.id===lesson.id);
  if(index<0)throw new Error("Lesson not in course");
  const next=entries[index+1];
  const questions=questionsForLesson(lesson);
  const guide=guides.find(item=>item.lessonId===lesson.id);
  const diagnostics=guide?questions.find(question=>question.id===guide.questionId):undefined;
  const predictionQuestions=guide?questions.filter(question=>question.id!==guide.questionId):questions;
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
    {guide&&<ol className="learning-trail" aria-label="Dört adımlı öğrenme yolu">
      <li><strong>01</strong>Tahmin et</li><li><strong>02</strong>İzini sür</li>
      <li><strong>03</strong>Hatayı düzelt</li><li><strong>04</strong>Kanıtla</li>
    </ol>}
    <section className="lesson-section" aria-labelledby="objective-title"><h2 id="objective-title">Bu derste öğreneceksin</h2><p>{lesson.objective}</p></section>
    {guide&&<section className="lesson-section guided-phase" aria-labelledby="predict-title">
      <p className="phase-kicker">01 · Aktif hatırlama</p>
      <h2 id="predict-title">Önce kendi tahminini yap</h2>
      <p>Açıklamayı okumadan önce bir cevap seç. Yanlış olursa, nedenini öğrenip tekrar deneyeceksin.</p>
      {predictionQuestions[0]&&<QuizCard question={predictionQuestions[0]} number={1}/>}
    </section>}
    <section className="lesson-section" aria-labelledby="explanation-title">
      {guide&&<p className="phase-kicker">02 · Kavrama ve izleme</p>}
      <h2 id="explanation-title">Konuyu anlayalım</h2><p>{lesson.explanation}</p>
      <div className="code-label">{name} · İncelenebilir örnek (otomatik çalıştırma kapalı)</div>
      <pre className="lesson-code"><code>{lesson.code}</code></pre>
      {guide&&<TraceWalkthrough steps={guide.trace}/>}
    </section>
    {guide&&diagnostics&&<section className="lesson-section guided-phase" aria-labelledby="debug-title">
      <p className="phase-kicker">03 · Hata avcısı</p>
      <h2 id="debug-title">{guide.missionTitle}</h2>
      <p>{diagnostics.prompt}</p>
      <div className="practice-mission-note">
        <strong>Görev:</strong> Hatalı kodu editörde düzeltmeyi dene. Ardından alttaki soruda hangi değişikliğin doğru olduğunu seç.
        Bu laboratuvarda yazdığın {name} kodu çalıştırılmaz; değerlendirme düzeltme seçimini kontrol eder.
      </div>
      <CodePlayground starterCode={diagnostics.code} displayLanguage={name}
        language={course.editorLanguage==="java"?"java":course.editorLanguage==="javascript"?"javascript":course.editorLanguage==="python"?"python":"plain"}
        label={lesson.title+" hata ayıklama editörü"}/>
      <div className="guided-debug-question">
        <QuizCard question={diagnostics} number={2} mode="debug" hints={guide.hints}/>
      </div>
      <p className="reflection-question"><strong>Kendine sor:</strong> {guide.reflection}</p>
    </section>}
    <section className="lesson-section" aria-labelledby="editor-title">
      {guide&&<p className="phase-kicker">04 · Transfer ve pekiştirme</p>}
      <h2 id="editor-title">{guide?"Öğrendiğini yeni örneğe taşı":"Kod laboratuvarı"}</h2>
      <p>Örneği değiştir ve sözdizimini incele. Çalıştırma yalnızca ayrı güvenlik değerlendirmesi yapılmış dillerde ve laboratuvar ortamında açılır.</p>
      <CodePlayground starterCode={lesson.code} displayLanguage={name}
        language={course.editorLanguage==="java"?"java":course.editorLanguage==="javascript"?"javascript":course.editorLanguage==="python"?"python":"plain"}
        label={lesson.title+" "+name+" kod editörü"}/>
    </section>
    <section className="lesson-section" aria-labelledby="practice-title">
      <h2 id="practice-title">{guide?"Son bir kontrol: Yeni durumu çöz":"Kendini test et"}</h2>
      <p>{guide?"Konuyu farklı bir örneğe uygula. Sonra kendine neden doğru olduğunu açıkla.":"Önce sonucu tahmin et, ardından açıklamayı incele."}</p>
      <div className="quiz-stack">{(guide?predictionQuestions.slice(1):questions).map((question,i)=>
        <QuizCard key={question.id} question={question} number={guide?i+3:i+1}/>)}</div>
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
