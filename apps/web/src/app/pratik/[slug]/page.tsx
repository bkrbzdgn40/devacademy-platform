import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import practice from "@/data/practice.json";
import { CodePlayground } from "@/components/code-playground";
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return practice.map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params;return {title:practice.find(p=>p.slug===slug)?.title??"Görev bulunamadı"};
}
export default async function PracticeTask({params}:Props){
  const {slug}=await params;
  const exercise=practice.find(p=>p.slug===slug);
  if(!exercise)notFound();
  return <article className="shell lesson-page">
    <nav aria-label="İçerik konumu" className="breadcrumb">
      <Link href="/">Ana sayfa</Link><span aria-hidden="true">/</span>
      <Link href="/pratik">Kod pratiği</Link><span aria-hidden="true">/</span>
      <span aria-current="page">{exercise.title}</span>
    </nav>
    <header className="lesson-header">
      <p className="overline">{("language" in exercise?exercise.language:"javascript")?.toUpperCase()} · Kod görevi · Revizyon {exercise.revision}</p>
      <h1>{exercise.title}</h1><p>{exercise.description}</p>
      <div className="lesson-meta"><span>{exercise.level}</span><span>Fonksiyon: {exercise.functionName}</span><span>Örnek test: {exercise.publicCases.length}</span></div>
    </header>
    <section className="lesson-section" aria-labelledby="examples-title">
      <h2 id="examples-title">Herkese açık örnekler</h2>
      <p>Fonksiyonunu belirtilen isimle yaz ve sonucu <code>return</code> ile döndür. Konsola yazdırmak çözümün yerine geçmez.</p>
      <ul className="public-case-list">{exercise.publicCases.map(example=>
        <li key={example.label}><strong>{example.label}</strong>
          <code>{`${exercise.functionName}(${example.args.map(arg=>JSON.stringify(arg)).join(", ")}) → ${JSON.stringify(example.expected)}`}</code>
        </li>)}</ul>
    </section>
    <section className="lesson-section" aria-labelledby="code-solution-title">
      <h2 id="code-solution-title">Çözümünü yaz</h2>
      <p>Birden çok sınır durumu otomatik kontrol edilir. Gizli test girişleri ve beklenen yanıtlar paylaşılmaz; değerlendirme yalnızca yerel laboratuvar etkin olduğunda yapılır.</p>
      <CodePlayground starterCode={exercise.starterCode} exerciseId={exercise.id}
        language={("language" in exercise?exercise.language:"javascript") as "javascript"|"python"|"java"}
        exerciseRevision={exercise.revision} label={`${exercise.title} çözüm editörü`}/>
    </section>
    <nav className="lesson-nav" aria-label="Pratik gezinmesi"><Link href="/pratik" className="subtle-button">← Tüm görevler</Link></nav>
  </article>;
}
