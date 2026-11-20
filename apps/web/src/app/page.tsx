import Link from "next/link";
import {ActionLink,SectionHeading,StatusPill} from "@/components/ui-primitives";
import { catalog, categoryInfo, type CatalogKind } from "@/lib/catalog";
import {HeroPredict} from "@/components/hero-predict";
import {ContinueLearning} from "@/components/continue-learning";
import {LearningPathCard,type LearningPath} from "@/components/learning-path-card";
import {learningPaths} from "@/lib/learning-paths.mjs";
import {courseOfferPhrase} from "@/lib/course-summary.mjs";
import {canonicalFor} from "@/lib/site-url.mjs";
import type {Metadata} from "next";
import courses from "@/data/courses.json";
import lessons from "@/data/lessons.json";
import questions from "@/data/questions.json";

const paths=learningPaths as LearningPath[];
const sources=[
  {key:"hn",title:"Hacker News",text:"Geliştiricilerin tartıştığı yeni araçlar, projeler ve mühendislik kararları.",
    href:"https://news.ycombinator.com/"},
  {key:"dev",title:"DEV Community",text:"Teknoloji etiketleriyle yayımlanan yazılım örnekleri ve geliştirici deneyimleri.",
    href:"https://dev.to/"},
  {key:"releases",title:"GitHub Releases",text:"Kütüphane ve araçların resmî depo sürümleri üzerinden yapılan duyurular.",
    href:"https://github.com/explore"}
];
const sections: CatalogKind[] = ["language","concept","technology"];

export const metadata:Metadata={...canonicalFor("/")};

export default function Home() {
  return <>
    <section className="hero shell">
      <div className="hero-text">
        <h1><span className="hero-h1-line">Bu kod ne yazdırır?</span> <span className="hero-h1-line">Önce <em>sen</em> söyle.</span></h1>
        <p>Her derste önce kodun sonucunu tahmin edersin, sonra yanıldığın yeri satır satır görürsün. {courseOfferPhrase()} kurslarından biriyle başla.</p>
      </div>
      <HeroPredict/>
      <div className="hero-meta">
        <div className="hero-actions"><ActionLink href="/kurslar">Kursları gör <span aria-hidden="true">→</span></ActionLink><ActionLink href="/kutuphane/kavramlar" variant="secondary">Kavram kütüphanesi</ActionLink></div>
        <p className="small-note">{courses.length} kurs · {lessons.length} ders · {questions.length} bilgi sorusu. Kod çalıştırma yalnızca özel yerel laboratuvarda mümkündür.</p>
        <ol className="hero-loop" aria-label="Bir dersin akışı">
          <li><span aria-hidden="true">01</span><strong>Tahmin et</strong><small>Kodu okuyup çıktıyı seç.</small></li>
          <li><span aria-hidden="true">02</span><strong>Kilitle</strong><small>Cevabını değiştirmeden gönder.</small></li>
          <li><span aria-hidden="true">03</span><strong>Satır satır izle</strong><small>Yanıldığın adımı gör.</small></li>
        </ol>
      </div>
    </section>
    <section className="shell home-journey-area" aria-labelledby="journey-heading">
      <div className="home-journey-intro">
        <h2 id="journey-heading">Kaldığın yeri arama. Buradan devam et.</h2>
        <p>Hesabındaki ders kayıtlarını kullanır. Oturumun yoksa kurs keşfi açık kalır.</p></div>
      <ContinueLearning/>
    </section>
    <section className="shell section home-path-section" aria-labelledby="paths-title">
      <div className="home-section-top">
        <SectionHeading id="paths-title"
          title="Öğrenme yolları"
          description="Her kurs birbiri üzerine kurulan derslerden oluşur. İlgi alanına göre bir yol seç."/>
        <Link href="/kurslar" className="home-text-link">Kurs ve derslerde ara <span aria-hidden="true">→</span></Link>
      </div>
      <div className="path-grid home-path-grid">{paths.map(path=>
        <LearningPathCard path={path} compact key={path.id}/>)}</div>
    </section>
    <section className="shell section" aria-labelledby="explore-title">
      <SectionHeading id="explore-title" title="Neyi öğrenmek istiyorsun?" description="Diller, kavramlar ve teknolojiler arasındaki bağlantıları gör."/>
      <ul className="home-explore-list">{sections.map(kind => {
        const info = categoryInfo[kind];
        return <li key={kind}><Link href={info.href} className="feature-card ui-card home-explore-row">
          <h3>{info.title}</h3><p>{info.description}</p><span className="home-explore-count">{catalog.filter((item) => item.kind === kind).length} başlık</span><span className="home-explore-arrow" aria-hidden="true">→</span>
        </Link></li>;
      })}</ul>
    </section>
    <section className="shell section radar-section radar-redesign" aria-labelledby="radar-title">
      <div className="radar-heading">
        <SectionHeading id="radar-title"
          title="Gündemdeki başlıklar ve ilgili dersler"
          description="Radar, Hacker News, DEV ve GitHub sürüm notlarındaki başlıkları senin kurslarındaki konularla eşleştirir."/>
        <StatusPill tone="olive">Sektör Radarı aktif</StatusPill>
        <Link href="/radar" className="ui-button ui-button-primary">Haber akışını aç</Link>
      </div>
      <ul className="radar-source-list ui-card">{sources.map(source=><li className="radar-source radar-source-row" key={source.key}>
        <h3>{source.title}</h3><p>{source.text}</p>
        <a href={source.href} target="_blank" rel="noopener noreferrer" aria-label={"Kaynağa git: "+source.title+" (yeni sekmede açılır)"}>Kaynağa git <span aria-hidden="true">↗</span></a>
      </li>)}</ul>
    </section>
  </>;
}
