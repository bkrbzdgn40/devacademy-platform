import Link from "next/link";

export type CourseMapLesson={id:string;title:string;slug:string};
type Props={courseTitle:string;courseHref:string;lessons:CourseMapLesson[];
  currentIndex:number;lessonBase:string};

function MapList({lessons,currentIndex,lessonBase}:Pick<Props,"lessons"|"currentIndex"|"lessonBase">){
  return <ol className="course-map-list">
    {lessons.map((entry,i)=><li key={entry.id}>
      <Link href={lessonBase+"/"+entry.slug} aria-current={i===currentIndex?"page":undefined}
        className={i===currentIndex?"course-map-lesson is-current":"course-map-lesson"}>
        <span className="course-map-number" aria-hidden="true">{String(i+1).padStart(2,"0")}</span>
        <span className="course-map-lesson-title">{entry.title}</span>
        {i===currentIndex&&<span className="course-map-now">Şimdi</span>}
      </Link>
    </li>)}
  </ol>;
}
export function LessonCourseMap({courseTitle,courseHref,lessons,currentIndex,lessonBase}:Props){
  const position=currentIndex+1;
  return <aside className="lesson-course-map" aria-label="Kurs içindeki derslerin haritası">
    <div className="course-map-desktop">
      <header className="course-map-head">
        <span className="ui-eyebrow">Ders haritası</span>
        <Link href={courseHref} className="course-map-course">{courseTitle} ↗</Link>
        <p>Ders {position}/{lessons.length} · Konumun gösteriliyor, tamamlama puanı değil.</p>
        <progress value={position} max={lessons.length} aria-label={"Kurs içindeki konum: ders "+position+"/"+lessons.length}/>
      </header>
      <nav aria-label="Kursta dersler"><MapList lessons={lessons} currentIndex={currentIndex} lessonBase={lessonBase}/></nav>
    </div>
    <details className="course-map-mobile">
      <summary><span><strong>Kurs dersleri</strong><small>{courseTitle} · {position}/{lessons.length}</small></span>
        <span className="course-map-toggle-label">Dersleri gör</span></summary>
      <nav aria-label="Mobil kurs dersleri">
        <MapList lessons={lessons} currentIndex={currentIndex} lessonBase={lessonBase}/>
      </nav>
    </details>
  </aside>;
}
