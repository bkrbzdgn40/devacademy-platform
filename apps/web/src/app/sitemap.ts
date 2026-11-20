import type {MetadataRoute} from "next";
import {absoluteUrl} from "@/lib/site-url.mjs";
import {courses,lessonsForCourse} from "@/lib/courses";
import practice from "@/data/practice.json";

// Sitemap entries need absolute URLs. Without APP_ORIGIN we list nothing rather
// than guess a host (same rule as the canonical tags in site-url.mjs).
export default function sitemap():MetadataRoute.Sitemap{
  const paths=["/","/kurslar","/pratik","/radar","/laboratuvar","/kutuphane/diller","/kutuphane/kavramlar",
    "/kutuphane/teknolojiler",
    ...courses.flatMap(course=>["/kurslar/"+course.slug,
      ...lessonsForCourse(course).map(lesson=>"/kurslar/"+course.slug+"/"+lesson.slug)]),
    ...practice.map(task=>"/pratik/"+task.slug)];
  return paths.flatMap(path=>{const url=absoluteUrl(path);return url?[{url}]:[];});
}
