# M8.5 Öğrenme Stüdyosu 2.0

## Amaç ve kapsam

Eğitim döngüsü: önce A/B sonucunu tahmin et → kod satırlarının durumunu incele → gerçek çıktıyla karşılaştır → varsayımı tekrar düşün → farklı girdilerle sınama.

İlk sürümde JavaScript, Java ve Python'da ikişer kavram, toplam altı ders ve her biri üçer sabit, gözden geçirilmiş varyantla 18 yürütme senaryosu vardır. Öğrenci iki sonucu yazmadan değişkenleri ve program çıktılarını göremez. İsteğe bağlı kavram ipucu, adım adım ileri/geri sarma, aktif satır vurgusu, konsol çıktısı, yanılgıya yönelik açıklama ve farklı girdi deneyi vardır.

| Dil | Kavram | Öğrenme hedefi |
|---|---|---|
| JavaScript | let/const | Sayısal değişken ile nesne alanı arasındaki fark |
| JavaScript | Array.map | Kaynak dizinin yerinde kalması ve yeni dizinin oluşturulması |
| Java | int bölmesi | Cast zamanlamasının kesir üzerine etkisi |
| Java | polymorphism | Kalıtılan metodun ve farklı imzalı overload'un ayrılması |
| Python | range | Bitiş değerinin dışarıda kalması ve döngü değişkenleri |
| Python | print/return | Yan etki çıktısı ile fonksiyon dönüş değeri |

## Güvenilirlik ve öğreticilik sınırları

- Senaryo üreticisi yalnızca gözden geçirilmiş ve sınırlı parametreler kullanır. Tarayıcıda rastgele kod yorumlamaz, eval/Function çalıştırmaz ve ağ isteği yapmaz.
- Eski rehberli derslerde senaryo olmayan yerlerde mevcut metin tabanlı izleme aynen sürer.
- Öğrenme Stüdyosu bağımsız bir sınav DEĞİLDİR. Önceden tasarlanmış örneklerin sonuçları istemci kodunda görülebilir; güvenilir değerlendirme bu veriye dayanmaz.
- Öğrencinin tahmini, eminlik düzeyi ve ipucu kullanımı yalnızca sayfada tutulur. Yeni hesap kaydı, sunucu telemetrisi veya başarı sertifikası üretilmez.
- Mevcut M8.1/M8.2 bağımsız transfer ve M8.3 Docker kod yazma değerlendirmesi etkilenmez.
- Serbest kod editöründe yazılan keyfi programın izi çıkarılıyormuş gibi davranılmaz; stüdyo yalnızca gösterdiği gözden geçirilmiş senaryonun yürütülmesini açıklar.

## Doğrulama kapıları

1. Altı konu ve 18 parametre varyantında tahmin ve yürütme izi tutarlılık testleri.
2. Tam 18 kaynak örneğinin Node/Python/Java gerçek çalışma ortamlarıyla yürütülmesi ve son iz çıktılarıyla karşılaştırılması.
3. Gerçek Chrome mobil smoke testi: 320px genişlikte iki tahmin girişi, kilitleme, ileri sarma, doğru sonuç ve taşma kontrolü.
4. Önceki ders/CodeMirror/quiz ve CI regresyonlarının başarılı olması.

Yeni veritabanı migration'ı, paket bağımlılığı, üretim dağıtımı veya herkese açık kod çalıştırma yoktur.

## Sonraki iterasyon

Önce mevcut 15 derse izleme senaryoları yayılacak, ardından her kavramda amaç, örnek, karşı-örnek, hata avı ve bağımsız transfer uyumu genişletilecektir. Eğitim kalitesi iddiaları gerçek kullanıcıların ilk deneme ve gecikmeli bağımsız performans ölçümleriyle değerlendirilmelidir.
