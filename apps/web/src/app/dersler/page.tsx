import type { Metadata } from "next";
import {canonicalFor} from "@/lib/site-url.mjs";
import { courseById } from "@/lib/courses";
import { CourseOverview } from "@/components/course-overview";
export const metadata:Metadata={title:"JavaScript Temelleri",...canonicalFor("/kurslar/javascript-temelleri")};
export default function LegacyJsIndex(){
  const course=courseById("course.javascript.fundamentals");
  if(!course)throw new Error("Missing original JavaScript course");
  return <CourseOverview course={course} legacy/>;
}
