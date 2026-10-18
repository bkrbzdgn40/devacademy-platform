# DevAcademy · Güncel Ürün Yol Haritası

**Sürüm:** 0.2 · **Güncelleme:** 2026-10-18
**Konum:** Yerel çalışan öğrenme prototipi. İnternet üzerinden kullanıma açılmış ürün değil.
**Kural:** Bu belge güncel ürün planıdır; eski M0–M8 numaraları tarihi uygulama kayıtlarıdır.
Takvim veya bağımsız güvenlik onayı vaat edilmez.

## Şu anda doğruladığımız durum

- Yayınlanan **3 eğitim kursu**, **15 ders**: JavaScript (7), Java (3), Python (5).
- 38 yayımlanmış bilgi sorusu; 45 gözden geçirilmiş, gerçek JS/Java/Python
  çalışma ortamında CI ile karşılaştırılmış Öğrenme Stüdyosu senaryosu.
- Öğretici çıktı tahmini, satır izleme, karşı örnek, rehberli hata düzeltme
  ve kayıtlı ders ilerlemesi; zamanlanmış tekrar.
- Sadece **altı kavram** için M8.1–M8.2 bağımsız çıktı tahmini/gecikmiş
  kanıt ve M8.3 bağımsız kod yazma görevi vardır. Bunlar 15 dersin
  tamamına otomatik olarak yayılmış veya öğrenci üzerinde kanıtlanmış değildir.
- JavaScript/Python/Java öğrenci kodunu güvenilir testlerle değerlendirme
  yalnızca açıkça etkinleştirilen özel localhost Docker laboratuvarında vardır.
  Genel internet kod çalıştırıcısı ve üretim dağıtımı **yoktur**.
- Açık/koyu toprak-zeytin teması, gerçek kurs/ders araması, ders çalışma
  alanı ve kişisel ilerleme panosu mevcut. Sektör Radarı şimdilik kaynak
  tanıtımıdır; **canlı haber API'si yoktur**.
- Otomatik CI başarıları yazılım davranışını doğrular. Gerçek öğrencide
  kalıcı öğrenme kazanımı **henüz ölçülmemiştir**.

## Ürün öncelikleri

### M9 · Gerçek Öğrenme Deneyimi (aktif, tek bütünleşik ürün paketi)

**Problem:** Ders tamamlamak, verilen kodun çıktısını tahmin etmek ve bağımsız
kod yazabilmek ayrı kazanımlardır. Öğrencinin önündeki doğru adım ve kanıtın
sınırları anlaşılır olmalıdır.

**Ürün sonucu:** Bir öğrenci, Türkçe hazırlanmış tutarlı bir öğrenme yolunda
kavramı açıklayabilir, tahmin edebilir, yanlış varsayımını araştırabilir,
başka bir duruma aktarabilir ve mümkün olduğunda kendi kodunu oluşturabilir.

**Tek paket içinde yapılacaklar:**
- Var olan ders, tekrar, transfer ve kod kanıtı kayıtlarından **dürüst ve
  eyleme dönük öğrenme önerisi**. Ders tamamlama asla mastery etiketi olmaz.
- Öncelikle **Python Temelleri'nin beş dersinde** öğretim akışını baştan
  sona gözden geçir: yanlış anlama, gerçek kullanım, kademeli ipucu,
  bağımsız senaryo, sağlam geri bildirim ve konu bağlantısı.
- Değerlendirilebilen görevler ile yalnızca serbest kod düzenlenebilen
  oturumları açıkça ayır. Laboratuvar kapalıyken kodu değerlendirildi gibi
  sunma; teknik kontrollere aykırı bir yeni public runner açma.
- Mevcut kimlik/ilerleme şemasını mümkün olduğunca yeniden kullan;
  öğrenme açısından gerekmedikçe yeni DB tablosu veya karmaşık ajan yok.
- Gerçek öğrencilerle düşük riskli pilot için karşılaştırılabilir yeni
  görevler, ön test/son test/gecikmeli test ve gözlem rehberi hazırla.
  Toplanmayan veriyi ölçülmüş başarı gibi raporlama.
- Python akışında kabul edilen öğrenme modelini Java ve JavaScript'e
  içerik değerlendirmesiyle uygula. Yeni ders sayısı ikincil ölçüttür.

**M9 kabul kapısı:**
1. Bir öğrenci Python Temelleri'nin bütün mevcut derslerini bilgisayar ve
   mobilde anlaşılır bir akışla bitirebilmeli ve gerçek bir sonraki adımı
   görmeli. Hata/oturum/DB-yok durumlarında sahte kayıt gösterilmemeli.
2. Öğretici yardım ve bağımsız doğrulama UI'si/ölçümleri birbirinden
   ayrı tutulmalı. Programın başarısı, açık/gizli worker testleri yokken
   uydurulmamalı.
3. Yeni içerik için uzman teknik kontrol, doğrulanabilir kaynak/çıktı,
   örnek çözümler ve karşı örnekler şart.
4. Mobil erişilebilirlik, klavye, normal/koyu tema, doğru öneri,
   regresyon testleri başarılı olmalı.
