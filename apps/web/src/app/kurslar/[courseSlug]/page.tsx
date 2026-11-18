import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { courses, findCourse } from "@/lib/courses";
import { CourseOverview } from "@/components/course-overview";
import { CourseJsonLd } from "@/components/course-json-ld";
import { canonicalFor } from "@/lib/site-url.mjs";
type Props={params:Promise<{courseSlug:string}>};
export function generateStaticParams(){return courses.map(course=>({courseSlug:course.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {courseSlug}=await params;
  const course=findCourse(courseSlug);
  if(!course)return {title:"Kurs bulunamadı"};
  return {title:course.title,description:course.summary,...canonicalFor("/kurslar/"+course.slug)};
}
export default async function CoursePage({params}:Props){
  const {courseSlug}=await params;
  const course=findCourse(courseSlug);
  if(!course)notFound();
  return <><CourseJsonLd course={course}/><CourseOverview course={course}/></>;
}
