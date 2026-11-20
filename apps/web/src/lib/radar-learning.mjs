/*
 * Curated learning bridges for M10. Titles/tags are third-party metadata;
 * they are NOT summaries of articles and are never treated as instructions.
 * Links point to existing lessons or explicitly labelled preview catalog pages.
 */
const shortcut=(label,href,kind)=>({label,href,kind});
const links={
  pyCourse:shortcut("Python Temelleri kursu","/kurslar/python-temelleri","Önkoşul"),
  pyVars:shortcut("Python: Değişkenler ve türler","/kurslar/python-temelleri/degiskenler-ve-turler","İlgili ders"),
  pyConditions:shortcut("Python: Koşullar","/kurslar/python-temelleri/kosullar","İlgili ders"),
  pyLoops:shortcut("Python: Döngüler","/kurslar/python-temelleri/donguler","İlgili ders"),
  pyFunctions:shortcut("Python: Fonksiyonlar","/kurslar/python-temelleri/fonksiyonlar","Önkoşul"),
  pyCollections:shortcut("Python: Listeler ve sözlükler","/kurslar/python-temelleri/listeler-ve-sozlukler","Önkoşul"),
  jsCourse:shortcut("JavaScript Temelleri kursu","/kurslar/javascript-temelleri","Önkoşul"),
  algorithmCourse:shortcut("Veri Yapıları ve Algoritmalar","/kurslar/veri-yapilari-algoritmalar","İlgili öğrenme yolu"),
  binarySearch:shortcut("İkili arama dersi","/kurslar/veri-yapilari-algoritmalar/ikili-arama","İlgili ders"),
  jsVars:shortcut("JavaScript: let ve const","/kurslar/javascript-temelleri/degiskenler","Önkoşul"),
  jsAsync:shortcut("JavaScript: Asenkron işlemler ve Promise","/kurslar/javascript-temelleri/asenkron-temeller","İlgili ders"),
  jsMap:shortcut("JavaScript: map ile dönüşüm","/kurslar/javascript-temelleri/dizilerde-map","İlgili ders"),
  jsFilter:shortcut("JavaScript: filter ve reduce","/kurslar/javascript-temelleri/dizilerde-filter","İlgili ders"),
  jsFunctions:shortcut("JavaScript: Fonksiyonlar","/kurslar/javascript-temelleri/fonksiyonlar","Önkoşul"),
  javaCourse:shortcut("Java Temelleri kursu","/kurslar/java-temelleri","Önkoşul"),
  javaMethods:shortcut("Java: Metotlar ve return","/kurslar/java-temelleri/metotlar-ve-return","Önkoşul"),
  javaPoly:shortcut("Java: Çok biçimlilik","/kurslar/java-temelleri/polymorphism","İlgili ders"),
  sqlCourse:shortcut("SQL Temelleri kursu","/kurslar/sql-temelleri","Önkoşul"),
  sqlWhere:shortcut("SQL: WHERE ve NULL","/kurslar/sql-temelleri/where-ve-null","İlgili ders"),
  sqlGroup:shortcut("SQL: GROUP BY ve HAVING","/kurslar/sql-temelleri/group-by-ve-having","İlgili ders"),
  languageCatalog:shortcut("Diller kataloğu","/kutuphane/diller","Katalog sayfası"),
  techCatalog:shortcut("Teknolojiler kataloğu","/kutuphane/teknolojiler","Katalog sayfası")
};
const matches=(text,pattern)=>pattern.test(text);
// A bridge that only points at a whole language course (for example a crypto
// token headline tagged "python") is too loose for the main radar list.
export const looseRadarCoverage="Genel dil kursu";
export const isLooseRadarMatch=(learning)=>!learning||learning.coverage===looseRadarCoverage;
function bridge({label,context,why,question,primary,secondary=null,coverage}){
  return {label,context,why,question,primary,secondary,coverage};
}
const textIndex=(text)=>{
  let hash=0;
  for(let i=0;i<text.length;i++)hash=(hash*31+text.charCodeAt(i))>>>0;
  return hash;
};
const cueList=(text,rules)=>rules.filter(([pattern])=>pattern.test(text)).map(([,name])=>name);
const formatCue=(cues,fallback)=>cues.length?cues.slice(0,2).join(" ve "):fallback;
const postgresCues=[
  [/\bpostgres(?:ql)?(?:\s*\d+)?\b/i,"PostgreSQL"],
  [/\bsqlite\b/i,"SQLite"],
  [/\b(?:backup|restore|wal|pg_dump|recovery|failover)\b/i,"yedekleme ve kurtarma"],
  [/\b(?:index|vacuum|repack|explain|query\s+plan|latency|performance)\b/i,"sorgu performansı"],
  [/\b(?:schema|migration|ddl|table|join|group\s+by)\b/i,"tablo ve şema tasarımı"],
  [/\b(?:replication|cluster|ha|shard|locking|deadlock)\b/i,"eşzamanlılık ve tutarlılık"]
];
const dockerCues=[
  [/\b(?:kubernetes|k8s|pods?|deployments?|helm|ingress)\b/i,"Kubernetes ve orkestrasyon"],
  [/\b(?:microvm|firecracker|gvisor|sandbox|kernel|isolation)\b/i,"izolasyon ve çalışma katmanı"],
  [/\b(?:docker|dockerfile|compose|image|registry|containerfile)\b/i,"konteyner imajları"],
  [/\b(?:bgp|routing|network|proxy|mesh|cloud|bare[- ]metal)\b/i,"ağ ve dağıtım altyapısı"]
];
const tsCues=[
  [/\btypescript\b/i,"TypeScript"],
  [/\b(?:compiler|tsc|build|bundler)\b/i,"derleyici ve derleme adımı"],
  [/\b(?:type|generic|infer|narrowing|schema)\b/i,"tip denetimi"],
  [/\b(?:node|react|next|api|calculator|formula)\b/i,"uygulama kodu"]
];
const reactCues=[
  [/\breact(?:\.js)?\b/i,"React"],
  [/\b(?:compiler|memo|render|re-?render)\b/i,"render davranışı"],
  [/\b(?:hook|state|effect|server\s+component|rsc)\b/i,"bileşen ve durum akışı"],
  [/\b(?:next\.js|router|form|ui)\b/i,"arayüz mimarisi"]
];
const algoCues=[
  [/\b(?:binary search|ikili arama)\b/i,"ikili arama"],
  [/\b(?:sort|quicksort|mergesort|heap)\b/i,"sıralama"],
  [/\b(?:tree|graph|bfs|dfs|trie)\b/i,"ağaç ve graf yapısı"],
  [/\b(?:hash|map|set|cache)\b/i,"arama ve eşleme yapısı"]
];
const pick=(list,seed)=>list[seed%list.length];