5. Gönüllü pilotun yöntemi belirlenmiş, gerçek veriler ayrı raporlanmış
   olmalı. *Öğrenme etkisi* yalnızca bunlar ölçüldüyse iddia edilebilir.

### M10 · Sektör Radarı ve Teknoloji Keşfi

**Problem:** Geliştiricilerin güncel teknoloji haberi ile öğrendikleri
kavramlar arasındaki bağ zayıf.

**Ürün sonucu:** Tarihli, kaynak bağlantılı ve dersle ilişkilendirilmiş
güncel yazılım bilgisi.

**Tek paket kapsamı:** Hacker News ve DEV Community gibi topluluk
kaynaklarının resmî API/erişim koşullarını, GitHub Releases gibi birincil
sürüm kaynaklarını doğrula. Gerçek published/checked tarihlerini göster,
kanonik URL, duplicate ayıklama, kaynağın türü ve eskimiş veri davranışı
sun. Haber içeriği dersleri önermek için kullanılabilir ama kaynaktaki
talimatlar uygulama talimatı olarak yürütülemez. Otomatik özetlerin
doğruluğu ve telif koşulları kontrol edilir.

**M10 kabul kapısı:** Sıfır hayali manşet; haberin gerçek bağlantısı,
yayın tarihi, doğrulama zamanı ve neden ilgili olduğu açıklanır.
Kaynak erişilemiyorsa şeffaf boş/hata durumu gösterilir.

### M11 · Öğrenci Doğrulaması ve Kontrollü Genişleme

**Problem:** Otomatik testler, öğreticiliğin gerçek hayattaki etkisini
tek başına göstermez.

**Ürün sonucu:** Gönüllü öğrenci oturumlarıyla düzeltilmiş deneyim ve
kalitesi kanıtlanabilir içerik genişlemesi.

**Tek paket kapsamı:** Temsil kabiliyeti sınırlı pilot katılımcılarında
ön/son ve gecikmeli bağımsız görev ölçümü; anlaşılabilirlik, yardım
bağımlılığı, takıldığı aşamalar ve erişilebilirlik analizi. Sonuçlara
göre TypeScript, SQL, veri yapıları, algoritmalar ve proje laboratuvarları
için öncelik belirle. Esoterik COW/MOO veya AI mentor yalnızca açık
öğretim faydası gösteren ayrı adaylardır; otomatik kapsam genişlemesi yok.

**M11 kabul kapısı:** Pilot veri ve sınırlamalar açıkça raporlanır;
hangi içeriğin neden geliştirildiği kanıtla açıklanır; yeni dersler
teknik/öğretim kontrolünden geçer.

## Üretim / güvenlik sınırı (şu anda ürün önceliği değil)

Yeni internet dağıtımı, genel kullanıma açık untrusted kod çalıştırma,
yapay zekâ mentorluk ve operasyonel genişleme M9–M11'e gizlice eklenmez.
Var olan yetkilendirme, veri gizliliği, sandbox sınırlamaları ve regresyon
testleri korunur. Bir ürün çıktısı bu sınırı değiştirmek zorundaysa
**durulur ve ayrı karar/kanıt** gerekliliği açıkça belirtilir.

## Teslimat yönetimi: atomik görevlerden ürün hedefine

- Kullanıcıya **M9, M10, M11** hedefleri raporlanır. Hata düzeltmeleri
  yeni M8.6C.1.2 kilometre taşları olarak adlandırılmaz.
- Her büyük hedefin içinde tasarım, içerik, uygulama, değerlendirme,
  test, erişilebilirlik ve ölçüm birlikte ele alınır.
- Aynı anda **bir aktif PR**; ancak büyük hedef için güvenle bölünebilen
  birkaç anlamlı PR olabilir. PR başına mümkünse tek mantıklı commit/squash.
- Sonuç kullanıcıya gösterilmeden "bitti" denmez. GitHub CI geçtiyse yalnızca
  kod doğrulamasının geçtiği söylenir; üretim deploy veya pilot başarısı
  iddia edilmez.
- Açık kritik kusur olmamalı, var olan öğrenme kanıtları ve güvenlik
  garantileri bozulmamalı. Geri bildirim doğrudan aynı ürün hedefine bağlanır.

## Tarihi kilometre taşları (arşiv, yapılacak liste değil)

M0–M3: Temel mimari, kimlik, çalışma motoru ve yerel değerlendirme.
M4–M7: Ders motoru, kurs üretimi, Java/Python öğretimi, tekrar ve
yerel kod değerlendirmeleri. Bunların tarihî başlıkları tam olarak
ilk yol haritasında vaat edilen tüm public runtime, içerik ve haber
hedeflerinin tamamlandığı anlamına gelmez.
M8: Güvenlik/performans düzeltmeleri, karşıolgusal kanıt,
uyarlamalı deney, bağımsız kod transferi, Öğrenme Stüdyosu ve
Olive & Earth arayüz yenilemesi. Son M8.6C birleşimi: PR #34.

**Ürün kapsamının gerçek durumu için PRD ve güncel kod esas alınır.**
