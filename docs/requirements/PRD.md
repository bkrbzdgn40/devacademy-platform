# DevAcademy · Ürün Gereksinimleri

**Sürüm:** 0.2 · **Güncelleme:** 2026-10-18
**Statü:** Yerel çalışan ürün prototipi; henüz genel internet ürünü değil.
**Strateji:** Önce öğreticilik ve içerik; ardından güncel sektör bilgisi
ve gerçek öğrenci doğrulaması. Ayrıntılar [güncel yol haritasında](../roadmap/ROADMAP.md).

## 1. Ürün sözü

DevAcademy, Türkçe olarak yazılım öğrenen kişinin:
- yeni bir kavramı kendi sözleriyle açıklamasına,
- küçük bir programın davranışını tahmin etmesine,
- yanlış varsayımının neden yanlış olduğunu görmesine,
- yeni örnekte bağımsız karar vermesine ve
- uygun doğrulama ortamında çalışır kod yazmasına

yardım etmeyi amaçlar.

**Ders bitirme, bir defa doğru yanıt, 24 saat sonraki doğrulama ve
kod üretme birbirinin yerine kullanılamaz.** Mevcut testler pedagojinin
öğrencide etkili olduğunu kanıtlamaz. Teklif ettiğimiz öğrenme etkisi
henüz saha çalışmasında doğrulanmamıştır.

## 2. Hedef kullanıcılar

- Yeni başlayan: kavramı küçük bir problemde **ezberlemeden** kullanmak.
- Üniversite öğrencisi: fonksiyon, nesne yönelimli programlama,
  algoritma ve hata ayıklamayı nedenleriyle öğrenmek.
- Çalışan geliştirici: kavramın başka dil/ekosistemdeki karşılığını görmek.
- Meraklı öğrenci: COW gibi sıra dışı dilleri de doğru kategoride keşfetmek.

Birincil öğretim ve arayüz dili Türkçedir. İçeriğin yayımlanmış görünmesi
otomatik olarak başka dillere çevrilmiş olduğunu göstermez.

## 3. Bugün teslim edilmiş kapsam (2026-10-18)

| Yetenek | Gerçek kapsam / sınır |
| --- | --- |
| Kurslar | JavaScript 7, Java 3, Python 5 olmak üzere 15 ders / 3 kurs |
| Soru | 38 gözden geçirilmiş yayımlanmış bilgi sorusu |
| Öğrenme Stüdyosu | 15 dersin tamamında 3'er hazır, CI'da gerçek dillerle doğrulanmış kod izleme varyantı (45) |
| Öğretici açıklama | Kavram modeli, karşı örnek, yaygın hata, örneği adım adım takip ve ipuçları |
| Değerlendirme | Sunucuda derecelendirilen quiz; kılavuzlu hata seçimi, bireysel kanıtlarla aynı değil |
| Bağımsız kanıt | 6 kavramda çıktı tahmini, uyarlamalı teşhis ve en az 24 saat sonra bağımsız tekrar |
| Kod yazma | 6 kavramda kod yazma transfer görevi; worker doğrulaması yalnızca izole, açıkça etkin yerel laboratuvar |
| Hesaplar | PostgreSQL kurulmuş yerel ortamda kullanıcı, oturum ve kaydedilmiş ilerleme |
| Kişisel tekrar | Hata ve doğru cevaplara göre sıradaki tekrar zamanı; bağımsız kod becerisi puanı değil |
| Tasarım | Olive & Earth açık/koyu tema, kurs/ders keşfi, duyarlı çalışma alanı |
| Sektör Radarı | Sabit resmî API uçlarından yayın tarihi doğrulanan başlıklar; kaynak türü, kontrol zamanı, öğrenme bağlantısı, kesinti/eskime durumu |
| Dağıtım | Genel canlı sürüm ve public öğrenci kodu çalıştırıcısı yok |

Eski MVP hedefleri (4 yol, 5 public dil deneyimi, 100 kavram kartı,
canlı haber, 30 değerlendirilen alıştırma) **tamamlanmış sayılmaz**.
Bunlar tasarım araştırmasının tarihî başlangıç hedefleridir.

## 4. Öncelikli ürün gereksinimleri

### P0 · M9 Öğrenme kalitesi

1. Kullanıcı, mevcut derslerde **tahmin → gözlem → yanlış varsayımı
   ayırt etme → yeni problem → tekrar** bağlantısını görebilmeli.
2. Mevcut soru/ilerleme/bağımsız transfer durumu hangi sonraki adımı
   gerektiriyorsa, o adım gerçek kayıtlarla önerilmeli.
3. **Kanıt hiyerarşisi:** rehberli tamamlama, ilk bağımsız tahmin,
   gecikmeli bağımsız tahmin ve kod yazma ayrı isimlendirilir.
   Öğrenciden gözlenmeyen bir beceri çıkarılmaz.
4. Beş Python dersinin tamamına 15 gerçek hayat kod senaryosu, üç
   zorluk düzeyi ve beş kendi kodunu yazma görevi eklendi.
   Bu görevlerin çıktı geri bildirimi yerel ve rehberlidir; kod
   editörü genel Python runner veya bağımsız başarı belgesi değildir.
5. İlk bütünleşik müfredat incelemesi Python'un mevcut 5 dersi üzerine
   yapılır. İçerik; gerçek uygulama, karşı örnek, öğretici geri bildirim,
   farklı girdiler ve bağımsız çözümle sınanabilir olmalı.
