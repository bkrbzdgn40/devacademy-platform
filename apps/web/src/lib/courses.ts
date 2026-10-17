
import raw from "@/data/courses.json";
import { allLessons, lessonById, type Lesson } from "@/lib/lessons";

export type Course = (typeof raw)[number];
export const courses: readonly Course[] = raw;
export const findCourse = (slug:string): Course | undefined => courses.find(course=>course.slug===slug);
export const courseById = (id:string): Course | undefined => courses.find(course=>course.id===id);
export const courseForLesson = (id:string): Course | undefined => courses.find(course=>course.lessonIds.includes(id));
export const lessonsForCourse = (course:Course): Lesson[] => course.lessonIds.map(id=>{
  const lesson=lessonById(id);
  if(!lesson)throw new Error("Unknown lesson referenced in course "+course.id+": "+id);
  return lesson;
});
export const lessonHref = (lessonId:string): string => {
  const course=courseForLesson(lessonId);
  const lesson=allLessons.find(x=>x.id===lessonId);
  if(!course || !lesson)throw new Error("Unknown lesson: "+lessonId);
  return "/kurslar/"+course.slug+"/"+lesson.slug;
};
