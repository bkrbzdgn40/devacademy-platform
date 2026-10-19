/*
 * Curated learning bridges for M10. Titles/tags are third-party metadata;
 * they are NOT summaries of articles and are never treated as instructions.
 * Links point to existing lessons or explicitly labelled preview catalog pages.
 */
const shortcut=(label,href,kind)=>({label,href,kind});
const links={
  pyCourse:shortcut("Python Temelleri kursu","/kurslar/python-temelleri","Temel hazırlık"),
  pyVars:shortcut("Python: Değişkenler ve türler","/kurslar/python-temelleri/degiskenler-ve-turler","İlgili ders"),
  pyConditions:shortcut("Python: Koşullar","/kurslar/python-temelleri/kosullar","İlgili ders"),
  pyLoops:shortcut("Python: Döngüler","/kurslar/python-temelleri/donguler","İlgili ders"),
  pyFunctions:shortcut("Python: Fonksiyonlar","/kurslar/python-temelleri/fonksiyonlar","Temel hazırlık"),
  pyCollections:shortcut("Python: Listeler ve sözlükler","/kurslar/python-temelleri/listeler-ve-sozlukler","Temel hazırlık"),
  jsCourse:shortcut("JavaScript Temelleri kursu","/kurslar/javascript-temelleri","Temel hazırlık"),
  jsVars:shortcut("JavaScript: let ve const","/kurslar/javascript-temelleri/degiskenler","Temel hazırlık"),
  jsAsync:shortcut("JavaScript: Asenkron işlemler ve Promise","/kurslar/javascript-temelleri/asenkron-temeller","İlgili ders"),
  jsMap:shortcut("JavaScript: map ile dönüşüm","/kurslar/javascript-temelleri/dizilerde-map","İlgili ders"),
  jsFilter:shortcut("JavaScript: filter ve reduce","/kurslar/javascript-temelleri/dizilerde-filter","İlgili ders"),
  jsFunctions:shortcut("JavaScript: Fonksiyonlar","/kurslar/javascript-temelleri/fonksiyonlar","Temel hazırlık"),
  javaCourse:shortcut("Java Temelleri kursu","/kurslar/java-temelleri","Temel hazırlık"),
  javaMethods:shortcut("Java: Metotlar ve return","/kurslar/java-temelleri/metotlar-ve-return","Temel hazırlık"),
  javaPoly:shortcut("Java: Çok biçimlilik","/kurslar/java-temelleri/polymorphism","İlgili ders"),
  sqlCourse:shortcut("SQL Temelleri kursu","/kurslar/sql-temelleri","Temel hazırlık"),
  sqlWhere:shortcut("SQL: WHERE ve NULL","/kurslar/sql-temelleri/where-ve-null","İlgili ders"),
  sqlGroup:shortcut("SQL: GROUP BY ve HAVING","/kurslar/sql-temelleri/group-by-ve-having","İlgili ders"),
  languageCatalog:shortcut("Diller kataloğu","/kutuphane/diller","Katalog önizlemesi"),
  techCatalog:shortcut("Teknolojiler kataloğu","/kutuphane/teknolojiler","Katalog önizlemesi")
};
const matches=(text,pattern)=>pattern.test(text);
function bridge({label,context,why,question,primary,secondary=null,coverage}){
  return {label,context,why,question,primary,secondary,coverage};
}
const topicDefault={
  python:()=>bridge({label:"Python ekosistemi",
    context:"Başlık veya etiketler Python ekosistemine işaret ediyor; makalenin ayrıntılarını henüz incelemedik.",
    why:"Dil temellerini bilmek bir kütüphane veya araç duyurusundaki örnekleri yorumlamayı kolaylaştırır.",
    question:"Kaynakta hangi dil özelliği veya araç etkileniyor? Mevcut kodunla hangi bağlantıyı kurabiliyorsun?",
    primary:links.pyCourse,coverage:"genel temel"}),
  javascript:()=>bridge({label:"JavaScript ekosistemi",
    context:"Başlık veya etiketlerde JavaScript ya da Node.js ile ilişkili terimler bulunuyor.",
    why:"Sözdizimi ve fonksiyon bilgisini yeni çalışma ortamlarıyla ilişkilendirmek daha sağlıklı bir başlangıçtır.",
    question:"Söz konusu değişiklik JavaScript dilinde mi, yoksa araç/çalışma ortamında mı?",
    primary:links.jsCourse,coverage:"genel temel"}),
  java:()=>bridge({label:"Java ekosistemi",
    context:"Başlık veya etiketler Java ya da JVM ekosistemine işaret ediyor.",
    why:"Dil ve nesne yönelimli programlama bilgisi, framework ve sürüm duyurularını ayırt etmeyi sağlar.",
    question:"Kaynak bir Java dil değişikliğinden mi, JVM'den mi, yoksa ayrı bir framework'ten mi bahsediyor?",
    primary:links.javaCourse,coverage:"genel temel"}),
  typescript:()=>bridge({label:"TypeScript ve tip güvenliği",
    context:"Başlık veya etiketlerde TypeScript'e ilişkin bir konu bulunuyor.",
    why:"TypeScript, JavaScript üzerine tip denetimi ekler; doğrudan TypeScript kursumuz henüz yok.",
    question:"Kaynakta bahsedilen değişiklik derleme zamanı tip denetimini mi, çalışma zamanındaki JavaScript'i mi etkiliyor?",
    primary:links.languageCatalog,secondary:links.jsVars,coverage:"katalog ve önkoşul"}),
  react:()=>bridge({label:"React ve bileşenler",
    context:"Başlık veya etiketler React ekosistemiyle ilişkili.",
    why:"React bileşenlerini anlamak için JavaScript fonksiyonları iyi bir temel oluşturur. Henüz React dersimiz yok.",
    question:"Söz konusu özellik React'e mi ait, yoksa genel JavaScript davranışı mı?",
    primary:links.techCatalog,secondary:links.jsFunctions,coverage:"katalog ve önkoşul"}),
  postgres:()=>bridge({label:"Veritabanı ve SQL",
    context:"Başlık veya etiketler SQL ya da veritabanı araçlarını işaret ediyor.",
    why:"SELECT, WHERE, JOIN ve GROUP BY temelleri sorgu, tablo ve raporlama konularını ayırt etmene yardım eder.",
    question:"Kaynağın konusu sorgu yazma mı, veri tutarlılığı mı, performans mı, yoksa yönetim mi?",
    primary:links.sqlCourse,coverage:"temel hazırlık"}),
  docker:()=>bridge({label:"Konteynerler ve dağıtım",
    context:"Başlık veya etiketlerde Docker ya da konteyner ekosistemi var.",
    why:"Uygulama kodu ile onu paketleyen/çalıştıran ortam farklı katmanlardır. Henüz konteyner dersi sunmuyoruz.",
    question:"Kaynak imaj oluşturma, çalıştırma, dağıtım veya orkestrasyon konularından hangisini ele alıyor?",
    primary:links.techCatalog,coverage:"katalog önizlemesi"}),
  async:()=>bridge({label:"Asenkron JavaScript akışı",
    context:"Başlık veya etiketler Promise, async/await ya da event loop terimleri içeriyor.",
    why:"Promise ve microtask sıralamasını anlamak bu ifadeleri okurken somut bir temel sağlar.",
    question:"Örnekte senkron ve asenkron işlemlerin hangi sırada gerçekleştiğine bak.",
    primary:links.jsAsync,coverage:"doğrudan ders"})
};