const topicDefault={
  python:()=>bridge({label:"Python ekosistemi",
    context:"Başlık veya etiketler Python ekosistemine işaret ediyor; makalenin ayrıntılarını henüz incelemedik.",
    why:"Dil temellerini bilmek bir kütüphane veya araç duyurusundaki örnekleri yorumlamayı kolaylaştırır.",
    question:"Kaynakta hangi dil özelliği veya araç etkileniyor? Mevcut kodunla hangi bağlantıyı kurabiliyorsun?",
    primary:links.pyCourse,coverage:looseRadarCoverage}),
  javascript:()=>bridge({label:"JavaScript ekosistemi",
    context:"Başlık veya etiketlerde JavaScript ya da Node.js ile ilişkili terimler bulunuyor.",
    why:"Sözdizimi ve fonksiyon bilgisini yeni çalışma ortamlarıyla ilişkilendirmek daha sağlıklı bir başlangıçtır.",
    question:"Söz konusu değişiklik JavaScript dilinde mi, yoksa araç/çalışma ortamında mı?",
    primary:links.jsCourse,coverage:looseRadarCoverage}),
  java:()=>bridge({label:"Java ekosistemi",
    context:"Başlık veya etiketler Java ya da JVM ekosistemine işaret ediyor.",
    why:"Dil ve nesne yönelimli programlama bilgisi, framework ve sürüm duyurularını ayırt etmeyi sağlar.",
    question:"Kaynak bir Java dil değişikliğinden mi, JVM'den mi, yoksa ayrı bir framework'ten mi bahsediyor?",
    primary:links.javaCourse,coverage:looseRadarCoverage}),
  typescript:(text="")=>{
    const seed=textIndex(text);
    const focus=formatCue(cueList(text,tsCues),"TypeScript");
    return bridge({label:"TypeScript ve tip güvenliği",
      context:pick([
        `Başlık veya etiketlerde ${focus} odaklı terimler geçiyor; doğrudan TypeScript kursumuz henüz yok.`,
        `Etiketler ${focus} başlığını işaret ediyor; konu JavaScript üzerine kurulan statik tip katmanıyla ilgili.`
      ],seed),
      why:pick([
        "Derleme aşamasındaki tip kuralları, çalışma zamanındaki JavaScript davranışını öngörmeyi kolaylaştırır.",
        "TypeScript ile üretilen JavaScript çıktısını ayırabilmek için önce değişken ve tür davranışını tanımak gerekir."
      ],seed),
      question:pick([
        "Kaynakta bahsedilen örnek derleme zamanı tip kontrolünü mü, çalışma zamanındaki JavaScript'i mi etkiliyor?",
        "Yazıda ele alınan kural tip tanımlarında mı kalıyor, yoksa üretilen kodu da değiştiriyor mu?"
      ],seed),
      primary:links.languageCatalog,secondary:links.jsVars,coverage:"Katalog ve önkoşul ders"});
  },
  react:(text="")=>{
    const seed=textIndex(text);
    const focus=formatCue(cueList(text,reactCues),"React");
    return bridge({label:"React ve bileşenler",
      context:pick([
        `Başlık veya etiketlerde ${focus} ile ilişkili ifadeler bulunuyor; henüz React dersimiz yok.`,
        `Kayıt ${focus} bağlamında görünüyor; bileşen yapısını anlamak için JavaScript fonksiyonları önkoşuldur.`
      ],seed),
      why:pick([
        "Bileşen yaşam döngüsü ve durum güncellemeleri doğrudan JavaScript fonksiyonları ve kapanışlar üzerine kuruludur.",
        "Arayüz kütüphanelerindeki değişiklikleri ayırt etmek için önce temel fonksiyon ve dönüş değerlerini bilmek gerekir."
      ],seed),
      question:pick([
        "Söz konusu özellik React'e mi ait, yoksa genel JavaScript davranışı mı?",
        "Kaynakta anlatılan değişiklik bileşen render'ını mı, veri akışını mı etkiliyor?"
      ],seed),
      primary:links.techCatalog,secondary:links.jsFunctions,coverage:"Katalog ve önkoşul ders"});
  },
  postgres:(text="")=>{
    const seed=textIndex(text);
    const focus=formatCue(cueList(text,postgresCues),"SQL ve veritabanı");
    return bridge({label:"Veritabanı ve SQL",
      context:pick([
        `Başlık veya etiketlerde ${focus} ile ilgili terimler görünüyor; makale metni ayrıca doğrulanmamıştır.`,
        `Bu kayıt ${focus} odağında eşleşti; başlık veritabanı sorgulama veya veri yönetimiyle ilişkili.`,
        `Etiketler ${focus} konusuna işaret ediyor; sunulan ders bağlantısı yalnızca hazırlık amaçlıdır.`
      ],seed),
      why:pick([
        "SELECT, WHERE, JOIN ve GROUP BY temelleri farklı veri araçlarındaki sorgu ve tablo kararlarını okumayı kolaylaştırır.",
        "Koşul süzme, boş değer (NULL) kontrolü ve gruplama kuralları veritabanı davranışını yorumlamanın temelidir.",
        "Tablo ilişkileri ile filtreleme mantığını kavramak, yeni veri motorlarındaki örnekleri kıyaslamayı sağlar."
      ],seed),
      question:pick([
        "Kaynağın odağı sorgu yazma mı, veri tutarlılığı mı, performans mı, yoksa yönetim mi?",
        "Başlıkta geçen yaklaşım tablo tasarımını mı, sorgu maliyetini mi değiştiriyor?",
        "Örnekte tekil kayıt filtresi mi, yoksa toplu raporlama/birleştirme mi öne çıkıyor?"
      ],seed),
      primary:links.sqlCourse,coverage:"Önkoşul dersi"});
  },
  docker:(text="")=>{
    const seed=textIndex(text);
    const focus=formatCue(cueList(text,dockerCues),"konteyner teknolojileri");
    return bridge({label:"Konteynerler ve dağıtım",
      context:pick([
        `Başlık veya etiketlerde ${focus} ile ilgili kavramlar geçiyor; henüz konteyner dersimiz bulunmuyor.`,
        `Kayıt ${focus} başlığıyla eşleşti; içerik uygulama kodunun çalıştırıldığı altyapı katmanıyla ilgili.`,
        `Etiketler ${focus} alanına işaret ediyor; uygulama mantığı ile dağıtım ortamı burada ayrışır.`
      ],seed),
      why:pick([
        "Uygulama mantığıyla onu izole eden veya dağıtan çalışma ortamını ayırmak üretim sorunlarını okumayı kolaylaştırır.",
        "Konteyner veya sanal ortam katmanını anlamak, kodun hangi sınırlar içinde çalıştığını görmene yardımcı olur.",
        "Paketleme ve çalışma zamanı sınırlarını bilmek, kodun farklı makinelerde neden aynı davrandığını açıklar."
      ],seed),
      question:pick([
        "Kaynak imaj oluşturma, izolasyon, dağıtım veya orkestrasyon adımlarından hangisini inceliyor?",
        "Yazıda ele alınan mimari geliştirme ortamını mı, üretim dağıtımını mı hedefliyor?",
        "Örnekte vurgulanan değişiklik uygulama kodunda mı, çalışma ortamı yapılandırmasında mı?"
      ],seed),
      primary:links.techCatalog,coverage:"Katalog sayfası"});
  },
  algorithms:(text="")=>{
    const seed=textIndex(text);
    const focus=formatCue(cueList(text,algoCues),"algoritma ve veri yapıları");
    return bridge({label:"Algoritmalar ve maliyet analizi",
      context:pick([
        `Başlık veya etiketlerde ${focus} ile ilişkili terimler bulunuyor.`,
        `Bu kayıt ${focus} konusuna işaret ediyor; doğruluk şartlarını mevcut derslerle karşılaştırabilirsin.`
      ],seed),
      why:pick([
        "Doğru veri yapısı ve algoritma önkoşulları uygulamanın hem sonucunu hem ölçeklenmesini belirler.",
        "Zaman karmaşıklığı ve veri düzeni varsayımlarını bilmek performans iddialarını sınamayı sağlar."
      ],seed),
      question:pick([
        "Kaynak hangi veri yapısı, sıralama varsayımı veya işlem maliyetini inceliyor?",
        "Anlatılan yöntemin çalışması için verinin hangi önkoşulu sağlaması gerekiyor?"
      ],seed),
      primary:links.algorithmCourse,coverage:"Önkoşul dersi"});
  },
  async:()=>bridge({label:"Asenkron JavaScript akışı",
    context:"Başlık veya etiketler Promise, async/await ya da event loop terimleri içeriyor.",
    why:"Promise ve microtask sıralamasını anlamak bu ifadeleri okurken somut bir temel sağlar.",
    question:"Örnekte senkron ve asenkron işlemlerin hangi sırada gerçekleştiğine bak.",
    primary:links.jsAsync,coverage:"Doğrudan ders"})
};

