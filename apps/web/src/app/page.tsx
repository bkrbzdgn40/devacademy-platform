import Link from "next/link";
import {ActionLink,SectionHeading,StatusPill} from "@/components/ui-primitives";
import { catalog, categoryInfo, type CatalogKind } from "@/lib/catalog";
import courses from "@/data/courses.json";
import lessons from "@/data/lessons.json";
import questions from "@/data/questions.json";

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
        <h1>Kodu sadece okuma.<br /><span>Gerçekten anla.</span></h1>
        <p>JavaScript, Java ve Python öğren. Önce anlamaya çalış, sonra yeni kod örneklerinin sonuçlarını kendin üret. Bir gün sonra gerçekten hatırlayıp hatırlamadığını sınayabilirsin.</p>
        <div className="hero-actions"><ActionLink href="/kurslar">İlk derslere başla <span aria-hidden="true">↗</span></ActionLink><ActionLink href="/kutuphane/diller" variant="secondary">Kütüphaneyi keşfet <span aria-hidden="true">→</span></ActionLink></div>
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
    <section className="shell section" aria-labelledby="explore-title">
      <div className="section-heading"><SectionHeading eyebrow="Yolculuğun başlangıcı" id="explore-title" title="Neyi öğrenmek istiyorsun?"/><p>Teknolojileri ezberlemek yerine aralarındaki bağlantıları gör.</p></div>
      <div className="section-grid">{sections.map(({ kind, number, accent }) => {
        const info = categoryInfo[kind];
        return <Link href={info.href} className={`feature-card ui-card card-${accent}`} key={kind}>
          <span className="card-number">{number} / 03</span><div><h3>{info.title}</h3><p>{info.description}</p></div><span className="card-bottom"><span>{catalog.filter((item) => item.kind === kind).length} örnek başlık</span><span aria-hidden="true">↗</span></span>
        </Link>;
      })}</div>
    </section>
    <section className="shell section radar-section" aria-labelledby="radar-title">
      <div><SectionHeading eyebrow="Sektör radarı" id="radar-title" title="Dünyada neler değişiyor?"/><p>Kaynaklı teknoloji haberleri, sürüm notları ve mühendislik pratikleri yakında burada olacak. Güncelliği doğrulanmayan haberleri yayımlamıyoruz.</p><StatusPill tone="olive">Kaynağı doğrulanmış içerik hedefi</StatusPill></div>
      <div className="radar-empty ui-card"><span className="radar-symbol" aria-hidden="true">◎</span><strong>Kaynaklar hazırlanıyor</strong><span>Henüz doğrulanmış haber akışı bulunmuyor.</span></div>
    </section>
  </>;
}