const releaseBridges={
  "nodejs/node":()=>bridge({label:"Node.js sürüm duyurusu",
    context:"Bu bağlantı Node.js deposunun yayımlanmış sürüm kaydıdır. Değişiklik listesi için kaynak sürüm notlarını aç.",
    why:"Node.js bir JavaScript çalışma ortamıdır; dil özellikleri ile çalışma ortamına özgü API'leri ayırmak önemlidir.",
    question:"Sürüm notunda davranışı değişen API, uyumluluk veya güvenlik başlığı var mı? Bunlar hangi sürümleri etkiliyor?",
    primary:links.jsAsync,secondary:links.jsCourse,coverage:"temel hazırlık"}),
  "microsoft/TypeScript":()=>bridge({label:"TypeScript sürüm duyurusu",
    context:"Bu bağlantı TypeScript deposunun yayımlanmış sürüm kaydıdır. Ayrıntılar resmî sürüm notlarındadır.",
    why:"Tip kontrolü ile üretilen JavaScript'in çalışma zamanındaki davranışını birbirinden ayırmak gerekir.",
    question:"Yenilik tip sistemini mi, derleyici ayarlarını mı, yoksa çıktıyı mı etkiliyor?",
    primary:links.languageCatalog,secondary:links.jsVars,coverage:"katalog ve önkoşul"}),
  "facebook/react":()=>bridge({label:"React sürüm duyurusu",
    context:"Bu bağlantı React deposunun yayımlanmış sürüm kaydıdır. Duyurunun ayrıntısı resmî kaynakta yer alır.",
    why:"Bileşen mantığını kavramak için JavaScript fonksiyonları ve durum değişimlerini bilmek gerekir.",
    question:"Bu sürümde bahsedilen davranış React'e mi, genel JavaScript'e mi ait? Geçiş adımı var mı?",
    primary:links.techCatalog,secondary:links.jsFunctions,coverage:"katalog ve önkoşul"}),
  "astral-sh/ruff":()=>bridge({label:"Ruff sürüm duyurusu",
    context:"Bu bağlantı Python kod denetimi/biçimlendirme aracı Ruff'ın yayımlanmış sürüm kaydıdır.",
    why:"Kodun çalışmasıyla kodun biçimi ve statik kontrolü aynı şey değildir. Ruff için özel dersimiz henüz yok.",
    question:"Sürüm notunda hangi kural, biçimlendirme davranışı veya uyumluluk değişiyor?",
    primary:links.pyFunctions,secondary:links.pyCourse,coverage:"temel hazırlık"}),
  "spring-projects/spring-boot":()=>bridge({label:"Spring Boot sürüm duyurusu",
    context:"Bu bağlantı Java framework'ü Spring Boot'un yayımlanmış sürüm kaydıdır.",
    why:"Spring Boot bir Java sürümü değildir; Java temelleri framework kodlarını okumak için hazırlık sağlar.",
    question:"Kaynakta hangi Spring Boot özelliği veya desteklenen sürüm değişiyor?",
    primary:links.javaMethods,secondary:links.javaCourse,coverage:"temel hazırlık"})
};

