# M11 · SQL Temelleri: kontrollü içerik genişlemesi

**Durum:** İlk içerik paketi. Yazılım ve örnek sorgu doğrulaması CI ile yapılır;
**öğrenme etkisi ve gönüllü pilot henüz doğrulanmadı**.

## Öğrenme yolu ve söz

SQL Temelleri dört sıralı ders içerir:

| Sıra | Ders | Ölçülebilir hedef | Yanlış varsayım |
|---|---|---|---|
| 1 | SELECT ve ORDER BY | İstenen iki sütunu, açık sıralamayla seçme | Sorgu sonucu kendiliğinden sıralıdır |
| 2 | WHERE, AND, NULL | İki koşulla filtreleme, eksik tarihi IS NULL ile bulma | = NULL ile eşleşir |
| 3 | INNER ve LEFT JOIN | Eşleşmeyen müşteriyi koruyarak ilişkiyi çözme | Her iki JOIN aynı sonucu verir |
| 4 | GROUP BY, COUNT, HAVING | Yalnızca teslim edilen siparişleri grup bazında toplama | WHERE ile SUM filtresi aynı şey |

**Sabit kurgusal veri:** /sql-ornek-veri. GitHub'daki
`apps/web/tests/fixtures/m11-sql-seed.sql` dosyası aynı kaydı geçici PostgreSQL
tablolarına yazar. Bu senaryoda 3 müşteri, 5 sipariş vardır:
Ayşe (1), Bora (2), Can (3); Can'ın siparişi yoktur.
10=120 teslim, 11=80 bekliyor ve teslim tarihi NULL,
12=200 teslim, 13=50 teslim, 14=100 teslim.
Örneklerin metni ve sonuçları buna bağlıdır; canlı öğrenci verisine **asla** bağlanmaz.

## Editoryal kalite ve çalışma sınırı

- `courses.json`, `lessons.json`, `questions.json` ve server-only
  `answer-keys.json` birlikte yayımlanır; doğru seçenekler tarayıcıdaki
  veri dosyasına konulmaz.
- `lesson-depth.json` dört derste model, yaygın hata, karşı örnek,
  neden, düşünme sorusu ve uygulama sağlar.
- Her öğrenci kodu düz metin editöründedir (`editorLanguage: plain`);
  ne tarayıcıdan ne de Next.js API'sinden SQL yürütülür.
  `runtimeId: null`, `run: false`, `codeAssessment: false`.
- **Değerlendirilen:** 8 bilgi sorusu; oturum açmış öğrencinin doğru/yanlış
  denemeleri ve rehberli ders tamamlaması mevcut PostgreSQL yapısına kaydedilir.
- **Değerlendirilmeyen:** Editörde yazılan SQL sorgusu, çalışma zamanı
  başarı puanı, bağımsız sorgu yazma kanıtı, otomatik uzman değerlendirmesi.
  DevAcademy bunları kazanılmış yetkinlik saymaz.
- Öğretim örnekleri `node apps/web/tests/sql-postgres-fixtures.mjs` ile
  ayrı `devacademy_sql_ci` veritabanında Postgres 16'ya karşı sınanır.
  Script yalnızca localhost'a izin verir, geçici tablolar kullanır
  ve kullanıcı uygulama veritabanını kabul etmez.
- SQL JOIN, NULL, sıralama ve grup örnekleri Postgres 16 semantiğine göredir.
  Diğer DB sürümleri/ürünleri test edilmeden eşdeğer ilan edilmez.

## Ön test / son test / gecikmeli test kapısı (henüz gerçekleşmedi)

Gönüllü bir pilot yapılacaksa M9'daki katılımcı ve rıza rehberi korunur:
`docs/learning/M9-PILOT-PROTOCOL.md`,
`docs/learning/M9-PYTHON-PILOT-FACILITATOR.md` ve
`docs/learning/M9-PYTHON-PILOT-CARDS.md`.
Bunlar **Python** ölçüm formlarıdır; SQL için otomatik geçerli bir
ön/son karşılaştırması oluşturmaz.

M11 SQL pilotu için yeni, çözümü derste görünmeyen üç eşdeğer
müşteri/sipariş veri varyantı hazırlanmalı. Aynı öğrencide
öğrenme öncesi, ders sonrası ve en erken 24 saat sonra farklı
varyant kullanılmalı. Erişilebilirlik, yardım bağımlılığı,
yanlış WHERE/HAVING/NULL yorumu, sorguyu kendi yazabilme ve geri
bildirimin anlaşılması gözlenmeli. Katılımcının kimliği toplanmadan
rıza ve veri silme prosedürü belirlenmeli. Bu görevleri daha sonra
uygulama veya bir gözlemci olmadan kendiliğinden yapılmış saymayın.

### Nihai M11 kabul ölçütü

1. Yeni derslerin SQL sorguları/cevap anahtarları gerçek PostgreSQL
   ortamında doğrulanmış olmalı.
2. Kişisel ilerlemenin yanlış raporlanması, genel SQL runner veya
   kamuya açık kullanıcı kodu çalıştırma API'si eklenmemeli.
3. Gerçek gönüllülerin ön/son/gecikmeli SQL değerlendirmesi,
   anonim rapor ve sınırlamaları bulunmalı.
4. Pilot sonuçlarıyla TypeScript/veri yapıları/algoritmalar/proje
   laboratuvarlarının sonraki içerik sırası gerekçelendirilmeli.

İlk iki koşul kodla denetlenebilir. Son iki koşul henüz tamamlanmadı.
