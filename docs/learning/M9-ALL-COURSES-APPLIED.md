# M9 · On Beş Dersin Tamamında Uygulamalı Öğrenme

**Hedef:** Rehberli çıktı tahmini → hataya özgü kavramsal geri bildirim
→ yeni bağlamda tahmin → sıfırdan kod denemesi. Bu paket
M9 Gerçek Öğrenme Deneyimi içinde **tek içerik teslimatıdır**;
yeni bir M9.1.1 milestone'u değildir.

## Erişim ve kapsam

JavaScript 7 + Java 3 + Python 5 = **15 yayımlanmış ders**.
Her dersin Uygula/Kodla aşamasına aynı mobil uyumlu öğrenme laboratuvarı
yerleştirildi. Var olan Öğrenme Stüdyosu, Quiz, Hata Avcısı, Transfer
Lab ve Code Transfer Lab kaldırılmadı.

Her derste **Başlangıç, Uygulama, Yeni durum** adlı üç farklı gerçek
program vardır: toplam 45 kademeli problem, 135 alternatif çıktı
seçeneği. Her alternatif özel hata nedeni, her problem isteğe bağlı
ipucu ve doğru düşünme açıklaması içerir.

Ders başına bir **kod üretme taslağı** vardır: 15 yeni özgün problem,
başlangıç kodu, gereksinimler, farklı girdilerde beklenen çıktı,
üzerinde çalışılabilir editör, gerekçelendirme sorusu ve istek üzerine
açılan gözden geçirilmiş örnek çözüm. Yeni kod yazma taslaklarının
otomatik puanı **yoktur**.

## Öğrenme problemleri

| Dil | Ders | Güncel gerçek hayat bağlamı |
| --- | --- | --- |
| JavaScript | let/const | Stok ve kasa sayıları; sabit bağ / değişen nesne |
| JavaScript | == / === | API kimliklerinde metin/sayı dönüşümleri |
| JavaScript | map | Vergili fiyat listeleri; veri kaynağını koruma |
| JavaScript | Fonksiyonlar | Kargo ücreti, return, varsayılan parametre |
| JavaScript | Kapsam | Kampanya blokları, let gölgeleme ve dış değer |
| JavaScript | filter/reduce | Sipariş filtreleme, güvenilir toplam |
| JavaScript | Promise | Sipariş bildirimleri, senkron ve microtask sırası |
| Java | Değişkenler | Koli başına ölçüm; int / double bölme |
| Java | Metotlar | İndirim ve kargo fonksiyonları; dönüş türleri |
| Java | Polymorphism | Bildirim kanallarında override / overload / alan |
| Python | Değişkenler | Kasa hesabı, f-string, dönüşüm |
| Python | Koşullar | Stok, üyelik, geçme kararı |
| Python | Döngüler | Satış özeti ve sensör kayıtları |
| Python | Fonksiyonlar | Sepet toplamı, print / return |
| Python | Koleksiyonlar | Kitap listesi, stok sözlüğü, filtre |

## Kanıt ve güvenilirlik sınırları

- 45 seviye görevinde çıktı, içerik yazarının gözden geçirilmiş
  beklenen yanıtına karşı **tarayıcıda** karşılaştırılır. Çözümün
  seçeneği sunucuya gönderilmez; başarı kaydı oluşturulmaz.
- Yanlış cevap, hangi varsayımın hatalı olabileceğine dair açıklama
  sağlar; öğrencinin zihnini okuduğu veya kalıcı kişiselleştirme
  yaptığı iddia edilmez.
- Her dersteki kod editörü kendi kodunu yazmak ve **örnek çözümle
  karşılaştırmak** içindir. Her Java ve Python dosyasının çalıştırma
  düğmesi olması veya başardığına dair puan verme zorunluluğu yoktur.
- Güvenilir, gerçek bağımsız kod kanıtı halen yalnızca önceden
  mevcut altı kavramda ve izole, açıkça yetkili localhost laboratuvarı
  yoluyla elde edilebilir. Var olan quiz, gecikmeli transfer,
  değerlendirme servisleri ve user kayıtları değiştirilmedi.
- Pilot öğrenci çalışması henüz yapılmadı; otomatik testler öğretici
  etkinlik iddiasının yerine geçmez.

## Kabul ve test ölçütleri

1. Mevcut yayımlanmış 15 ders, özgün quiz ve transfer kimliklerini
   değiştirmeden tek ortak laboratuvar bileşeni kullanır.
2. JavaScript ve Java için 30 kademeli problem, 10 gözden geçirilmiş
   örnek çözüm ve 10 değişmiş girdi örneği **Node 24 / Java 21**
   gerçek çalışma ortamlarında yürütülerek beklenen çıktılarla
   karşılaştırılır (50 yürütme). Java kodları önce derlenir; yeni
   JavaScript ve Java starter kodlarının sözdizimi de kontrol edilir.
3. Python için önceki 25 gerçek Python 3.12 örnek yürütmesi ve
   5 starter sözdizimi kontrolü devam eder.
4. 320 piksel mobil Chrome'da **JavaScript'in yedi ve Java'nın üç
   dersinin tümü**, üç zorluk düzeyi ve bağımsız kod deneme alanını
   taşma olmadan gösterir. Yanlış tahmin, doğruya düzeltme,
   odak ve mevcut öğrenme akışının regresyonu sınanır.
5. Açık/koyu Olive & Earth tasarımı semantik renklerle korunur.
   Yeni DB migration, paket, üretim deploy veya genel kod runner yok.

**Sonraki M9 ürün kabulü:** Gerçek kullanıcıyla ilk Python kursundan
başlayarak ön test → öğrenme oturumu → bağımsız son test → gecikmeli test.
Gerçek ölçüm olmadan "öğrenme iyileşti" denmez.