export function selectRadarLearning({title="",tags=[],topicKey,releaseRepo=null}={}){
  if(!Object.hasOwn(topicDefault,topicKey))return null;
  const text=[title,...(Array.isArray(tags)?tags:[])].filter(x=>typeof x==="string").join(" ").slice(0,700);
  if(releaseRepo&&Object.hasOwn(releaseBridges,releaseRepo)){
    return {...releaseBridges[releaseRepo](),basis:"Doğrulanmış depo sürüm kaydı"};
  }
  let result=null;
  if(topicKey==="python"){
    if(matches(text,/\b(?:asyncio|async\s+def|python\s+async|async\s+python)\b/i))
      result=bridge({label:"Python'da asyncio ve eşzamanlılık",
        context:"Başlık/etiketler Python asenkron programlama alanına işaret ediyor. JavaScript Promise dersi bu konunun doğrudan karşılığı değildir.",
        why:"Python asyncio ve JavaScript Promise farklı ekosistemlere aittir; Python'daki özel async konusunun dersi henüz yok.",
        question:"Kaynakta async fonksiyon, event loop veya coroutine terimlerinden hangisi geçiyor? Nasıl kullanıldığını asıl kaynaktan kontrol et.",
        primary:links.pyFunctions,secondary:links.pyCourse,coverage:"temel hazırlık"});
    else if(matches(text,/\b(?:pandas|numpy|dataframes?|data\s+processing|data\s+analysis|polars|dictionaries|lists?)\b/i))
      result=bridge({label:"Python'da veri yapıları ve kütüphaneler",
        context:"Başlık/etiketlerde Python veri işleme ve koleksiyonlarıyla ilgili terimler bulunuyor.",
        why:"Listeler ve sözlükler, daha gelişmiş veri işleme araçlarına geçmeden önce gereken temel kavramlardandır.",
        question:"Veri yapılarını incele: Liste, sözlük, tablo veya dizi hangi işi üstleniyor?",
        primary:links.pyCollections,coverage:"temel hazırlık"});
    else if(matches(text,/\b(?:pytest|unittest|testing|tests?|linting|linter|ruff)\b/i))
      result=bridge({label:"Python'da test ve kod kalitesi",
        context:"Başlık/etiketlerde Python test veya kod kalite araçlarıyla ilişkili terimler var.",
        why:"Test edilebilir, return değeri üreten küçük fonksiyonlar yazabilmek iyi bir başlangıçtır. Özel test/kalite dersimiz yok.",
        question:"Araç doğruluk mu, stil mi, tip kontrolü mü denetliyor? Testin neyi kanıtladığına bak.",
        primary:links.pyFunctions,coverage:"temel hazırlık"});
    else if(matches(text,/\b(?:securit(?:y|ies)|vulnerabilit(?:y|ies)|cve-\d{4}-\d+|exploit|patch)\b/i))
      result=bridge({label:"Python ve güvenlik duyuruları",
        context:"Başlık/etiketler Python bağlamında bir güvenlik konusuna işaret ediyor; başlığın doğru ve etkisinin gerçek olduğunu ayrıca doğrulamak gerekir.",
        why:"Güvenlik duyurularını yorumlamak için etkilenen sürüm, tehdit modeli ve düzeltme bilgisi gerekir. Güvenlik kursumuz yok.",
        question:"Duyurunun birincil kaynağında etkilenen sürümler, çözüm ve yayımlanma tarihi belirtiliyor mu?",
        primary:links.pyCourse,coverage:"genel temel"});
    else if(matches(text,/\b(?:python\s+3(?:\.\d+)?|cpython|language\s+release|release\s+notes|version)\b/i))
      result=bridge({label:"Python sürüm ve dil gelişmeleri",
        context:"Başlık/etiketlerde Python sürümü veya dil gelişmesiyle ilgili terimler bulunuyor.",
        why:"Sürüm değişikliklerini yorumlarken dil sözdizimiyle bağımlı paketlerin davranışını ayırmak gerekir.",
        question:"Değişiklik dilin kendisinde mi, standart kütüphanede mi yoksa üçüncü taraf bir araçta mı?",
        primary:links.pyVars,secondary:links.pyCourse,coverage:"temel hazırlık"});
    else if(matches(text,/\b(?:loops?|range|iteration|for-loop)\b/i))
      result=bridge({label:"Python döngüleri",
        context:"Başlık/etiketlerde Python döngüleri veya yineleme terimleri bulunuyor.",
        why:"range, break ve continue davranışlarını bilmek yineleme örneklerinin kontrol akışını açıklamayı kolaylaştırır.",
        question:"Döngünün başlangıç, bitiş ve geçersiz kayıt davranışı nasıl?",
        primary:links.pyLoops,coverage:"doğrudan ders"});
    else if(matches(text,/\b(?:conditional|if-else|truthiness)\b/i))
      result=bridge({label:"Python koşulları",
        context:"Başlık/etiketlerde koşullar veya doğruluk değeri davranışı bulunuyor.",
        why:"if/elif sırası ve sınır koşulları örnekleri anlamada belirleyicidir.",
        question:"Koşulda hangi değerlerin True veya False sayıldığına bak.",
        primary:links.pyConditions,coverage:"doğrudan ders"});
  }else if(topicKey==="javascript"||topicKey==="async"){
    if(matches(text,/\b(?:promises?|async\/await|event\s+loop|microtasks?|asynchronous)\b/i))
      result=topicDefault.async();
    else if(matches(text,/\b(?:map\s*\(|array\.map|array\s+map)\b/i))
      result=bridge({label:"JavaScript dizilerinde map",
        context:"Başlık veya etiketler dizilerde map dönüşümünü işaret ediyor.",
        why:"map yönteminin yeni bir dizi üretmesi ve callback dönüş değeri bu konunun temelidir.",
        question:"Örnekte kaynak dizi değişiyor mu, yoksa yeni bir dizi mi oluşuyor?",
        primary:links.jsMap,coverage:"doğrudan ders"});
    else if(matches(text,/\b(?:filter\s*\(|reduce\s*\(|array\.filter|array\.reduce)\b/i))
      result=bridge({label:"JavaScript filtreleme ve biriktirme",
        context:"Başlık/etiketlerde filter veya reduce yöntemleri bulunuyor.",
        why:"Bir diziyi süzmek ve sonuçları toplamak farklı işlemlerdir.",
        question:"Örnek filtreleme mi yapıyor, toplam mı hesaplıyor, yoksa ikisini mi?",
        primary:links.jsFilter,coverage:"doğrudan ders"});
    else if(matches(text,/\b(?:node\.?js|nodejs|npm|package\s+manager|runtime)\b/i))
      result=bridge({label:"Node.js ve çalışma ortamı",
        context:"Başlık/etiketler Node.js ya da JavaScript araçlarına işaret ediyor.",
        why:"Bir dilin özellikleri ile çalışma ortamının sağladığı API'leri ayırmak önemlidir.",
        question:"Kaynakta değişen davranış JavaScript diline mi, Node.js'e mi, paket yöneticisine mi ait?",
        primary:links.jsCourse,coverage:"temel hazırlık"});
  }else if(topicKey==="java"){
    if(matches(text,/\b(?:polymorphism|override|overloading|inheritance|oop)\b/i))
      result=bridge({label:"Java'da nesne yönelimli davranış",
        context:"Başlık veya etiketlerde override, polymorphism ya da kalıtımla ilişkili terimler var.",
        why:"Çalışma zamanı metot seçimiyle derleme zamanı referans türünü ayırabilmek bu konunun temelidir.",
        question:"Örnekte gerçek nesnenin türüyle referansın türü farklı mı?",
        primary:links.javaPoly,coverage:"doğrudan ders"});
    else if(matches(text,/\b(?:spring\s*boot|springboot|spring\s+framework)\b/i))
      result=bridge({label:"Spring Boot ve Java uygulamaları",
        context:"Başlık/etiketler Spring Boot framework'üne işaret ediyor. Bu, doğrudan Java dilindeki bir yenilik anlamına gelmez.",
        why:"Framework kullanmadan önce Java metotları ve türleri konusunda sağlam temel edinmek gerekir. Spring Boot dersimiz yok.",
        question:"Bahsedilen özelliğin Spring Boot'a mı yoksa Java/JVM sürümüne mi ait olduğunu kontrol et.",
        primary:links.javaMethods,secondary:links.javaCourse,coverage:"temel hazırlık"});
  }
  return {...(result??topicDefault[topicKey]()),basis:"Başlık ve varsa etiket eşleşmesi"};
}
