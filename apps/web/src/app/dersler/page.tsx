import { courseById } from "@/lib/courses";
import { CourseOverview } from "@/components/course-overview";
export default function LegacyJsIndex(){
  const course=courseById("course.javascript.fundamentals");
  if(!course)throw new Error("Missing original JavaScript course");
  return <CourseOverview course={course} legacy/>;
}
