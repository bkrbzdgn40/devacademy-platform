import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lessons,findLesson } from "@/lib/lessons";
import { courseById } from "@/lib/courses";
import { CourseLesson } from "@/components/course-lesson";
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return lessons.map(lesson=>({slug:lesson.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params;return {title:findLesson(slug)?.title??"Ders bulunamadı"};
}
export default async function LegacyLesson({params}:Props){
  const {slug}=await params;
  const lesson=findLesson(slug),course=courseById("course.javascript.fundamentals");
  if(!lesson||!course)notFound();
  return <CourseLesson course={course} lesson={lesson} legacy/>;
}
