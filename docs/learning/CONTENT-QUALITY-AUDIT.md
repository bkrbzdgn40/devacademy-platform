# İçerik kalite denetimi: 23 ders için rubrik ve eksik tablosu

**Tarih:** 2026-11-21 · **Kapsam:** Yayımlanmış 5 kurs, 23 ders, 59 bilgi sorusu
**Yeniden puanlama:** 2026-11-21, Python Temelleri altın standardı (PR #51) birleştikten sonra.
Yalnızca Python satırları değişti; diğer 18 dersin içeriği değişmediği için puanları aynıdır.
**Durum:** Yalnızca masa başı içerik denetimi. Öğrenci verisi, pilot sonucu ya da
öğrenme etkisi ölçümü **içermez**. Puanlar, dersin hangi öğretim bileşenlerini
sunduğunu gösterir; öğrencinin ne öğrendiğini göstermez.

## 1. Amaç

İçeriği bir üst seviyeye taşımadan önce bugünkü durumu tek bir ölçütle görmek:

- Her ders `docs/content/CONTENT_MODEL.md` §4'teki sekiz parçalı ders yapısının
  ne kadarını karşılıyor?
- PRD P0'daki **tahmin → gözlem → yanlış varsayım → yeni problem → tekrar**
  akışının ne kadarını karşılıyor?
- En büyük boşluklar hangi derslerde ve hangi bileşenlerde?

Bu belge sonraki işin sırasını belirler. Önce Python Temelleri "altın standart"
olacak, ardından aynı kalıp diğer kurslara yayılacak (§6).

## 2. Yöntem

Puanlar dosyalardan otomatik çıkarıldı, ardından elle doğrulandı. Kaynak dosyalar:

| Kaynak | İçerik |
|---|---|
| `apps/web/src/data/lessons.json` | Hedef, açıklama, kod, akılda kalsın, önkoşul |
| `apps/web/src/data/questions.json` + `src/server/answer-keys.json` | Sorular, açıklamalar ve yanlış seçenek geri bildirimi |
| `apps/web/src/data/lesson-depth.json` | Model, tuzak, karşı örnek, alıştırma |
| `apps/web/src/data/lesson-guides.json` | Rehberli tahmin ve hata avcısı aşamaları |
| `apps/web/src/lib/studio-scenarios*.mjs` | Öğrenme Stüdyosu izleme senaryoları |
| `apps/web/src/data/*-applied-path.json` | Üç kademeli uygulamalı senaryo ve bağımsız görev |
| `apps/web/src/data/practice.json` + `src/server/transfer-missions.mjs` | Sunucuda değerlendirilen kod ve transfer görevleri |

Bir dersin ekranda neyi gösterdiği `apps/web/src/components/course-lesson.tsx`
üzerinden kontrol edildi. Rehberi (`lesson-guides.json`) olan dersler dört aşama
gösterir: Tahmin et, Anla ve izle, Hata avcısı, Uygula. Rehberi olmayan dersler
üç aşama gösterir: Öğren, Kodla, Test et.

## 3. Rubrik

On ölçüt vardır ve her biri 0–2 puan alır; en yüksek toplam 20'dir. Ölçütler
CONTENT_MODEL §4 ve PRD P0'dan türetildi. Yeni bir gereksinim eklenmedi.

| # | Ölçüt | 0 | 1 | 2 | Kaynak |
|---|---|---|---|---|---|
| K1 | **Hedef–ölçme hizası** | Hedefi hiçbir etkinlik sınamıyor | Hedefteki senaryo yalnızca notlanmayan uygulamada geçiyor | Notlanan soru veya görev hedefin kendisini sınıyor | §4.1 |
| K2 | **Önkoşul bağlantısı** | Gerekli önkoşul yok | – | Bağlantı var ya da kursun ilk dersi | §4.2 |
| K3 | **Açıklama derinliği** | 250 karakterden kısa, tek paragraf | 250 karakter ve üstü, ama tek paragraf ve çözümlü örnek yok | Zihinsel model, adım adım çözümlü örnek ve sınır durumu var | §4.3 |
| K4 | **Önce tahmin** | Açıklama, ilk sorudan önce geliyor | Stüdyoda tahmin var, ama açıklamadan sonra | İlk aşama, açıklama görülmeden yapılan tahmin | PRD P0 |
| K5 | **Yanlış kavrama / karşı örnek** | Yok | Tuzak ve karşı örnek var, ama kapalı bir bölmede | Ek olarak, yanlış varsayımı ayrı bir aşamada (hata avcısı) sınıyor | §4.5 |
| K6 | **Gözlem / izleme** | Yok | Durağan iz ya da örnek veri sayfası | Değişkenli, adım adım izleme stüdyosu | PRD P0 |
| K7 | **Geri bildirimli bilgi kontrolü** | Yok | 1–2 soru | En az 3 soru; her yanlış seçeneğe özel geri bildirim | §4.6 |
| K8 | **Kademeli pratik ve ipucu** | Yalnızca boş editör | Tek düzey | Üç kademe, her kademede ipucu | §4.7 |
| K9 | **Bağımsız, notlanan transfer** | Yok | Bağımsız görev var, ama yalnızca tarayıcı geri bildirimi (kanıt sayılmaz) | Sunucuda değerlendirilen bağımsız kod görevi | PRD P0 kanıt hiyerarşisi |
| K10 | **Kapanış** | Yok | Özet ve sonraki ders var, kaynak yok | Özet, kaynak bağlantısı ve sonraki ilgili kavram | §4.8 |

**Rubriğe alınmayan ama tüm derslerde aynı olan bileşenler:**

- `/tekrar` sayfası, oturum açmış öğrencinin cevapladığı her dersin sorularını
  aralıklı tekrara sokar.
- Ders tamamlama değerlendirmeye bağlıdır.

Bu bileşenler dersler arasında ayrım yapmadığı için puana katılmadı.

## 4. Eksik tablosu

| Ders | K1 | K2 | K3 | K4 | K5 | K6 | K7 | K8 | K9 | K10 | Toplam /20 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| javascript.let-const | 1 | 2 | 0 | 1 | 1 | 2 | 1 | 2 | 2 | 1 | **13** |
| javascript.equality | 1 | 2 | 0 | 1 | 1 | 2 | 1 | 2 | 1 | 1 | **12** |
| javascript.array-map | 1 | 2 | 0 | 1 | 1 | 2 | 1 | 2 | 2 | 1 | **13** |
| javascript.functions | 1 | 2 | 0 | 1 | 1 | 2 | 1 | 2 | 1 | 1 | **12** |
| javascript.scope | 1 | 2 | 0 | 1 | 1 | 2 | 1 | 2 | 1 | 1 | **12** |
| javascript.filter | 1 | 2 | 0 | 1 | 1 | 2 | 1 | 2 | 1 | 1 | **12** |
| javascript.async | 1 | 2 | 0 | 1 | 1 | 2 | 1 | 2 | 1 | 1 | **12** |
| java.variables | 1 | 2 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | **16** |
| java.methods | 1 | 2 | 0 | 2 | 2 | 2 | 2 | 2 | 1 | 1 | **15** |
| java.polymorphism | 1 | 2 | 1 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | **17** |
| python.variables | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **20** |
| python.conditions | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **20** |
| python.loops | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **20** |
| python.functions | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **20** |
| python.collections | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **20** |
| sql.select | 2 | 2 | 1 | 0 | 1 | 1 | 1 | 0 | 0 | 1 | **9** |
| sql.where | 2 | 2 | 1 | 0 | 1 | 1 | 1 | 0 | 0 | 1 | **9** |
| sql.join | 2 | 2 | 1 | 0 | 1 | 1 | 1 | 0 | 0 | 1 | **9** |
| sql.group | 2 | 2 | 1 | 0 | 1 | 1 | 1 | 0 | 0 | 1 | **9** |
| algorithms.complexity | 2 | 2 | 1 | 0 | 1 | 0 | 1 | 0 | 0 | 1 | **8** |
| algorithms.stack-queue | 2 | 2 | 1 | 0 | 1 | 0 | 1 | 0 | 0 | 1 | **8** |
| algorithms.map-set | 2 | 2 | 1 | 0 | 1 | 0 | 1 | 0 | 0 | 1 | **8** |
| algorithms.binary-search | 2 | 2 | 1 | 0 | 1 | 0 | 1 | 0 | 0 | 1 | **8** |

**Kurs ortalamaları (/20):**

| Kurs | Ortalama |
|---|---|
| Python | 20,0 (önce 16,4) |
| Java | 16,0 |
| JavaScript | 12,3 |
| SQL | 9,0 |
| Algoritmalar | 8,0 |

**Yalnızca Python derslerinin 2 aldığı ölçütler:**

- **K3 (açıklama derinliği).** Python dersleri artık "Anla ve izle" aşamasında
  görünür bir zihinsel model, hedef senaryoda adım adım çözümlü örnek ve sınır
  durumu gösterir (`lesson-walkthroughs.json`). Diğer 18 dersin açıklaması hâlâ
  tek paragraftır.
- **K10 (kapanış).** Python derslerinin her birinde 1–2 docs.python.org bağlantısı
  vardır. Diğer derslerde kaynak bağlantısı yoktur.

İlk denetimde hiçbir ders K3 ve K10'da 2 almıyordu; Python derslerinde K1 de 2
değildi.

**20/20 ne demek değildir.** Rubrik bileşenin varlığını ölçer. Python'un 20/20
alması, öğrencilerin bu derslerden daha iyi öğrendiğini göstermez. Bileşenlerin
kalitesine dair öz-inceleme bulguları `M9-PYTHON-GOLD-STANDARD-REVIEW.md` içindedir;
bu inceleme bağımsız değildir.

## 5. Bulgular

### B1. Hedef ile notlanan sorular arasında kopukluk (JavaScript, Java; Python'da giderildi)

Hedefler uygulamalı bir iş tarif ediyor, ama notlanan sorular tek satırlık oyuncak
kodlar soruyor. Aşağıdaki tablo ilk denetimdeki Python durumunu gösterir.

| Ders | Hedef | Notlanan sorular |
|---|---|---|
| `python.loops` | "Geçersiz sensör kayıtlarını atlayarak … doğru toplamı hesaplayabilmek." | `list(range(1, 6, 2))` ve `continue` çıktısı |
| `python.variables` | "Birim fiyat, adet ve teslimat ücretinden … iki ondalıkla yazdırabilmek." | Değişkene yeniden atama ve `5 / 2` türü |

Hedefteki senaryo yalnızca uygulamalı stüdyonun bağımsız görevinde geçiyor.
`python.variables` dersindeki `:.2f` biçimlendirmesi de yalnızca orada görünüyor.
Bu görev tarayıcı içi geri bildirimdir ve PRD'ye göre bağımsız kanıt sayılmaz.

SQL ve algoritma derslerinde hedef ile sorular uyumludur.

**Python'daki durum (yeniden puanlama).** Her Python dersine hedef senaryoyu sınayan
dördüncü bir notlanan soru eklendi; örneğin `python.loops` için negatif sensör
kayıtlarını atlayan toplam. `:.2f` biçimlendirmesi hem notlanan soruda hem de
sunucuda değerlendirilen `format_total` kod görevinde sınanıyor. Kalan zayıflık:
yeni sorular adım adım örneğe çok yakın yapıdadır, yani yakın transferi ölçer.

### B2. Açıklamalar ince

Açıklamalar 176–401 karakterdir; hepsi tek paragraftır ve çözümlü örnek yoktur.
Zihinsel model (`lesson-depth.json` içindeki `model`) var, ama "Kavramı karşı
örneklerle derinleştir" adlı kapalı bir bölmede duruyor. Öğrenci açmazsa
görmüyor. En zayıf grup JavaScript'tir (176–235 karakter).

Python'da giderildi: model, çözümlü örnek ve sınır durumu artık açık bir bölümde
gösteriliyor. Diğer 18 derste durum aynıdır.

### B3. Akış, rehberi olmayan 15 derste PRD sırasını bozuyor

Rehberi olan 8 derste (Python 5, Java 3) akış önce tahmin, sonra açıklamadır.
JavaScript, SQL ve algoritma derslerinde açıklama önce gelir, sorular en son
aşamadadır. Bu, "tahmin → gözlem" sırasının tersidir ve soruları "okuduğunu
hatırla" testine çevirir.

### B4. Sorular dar bir yelpazede

59 sorunun tamamı çoktan seçmeli ve neredeyse tamamı "bu kod ne yazdırır?"
biçimindedir. Ders başına soru sayısı:

- JavaScript, SQL ve algoritma derslerinde 2.
- Java derslerinde 3 (tahmin + hata avcısı).
- Python derslerinde 4 (tahmin + hata avcısı + iki uygulama sorusu).

Güçlü yan: her sorunun açıklaması ve her yanlış seçeneğe özel geri bildirimi var
(59/59).

Eksik kalan soru türleri:

- Kod tamamlama.
- Hatayı bulma (8 hata avcısı sorusu dışında).
- "Hangisi aynı sonucu verir?" türü karşılaştırma.
- Gerçek senaryoda karar verme.

### B5. Bağımsız ve notlanan kanıt 9 derste (ilk denetimde 6)

Sunucuda değerlendirilen kod görevi 9 derste var:

- `javascript.let-const`
- `javascript.array-map`
- `java.variables`
- `java.polymorphism`
- `python.variables` (`format_total`, yeni)
- `python.conditions` (`shipping_fee`, yeni)
- `python.loops`
- `python.functions`
- `python.collections` (`low_stock`, yeni)

Yeni görevlerin gizli test durumları yalnızca worker tarafındaki
`exercises-private.mjs` içindedir; istemciye yalnızca açık örnekler gider.

Diğer 6 JavaScript/Java dersinde bağımsız görev yalnızca tarayıcıda
geri bildirim verir. SQL ve algoritma derslerinde bağımsız görev hiç yoktur.

### B6. SQL ve algoritma kursları uygulamalı katmandan yoksun

Bu iki kursta üç şey eksik:

- Uygulamalı yol yok. SQL editörü düz metindir; algoritma derslerinde stüdyo yoktur.
- Rehberli hata avcısı yok.
- İzleme stüdyosu yok.

SQL'de yalnızca durağan örnek veri sayfası (`/sql-ornek-veri`) var.
Algoritmalar (8,0) ve SQL (9,0) en düşük puanlı kurslardır.

### B7. Kaynak ve süre iddiaları

- CONTENT_MODEL §4.8 "references" ister. Yalnızca Python derslerinde kaynak bağlantısı
  var (docs.python.org); diğer 18 derste yok.
- Ders süreleri 20–30 dakika olarak gösteriliyor. İçerik hacmi bu süreyi
  desteklemeyebilir, ancak bu pilot verisi olmadan doğrulanamaz.
- Seviye etiketleri, algoritmalar dışında hep "Başlangıç".

## 6. Önerilen sıra

Bu sıra PRD §7 ile uyumludur: dersleri sayıyı büyütmek için yeniden paketlemek
yok, yeni ders eklemek ikincil.

### 1. Python Temelleri altın standardı (5 ders)

**Durum: tamamlandı (PR #51), öz-inceleme bulguları açık.** Beş derste K1, K3, K9
ve K10 artık 2'dir. Eğitim incelemesi bağımsız bir gözden geçiren tarafından değil,
içeriği yazan ajan tarafından öz-inceleme olarak yapıldı
(`M9-PYTHON-GOLD-STANDARD-REVIEW.md`). Pilot kartları bu incelemeye göre yeniden
yazıldı. Bağımsız eğitim incelemesi ve gerçek pilot hâlâ yapılmadı.

Bu adımın hedefi beş derste K1, K3, K9 ve K10'u 2'ye çıkarmaktı.

- **Açıklama (K3):** Açıklamayı üç bölüme ayır: zihinsel model (bugünkü `model`
  alanı görünür hale gelir), hedef senaryoda adım adım çözümlü örnek ve sınır
  durumu.
- **Hedef hizası (K1):** Hedefteki senaryoyu sınayan en az bir notlanan soru
  ekle; örneğin sensör listesi toplamı. Oyuncak sorular ısınma olarak kalabilir.
- **Bağımsız kanıt (K9):** Bağımsız görevi sunucuda değerlendirilen kod görevine
  bağla; `variables`, `conditions` ve `collections` için yeni `practice.json`
  girdileri. Gizli test durumları istemciye gitmez.
- **Kaynak (K10):** Her derse 1–2 güvenilir kaynak bağlantısı ekle; Python resmi
  belgeleri.
- **İnceleme:** Eğitim incelemesi ve pilot kartlarının
  (`M9-PYTHON-PILOT-CARDS.md`) güncellenmesi.

### 2. JavaScript

Rehber verisi ekleyerek akışı tahmin-önce sırasına geçir (B3). Ardından açıklama
genişletme ve hedef hizası işini burada da yap.

### 3. Java

Önce Python kalıbını uygula. Ardından `java.methods` için kod görevi ekle.

### 4. SQL ve algoritmalar

Bu kurslarda üç iş var:

- Rehber ve hata avcısı ekle.
- Uygulamalı yol ekle. SQL için sonuçlar CI'da PostgreSQL ile doğrulanan
  öngörülmüş tablolar kullanılabilir; kod tarayıcıda yürütülmez.
- Algoritmalar için izleme stüdyosu senaryoları ekle.

Bu adım bir güvenlik/çalıştırma tasarımı gerektirebilir. Ayrı planlanmalıdır.

Her adımın sonunda bu tablo yeniden puanlanır. Öğrenme etkisi iddiası ancak
`M9-PILOT-PROTOCOL.md` uygulandıktan sonra yapılabilir.

## 7. Sınırlar

- Puanlar bileşenin **varlığını** ölçer, kalitesini kısmen ölçer. Örneğin bir
  karşı örneğin doğru yanlış kavramı hedefleyip hedeflemediği yalnızca örnekleme
  yoluyla okundu; 23 dersin tamamı satır satır incelenmedi.
- K3 için karakter eşiği kaba bir göstergedir. Uzun ama dağınık bir açıklama
  1 puan alabilir.
- Hiçbir puan öğrenci performansına dayanmaz.
