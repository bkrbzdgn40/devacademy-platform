import Link from "next/link";
type LessonItem={id:string;title:string;href:string};
export type LearningPath={
  id:string;title:string;href:string;area:string;summary:string;payoff:string;
  mark:string;tone:string;foundation:string[];next:string;level:string;
  lessons:LessonItem[];lessonCount:number;questionCount:number;minutes:number;
  matches?:LessonItem[];
};
export function LearningPathCard({path,compact=false}:{
  path:LearningPath;compact?:boolean;
}){
  return <article className={"path-card ui-card path-"+path.tone+(compact?" path-compact":"")}>
    <div className="path-top">
      <span className="path-mark" aria-hidden="true">{path.mark}</span>
      <span className="path-level">{path.area}</span>
    </div>
    <h3><Link href={path.href}>{path.title}</Link></h3>
    <p className="path-payoff">{path.payoff}</p>
    <div className="path-facts"><span>{path.lessonCount} ders</span><span>{path.questionCount} soru</span>
      <span>Yaklaşık {path.minutes} dk içerik</span></div>
    {!compact&&<><p className="path-subheading">Bu yolda neleri kavrayacaksın?</p>
      <ul className="path-topics">{path.foundation.map(x=><li key={x}>{x}</li>)}</ul>
      <p className="path-destination">Hazırlık: {path.next}</p></>}
    <Link className="path-cta" href={path.href}>Ders yolunu incele <span aria-hidden="true">↗</span></Link>
    {Boolean(path.matches?.length)&&<div className="path-matches">
      <strong>Aramana uyan dersler</strong>
      <ul>{path.matches?.map(l=><li key={l.id}><Link href={l.href}>{l.title} →</Link></li>)}</ul>
    </div>}
  </article>;
}
