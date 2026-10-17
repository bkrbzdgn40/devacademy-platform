import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuizCard } from "@/components/quiz-card";
import { CodePlayground } from "@/components/code-playground";
import { CompleteLesson } from "@/components/complete-lesson";
import { findLesson, lessons, questionsForLesson } from "@/lib/lessons";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return lessons.map((lesson) => ({ slug: lesson.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: findLesson(slug)?.title ?? "Ders bulunamadı" };
}

export default async function LessonPage({ params }: Props) {
  const { slug } = await params;
  const lesson = findLesson(slug);
  if (!lesson) notFound();
  const index = lessons.findIndex((item) => item.id === lesson.id);
  const next = lessons[index + 1];
  const questions = questionsForLesson(lesson);
  return <article className="shell lesson-page">
    <nav aria-label="İçerik konumu" className="breadcrumb"><Link href="/">Ana sayfa</Link><span aria-hidden="true">/</span><Link href="/dersler">JavaScript dersleri</Link><span aria-hidden="true">/</span><span aria-current="page">{lesson.title}</span></nav>
    <header className="lesson-header"><p className="overline">JavaScript temelleri · Ders {index + 1}/{lessons.length}</p><h1>{lesson.title}</h1><p>{lesson.summary}</p><div className="lesson-meta"><span>{lesson.level}</span><span>{lesson.durationMinutes} dakika</span><span>{questions.length} alıştırma</span></div></header>
    <section className="lesson-section" aria-labelledby="objective-title"><h2 id="objective-title">Bu derste öğreneceksin</h2><p>{lesson.objective}</p></section>
    <section className="lesson-section" aria-labelledby="explanation-title"><h2 id="explanation-title">Konuyu anlayalım</h2><p>{lesson.explanation}</p><div className="code-label">JavaScript · İncelenebilir örnek (çalıştırma henüz mevcut değil)</div><pre className="lesson-code"><code>{lesson.code}</code></pre></section>
    <section className="lesson-section" aria-labelledby="editor-title"><h2 id="editor-title">Kod laboratuvarı</h2><p>Örneği değiştirerek sözdizimini keşfet. Güvenli yürütme henüz etkin değil.</p><CodePlayground starterCode={lesson.code} label={`${lesson.title} JavaScript kod editörü`} /></section>
    <section className="lesson-section" aria-labelledby="practice-title"><h2 id="practice-title">Kendini test et</h2><p>Önce sonucu kendi başına tahmin et. Gönderdikten sonra açıklamayı inceleyebilirsin.</p><div className="quiz-stack">{questions.map((question, i) => <QuizCard key={question.id} question={question} number={i + 1} />)}</div></section>
    <section className="lesson-section takeaway-section" aria-labelledby="takeaway-title"><h2 id="takeaway-title">Aklında kalsın</h2><ul>{lesson.takeaways.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}</ul></section>
    <CompleteLesson lessonId={lesson.id} />
    <nav aria-label="Ders gezinmesi" className="lesson-nav"><Link className="subtle-button" href="/dersler">← Tüm dersler</Link>{next ? <Link className="primary-button" href={`/dersler/${next.slug}`}>Sonraki ders →</Link> : <Link className="primary-button" href="/dersler">Ders listesine dön →</Link>}</nav>
    <p className="small-note">Oturum açan kullanıcıların cevapları veritabanına kaydedilir. Kod düzenleme kullanılabilir ancak çalıştırma henüz etkin değildir.</p>
  </article>;
}