const releaseBridges={
  "nodejs/node":()=>bridge({label:"Node.js sürüm duyurusu",
    context:"Bu bağlantı Node.js deposunun yayımlanmış sürüm kaydıdır. Değişiklik listesi için kaynak sürüm notlarını aç.",
    why:"Node.js bir JavaScript çalışma ortamıdır; dil özellikleri ile çalışma ortamına özgü API'leri ayırmak önemlidir.",
    question:"Sürüm notunda davranışı değişen API, uyumluluk veya güvenlik başlığı var mı? Bunlar hangi sürümleri etkiliyor?",
    primary:links.jsAsync,secondary:links.jsCourse,coverage:"Önkoşul dersi"}),
  "microsoft/TypeScript":()=>bridge({label:"TypeScript sürüm duyurusu",
    context:"Bu bağlantı TypeScript deposunun yayımlanmış sürüm kaydıdır. Ayrıntılar resmî sürüm notlarındadır.",
    why:"Tip kontrolü ile üretilen JavaScript'in çalışma zamanındaki davranışını birbirinden ayırmak gerekir.",
    question:"Yenilik tip sistemini mi, derleyici ayarlarını mı, yoksa çıktıyı mı etkiliyor?",
    primary:links.languageCatalog,secondary:links.jsVars,coverage:"Katalog ve önkoşul ders"}),
  "facebook/react":()=>bridge({label:"React sürüm duyurusu",
    context:"Bu bağlantı React deposunun yayımlanmış sürüm kaydıdır. Duyurunun ayrıntısı resmî kaynakta yer alır.",
    why:"Bileşen mantığını kavramak için JavaScript fonksiyonları ve durum değişimlerini bilmek gerekir.",
    question:"Bu sürümde bahsedilen davranış React'e mi, genel JavaScript'e mi ait? Geçiş adımı var mı?",
    primary:links.techCatalog,secondary:links.jsFunctions,coverage:"Katalog ve önkoşul ders"}),
  "astral-sh/ruff":()=>bridge({label:"Ruff sürüm duyurusu",
    context:"Bu bağlantı Python kod denetimi/biçimlendirme aracı Ruff'ın yayımlanmış sürüm kaydıdır.",
    why:"Kodun çalışmasıyla kodun biçimi ve statik kontrolü aynı şey değildir. Ruff için özel dersimiz henüz yok.",
    question:"Sürüm notunda hangi kural, biçimlendirme davranışı veya uyumluluk değişiyor?",
    primary:links.pyFunctions,secondary:links.pyCourse,coverage:"Önkoşul dersi"}),
  "spring-projects/spring-boot":()=>bridge({label:"Spring Boot sürüm duyurusu",
    context:"Bu bağlantı Java framework'ü Spring Boot'un yayımlanmış sürüm kaydıdır.",
    why:"Spring Boot bir Java sürümü değildir; Java temelleri framework kodlarını okumak için hazırlık sağlar.",
    question:"Kaynakta hangi Spring Boot özelliği veya desteklenen sürüm değişiyor?",
    primary:links.javaMethods,secondary:links.javaCourse,coverage:"Önkoşul dersi"})
};

