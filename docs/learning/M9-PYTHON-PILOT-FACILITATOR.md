# M9 · Python Pilot Uygulayıcı Rehberi ve Cevap Anahtarı

**Statü: Pilot hazırlığı.** Gerçek katılımcı, ölçüm ve öğrenme etkisi sonucu yoktur. Görevler yalnızca araştırma araçlarıdır; ürün içinde otomatik değerlendirme veya ilerleme kaydı üretmez.

## Amaç ve sınırlamalar

Birincil ölçüt: Python fonksiyonlarında **print / return** ayrımını yeni örnekte doğru açıklamak. Destekleyici dört ölçüt: ondalıklı metni `float` ile çevirip `:.2f` ile yazmak, kademeli `if/elif` zincirinde sınır değerini doğru dala koymak, `continue` ile geçersiz kaydı atlayıp saymak ve sözlükte `get` varsayılanıyla liste kurmak. Kartlar 2026-11-21 tarihinde, derslerdeki adım adım örneklerle ve notlanan sorularla aynı yapıda olmayacak şekilde yeniden yazıldı; böylece son test, ders örneğini hatırlamayı değil yakın transferi ölçer. Bu beş konu için 3 paralel form vardır; ancak formlar gerçek öğrenci verisiyle güçlük bakımından **henüz eşitlenmedi**. Tek grubun ön/son değişimi kontrol grubu olmadan nedensel etki kanıtı değildir.

## Oturum yöntemi

1. Gönüllüye çalışmanın amaç ve sınırını açıkla; veri kaydı için açık rıza al. Kullanıcı adı, telefon, ham kod ve hesap kimliği **varsayılan olarak toplanmaz**; erişim ve saklama kararları ayrıca belirlenir.
2. Katılımcıya yalnızca geçici anonim bir oturum kodu ver. Önceki Python deneyimini ve bu görevleri önceden görüp görmediğini **isteğe bağlı** not et.
3. Form sırasını katılımcılar arasında dağıt: **A→B→C**, **B→C→A** veya **C→A→B**. İlk form ön test, ikinci form yeni son test, üçüncü form en az 24 saat sonraki gecikmeli test içindir. Üç formu aynı anda öğrenciye açma.
4. Her ölçümde beş konu kartını, açıklama/çalıştırma/ipucu **olmadan** yanıtlat; her cevabın süresini, çıktısını ve kısa nedenini ayrı yaz. Öğrenci bilmediğini işaretleyebilir. Görevlerde yardım, deney veya arama kullanıldıysa **yardımsız başarı** olarak kodlama.
5. Ön testin ardından öğrencinin beş derslik öğrenme akışını tamamlamasına olanak ver. Dersin hangi aşamasında durduğunu, açtığı ipuçlarını ve gözlenen karışıklıkları not et. Koçluk yapıldıysa kaydet; eğitmen yardımı yokmuş gibi değerlendirme.
6. Öğrenme sonrası **farklı formda** yeni test uygula. Gecikmeli testi en az 24 saat sonra ve son testten farklı formda uygula. Gerçek zaman damgası yoksa kalıcılık ölçümü ilan etme.
7. İsteğe bağlı fonksiyon yazma kartını her aşamada atanmış formdan uygulat; güvenilir yetkili worker yoksa yalnızca **elle gözlenen, doğrulanmamış taslak** olarak kaydet. Örnek çözümü önceden gösterme.

## Puanlama ve kayıt çizelgesi

Her konu/form için **çıktı doğruluğu** ayrı 0/1; bütün satırlar doğruysa 1. **Gerekçe** ayrı 0/1/2: 0 yanlış/boş, 1 bazı doğru adımlar ama belirleyici kural eksik, 2 kritik kuralı doğru açıklar. Gerekçe puanı, iki bağımsız gözlemci varsa uyuşmazlık çözülerek raporlanabilir; yoksa değerlendirici öznelliği belirtilir. Süreyi gerçek gözlemden al, sıfır veya tahmini süre yazma. Kod yazmayı çıktı tahminiyle aynı mastery puanına katma.

**Önerilen anonim satır alanları:** oturum kodu, konu, ölçüm (ön/son/gecikmeli), form, tarih-saat, çıktı (0/1), gerekçe (0/1/2), ipucu/arama/çalıştırma (evet/hayır), gözlenen süre, nitel not, değerlendirici. Veri toplanacaksa onaylı saklama yöntemi ayrıca belirlenir; bu repoya kişisel pilot kayıtları commit edilmez.

**Pilot raporunda ayır:** teknik fixture testi sonucu; katılımcı sayısı ve seçim yöntemi; konu bazında görülen cevaplar; ipucu etkisi; fonksiyon kodu worker ile doğrulandı mı; gecikmeli tekrar süresi; nitel sorunlar; genellenebilirlik ve nedensellik sınırlamaları.

## Uygulayıcı cevap anahtarı

Aşağıdaki yanıtları öğrenci formuna dahil etme. Kaynak: `apps/web/tests/fixtures/m9-python-pilot-cases.json`; bütün referans programları yalnızca geliştirici testinde gerçek Python 3.12 ile kontrol edilir.

