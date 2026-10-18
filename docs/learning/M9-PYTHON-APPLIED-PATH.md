# M9 · Python Temelleri: Bütünleşik Öğrenme Yolu

**Kapsam:** 5 mevcut Python dersi. Bu içerik sistemi ürünün genel öğrenme
hedefinin bir parçasıdır; bağımsız bir yeni milestone değildir.
**Durum:** Yayınlanmış ders içeriklerinin öğretici derinleştirmesi.
Gerçek öğrenci öğrenme etkisi henüz ölçülmemiştir.

## Yeni öğrenme akışı

1. Rehberli *Tahmin et*: eski sunucu değerlendirmeli sorular değişmez.
2. *Anla ve izle*: mevcut gerçek kod izleri, kavram modeli ve karşı örnek.
3. *Hata avcısı*: kavramsal yanlışı fark etme; eski değerlendirmeler.
4. *Uygula*: ders kodunu düzenleme; üç gerçek yaşam bağlamında
   **Başlangıç → Uygulama → Yeni durum** çıktısı tahmini.
   Seçim sonrası verilen geri bildirim, her çeldiricinin neden
   yanıltıcı olduğunu açıklar; yanlış yanıt yeniden denenebilir.
   İpucu isteğe bağlıdır.
5. *Bağımsız deneme*: her dersin sonunda **farklı, sıfırdan program
   yazma görevi** bulunur. Yeni girdilerle beklenen örnekler ve
   düzenlenebilir Python kod editörü vardır. Öğrenci kendi
   çözümünden sonra örnek çözümü açarak karşılaştırabilir.

> **Kanıt sınırı:** Üç düzeydeki çıktı tahminleri tarayıcıda düşük
> riskli anlık geri bildirimdir. Kayda geçmez, sunucu sorularını
> tamamlama puanını artırmaz ve bağımsız kod yazma yeterliliği
> **olduğu iddia edilmez**. Sıfırdan kod yazma görevi de çalışan
> genel Python hizmeti değildir; güvenilir puan sadece daha önce
> tasarlanmış, yetkili localhost laboratuvarında ayrı M8.3 kod
> transfer görevi varsa mümkündür.

## Kapsam matrisi

| Ders | Başlangıç | Uygulama | Yeni durum | Sıfırdan çözüm |
| --- | --- | --- | --- | --- |
| Değişkenler | Kafe fiyat/adet | Yüzdeli servis ve f-string | Metin bakiye → int | Etiketli kasa hesabı |
| Koşullar | Başarı eşiği | Üyelikli teslimat | Ön sipariş durumu | Sınır değerli başarı kararları |
| Döngüler | Günlük satış toplamı | Geçersiz kaydı continue ile atlama | Artımlı sensör ölçümü | Gerçek sensör verisini ayıklama |
| Fonksiyonlar | print / return | Varsayılan parametre | Erken return ve sınır | KDV dahil değer döndüren fonksiyon |
| Koleksiyonlar | Liste dilimleme | Sözlük get varsayılanı | Puan filtresi | Stok sınırına göre ürünleri listeleme |

15 farklı çalıştırılabilir kod problemi, 45 açıklamalı seçenek,
5 bağımsız çözüm ve bunların 5 alternatif girdi varyasyonu yazılmıştır.

## Ölçülebilir teknik doğrulama

- Mevcut yayımlanmış beş ders ve tüm soru kimlikleri değişmeden kalır.
- 15 yeni kod örneğinin beklenen sonuçları, 5 örnek çözüm ve 5
  alternatif girdi çözümü **gerçek Python 3.12** altında yürütülür
  (25 gerçek program yürütmesi). 5 başlangıç kodunun Python
  sözdizimi ayrıca test edilir.
- Her tahmin sorusunun üç benzersiz seçeneği, tam bir doğru çıktı
  seçeneği, açıklayıcı yanlış yanıt geri bildirimi ve ipucu test edilir.
- Gerçek mobil Chrome'da **beş dersin tamamı** açılır, dördüncü
  ders aşamasında üç zorluk düzeyi ve bağımsız görev görülebilir.
  Yanlış cevap → öğretici geri bildirim → düzeltme → doğru geri bildirim,
  zorluk değiştirme ve editörü açma doğrulanır.
- Görsel sistem açık/koyu zeytin/toprak semantik renklerini kullanır.
  Küçük ekranlarda yatay sayfa taşması engellenir.
- Sunucu bağımsız değerlendirme kodu, veritabanı, kullanıcı kimliği,
  tekrar algoritması, quiz notlandırması **değişmez**.

## Sonraki M9 değerlendirmesi

Yeni görevlerin pedagojik etkisi, sadece otomatik CI başarısıyla
kanıtlanamaz. Pilot protokolündeki bağımsız ön/son test, açıklama
kalitesi ve gecikmeli test ayrı öğrenci çalışmasıyla incelenmeli.
Yanlış seçenek dağılımı bu sürümde toplanmaz; kullanım analitiği
ve öğrenciyi psikolojik olarak etiketleyen bir model kurulmaz.

Derslerin açıklamaları, öğrenme hedefleri ve tahmini süreleri yeni
görevlere göre güncellendi. Süreler pedagojik tahmindir; gerçek
öğrenci oturumu kronometresi değildir.
