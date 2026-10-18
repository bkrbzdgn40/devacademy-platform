# M8.5.1 · Tam Ders Kapsamı ve Kavramsal Derinlik

## Hedef ve teslimat

Mevcut üç kurstaki bütün 15 dersin (7 JavaScript, 3 Java, 5 Python)
Öğrenme Stüdyosu deneyiminden yararlanması. Önceden yalnızca altı
derste bulunan doğrulanmış üçer girdi varyantı, dokuz yeni dersle toplam
**45 senaryoya** çıkarıldı.

Yeni konu kapsamı:

- JavaScript: gevşek/katı eşitlik, fonksiyon dönüşleri, blok kapsamı ve
  gölgeleme, filter/reduce, Promise microtask sıralaması.
- Java: metot çağrıları, dönüş değeri ve bu değerin başka işlemde kullanımı.
- Python: sayı/metin ayrımı ve f-string, if/else dalı, sözlükte get ve
  eksik anahtar için varsayılan değer.

Önceki altı senaryo aynen korunmuştur. Öğrenci her derste önce iki
çıktıyı tahmin eder, ardından gerçek kod satırını, değişken ve konsol
izini adım adım inceleyebilir; farklı varyantla tekrar deneyebilir.

## İçeriği derinleştirme

Her ders için ayrı gözden geçirilmiş "Kavramı Derinleştir" bölümü eklendi.
Yedi özgün alan içerir:

1. Zihinsel model: aynı kavramın ezber yerine doğru temsilini öğret.
2. Yanlış varsayım: sık yapılan bir hatayı açıkça göster.
3. Karşı örnek: benzer görünen iki kullanım arasındaki farklılık.
4. Karşı örneğin nedeni: sonucu değil nedenselliği açıkla.
5. Aktarım sorusu: yeni bağlamda öğrencinin düşünmesini sağla.
6. Yanıtın isteğe bağlı açılması: rehberli açıklama.
7. Gerçek kullanım: üründe nerede işe yarayacağını belirt.

Yanıtlar başlangıçta kapalıdır; öğrenci isterse açar. Bu alan
bağımsız sınav veya sertifika olarak sayılmaz. Önceki çoktan seçmeli
sorular, hata avcısı, M8.1-8.2 transfer kanıtları ve M8.3 kod
değerlendirme akışı korunur.

## Doğruluk ve güvenlik

Yeni senaryolar yalnızca sabit, sınırlı veriyle üretilir. Tarayıcıda
serbest kullanıcı kodu yürütmez. Sunucuda yeni genel çalıştırma,
öğrenci cevaplarının kaydı, veri tabanı migration'ı veya dış servis
bağlantısı yoktur.

Başarı için kalite kapıları:
- Senaryo kimlikleri mevcut 15 derse birebir eşleşmeli.
- 45 örneğin kaynakları gerçek Node, Java ve Python ile çalıştırılmalı;
  gerçek stdout çizilen olayların tamamıyla eşleşmeli.
- Bütün satır işaretleri kaynak satır numarasına denk gelmeli.
- 15 derinlik metninin tüm alanları dolu ve birbirinden bağımsız olmalı.
- Mobil Chrome'da seçili farklı dersler, 320 piksel tahmin/izleme
  etkileşimi ve yatay taşma kontrolü başarılı olmalı.
- Önceki ders, test, CI ve erişilebilirlik sözleşmeleri korunmalı.

## Sonraki sınır

Şimdiki stüdyo 45 **önceden tasarlanmış** iz oluşturur; genel amaçlı
debugger gibi herhangi bir kullanıcı kodunun izini oluşturmaz.
Öğrenme üzerinde etkinin ölçülmesi gerçek öğrenci deneyleri gerektirir.
Bir sonraki mantıklı yatırım içeriklerin kör noktalarını kullanıcı
performansı üzerinden belirlemek ve M8.6 tasarım sistemine geçmektir.
