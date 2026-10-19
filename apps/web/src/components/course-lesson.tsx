import Link from "next/link";
import { QuizCard } from "@/components/quiz-card";
import { CodePlayground } from "@/components/code-playground";
import { CompleteLesson } from "@/components/complete-lesson";
import { TraceWalkthrough } from "@/components/trace-walkthrough";
import { LearningStudio } from "@/components/learning-studio";
import { LessonDepth } from "@/components/lesson-depth";
import { AppliedLearningStudio } from "@/components/python-applied-studio";
import { LessonCourseMap } from "@/components/lesson-course-map";
import {studioHasLesson} from "@/lib/studio-scenarios.mjs";
import { LessonStepper, type LessonStep } from "@/components/lesson-stepper";
import { TransferLab } from "@/components/transfer-lab";
import { CodeTransferLab } from "@/components/code-transfer-lab";
import practice from "@/data/practice.json";
import { transferLessonIds } from "@/server/transfer-missions.mjs";
import guides from "@/data/lesson-guides.json";
import { lessonsForCourse, type Course } from "@/lib/courses";
import { questionsForLesson, type Lesson } from "@/lib/lessons";

export function CourseLesson({ course, lesson, legacy = false }: {
  course: Course;
  lesson: Lesson;
  legacy?: boolean;
}) {
  const path = legacy ? "/dersler" : "/kurslar/" + course.slug;
  const entries = lessonsForCourse(course);
  const index = entries.findIndex((item) => item.id === lesson.id);
  if (index < 0) throw new Error("Lesson not in course");
  const next = entries[index + 1];
  const previous = entries[index - 1];
  const questions = questionsForLesson(lesson);
  const guide = guides.find((item) => item.lessonId === lesson.id);
  const studio = studioHasLesson(lesson.id) ? <LearningStudio lessonId={lesson.id}/> : null;
  const diagnostic = guide ? questions.find((item) => item.id === guide.questionId) : undefined;
  const predictionQuestions = guide ? questions.filter((item) => item.id !== guide.questionId) : questions;
  const name = course.editorLanguage === "java" ? "Java" : course.editorLanguage === "javascript" ? "JavaScript" :
    course.editorLanguage === "python" ? "Python" : course.languageId === "language.sql" ? "SQL" : "Düz metin";
  const editorLanguage = course.editorLanguage === "java" ? "java" :
    course.editorLanguage === "python" ? "python" : "plain";
  const editor = <CodePlayground starterCode={lesson.code} displayLanguage={name}
    language={editorLanguage} label={lesson.title + " kod editörü"}/>;
  const completion = <CompleteLesson lessonId={lesson.id} questionCount={questions.length}/>;
  const task = practice.find(item=>"transferLessonId" in item && item.transferLessonId===lesson.id);
  const codeProof = task ? <CodeTransferLab lessonId={lesson.id} task={{
    id:task.id,revision:task.revision,title:task.title,description:task.description,
    language:task.language as "javascript"|"java"|"python",
    functionName:task.functionName,starterCode:task.starterCode,publicCases:task.publicCases
  }}/> : null;
  const steps: LessonStep[] = guide && diagnostic ? [
    { id: "predict", label: "Tahmin et", title: "Önce kendi tahminini yap", content: <>
      <p className="lesson-step-intro">Açıklamayı görmeden önce kodun ne yapacağını düşün. Yanlış cevap öğrenme fırsatıdır.</p>
      {predictionQuestions[0] && <QuizCard question={predictionQuestions[0]} number={1}/>}
    </> },
    { id: "understand", label: "Anla ve izle", title: "Konuyu anlayalım", content: <>
      <p className="lesson-step-intro">{lesson.explanation}</p>
      <details className="lesson-supplement lesson-sample-disclosure">
        <summary>Temel örnek kodu karşılaştır</summary>
        <div className="lesson-supplement-content">
          <div className="code-label">{name} · Örnek kod</div>
          <pre className="lesson-code"><code>{lesson.code}</code></pre>
        </div>
      </details>
      {studio ?? <TraceWalkthrough steps={guide.trace}/>}
      <details className="lesson-supplement lesson-depth-disclosure">
        <summary>Kavramı karşı örneklerle derinleştir</summary>
        <LessonDepth lessonId={lesson.id}/>
      </details>
      {studio && <p className="lesson-step-tip">Bu inceleme, gözden geçirilmiş bir deney üzerinde kodun davranışını izlemeni sağlar; ders içindeki diğer soruların yanıtlarını otomatik olarak değiştirmez.</p>}
    </> },
    { id: "debug", label: "Hata avcısı", title: "Hatayı düzelt", content: <>
      <h3>{guide.missionTitle}</h3>
      <p className="lesson-step-intro">{diagnostic.prompt}</p>
      <div className="code-label">Hatalı örnek · Düzeltmeyi aşağıdaki soruda seç</div>
      <pre className="lesson-code"><code>{diagnostic.code}</code></pre>
      <p className="lesson-step-tip">Bu aşamada seçtiğin düzeltme değerlendirilir; yazdığın kod değil. Bir sonraki aşamada kodu düzenleyebilirsin.</p>
      <QuizCard question={diagnostic} number={2} mode="debug" hints={guide.hints}/>
      <p className="reflection-question"><strong>Kendine sor:</strong> {guide.reflection}</p>
    </> },
    { id: "apply", label: "Uygula", title: "Yeni bir örnekte kendini dene", content: <>
      <p className="lesson-step-intro">Kodu kendin değiştir. Genel kullanıma açık kod çalıştırma kapalıdır; bilgi soruların ayrı değerlendirilir.</p>
      {editor}
      {editorLanguage!=="plain" && <AppliedLearningStudio lessonId={lesson.id} language={editorLanguage}/>}
      <div className="lesson-section">
        <h3>Öğrendiğini farklı bir durumda kullan</h3>
        <div className="quiz-stack">{predictionQuestions.slice(1).map((question, i) =>
          <QuizCard key={question.id} question={question} number={i + 3}/>)}</div>
      </div>
      <div className="lesson-section takeaway-section"><h3>Aklında kalsın</h3>
        <ul>{lesson.takeaways.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}</ul>
      </div>
      {completion}
      {transferLessonIds.includes(lesson.id) && <TransferLab lessonId={lesson.id}/>}
      {codeProof}
    </> },
  ] : [
    { id: "understand", label: "Öğren", title: "Konuyu anlayalım", content: <>
      <p className="lesson-step-intro">{lesson.explanation}</p>
      <details className="lesson-supplement lesson-sample-disclosure">
        <summary>Temel örnek kodu karşılaştır</summary>
        <div className="lesson-supplement-content">
          <div className="code-label">{name} · Örnek kod</div>
          <pre className="lesson-code"><code>{lesson.code}</code></pre>
        </div>
      </details>
      {studio}
      <details className="lesson-supplement lesson-depth-disclosure">
        <summary>Kavramı karşı örneklerle derinleştir</summary>
        <LessonDepth lessonId={lesson.id}/>
      </details>
    </> },
    { id: "apply", label: "Kodla", title: "Örneği kendin değiştir", content: <>
      <p className="lesson-step-intro">Örneği düzenle. Kod çalıştırma yalnızca yetkilendirilmiş yerel laboratuvar ortamında etkinleşir.</p>
      {editor}
      {editorLanguage!=="plain" && <AppliedLearningStudio lessonId={lesson.id} language={editorLanguage}/>}
    </> },
    { id: "assess", label: "Test et", title: "Bilgini kontrol et", content: <>
      <p className="lesson-step-intro">Önce sonucu tahmin et, sonra açıklamayı incele.</p>
      <div className="quiz-stack">{questions.map((question, i) =>
        <QuizCard key={question.id} question={question} number={i + 1}/>)}</div>
      <div className="lesson-section takeaway-section"><h3>Aklında kalsın</h3>
        <ul>{lesson.takeaways.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}</ul>
      </div>
      {completion}
      {transferLessonIds.includes(lesson.id) && <TransferLab lessonId={lesson.id}/>}
      {codeProof}
    </> },
  ];

  return <article className="shell lesson-page lesson-workspace-page">
    <nav aria-label="İçerik konumu" className="breadcrumb">
      <Link href="/kurslar">Kurslar</Link><span aria-hidden="true">/</span>
      <Link href={path}>{course.title}</Link><span aria-hidden="true">/</span>
      <span aria-current="page">{lesson.title}</span>
    </nav>
    <header className="lesson-header">
      <p className="overline">{course.title} · Ders {index + 1}/{entries.length}</p>
      <h1>{lesson.title}</h1><p>{lesson.summary}</p>
      {course.languageId==="language.sql"&&<p className="small-note">
        Örnek kayıtlar: <Link href="/sql-ornek-veri">Müşteri ve sipariş verilerini incele →</Link>.
        SQL editörü düz metin olarak çalışır; sorgular tarayıcıda veya web sunucusunda yürütülmez.
        Doğru cevaplar yalnızca ayrı bilgi sorularından değerlendirilir.
      </p>}
      <div className="lesson-meta">
        <span>{lesson.level}</span><span>{lesson.durationMinutes} dakika</span>
        <span>{questions.length} soru</span>
      </div>
    </header>
    <div className="lesson-workspace-layout">
      <LessonCourseMap courseTitle={course.title} courseHref={path}
        lessons={entries} currentIndex={index} lessonBase={path}/>
      <div className="lesson-workspace-main" id="ders-calisma">
        <section className="lesson-objective" aria-labelledby="objective-title">
          <div><span className="ui-eyebrow">Bu dersin hedefi</span>
            <h2 id="objective-title">Öğrenme hedefin</h2></div>
          <p>{lesson.objective}</p>
        </section>
        <LessonStepper steps={steps}/>
        <nav aria-label="Ders gezinmesi" className="lesson-nav">
          {previous ? <Link className="ui-button ui-button-secondary" href={path + "/" + previous.slug}>← Önceki ders</Link> :
            <Link className="ui-button ui-button-secondary" href={path}>← Kurs dersleri</Link>}
          {next ? <Link className="primary-button" href={path + "/" + next.slug}>Sonraki ders →</Link> :
            <Link className="primary-button" href="/kurslar">Kurslara dön →</Link>}
        </nav>
        <p className="small-note">Soru sonuçları ve ders tamamlama kaydı yalnızca oturum açtığında hesabına kaydedilir. Düzenlediğin kod, genel kullanıma açık bir kod çalıştırma hizmetinde yürütülmez.</p>
      </div>
    </div>
  </article>;
}
