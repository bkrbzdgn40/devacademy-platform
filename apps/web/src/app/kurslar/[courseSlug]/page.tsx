import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { courses, findCourse } from "@/lib/courses";
import { CourseOverview } from "@/components/course-overview";
type Props={params:Promise<{courseSlug:string}>};
export function generateStaticParams(){return courses.map(course=>({courseSlug:course.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {courseSlug}=await params;
  return {title:findCourse(courseSlug)?.title??"Kurs bulunamadı"};
}
export default async function CoursePage({params}:Props){
  const {courseSlug}=await params;
  const course=findCourse(courseSlug);
  if(!course)notFound();
  return <CourseOverview course={course}/>;
}
