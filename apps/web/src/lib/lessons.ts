import lessonsJson from "@/data/lessons.json";
import questionsJson from "@/data/questions.json";

export type Lesson = (typeof lessonsJson)[number];
export type PublicQuestion = (typeof questionsJson)[number];
// These aliases retain older JavaScript-only URLs without coupling new course pages to a language.
export const allLessons: readonly Lesson[] = lessonsJson;
export const lessons: readonly Lesson[] = lessonsJson.filter(lesson=>lesson.id.startsWith("lesson.javascript."));
export const questions: readonly PublicQuestion[] = questionsJson;
export const findLesson = (slug:string):Lesson|undefined=>lessons.find(lesson=>lesson.slug===slug);
export const lessonById = (id:string):Lesson|undefined=>allLessons.find(lesson=>lesson.id===id);
export const questionsForLesson = (lesson:Lesson):PublicQuestion[] => lesson.questionIds.map(id=>{
  const q=questions.find(item=>item.id===id);
  if(!q || q.lessonId!==lesson.id)throw new Error("Question mismatch: "+id);
  return q;
});
