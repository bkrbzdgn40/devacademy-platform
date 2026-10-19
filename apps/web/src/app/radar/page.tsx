import type {Metadata} from "next";
import Link from "next/link";
import {getRadarFeed,radarSources,radarTopics} from "@/lib/radar-feed.mjs";

export const metadata:Metadata={
  title:"Sektör Radarı | Güncel yazılım kaynakları",
  description:"Hacker News, DEV Community ve resmî GitHub sürümlerinden kaynaklı yazılım gelişmeleri ve ilgili DevAcademy dersleri."
};
export const dynamic="force-dynamic";

const formatDate=(value:string)=>new Intl.DateTimeFormat("tr-TR",{
  timeZone:"Europe/Istanbul",day:"numeric",month:"short",year:"numeric",
  hour:"2-digit",minute:"2-digit"
}).format(new Date(value));
const statusLabel:Record<string,string>={
  fresh:"Güncellendi",partial:"Kısmen güncellendi",empty:"Eşleşen içerik yok",
  stale:"Son başarılı kayıt",unavailable:"Şu an erişilemiyor"
};
type Props={searchParams:Promise<{kaynak?:string;konu?:string}>};

export default async function RadarPage({searchParams}:Props){
  const params=await searchParams;
  const feed=await getRadarFeed();
  const source=radarSources.some(s=>s.key===params.kaynak)?params.kaynak:null;
  const topic=radarTopics.some(t=>t.key===params.konu)?params.konu:null;
  const items=feed.items.filter(item=>(!source||item.source===source)&&(!topic||item.topic.key===topic));
  const unavailable=feed.sources.every(s=>s.status==="unavailable");
  const stale=feed.sources.some(s=>s.status==="stale");
  const href=(key:string|null,tag:string|null)=>{
    const query=new URLSearchParams();
    if(key)query.set("kaynak",key);
    if(tag)query.set("konu",tag);
    return "/radar"+(query.size?"?"+query.toString():"");
  };
  return <div className="shell radar-page">
    <header className="radar-page-hero">
      <Link className="back-link" href="/">← Ana sayfa</Link>
      <p className="overline">Sektör Radarı · M10</p>
      <h1>Güncel gelişmeleri <span>öğrendiğin kavramlara bağla.</span></h1>
      <p>Kaynakların resmî okuma API'lerinden alınan başlıklar, yayımlanma tarihleri ve mevcut derslere dönüş yolları. Haberlerin doğruluğunu bağımsız olarak teyit etmiyoruz; açıklamalarımız haber özeti değil, konu bağlantısıdır.</p>
    </header>
    <section className="radar-health" aria-labelledby="radar-health-title">
      <h2 id="radar-health-title">Kaynakların durumu</h2>
      <div className="radar-health-grid">
        {feed.sources.map(s=><article key={s.key} className="radar-health-card ui-card">
          <div className="radar-health-head"><strong>{s.name}</strong>
            <span className={`radar-health-tag radar-status-${s.status}`}>{statusLabel[s.status]??s.status}</span>
          </div>
          <p>{s.kind}</p>
          {s.checkedAt?<small>Son başarılı kontrol: <time dateTime={s.checkedAt}>{formatDate(s.checkedAt)}</time></small>:
            <small>Başarılı veri kontrolü yok.</small>}
          {s.status==="stale"&&<p className="radar-warning">Kaynak şu anda yanıt vermiyor. Gösterilen kayıtlar son başarılı kontrolden kaldı.</p>}
          {s.status==="partial"&&<p className="radar-warning">Kaynağın bazı kayıtlarına ulaşılamadı.</p>}
          <a href={s.href} target="_blank" rel="noopener noreferrer">Kaynağın sitesi ↗</a>
        </article>)}
      </div>
      {unavailable&&<p className="radar-empty" role="status">Üç kaynağa da şu an erişilemiyor. Doğrulanmamış başlık veya örnek haber göstermiyoruz. Daha sonra yeniden kontrol et.</p>}
      {stale&&<p className="radar-warning" role="status">Bazı bilgiler son başarılı kontrolden geliyor. Tarihleri kontrol ederek değerlendir.</p>}
    </section>
    <section className="radar-stories" aria-labelledby="radar-feed-title">
      <div className="radar-feed-head"><div><p className="overline">Kaynaklardan seçilen gerçek başlıklar</p>
        <h2 id="radar-feed-title">Yazılım gündemi</h2></div><p>{items.length} eşleşen bağlantı</p></div>
      <nav className="radar-filters" aria-label="Kaynağa göre filtrele">
        <Link aria-current={!source?"page":undefined} href={href(null,topic)}>Tüm kaynaklar</Link>
        {radarSources.map(s=><Link key={s.key} aria-current={source===s.key?"page":undefined}
          href={href(s.key,topic)}>{s.name}</Link>)}
      </nav>
      <nav className="radar-filters radar-topic-filters" aria-label="Konuya göre filtrele">
        <Link aria-current={!topic?"page":undefined} href={href(source,null)}>Tüm konular</Link>
        {radarTopics.map(t=><Link key={t.key} aria-current={topic===t.key?"page":undefined}
          href={href(source,t.key)}>{t.label}</Link>)}
      </nav>
      {items.length===0?<div className="radar-empty" role="status">
        <strong>Bu filtrelerde doğrulanabilir güncel bağlantı yok.</strong>
        <p>Kaynakların erişimi, son yayın tarihleri veya konu eşleştirmeleri nedeniyle liste boş olabilir. Eski başlıkları güncelmiş gibi göstermiyoruz.</p>
        <Link href="/radar">Tüm konulara dön →</Link>
      </div>:
        <div className="radar-article-grid">{items.map(item=><article key={item.id} className="radar-article ui-card">
          <div className="radar-article-meta">
            <span>{radarSources.find(s=>s.key===item.source)?.name}</span>
            <span>{radarSources.find(s=>s.key===item.source)?.kind}</span>
          </div>
          <h3><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title} ↗</a></h3>
          <p className="radar-article-date">Yayın: <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time></p>
          <div className="radar-learning-link"><strong>Neden ilgili?</strong>
            <p>{item.topic.reason}</p>
            <Link href={item.topic.href}>{item.topic.label} konusuna git →</Link>
          </div>
          {item.discussionUrl&&item.discussionUrl!==item.url&&
            <a className="radar-discussion" href={item.discussionUrl} target="_blank" rel="noopener noreferrer">Hacker News tartışması ↗</a>}
        </article>)}</div>}
    </section>
    <aside className="radar-method" aria-label="Veri ve editoryal yöntem">
      <h2>Bu akış nasıl hazırlanıyor?</h2>
      <p>Hacker News tartışmaları ve DEV Community yazıları topluluk içeriğidir; GitHub Releases bağlantıları adı geçen depoların kendi sürüm kayıtlarıdır. Başlıklar resmî API yanıtından alınır. Yayımlanma tarihi ve son başarılı kontrol ayrı gösterilir. Aynı kanonik bağlantı tekrar gösterilmez.</p>
      <p>İlk iki kaynakta 35 günden, sürüm kayıtlarında 120 günden eski içerik görünmez. Veriler en fazla 15 dakikada bir yeniden istenir; kısa erişim kesintilerinde en fazla 6 saat önce kontrol edilmiş kayıtlar <strong>son başarılı kayıt</strong> olarak işaretlenebilir. Sunucu yeniden başlarsa bu geçici önbellek kaybolur. Dış sayfalardaki içerikler DevAcademy'ye aktarılmaz ve kaynakların iddiaları eğitim önerisi olarak doğrulanmış sayılmaz.</p>
    </aside>
  </div>;
}
