import type {MetadataRoute} from "next";
import {absoluteUrl} from "@/lib/site-url.mjs";

// API routes carry no indexable content; everything else is public course material.
export default function robots():MetadataRoute.Robots{
  const sitemap=absoluteUrl("/sitemap.xml");
  return {rules:{userAgent:"*",allow:"/",disallow:"/api/"},...(sitemap?{sitemap}:{})};
}
