import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryInfo, entriesForKind, kindByRoute } from "@/lib/catalog";
import { courses } from "@/lib/courses";
import {courseOfferPhrase} from "@/lib/course-summary.mjs";
import {canonicalFor} from "@/lib/site-url.mjs";
import {PredictLine} from "@/components/predict-line";

// One small "what does this print?" line per catalog entry, written for the card.
const snippets:Record<string,{code:string;answer:string;language:string}>={
  "language.python":{code:'print(3 * "ab")',answer:"ababab",language:"python"},
  "language.javascript":{code:"console.log(0.1 + 0.2 === 0.3)",answer:"false",language:"javascript"},
  "language.typescript":{code:"console.log(typeof (5 as unknown))",answer:"number",language:"javascript"},
  "language.java":{code:"System.out.println(7 / 2);",answer:"3",language:"java"},
  "language.sql":{code:"SELECT NULL = NULL;",answer:"NULL",language:"sql"},
  "language.cow":{code:"MoO MoO MoO OOM",answer:"3",language:"plain"},
  "concept.polymorphism":{code:'console.log([1, "1"].map(x => x + 1))',answer:'[2, "11"]',language:"javascript"},
  "technology.react":{code:"console.log(typeof <p />)",answer:"object",language:"javascript"},
  "technology.docker":{code:"docker run --rm alpine echo merhaba",answer:"merhaba",language:"plain"},
};

type Props = { params: Promise<{ category: string }> };
export function generateStaticParams() { return Object.keys(kindByRoute).map((category) => ({ category })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const kind = kindByRoute[category];
  return kind ? { title: categoryInfo[kind].title, ...canonicalFor("/kutuphane/" + category) } : { title: "Sayfa bulunamadı" };
}
export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const kind = kindByRoute[category];
  if (!kind) notFound();
  const info = categoryInfo[kind];
  const entries = entriesForKind(kind);
  return <section className="shell listing-page">
    <Link className="back-link" href="/">← Ana sayfa</Link>
    <div className="listing-header"><p className="overline">Öğrenme kütüphanesi</p><h1>{info.title}</h1><p>{info.description}</p></div>
    <div className="availability-note" role="status">Bu katalog önizlemesidir. {courseOfferPhrase()} kursları mevcut; diğer başlıklar hazırlanıyor. Halka açık kod çalıştırma henüz etkin değildir.</div>
    <ul className="catalog-grid">{entries.map((entry) => <li key={entry.id} className="catalog-card"><div className="catalog-top"><span className="level-chip">{entry.level}</span><span className="locked-chip">{courses.some(course=>course.languageId===entry.id) ? "Kurs mevcut" : "Hazırlanıyor"}</span></div><h2>{entry.name}</h2><p>{entry.summary}</p>{snippets[entry.id]&&<PredictLine {...snippets[entry.id]}/>}<div className="tags">{entry.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>{courses.filter(course=>course.languageId===entry.id).map(course=><Link key={course.id} href={"/kurslar/"+course.slug} className="catalog-lesson-link">{course.title} kursunu aç →</Link>)}</li>)}</ul>
  </section>;
}
