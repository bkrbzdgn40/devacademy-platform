import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { courses,findCourse,lessonsForCourse } from "@/lib/courses";
import { CourseLesson } from "@/components/course-lesson";
type Props={params:Promise<{courseSlug:string;lessonSlug:string}>};
export function generateStaticParams(){return courses.flatMap(course=>
  lessonsForCourse(course).map(lesson=>({courseSlug:course.slug,lessonSlug:lesson.slug}))); }
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {courseSlug,lessonSlug}=await params;
  const course=findCourse(courseSlug);
  const lesson=course && lessonsForCourse(course).find(l=>l.slug===lessonSlug);
  return {title:lesson?.title??"Ders bulunamadı"};
}
export default async function CourseLessonPage({params}:Props){
  const {courseSlug,lessonSlug}=await params;
  const course=findCourse(courseSlug);
  if(!course)notFound();
  const lesson=lessonsForCourse(course).find(x=>x.slug===lessonSlug);
  if(!lesson)notFound();
  return <CourseLesson course={course} lesson={lesson}/>;
}