6. Çalıştırma devre dışıysa öğrenci kodunu düzenleyebilir ama güvenilir
   kod üretim başarısı elde ettiği iddia edilmez.
7. JavaScript ve Java'daki diğer 10 ders de 30 gerçek program,
   üç seviye ve 10 kendin yazma taslağıyla aynı deneyimi kullanır.
   Böylece üç kursun 15 dersinde toplam 45 gerçek hayat problemi,
   15 yeni taslak kod yazma görevi yer alır. Tarayıcı geri bildirimi
   ve örnek çözümler **puanlanmış bağımsız kanıt sayılmaz**.
8. Öğrenme etkisini kıyaslayan gönüllü pilot için ön test, son test ve
   gecikmeli test soruları yöntemsel olarak hazırlanır. Başarı oranları
   gözlem yapılmadan üretilmez.
9. Açık/koyu temada erişilebilirlik, mobilde yatay taşma olmaması ve
   gerçek konu bağlantıları korunur.

### P1 · M10 Sektör Radarı

Kaynağı belli, tarihi doğrulanmış ve içerikle ilişkili güncel veri:
gerçek API/erişim izinleri, tekrar ayıklama, kaynak türü ayrımı,
stale/hata durumları, kaynak bağlantısı, ilgili öğrenme konusu.
Yalnızca API bağlandı diye eski/sahte veri yayımlanamaz.

### P2 · M11 Doğrulama ve genişleme

Küçük pilot, öğrenme görevi tamamlama gözlemi, içerik anlaşılabilirliği,
daha iyi açıklama/kapsam gerekçesi ve kontrollü TypeScript/SQL/veri
yapıları/algoritmalar genişlemesi. COW/MOO, AI mentor, sosyal özellikler
ve topluluk varsayılan kapsam dışıdır.

## 5. Gerçek kullanıcı hikâyeleri

- **Öğren:** Öğrenci Python fonksiyonları dersini açıp sonucu tahmin
  eder, satır izini inceler ve print/return ayrımını açıklayabilir.
- **Bağımsız dene:** Uygun desteklenen derste oturum açmış öğrenci
  rehberli çözüme bakmadan yeni bir çıktı tahminini çözer.
- **Kod üret:** Desteklenen özel yerel laboratuvar açıkken öğrenci
  kendi fonksiyonunu yazar; açık/gizli testlerle yalnızca
  davranışsal doğruluk kanıtı üretilebilir.
- **Geri dön:** Oturum açmış kullanıcı kendi ilerleme ve tekrarlarını
  görür; tamamlanma ile bağımsız kanıtı karıştırmadan ilgili derse gider.
- **Güncel kal:** Gerçek sektör akışında haberin tarihini,
  kanonik kaynağını, türünü ve alakalı ders bağlantısını görür.

## 6. Başarı ölçümü: ürün değil, öğrenci odaklı

| Boyut | Yöntem / kabul |
| --- | --- |
| Kod okuma | Görülmemiş varyantta bağımsız çıktı tahmini |
| Yanlış varsayımı giderme | Aynı kavramın odaklanmış farklı karşı örneğinde düzelme |
| Kod yazma | Güvenilir işçi ve gizli testler varsa davranışsal değerlendirme, yoksa kanıt yok |
| Kalıcılık | En az 24 saat sonra yeni girdiler; uzun vadeli yetkinlik iddiası yok |
| Öğretim etkililiği | Gönüllü ön/son/gecikmeli karşılaştırmalar; örneklem ve sınırlamalar raporlanır |
| Kullanılabilirlik | Klavye, erişilebilir adlar, 320px ve mobil, farklı temalar, okunaklı kod |
| İçerik | Teknik olarak doğru, ayrı gözden geçirilmiş açıklama, kaynak ve örnekler |
| Veri doğruluğu | Hesap/DB yok veya API hatalıysa sahte ilerleme gösterilmez |
| Haber | Her zaman gerçek kanonik URL, doğrulanmış tarihler ve açık kaynak türü |

## 7. Teknik ve editoryal sınırlar

- Kullanıcı kodunu genel web sürecinde veya internetten gelen istek
  üzerine kontrolsüz yürütme. Var olan sunucu doğrulaması ve özel
  Docker laboratuvarı sınırları korunur.
- Öğrencinin serbest açıklamasından doğrulanmamış mastery skoru çıkarma.
- Eğitim yazılarından tamamını kopyalama, tarihsiz haber yayımlama,
  kaynak metnindeki talimatları sistem talimatı kabul etme.
- Salt sayısal içerik büyümesi için aynı dersi yeniden paketleme.
- Öğrenci pilotları için kişisel veri, rıza ve erişim kararlarını
  kendiliğinden belirleme; anonim veya minimum veri ile başlama.

## 8. Değişiklik kabulü ve plan yönetimi

Ürün başlığı M9/M10/M11 olarak kalır; alt teknik görevler milestone
adı almaz. Hedef kabulü için gerçek kullanım akışı, CI regresyonları,
eğitim içeriği incelemesi ve sınırlamalar raporlanmalıdır. Birkaç anlamlı
PR olabilir, aynı anda birden fazla açık PR tercih edilmez.

Mimariyi veya güvenlik sınırını değiştiren işler ayrık ADR ve onay
gerektirir. Güncel teslimat ve reddedilen iddialar için
[ROADMAP](../roadmap/ROADMAP.md) yetkilidir.
