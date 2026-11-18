import type {Course} from "@/lib/courses";
import type {Lesson} from "@/lib/lessons";
import {absoluteUrl} from "@/lib/site-url.mjs";

// schema.org Course data built only from course/lesson JSON. "<" is escaped so
// the payload can never close the script element.
export function CourseJsonLd({course,lesson}:{course:Course;lesson?:Lesson}){
  const coursePath="/kurslar/"+course.slug;
  const data={
    "@context":"https://schema.org",
    "@type":"Course",
    name:course.title,
    description:course.summary,
    inLanguage:"tr",
    educationalLevel:course.level,
    url:absoluteUrl(coursePath),
    provider:{"@type":"Organization",name:"DevAcademy",url:absoluteUrl("/")},
    ...(lesson?{hasPart:{
      "@type":"LearningResource",
      name:lesson.title,
      description:lesson.summary,
      inLanguage:"tr",
      timeRequired:"PT"+lesson.durationMinutes+"M",
      url:absoluteUrl(coursePath+"/"+lesson.slug),
    }}:{}),
  };
  return <script type="application/ld+json"
    dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,"\u003c")}}/>;
}