export function selectRadarLearning({title="",tags=[],topicKey,releaseRepo=null}={}){
  if(!Object.hasOwn(topicDefault,topicKey))return null;
  const text=[title,...(Array.isArray(tags)?tags:[])].filter(x=>typeof x==="string").join(" ").slice(0,700);
  if(releaseRepo&&Object.hasOwn(releaseBridges,releaseRepo)){
    return {...releaseBridges[releaseRepo](),basis:"Doğrulanmış depo sürüm kaydı"};
  }
  let result=null;
  if(topicKey==="algorithms"){
    if(matches(text,/\b(?:binary search|ikili arama)\b/i))
      result=bridge({label:"İkili arama ve veri önkoşulu",
        context:"Başlık/etiketlerde ikili arama algoritmasına dair ifadeler var; makale içeriğinin doğruluğunu ayrıca kontrol etmelisin.",
        why:"İkili arama sıralı veri gerektirir; bu şart karşılanmazsa aranan öğe bulunamayabilir.",
        question:"Kaynakta giriş listesinin sıralı olduğu belirtilmiş mi? Sınırlar nasıl güncelleniyor?",
        primary:links.binarySearch,coverage:"Doğrudan ders"});
  }
  else if(topicKey==="python"){
    if(matches(text,/\b(?:asyncio|async\s+def|python\s+async|async\s+python)\b/i))
      result=bridge({label:"Python'da asyncio ve eşzamanlılık",
        context:"Başlık/etiketler Python asenkron programlama alanına işaret ediyor. JavaScript Promise dersi bu konunun doğrudan karşılığı değildir.",
        why:"Python asyncio ve JavaScript Promise farklı ekosistemlere aittir; Python'daki özel async konusunun dersi henüz yok.",
        question:"Kaynakta async fonksiyon, event loop veya coroutine terimlerinden hangisi geçiyor? Nasıl kullanıldığını asıl kaynaktan kontrol et.",
        primary:links.pyFunctions,secondary:links.pyCourse,coverage:"Önkoşul dersi"});
    else if(matches(text,/\b(?:pandas|numpy|dataframes?|data\s+processing|data\s+analysis|polars|dictionaries|lists?)\b/i))
      result=bridge({label:"Python'da veri yapıları ve kütüphaneler",
        context:"Başlık/etiketlerde Python veri işleme ve koleksiyonlarıyla ilgili terimler bulunuyor.",
        why:"Listeler ve sözlükler, daha gelişmiş veri işleme araçlarına geçmeden önce gereken temel kavramlardandır.",
        question:"Veri yapılarını incele: Liste, sözlük, tablo veya dizi hangi işi üstleniyor?",
        primary:links.pyCollections,coverage:"Önkoşul dersi"});
    else if(matches(text,/\b(?:pytest|unittest|testing|tests?|linting|linter|ruff)\b/i))
      result=bridge({label:"Python'da test ve kod kalitesi",
        context:"Başlık/etiketlerde Python test veya kod kalite araçlarıyla ilişkili terimler var.",
        why:"Test edilebilir, return değeri üreten küçük fonksiyonlar yazabilmek iyi bir başlangıçtır. Özel test/kalite dersimiz yok.",
        question:"Araç doğruluk mu, stil mi, tip kontrolü mü denetliyor? Testin neyi kanıtladığına bak.",
        primary:links.pyFunctions,coverage:"Önkoşul dersi"});
    else if(matches(text,/\b(?:securit(?:y|ies)|vulnerabilit(?:y|ies)|cve-\d{4}-\d+|exploit|patch)\b/i))
      result=bridge({label:"Python ve güvenlik duyuruları",
        context:"Başlık/etiketler Python bağlamında bir güvenlik konusuna işaret ediyor; başlığın doğru ve etkisinin gerçek olduğunu ayrıca doğrulamak gerekir.",
        why:"Güvenlik duyurularını yorumlamak için etkilenen sürüm, tehdit modeli ve düzeltme bilgisi gerekir. Güvenlik kursumuz yok.",
        question:"Duyurunun birincil kaynağında etkilenen sürümler, çözüm ve yayımlanma tarihi belirtiliyor mu?",
        primary:links.pyCourse,coverage:looseRadarCoverage});
    else if(matches(text,/\b(?:python\s+3(?:\.\d+)?|cpython|language\s+release|release\s+notes|version)\b/i))
      result=bridge({label:"Python sürüm ve dil gelişmeleri",
        context:"Başlık/etiketlerde Python sürümü veya dil gelişmesiyle ilgili terimler bulunuyor.",
        why:"Sürüm değişikliklerini yorumlarken dil sözdizimiyle bağımlı paketlerin davranışını ayırmak gerekir.",
        question:"Değişiklik dilin kendisinde mi, standart kütüphanede mi yoksa üçüncü taraf bir araçta mı?",
        primary:links.pyVars,secondary:links.pyCourse,coverage:"Önkoşul dersi"});
    else if(matches(text,/\b(?:loops?|range|iteration|for-loop)\b/i))
      result=bridge({label:"Python döngüleri",
        context:"Başlık/etiketlerde Python döngüleri veya yineleme terimleri bulunuyor.",
        why:"range, break ve continue davranışlarını bilmek yineleme örneklerinin kontrol akışını açıklamayı kolaylaştırır.",
        question:"Döngünün başlangıç, bitiş ve geçersiz kayıt davranışı nasıl?",
        primary:links.pyLoops,coverage:"Doğrudan ders"});
    else if(matches(text,/\b(?:conditional|if-else|truthiness)\b/i))
      result=bridge({label:"Python koşulları",
        context:"Başlık/etiketlerde koşullar veya doğruluk değeri davranışı bulunuyor.",
        why:"if/elif sırası ve sınır koşulları örnekleri anlamada belirleyicidir.",
        question:"Koşulda hangi değerlerin True veya False sayıldığına bak.",
        primary:links.pyConditions,coverage:"Doğrudan ders"});
  }else if(topicKey==="javascript"||topicKey==="async"){
    if(matches(text,/\b(?:promises?|async\/await|event\s+loop|microtasks?|asynchronous)\b/i))
      result=topicDefault.async();
    else if(matches(text,/\b(?:map\s*\(|array\.map|array\s+map)\b/i))
      result=bridge({label:"JavaScript dizilerinde map",
        context:"Başlık veya etiketler dizilerde map dönüşümünü işaret ediyor.",
        why:"map yönteminin yeni bir dizi üretmesi ve callback dönüş değeri bu konunun temelidir.",
        question:"Örnekte kaynak dizi değişiyor mu, yoksa yeni bir dizi mi oluşuyor?",
        primary:links.jsMap,coverage:"Doğrudan ders"});
    else if(matches(text,/\b(?:filter\s*\(|reduce\s*\(|array\.filter|array\.reduce)\b/i))
      result=bridge({label:"JavaScript filtreleme ve biriktirme",
        context:"Başlık/etiketlerde filter veya reduce yöntemleri bulunuyor.",
        why:"Bir diziyi süzmek ve sonuçları toplamak farklı işlemlerdir.",
        question:"Örnek filtreleme mi yapıyor, toplam mı hesaplıyor, yoksa ikisini mi?",
        primary:links.jsFilter,coverage:"Doğrudan ders"});
    else if(matches(text,/\b(?:node\.?js|nodejs|npm|package\s+manager|runtime)\b/i))
      result=bridge({label:"Node.js ve çalışma ortamı",
        context:"Başlık/etiketler Node.js ya da JavaScript araçlarına işaret ediyor.",
        why:"Bir dilin özellikleri ile çalışma ortamının sağladığı API'leri ayırmak önemlidir.",
        question:"Kaynakta değişen davranış JavaScript diline mi, Node.js'e mi, paket yöneticisine mi ait?",
        primary:links.jsCourse,coverage:"Önkoşul dersi"});
  }else if(topicKey==="postgres"){
    if(matches(text,/\b(?:sqlite)\b/i))
      result=bridge({label:"Gömülü SQL ve SQLite",
        context:"Başlık veya etiketlerde dosya tabanlı gömülü veritabanı SQLite geçiyor.",
        why:"Sunuculu veritabanlarından farklı olarak SQLite uygulama süreci içinde tek dosya üzerinde çalışır; temel SQL kuralları ortaktır.",
        question:"Kaynakta vurgulanan kısıt veya avantaj eşzamanlı yazma mı, taşınabilirlik mi?",
        primary:links.sqlWhere,secondary:links.sqlCourse,coverage:"Önkoşul dersi"});
    else if(matches(text,/\b(?:backup|restore|wal|pg_dump|recovery|failover|replica)\b/i))
      result=bridge({label:"Veritabanı yedekleme ve kurtarma",
        context:"Başlık veya etiketlerde yedekleme, kurtarma ya da kesintisiz çalışma terimleri yer alıyor.",
        why:"Kayıt tutarlılığı ve işlem bütünlüğü olmadan yedek geri yükleme senaryolarında veri kaybı riski doğar.",
        question:"Kaynakta yedek alma yöntemi, geri yükleme süresi veya tutarlılık garantisi nasıl sınanıyor?",
        primary:links.sqlWhere,secondary:links.sqlCourse,coverage:"Önkoşul dersi"});
    else if(matches(text,/\b(?:index|vacuum|repack|explain|query\s+plan|slow|performance|latency)\b/i))
      result=bridge({label:"Sorgu performansı ve indeksler",
        context:"Başlık veya etiketler sorgu planı, indeks bakımı ya da performans iyileştirmesiyle ilgili.",
        why:"WHERE koşulları ve toplulaştırma sorgularının maliyeti seçilen filtre ve indeks düzenine doğrudan bağlıdır.",
        question:"Hızlanma veya maliyet düşüşü tablo okuma biçiminden mi, indeks yapısından mı geliyor?",
        primary:links.sqlGroup,secondary:links.sqlCourse,coverage:"Önkoşul dersi"});
  }else if(topicKey==="docker"){
    if(matches(text,/\b(?:microvm|firecracker|gvisor|sandbox|isolation|kernel)\b/i))
      result=bridge({label:"Konteyner izolasyonu ve MicroVM",
        context:"Başlık veya etiketler çekirdek izolasyonu, sandbox ya da MicroVM mimarisine odaklanıyor.",
        why:"Paylaşımlı çekirdekli konteynerlerle donanım sanallaştırmalı ortamlar güvenlik ve başlatma maliyeti açısından ayrılır.",
        question:"Kaynak güvenlik sınırını nasıl çiziyor ve başlatma gecikmesini hangi katmanda ölçüyor?",
        primary:links.techCatalog,coverage:"Katalog sayfası"});
    else if(matches(text,/\b(?:kubernetes|k8s|pods?|deployments?|helm|ingress)\b/i))
      result=bridge({label:"Kubernetes ve orkestrasyon",
        context:"Başlık veya etiketler çoklu konteyner orkestrasyonu ve Kubernetes bileşenlerine işaret ediyor.",
        why:"Tek bir imajı çalıştırmak ile pod planlama, servis keşfi ve ölçekleme yönetimi farklı sorumluluklardır.",
        question:"Yazı pod yaşam döngüsünü mü, servis yönlendirmeyi mi, yoksa küme operasyonunu mu ele alıyor?",
        primary:links.techCatalog,coverage:"Katalog sayfası"});
    else if(matches(text,/\b(?:bgp|routing|network|interconnect|proxy|port)\b/i))
      result=bridge({label:"Konteyner ağı ve yönlendirme",
        context:"Başlık veya etiketlerde dağıtık ağ, yönlendirme ya da servis bağlantısı terimleri bulunuyor.",
        why:"Konteynerlerin dış dünya ve diğer servislerle konuşabilmesi için ağ geçidi ve port kurallarının net olması gerekir.",
        question:"Kaynakta bağlantı gecikmesini veya trafiği yöneten katman hangisi?",
        primary:links.techCatalog,coverage:"Katalog sayfası"});
  }else if(topicKey==="java"){
    if(matches(text,/\b(?:polymorphism|override|overloading|inheritance|oop)\b/i))
      result=bridge({label:"Java'da nesne yönelimli davranış",
        context:"Başlık veya etiketlerde override, polymorphism ya da kalıtımla ilişkili terimler var.",
        why:"Çalışma zamanı metot seçimiyle derleme zamanı referans türünü ayırabilmek bu konunun temelidir.",
        question:"Örnekte gerçek nesnenin türüyle referansın türü farklı mı?",
        primary:links.javaPoly,coverage:"Doğrudan ders"});
    else if(matches(text,/\b(?:spring\s*boot|springboot|spring\s+framework)\b/i))
      result=bridge({label:"Spring Boot ve Java uygulamaları",
        context:"Başlık/etiketler Spring Boot framework'üne işaret ediyor. Bu, doğrudan Java dilindeki bir yenilik anlamına gelmez.",
        why:"Framework kullanmadan önce Java metotları ve türleri konusunda sağlam temel edinmek gerekir. Spring Boot dersimiz yok.",
        question:"Bahsedilen özelliğin Spring Boot'a mı yoksa Java/JVM sürümüne mi ait olduğunu kontrol et.",
        primary:links.javaMethods,secondary:links.javaCourse,coverage:"Önkoşul dersi"});
  }
  return {...(result??topicDefault[topicKey](text)),basis:"Başlık ve varsa etiket eşleşmesi"};
}
