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
const steps=[
  {title:"Önce tahmin et",description:"Programın sonucunu görmeden düşün ve kendi cevabını yaz."},
  {title:"Satır satır kanıtla",description:"Değişkenlerin ve çıktının nerede değiştiğini adım adım takip et."},
  {title:"Farklı koşulda uygula",description:"Karşı örnekleri incele, bağımsız kavram sorularında bilgini sınamaya çalış."},
];
const sources=[
  {key:"hn",title:"Hacker News",label:"Sektör tartışmaları",
    text:"Geliştiricilerin tartıştığı yeni araçlar, projeler ve mühendislik kararları.",
    href:"https://news.ycombinator.com/",note:"Topluluk akışı"},
  {key:"dev",title:"DEV Community",label:"Uygulamalı yazılar",
    text:"Teknoloji etiketleriyle yayımlanan yazılım örnekleri ve geliştirici deneyimleri.",
    href:"https://dev.to/",note:"Topluluk içeriği"},
  {key:"releases",title:"GitHub Releases",label:"Sürüm duyuruları",
    text:"Kütüphane ve araçların resmî depo sürümleri üzerinden yapılan duyurular.",
    href:"https://github.com/explore",note:"Depo keşfi"}
];
const sections: CatalogKind[] = ["language","concept","technology"];

export const metadata:Metadata={...canonicalFor("/")};

export default function Home() {
  return <>
    <section className="hero shell">
      <div className="hero-text">
        <div className="eyebrow"><span className="status-dot" /> Tasarlanmış öğrenme deneyimi</div>
        <h1>Kodu öğrenmek değil,<br /><span>anlamak için buradasın.</span></h1>
        <p>Önce tahmin et, kodun davranışını incele, yanlış varsayımlarını keşfet ve öğrendiğini yeni bir problemde kullan. {courseOfferPhrase()} ile kendi öğrenme yoluna başla.</p>
        <div className="hero-actions"><ActionLink href="/kurslar">Öğrenme yollarını keşfet <span aria-hidden="true">↗</span></ActionLink><ActionLink href="/kutuphane/diller" variant="secondary">Kod ve kavramları keşfet <span aria-hidden="true">→</span></ActionLink></div>
        <p className="small-note">{courses.length} kurs · {lessons.length} ders · {questions.length} bilgi sorusu. Kod çalıştırma yalnızca özel yerel laboratuvarda mümkündür.</p>
      </div>
      <HeroPredict/>
    </section>
    <section className="shell home-journey-area" aria-labelledby="journey-heading">
      <div className="home-journey-intro"><p className="overline">Sana ait öğrenme rotası</p>
        <h2 id="journey-heading">Kaldığın yeri arama. Buradan devam et.</h2>
        <p>Hesabındaki gerçek ders kayıtlarıyla çalışır. Oturumun yoksa kurs keşfi açık kalır.</p></div>
      <ContinueLearning/>
    </section>
    <section className="shell section home-path-section" aria-labelledby="paths-title">
      <div className="home-section-top">
        <SectionHeading id="paths-title"
          title="Öğrenme yolları"
          description="Her kurs birbiri üzerine kurulan derslerden oluşur. İlgi alanına göre bir yol seç."/>
        <Link href="/kurslar" className="home-text-link">Kurs ve derslerde ara ↗</Link>
      </div>
      <div className="path-grid home-path-grid">{paths.map(path=>
        <LearningPathCard path={path} compact key={path.id}/>)}</div>
    </section>
    <section className="shell section home-method-section" id="nasil-ogrenirsin" aria-labelledby="method-heading">
      <SectionHeading eyebrow="DevAcademy öğrenme döngüsü" id="method-heading"
        title="Cevabı değil, düşünme biçimini geliştir."
        description="Kavramı yalnızca dinlemek yerine tahmin et, kanıtla ve farklı bir durumda kullan."/>
      <ol className="home-method-flow">{steps.map(step=><li className="home-method-step" key={step.title}>
        <h3>{step.title}</h3><p>{step.description}</p>
      </li>)}</ol>
      <p className="home-method-note">Rehberli deneyler bağımsız yeterlilik kanıtından ayrıdır. Bir doğru cevap her şeyi öğrenmiş olduğunu göstermez.</p>
    </section>
    <section className="shell section" aria-labelledby="explore-title">
      <div className="section-heading"><SectionHeading eyebrow="Yolculuğun başlangıcı" id="explore-title" title="Neyi öğrenmek istiyorsun?"/><p>Teknolojileri ezberlemek yerine aralarındaki bağlantıları gör.</p></div>
      <ul className="home-explore-list">{sections.map(kind => {
        const info = categoryInfo[kind];
        return <li key={kind}><Link href={info.href} className="feature-card ui-card home-explore-row">
          <h3>{info.title}</h3><p>{info.description}</p><span className="home-explore-count">{catalog.filter((item) => item.kind === kind).length} başlık</span><span className="home-explore-arrow" aria-hidden="true">→</span>
        </Link></li>;
      })}</ul>
    </section>
    <section className="shell section radar-section radar-redesign" aria-labelledby="radar-title">
      <div className="radar-heading">
        <SectionHeading eyebrow="Sektör radarı" id="radar-title"
          title="Teknoloji dünyasını öğrendiğin kavramlarla bağla."
          description="Hacker News, DEV ve resmî GitHub sürümlerinden güncel başlıkları derslerinle ilişkilendir."/>
        <StatusPill tone="olive">Sektör Radarı aktif</StatusPill>
        <p className="radar-integrity">Başlıklar ve kaynak kontrol tarihleri ayrı Radar sayfasında gösterilir. Bu ana sayfa yalnızca kaynakları tanıtır.</p><Link href="/radar" className="ui-button ui-button-primary">Haber akışını aç ↗</Link>
      </div>
      <div className="radar-source-grid">{sources.map(source=><article className="radar-source ui-card" key={source.key}>
        <span className="radar-source-type">{source.label}</span>
        <h3>{source.title}</h3><p>{source.text}</p>
        <span className="radar-source-note">{source.note}</span>
        <a href={source.href} target="_blank" rel="noopener noreferrer">Kaynağı ziyaret et <span aria-hidden="true">↗</span></a>
      </article>)}</div>
      <p className="radar-disclaimer">Kaynakların gerçek başlıkları, yayın tarihleri, kontrol zamanı, konu eşleştirmesi ve erişim durumu Sektör Radarı sayfasındadır.</p>
    </section>
  </>;
}
