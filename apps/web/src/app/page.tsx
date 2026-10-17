import Link from "next/link";
import { catalog, categoryInfo, type CatalogKind } from "@/lib/catalog";

const sections: { kind: CatalogKind; number: string; accent: string }[] = [
  { kind: "language", number: "01", accent: "violet" },
  { kind: "concept", number: "02", accent: "green" },
  { kind: "technology", number: "03", accent: "blue" },
];

export default function Home() {
  return <>
    <section className="hero shell">
      <div className="hero-text">
        <div className="eyebrow"><span className="status-dot" /> Yazılım öğrenmenin yeni yolu</div>
        <h1>Kodu sadece okuma.<br /><span>Gerçekten anla.</span></h1>
        <p>JavaScript ve Java kurslarında kısa derslerle öğren ve anında bilgi testleriyle pekiştir. Kod düzenleme, kişisel ilerleme takibi ve kod yazma görevleri geliştirme önizlemesinde mevcut.</p>
        <div className="hero-actions"><Link href="/kurslar" className="primary-button">İlk derslere başla <span aria-hidden="true">↗</span></Link><Link href="/kutuphane/diller" className="subtle-button">Kütüphaneyi keşfet <span aria-hidden="true">→</span></Link></div>
        <p className="small-note">JavaScript ve Java için 10 ders ve 20 bilgi sorusu mevcut. Kod çalıştırma halka açık değildir; hesap ilerlemesi yalnızca yerel veritabanı yapılandırıldığında saklanır.</p>
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
      <div className="section-heading"><div><p className="overline">Yolculuğun başlangıcı</p><h2 id="explore-title">Neyi öğrenmek istiyorsun?</h2></div><p>Teknolojileri ezberlemek yerine aralarındaki bağlantıları gör.</p></div>
      <div className="section-grid">{sections.map(({ kind, number, accent }) => {
        const info = categoryInfo[kind];
        return <Link href={info.href} className={`feature-card card-${accent}`} key={kind}>
          <span className="card-number">{number} / 03</span><div><h3>{info.title}</h3><p>{info.description}</p></div><span className="card-bottom"><span>{catalog.filter((item) => item.kind === kind).length} örnek başlık</span><span aria-hidden="true">↗</span></span>
        </Link>;
      })}</div>
    </section>
    <section className="shell section radar-section" aria-labelledby="radar-title">
      <div><p className="overline">Sektör radarı</p><h2 id="radar-title">Dünyada neler değişiyor?</h2><p>Kaynaklı teknoloji haberleri, sürüm notları ve mühendislik pratikleri yakında burada olacak. Güncelliği doğrulanmayan haberleri yayımlamıyoruz.</p></div>
      <div className="radar-empty"><span className="radar-symbol" aria-hidden="true">◎</span><strong>Kaynaklar hazırlanıyor</strong><span>Henüz doğrulanmış haber akışı bulunmuyor.</span></div>
    </section>
  </>;
}
