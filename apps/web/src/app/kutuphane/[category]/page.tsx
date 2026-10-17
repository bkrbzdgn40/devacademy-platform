import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryInfo, entriesForKind, kindByRoute } from "@/lib/catalog";

type Props = { params: Promise<{ category: string }> };
export function generateStaticParams() { return Object.keys(kindByRoute).map((category) => ({ category })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const kind = kindByRoute[category];
  return { title: kind ? categoryInfo[kind].title : "Sayfa bulunamadı" };
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
    <div className="availability-note" role="status">Bu katalog önizlemesidir. JavaScript temel derslerine erişebilirsin; tarayıcıda kod çalıştırma henüz sunulmuyor.</div>
    <ul className="catalog-grid">{entries.map((entry) => <li key={entry.id} className="catalog-card"><div className="catalog-top"><span className="level-chip">{entry.level}</span><span className="locked-chip">{entry.id === "language.javascript" ? "Dersler mevcut" : "Hazırlanıyor"}</span></div><h2>{entry.name}</h2><p>{entry.summary}</p><div className="tags">{entry.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>{entry.id === "language.javascript" && <Link href="/dersler" className="catalog-lesson-link">JavaScript derslerini aç →</Link>}</li>)}</ul>
  </section>;
}
