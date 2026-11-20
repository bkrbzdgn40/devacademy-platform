import type { Metadata } from "next";
import Link from "next/link";
import practice from "@/data/practice.json";
import {canonicalFor} from "@/lib/site-url.mjs";
import {PredictLine} from "@/components/predict-line";
export const metadata: Metadata={...canonicalFor("/pratik"),title:"Kod pratiği",description:"JavaScript, Python ve Java fonksiyonları yazma alıştırmaları."};

type Exercise=(typeof practice)[number];
const languages=[
  {id:"javascript",title:"JavaScript"},
  {id:"python",title:"Python"},
  {id:"java",title:"Java"},
] as const;
const baseLevel="Başlangıç";
// Older tasks carry no language field; they are the original JavaScript set.
const languageOf=(exercise:Exercise)=>("language" in exercise&&exercise.language)||"javascript";
// The group heading already names the language, so drop it from the task title.
// The first public case as a call the learner can predict before opening the task.
const show=(value:unknown):string=>Array.isArray(value)?"["+value.map(show).join(", ")+"]":JSON.stringify(value);
const sampleCall=(exercise:Exercise)=>{
  const sample=exercise.publicCases[0];
  return sample?{code:exercise.functionName+"("+(sample.args as unknown[]).map(show).join(", ")+")",answer:show(sample.expected)}:null;
};
const shortTitle=(title:string)=>title.replace(/^(JavaScript|Python|Java)\s*[:·]\s*/,"");

export default function PracticeIndex(){
  return <section className="shell listing-page">
    <div className="listing-header">
      <h1>Kodu kendin yaz.</h1>
      <p>Bir fonksiyon geliştir, açık örneklere göre kontrol et, gizli sınır durumlarına karşı ne kadar sağlam olduğunu öğren.</p>
    </div>
    <div className="availability-note">Kod değerlendirme yalnızca özel yerel laboratuvarda çalışır. Normal önizlemede alıştırmaları okuyup çözüm düzenleyebilirsin; sonuç gönderme kapalıdır.</div>
    <p className="practice-lab-link"><Link href="/laboratuvar">Serbest JavaScript laboratuvarını aç →</Link></p>
    {languages.map(language=>{
      const tasks=practice.filter(exercise=>languageOf(exercise)===language.id);
      if(!tasks.length)return null;
      return <section className="practice-group" key={language.id} aria-labelledby={"practice-"+language.id}>
        <h2 id={"practice-"+language.id}>{language.title} <span>{tasks.length} görev</span></h2>
        <ul className="practice-list">{tasks.map(exercise=>
          <li key={exercise.id} className="practice-card">
            <Link href={`/pratik/${exercise.slug}`} className="practice-row-link">
              <strong>{shortTitle(exercise.title)}</strong>
              {exercise.level!==baseLevel&&<span className="practice-level">{exercise.level}</span>}
            </Link>
            <p>{exercise.description}</p>
            {(()=>{const call=sampleCall(exercise);return call&&<PredictLine code={call.code} answer={call.answer} language={languageOf(exercise)}/>;})()}
          </li>)}</ul>
      </section>;
    })}
  </section>;
}
