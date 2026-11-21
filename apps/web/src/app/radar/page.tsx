import type {Metadata} from "next";
import Link from "next/link";
import {getRadarFeed,radarSources,radarTopics} from "@/lib/radar-feed.mjs";
import {isLooseRadarMatch} from "@/lib/radar-learning.mjs";

import {canonicalFor} from "@/lib/site-url.mjs";
import {OutputTeaser} from "@/components/output-teaser";
export const metadata:Metadata={
  ...canonicalFor("/radar"),
  title:"Sektör Radarı | Güncel yazılım kaynakları",
  description:"Hacker News, DEV Community ve resmî GitHub sürümlerinden kaynaklı yazılım gelişmeleri ve ilgili DevAcademy dersleri."
};
export const dynamic="force-dynamic";

const formatDate=(value:string)=>new Intl.DateTimeFormat("tr-TR",{
  timeZone:"Europe/Istanbul",day:"numeric",month:"short",year:"numeric",
  hour:"2-digit",minute:"2-digit"
}).format(new Date(value));
const formatShort=(value:string)=>new Intl.DateTimeFormat("tr-TR",{
  timeZone:"Europe/Istanbul",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"
}).format(new Date(value));
type FeedItem=Awaited<ReturnType<typeof getRadarFeed>>["items"][number];
/** Haberleri konuya göre toplar. `learning.label` sürüm ve ipucuna özgü olduğu için neredeyse
 *  her haberi ayrı gruba düşürüyordu; konu anahtarı gerçekten birleştirir. Akış yeniden eskiye
 *  sıralı geldiği için grup sırası grubun en yeni haberine göre oluşur; ders bloğu en yeni haberden gelir. */
function groupByTopic(list:FeedItem[]){
  const groups=new Map<string,FeedItem[]>();
  for(const item of list){
    const key=item.topic.key;
    groups.set(key,[...(groups.get(key)??[]),item]);
  }
  return [...groups.entries()].map(([key,entries])=>({key,
    label:radarTopics.find(t=>t.key===key)?.label??entries[0].learning.label,
    learning:entries[0].learning,items:entries}));
}
const statusLabel:Record<string,string>={
  fresh:"Güncellendi",partial:"Kısmen güncellendi",empty:"Eşleşen içerik yok",
  stale:"Son başarılı kayıt",unavailable:"Şu an erişilemiyor"
};
type Props={searchParams:Promise<{kaynak?:string;konu?:string}>};

