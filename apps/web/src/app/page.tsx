import Link from "next/link";
import {ActionLink,SectionHeading,StatusPill} from "@/components/ui-primitives";
import { catalog, categoryInfo, type CatalogKind } from "@/lib/catalog";
import {ContinueLearning} from "@/components/continue-learning";
import {LearningPathCard,type LearningPath} from "@/components/learning-path-card";
import {learningPaths} from "@/lib/learning-paths.mjs";
import courses from "@/data/courses.json";
import lessons from "@/data/lessons.json";
import questions from "@/data/questions.json";

const paths=learningPaths as LearningPath[];
const steps=[
  {number:"01",title:"Önce tahmin et",description:"Programın sonucunu görmeden düşün ve kendi cevabını yaz."},
  {number:"02",title:"Satır satır kanıtla",description:"Değişkenlerin ve çıktının nerede değiştiğini adım adım takip et."},
  {number:"03",title:"Farklı koşulda uygula",description:"Karşı örnekleri incele, bağımsız kavram sorularında bilgini sınamaya çalış."},
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
const sections: { kind: CatalogKind; number: string; accent: string }[] = [
  { kind: "language", number: "01", accent: "violet" },
  { kind: "concept", number: "02", accent: "green" },
  { kind: "technology", number: "03", accent: "blue" },
];

export default function Home() {
  return <>
    <section className="hero shell">
      <div className="hero-text">
        <div className="eyebrow"><span className="status-dot" /> Tasarlanmış öğrenme deneyimi</div>
        <h1>Kodu öğrenmek değil,<br /><span>anlamak için buradasın.</span></h1>
        <p>Önce tahmin et, kodun davranışını incele, yanlış varsayımlarını keşfet ve öğrendiğini yeni bir problemde kullan. JavaScript, Java ve Python ile kendi öğrenme yoluna başla.</p>
        <div className="hero-actions"><ActionLink href="/kurslar">Öğrenme yollarını keşfet <span aria-hidden="true">↗</span></ActionLink><ActionLink href="/kutuphane/diller" variant="secondary">Kod ve kavramları keşfet <span aria-hidden="true">→</span></ActionLink></div>
        <p className="small-note">{courses.length} kurs · {lessons.length} ders · {questions.length} bilgi sorusu. Kod çalıştırma yalnızca özel yerel laboratuvarda mümkündür.</p>
      </div>
      <div className="hero-visual" aria-label="DevAcademy örnek ders kartı">
        <div className="code-heading"><span className="window-dots" aria-hidden="true">● ● ●</span><span>Polymorphism.java</span><span>Java</span></div>
        <pre className="code-sample"><code>{`abstract class Animal {
  abstract void speak();
}

class Dog extends Animal {
  @Override
  void speak() {
    System.out.println("Woof!");
  }
}

Animal pet = new Dog();
pet.speak(); // Woof!`}</code></pre>
        <div className="code-footnote"><span>Örnek içerik</span><span>Çalıştırma aktif değil</span></div>
      </div>
    </section>
    <section className="shell home-journey-area" aria-labelledby="journey-heading">
      <div className="home-journey-intro"><p className="overline">Sana ait öğrenme rotası</p>
        <h2 id="journey-heading">Kaldığın yeri arama. Buradan devam et.</h2>
        <p>Hesabındaki gerçek ders kayıtlarıyla çalışır. Oturumun yoksa kurs keşfi açık kalır.</p></div>
      <ContinueLearning/>
    </section>
    <section className="shell section home-path-section" aria-labelledby="paths-title">
      <div className="home-section-top">
        <SectionHeading eyebrow="Bir yol seç, bir düşünme biçimi kazan" id="paths-title"
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
      <div className="home-method-grid">{steps.map(step=><article className="home-method-card" key={step.number}>
        <span className="home-method-number">{step.number}</span>
        <h3>{step.title}</h3><p>{step.description}</p>
      </article>)}</div>
      <p className="home-method-note">Rehberli deneyler bağımsız yeterlilik kanıtından ayrıdır. Bir doğru cevap her şeyi öğrenmiş olduğunu göstermez.</p>
    </section>
    <section className="shell section" aria-labelledby="explore-title">
      <div className="section-heading"><SectionHeading eyebrow="Yolculuğun başlangıcı" id="explore-title" title="Neyi öğrenmek istiyorsun?"/><p>Teknolojileri ezberlemek yerine aralarındaki bağlantıları gör.</p></div>
      <div className="section-grid">{sections.map(({ kind, number, accent }) => {
        const info = categoryInfo[kind];
        return <Link href={info.href} className={`feature-card ui-card card-${accent}`} key={kind}>
          <span className="card-number">{number} / 03</span><div><h3>{info.title}</h3><p>{info.description}</p></div><span className="card-bottom"><span>{catalog.filter((item) => item.kind === kind).length} örnek başlık</span><span aria-hidden="true">↗</span></span>
        </Link>;
      })}</div>
    </section>
    <section className="shell section radar-section radar-redesign" aria-labelledby="radar-title">
      <div className="radar-heading">
        <SectionHeading eyebrow="Sektör radarı · kaynak masası" id="radar-title"
          title="Teknoloji dünyasını öğrendiğin kavramlarla bağla."
          description="Sektör tartışmalarını, makaleleri ve sürüm duyurularını tek yerde keşfetmek için hazırlanan alan."/>
        <StatusPill tone="terracotta">Canlı haber akışı henüz bağlı değil</StatusPill>
        <p className="radar-integrity">Şimdilik yalnızca kaynakları tanıtıyoruz. Güncelliği ve yayın tarihi doğrulanmamış başlıkları haber gibi göstermiyoruz.</p>
      </div>
      <div className="radar-source-grid">{sources.map((source,index)=><article className="radar-source ui-card" key={source.key}>
        <div className="radar-source-top"><span className="radar-source-index">0{index+1}</span>
          <span className="radar-source-type">{source.label}</span></div>
        <h3>{source.title}</h3><p>{source.text}</p>
        <span className="radar-source-note">{source.note}</span>
        <a href={source.href} target="_blank" rel="noopener noreferrer">Kaynağı ziyaret et <span aria-hidden="true">↗</span></a>
      </article>)}</div>
      <p className="radar-disclaimer">Veri entegrasyonu tamamlandığında her haberde kaynak, tarih ve ilgili ders bağlantısı gösterilecek. Topluluk yazıları resmî duyuru gibi etiketlenmeyecek.</p>
    </section>
  </>;
}
