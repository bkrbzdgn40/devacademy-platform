// Visible course lists and counts are derived from course data, so new
// courses (SQL, algorithms, ...) never leave stale hand-written copy behind.
import courses from "../data/courses.json" with {type:"json"};

const SUFFIX=" Temelleri";
const list=new Intl.ListFormat("tr",{style:"long",type:"conjunction"});

/** Language names of "X Temelleri" courses, in catalog order. */
export const languageCourseNames=Object.freeze(courses
  .filter(course=>course.title.endsWith(SUFFIX))
  .map(course=>course.title.slice(0,-SUFFIX.length)));
/** Titles of the remaining (topic) courses, such as Veri Yapıları ve Algoritmalar. */
export const topicCourseTitles=Object.freeze(courses
  .filter(course=>!course.title.endsWith(SUFFIX))
  .map(course=>course.title));
/** Distinct languages taught across all courses (SQL included). */
export const languageCount=new Set(courses.map(course=>course.languageId)).size;
export const courseCount=courses.length;

/** "JavaScript, Java, Python ve SQL temelleri ya da Veri Yapıları ve Algoritmalar" */
export function courseOfferPhrase(){
  const base=languageCourseNames.length?list.format(languageCourseNames)+" temelleri":"";
  const topics=topicCourseTitles.length?topicCourseTitles.join(", "):"";
  return [base,topics].filter(Boolean).join(" ya da ");
}
