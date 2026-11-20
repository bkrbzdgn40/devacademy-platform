import {canonicalFor} from "@/lib/site-url.mjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lessons,findLesson } from "@/lib/lessons";
import { courseById } from "@/lib/courses";
import { CourseLesson } from "@/components/course-lesson";
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return lessons.map(lesson=>({slug:lesson.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params;const lesson=findLesson(slug),course=courseById("course.javascript.fundamentals");
  // Legacy address: point search engines at the course URL that shows the same lesson.
  return lesson&&course?{title:lesson.title,...canonicalFor("/kurslar/"+course.slug+"/"+lesson.slug)}:{title:"Ders bulunamadı"};
}
export default async function LegacyLesson({params}:Props){
  const {slug}=await params;
  const lesson=findLesson(slug),course=courseById("course.javascript.fundamentals");
  if(!lesson||!course)notFound();
  return <CourseLesson course={course} lesson={lesson} legacy/>;
}
