import Link from "next/link";
import {ViewTransition} from "react";
type LessonItem={id:string;title:string;href:string};
export type LearningPath={
  id:string;title:string;href:string;area:string;summary:string;payoff:string;
  mark:string;tone:string;foundation:string[];next:string;level:string;
  lessons:LessonItem[];lessonCount:number;questionCount:number;minutes:number;
  matches?:LessonItem[];
};
/** Fihrist satırı: `index` kursun katalogdaki 0 tabanlı sırası; filtrelenmiş
 *  listede de gerçek sıra numarası görünsün diye dışarıdan verilir. */
export function LearningPathCard({path,index,compact=false}:{
  path:LearningPath;index:number;compact?:boolean;
}){
  return <article className={"path-card path-"+path.tone+(compact?" path-compact":"")}>
    <span className="path-index-no" aria-hidden="true">{String(index+1).padStart(2,"0")}</span>
    <div className="path-index-body">
      <ViewTransition name={"course-title-"+path.href.split("/").pop()} share={{"title-morph":"title-morph",default:"none"}} default="none">
        <h3><Link href={path.href} transitionTypes={["title-morph"]}>{path.title}</Link></h3>
      </ViewTransition>
      <p className="path-payoff">{path.payoff}</p>
      {!compact&&<><p className="path-subheading">Bu yolda neleri kavrayacaksın?</p>
        <ul className="path-topics">{path.foundation.map(x=><li key={x}>{x}</li>)}</ul>
        <p className="path-destination">Hazırlık: {path.next}</p></>}
      {Boolean(path.matches?.length)&&<div className="path-matches">
        <strong>Aramana uyan dersler</strong>
        <ul>{path.matches?.map(l=><li key={l.id}><Link href={l.href}>{l.title} →</Link></li>)}</ul>
      </div>}
    </div>
    <div className="path-index-meta">
      <p className="path-facts">{path.lessonCount} ders<span aria-hidden="true"> · </span>
        <span className="sr-only">, </span>{path.questionCount} soru<span aria-hidden="true"> · </span>
        <span className="sr-only">, </span>yaklaşık {path.minutes} dk</p>
      {path.lessons[0]&&<p className="path-level">İlk ders: {path.lessons[0].title}</p>}
      <Link className="path-cta" href={path.href} transitionTypes={["title-morph"]}>Ders yolunu incele <span aria-hidden="true">→</span></Link>
    </div>
  </article>;
}
