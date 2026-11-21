import walkthroughs from "@/data/lesson-walkthroughs.json";
import depth from "@/data/lesson-depth.json";

// Hedefteki senaryoyu adım adım çözen örnek; zihinsel model görünür, uç durum ayrı vurgulanır.
export function LessonWalkthrough({lessonId}:{lessonId:string}) {
  const content=walkthroughs.find(item=>item.id===lessonId);
  if(!content)return null;
  const model=depth.find(item=>item.id===lessonId)?.model;
  const headingId="lesson-walkthrough-"+lessonId;
  return <section className="lesson-walkthrough" aria-labelledby={headingId}>
    {model && <aside className="lesson-walkthrough-model" aria-label="Zihinsel model">
      <span className="lesson-depth-kicker">Zihinsel model</span>
      <p>{model}</p>
    </aside>}
    <h3 id={headingId}>Hedefteki durumu adım adım çözelim</h3>
    <p className="lesson-walkthrough-scenario">{content.scenario}</p>
    <ol className="lesson-walkthrough-steps">
      {content.steps.map((step,i)=><li key={i}>
        <pre className="lesson-code"><code>{step.code}</code></pre>
        <p>{step.note}</p>
      </li>)}
    </ol>
    <div className="lesson-walkthrough-edge">
      <span className="lesson-depth-kicker">Uç durum · Burada yanılma</span>
      <pre className="lesson-code"><code>{content.edgeCase.code}</code></pre>
      <p>{content.edgeCase.note}</p>
    </div>
  </section>;
}

export function LessonReferences({lessonId}:{lessonId:string}) {
  const references=walkthroughs.find(item=>item.id===lessonId)?.references;
  if(!references?.length)return null;
  return <div className="lesson-references">
    <h4>Resmî kaynakta oku</h4>
    <ul>{references.map(ref=><li key={ref.url}>
      <a href={ref.url} target="_blank" rel="noopener noreferrer">{ref.title}<span className="sr-only"> (yeni sekmede açılır)</span></a>
    </li>)}</ul>
  </div>;
}