| Konu | Form | Beklenen standart çıktı | Belirleyici gerekçe |
|---|---|---|---|
| Ondalıklı metin, float ve iki basamaklı biçim | A | `7.70` | float metni ondalıklı sayıya çevirir; 2.4×3+0.5=7.7 ve :.2f iki basamakla 7.70 yazar. |
| Ondalıklı metin, float ve iki basamaklı biçim | B | `5.30` | float dönüşümü sonrası 1.25×4+0.3=5.3; :.2f biçimi bunu 5.30 olarak yazar. |
| Ondalıklı metin, float ve iki basamaklı biçim | C | `5.70` | float dönüşümü sonrası 0.75×6+1.2=5.7; :.2f biçimi iki basamakla 5.70 yazar. |
| Kademeli koşul sırası ve sınır değeri | A | `Sarı` | İlk koşul yanlış; >= sınırı dahil ettiği için 20 >= 20 doğrudur ve ilk doğru dal Sarı'dır. |
| Kademeli koşul sırası ve sınır değeri | B | `Pekiyi` | 85 >= 85 doğrudur; zincirde ilk doğru dal çalışır, sonraki elif hiç denetlenmez. |
| Kademeli koşul sırası ve sınır değeri | C | `Hafif` | 39 iki eşiğin de altında kalır; hiçbir koşul doğru olmadığı için else dalı çalışır. |
| continue ile geçersiz kaydı atlayıp sayma | A | `3` | continue negatif turda sayacı atlar; 3, 0 ve 5 geçerlidir, sayaç 3 olur. Değerler toplanmaz. |
| continue ile geçersiz kaydı atlayıp sayma | B | `2` | -1 ve -4 turlarında continue sayacı atlar; 0 ve 7 geçerli olduğundan sonuç 2'dir. |
| continue ile geçersiz kaydı atlayıp sayma | C | `4` | Yalnızca -5 turunda continue sayacı atlar; kalan dört değer, iki sıfır dahil, sayılır. |
| print ve return ile çağıran değer ayrımı | A | `6 ⏎ 9` | İç print 6 yazar, return 9 üretir; dış print 9 yazar. |
| print ve return ile çağıran değer ayrımı | B | `10 ⏎ 8` | İç print 10 yazar, return 8 üretir; dış print 8 yazar. |
| print ve return ile çağıran değer ayrımı | C | `5 ⏎ 18` | İç print 5 yazar, return 18 üretir; dış print 18 yazar. |
| Sözlükte get varsayılanı ile liste kurma | A | `[8, 0, 12]` | Liste asked sırasıyla kurulur; drama anahtarı olmadığından get KeyError vermez, 0 döndürür. |
| Sözlükte get varsayılanı ile liste kurma | B | `[3, 0]` | nane için 3 okunur; kaktüs sözlükte olmadığı için get varsayılan 0'ı listeye ekler. |
| Sözlükte get varsayılanı ile liste kurma | C | `[1, 0, 0]` | Her eleman için ayrı get çağrılır; resim iki kez geçtiği için listeye iki kez 0 eklenir. |

## Bağımsız fonksiyon üretimi · örnek referans kontrolü

**Form A:** Teslimat ücretini döndür. Referans çözüm çıktısı: `23`. Öğrencinin fonksiyonu değeri **return** ile döndürmeli; yalnızca print etmek, fonksiyonun başka ifadede kullanılabildiğine kanıt değildir. CI'daki referans yürütmesi öğrenci kodunu çalıştırmaz.

**Form B:** Ek ücreti döndür. Referans çözüm çıktısı: `32`. Öğrencinin fonksiyonu değeri **return** ile döndürmeli; yalnızca print etmek, fonksiyonun başka ifadede kullanılabildiğine kanıt değildir. CI'daki referans yürütmesi öğrenci kodunu çalıştırmaz.

**Form C:** Ek süreyi döndür. Referans çözüm çıktısı: `20`. Öğrencinin fonksiyonu değeri **return** ile döndürmeli; yalnızca print etmek, fonksiyonun başka ifadede kullanılabildiğine kanıt değildir. CI'daki referans yürütmesi öğrenci kodunu çalıştırmaz.

## Uçtan uca öğrenme akışı denetim noktaları

- Değişkenler: `int()` ile `float()` dönüşümü ve `:.2f` biçimlendirmesi arasındaki ayrım net mi?
- Koşullar: `>=` sınırları ve `if/elif` sırası, görevin başlığı ile tutarlı mı?
- Döngüler: geçersiz negatifler ve geçerli sıfır her yerde aynı anlama mı geliyor?
- Fonksiyonlar: içteki `print` ile dıştaki `return` ayrı çıktı/değer mi; öğrenci bunu kendi cümlesiyle açıklıyor mu?
- Koleksiyonlar: `get` varsayılanı ile indeks/dilim/anahtar okuma örnekleri ayırt ediliyor mu?
- Mobil ve klavye: dört ders aşaması, kapalı/yavaş editör, bağımsız görev ve ipucu açma anlaşılır mı?
- Ders tamamlama yalnızca rehberli tamamlama olarak mı sunuluyor; worker kapalıyken başarı iddia edilmiyor mu?

**Kabul notu:** Bu kontrol listesi, gerçek kullanıcının bütün beş dersi baştan sona kullandığını iddia etmez. Bir pilot yapılmadan gözlenen kullanıcı sorunları veya öğrenme yüzdeleri üretme.