export default async function RadarPage({searchParams}:Props){
  const params=await searchParams;
  const feed=await getRadarFeed();
  const source=typeof params.kaynak==="string"&&radarSources.some(s=>s.key===params.kaynak)?params.kaynak:null;
  const topic=typeof params.konu==="string"&&radarTopics.some(t=>t.key===params.konu)?params.konu:null;
  const filtered=feed.items.filter(item=>(!source||item.source===source)&&(!topic||item.topic.key===topic));
  const items=filtered.filter(item=>!isLooseRadarMatch(item.learning));
  const related=filtered.filter(item=>isLooseRadarMatch(item.learning));
  const unavailable=feed.sources.every(s=>s.status==="unavailable");
  const href=(key:string|null,tag:string|null)=>{
    const query=new URLSearchParams();
    if(key)query.set("kaynak",key);
    if(tag)query.set("konu",tag);
    return "/radar"+(query.size?"?"+query.toString():"");
  };
  return <div className="shell radar-page">
    <div className="teaser-header">
    <header className="radar-page-hero">
      <Link className="back-link" href="/">← Ana sayfa</Link>
      <p className="overline">Sektör radarı</p>
      <h1>Güncel gelişmeleri <span>öğrendiğin kavramlara bağla.</span></h1>
      <p>Kaynakların resmî API&apos;lerinden gelen başlıkları ilgili derslere bağlıyoruz; haberlerin doğruluğunu bağımsız olarak teyit etmiyoruz.</p>
    </header>
    <OutputTeaser file="eski-bir-karar.js" code={"console.log(typeof null);"} answer="object"
      explanation="Dilin ilk sürümünden kalan bilinen bir tuhaflık; mevcut siteleri bozmamak için hiç düzeltilmedi. Haberlerin arkasındaki kavramlar da çoğu zaman böyle bir geçmiş taşır."/>
    </div>
    <section className="radar-health" aria-labelledby="radar-health-title">
      <h2 id="radar-health-title">Kaynakların durumu</h2>
      <ul className="radar-health-strip">
        {feed.sources.map(s=><li key={s.key}>
          <strong>{s.name}</strong>
          <span className={`radar-health-tag radar-status-${s.status}`}>{statusLabel[s.status]??s.status}</span>
          {s.checkedAt&&<time dateTime={s.checkedAt}>{formatShort(s.checkedAt)}</time>}
        </li>)}
      </ul>
      <details className="radar-health-details">
        <summary>Kaynak ayrıntıları</summary>
        <div className="radar-health-grid">
          {feed.sources.map(s=><article key={s.key} className="radar-health-card">
            <div className="radar-health-head"><strong>{s.name}</strong>
              <span className={`radar-health-tag radar-status-${s.status}`}>{statusLabel[s.status]??s.status}</span>
            </div>
            <p>{s.kind}</p>
            {s.checkedAt?<small>Son başarılı kontrol: <time dateTime={s.checkedAt}>{formatDate(s.checkedAt)}</time></small>:
              <small>Başarılı veri kontrolü yok.</small>}
            {s.status==="partial"&&<p className="radar-warning">Kaynağın bazı kayıtlarına ulaşılamadı.</p>}
            <a href={s.href} target="_blank" rel="noopener noreferrer">{s.name} sitesi ↗</a>
          </article>)}
        </div>
      </details>
      {feed.sources.filter(s=>s.status==="stale").map(s=><p key={s.key} className="radar-warning" role="status">{s.name} şu anda yanıt vermiyor. Gösterilen kayıtlar son başarılı kontrolden kaldı; tarihleri kontrol ederek değerlendir.</p>)}
      {unavailable&&<p className="radar-empty" role="status">Üç kaynağa da şu an erişilemiyor. Doğrulanmamış başlık veya örnek haber göstermiyoruz. Daha sonra yeniden kontrol et.</p>}
    </section>
    <section className="radar-stories" aria-labelledby="radar-feed-title">
      <div className="radar-feed-head"><div><p className="overline">Kaynaklardan seçilen başlıklar</p>
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
      {items.length===0&&related.length>0&&<p className="radar-empty" role="status">Bu filtrelerde bir derse doğrudan bağlanan başlık yok. Yalnızca genel dil eşleşmesi olan başlıklar aşağıda, “İlgili olabilir” bölümünde.</p>}
      {items.length===0&&related.length===0?<div className="radar-empty" role="status">
        <strong>Bu filtrelerde doğrulanabilir güncel bağlantı yok.</strong>
        <p>Kaynakların erişimi, son yayın tarihleri veya konu eşleştirmeleri nedeniyle liste boş olabilir. Eski başlıkları güncelmiş gibi göstermiyoruz.</p>
        <Link href="/radar">Tüm konulara dön →</Link>
      </div>:items.length>0&&
        <ol className="radar-group-index">{groupByTopic(items).map((group,index)=><li key={group.key} className="radar-group">
          <span className="radar-group-no" aria-hidden="true">{String(index+1).padStart(2,"0")}</span>
          <div className="radar-group-body">
            <div className="radar-group-head">
              <div>
                <span className="radar-bridge-scope">{group.learning.coverage}</span>
                <h3>{group.label}</h3>
              </div>
              <div className="radar-learning-actions">
                <Link href={group.learning.primary.href}>{group.learning.primary.label} →</Link>
                <span>{group.learning.primary.kind}</span>
                {group.learning.secondary&&<>
                  <Link href={group.learning.secondary.href}>{group.learning.secondary.label} →</Link>
                  <span>{group.learning.secondary.kind}</span>
                </>}
              </div>
            </div>
            <p className="radar-group-why">{group.learning.why}</p>
            <ul className="radar-group-items">{group.items.map(item=>{const check=feed.sources.find(s=>s.key===item.source);const meta=radarSources.find(s=>s.key===item.source);return <li key={item.id} className="radar-article">
              <h4><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title} ↗</a></h4>
              <p className="radar-article-meta">{meta?.name}<span aria-hidden="true"> · </span><span className="sr-only">, </span>{meta?.kind}<span aria-hidden="true"> · </span><span className="sr-only">, yayın: </span><time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time></p>
              {/* The check time is already in the source strip above; repeat it only when this record is stale. */}
              {check?.status==="stale"&&<p className="radar-article-date">Kaynak kontrolü: {check.checkedAt?<time dateTime={check.checkedAt}>{formatDate(check.checkedAt)}</time>:"Başarılı kontrol yok"} <strong>(Son başarılı kayıt)</strong></p>}
              <details className="radar-reading-prompt">
                <summary>Bu derse neden bağlandı?</summary>
                <p>{item.learning.context} <span className="radar-bridge-basis">({item.learning.basis})</span></p>
                <p><strong>Okurken kontrol et:</strong> {item.learning.question}</p>
                {item.learning.primary.href!==group.learning.primary.href&&
                  <p><Link href={item.learning.primary.href}>{item.learning.primary.label} →</Link></p>}
              </details>
              {item.discussionUrl&&item.discussionUrl!==item.url&&
                <a className="radar-discussion" href={item.discussionUrl} target="_blank" rel="noopener noreferrer">Hacker News tartışması ↗</a>}
            </li>;})}</ul>
          </div>
        </li>)}</ol>}
      {related.length>0&&<details className="radar-related">
        <summary>İlgili olabilir <span>({related.length} başlık)</span></summary>
        <p>Bu başlıklar yalnızca dil etiketiyle eşleşti. Belirli bir derse bağlanmadıkları için ana listede değiller; konu dışı olabilirler.</p>
        <ul>{related.map(item=><li key={item.id}>
          <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title} ↗</a>
          <span>{radarSources.find(s=>s.key===item.source)?.name} · <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time></span>
          <Link href={item.learning.primary.href}>{item.learning.primary.label} →</Link>
        </li>)}</ul>
      </details>}
    </section>
    <aside className="radar-method" aria-label="Veri ve editoryal yöntem">
      <h2>Bu akış nasıl hazırlanıyor?</h2>
      <p>Hacker News tartışmaları ve DEV Community yazıları topluluk içeriğidir; GitHub Releases bağlantıları adı geçen depoların kendi sürüm kayıtlarıdır. Başlıklar resmî API yanıtından alınır. Yayımlanma tarihi ve son başarılı kontrol ayrı gösterilir. Aynı kanonik bağlantı tekrar gösterilmez. Konu rehberleri başlığa, varsa etiketlere ve resmî sürüm kayıtlarına dayanır; makale özeti değildir.</p>
      <p>İlk iki kaynakta 35 günden, sürüm kayıtlarında 120 günden eski içerik görünmez. Veriler en fazla 15 dakikada bir yeniden istenir; kısa erişim kesintilerinde en fazla 6 saat önce kontrol edilmiş kayıtlar <strong>son başarılı kayıt</strong> olarak işaretlenebilir. Sunucu yeniden başlarsa bu geçici önbellek kaybolur. Dış sayfalardaki içerikler DevAcademy&apos;ye aktarılmaz ve kaynakların iddiaları eğitim önerisi olarak doğrulanmış sayılmaz.</p>
    </aside>
  </div>;
}
