# M9 · Python Pilot Uygulayıcı Rehberi ve Cevap Anahtarı

**Statü: Pilot hazırlığı.** Gerçek katılımcı, ölçüm ve öğrenme etkisi sonucu yoktur. Görevler yalnızca araştırma araçlarıdır; ürün içinde otomatik değerlendirme veya ilerleme kaydı üretmez.

## Amaç ve sınırlamalar

Birincil ölçüt: Python fonksiyonlarında **print / return** ayrımını yeni örnekte doğru açıklamak. Destekleyici dört ölçüt: tür dönüşümü, if/elif, continue ve sözlükten güvenli okuma. Bu beş konu için 3 paralel form vardır; ancak formlar gerçek öğrenci verisiyle güçlük bakımından **henüz eşitlenmedi**. Tek grubun ön/son değişimi kontrol grubu olmadan nedensel etki kanıtı değildir.

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
| Değişkenler ve tür dönüşümü | A | `50` | int dönüşümü metni sayıya çevirir; 18×3−4=50. |
| Değişkenler ve tür dönüşümü | B | `61` | int dönüşümü sonrası 16×4−3=61. |
| Değişkenler ve tür dönüşümü | C | `37` | int dönüşümü sonrası 21×2−5=37. |
| Sıralı koşul ve and | A | `Öncelikli` | İlk koşul yanlış; iki alt koşul doğru olduğundan elif çalışır. |
| Sıralı koşul ve and | B | `İndirimli` | İlk dal yanlış; üye ve 100 sınırı birlikte doğru. |
| Sıralı koşul ve and | C | `Tasarruf` | İlk dal yanlış; saver True ve pil >=30, elif çalışır. |
| Döngüde continue ve negatifleri atlama | A | `14` | -1 atlanır; 5+0+9=14. |
| Döngüde continue ve negatifleri atlama | B | `9` | -4 atlanır; 3+6+0=9. |
| Döngüde continue ve negatifleri atlama | C | `15` | -2 atlanır; 0+8+7=15. |
| print ve return ile çağıran değer ayrımı | A | `6 ⏎ 9` | İç print 6 yazar, return 9 üretir; dış print 9 yazar. |
| print ve return ile çağıran değer ayrımı | B | `10 ⏎ 8` | İç print 10 yazar, return 8 üretir; dış print 8 yazar. |
| print ve return ile çağıran değer ayrımı | C | `5 ⏎ 18` | İç print 5 yazar, return 18 üretir; dış print 18 yazar. |
| Sözlük get varsayılanı ve anahtar okuma | A | `2` | Eksik silgi varsayılan 0; kalem değeri 2; toplam 2. |
| Sözlük get varsayılanı ve anahtar okuma | B | `1` | Pirinç eksik → 0, süt 1 → toplam 1. |
| Sözlük get varsayılanı ve anahtar okuma | C | `7` | Öğrenci anahtarı yok → 0, çocuk 7 → toplam 7. |

## Bağımsız fonksiyon üretimi · örnek referans kontrolü

**Form A:** Teslimat ücretini döndür. Referans çözüm çıktısı: `23`. Öğrencinin fonksiyonu değeri **return** ile döndürmeli; yalnızca print etmek, fonksiyonun başka ifadede kullanılabildiğine kanıt değildir. CI'daki referans yürütmesi öğrenci kodunu çalıştırmaz.

**Form B:** Ek ücreti döndür. Referans çözüm çıktısı: `32`. Öğrencinin fonksiyonu değeri **return** ile döndürmeli; yalnızca print etmek, fonksiyonun başka ifadede kullanılabildiğine kanıt değildir. CI'daki referans yürütmesi öğrenci kodunu çalıştırmaz.

**Form C:** Ek süreyi döndür. Referans çözüm çıktısı: `20`. Öğrencinin fonksiyonu değeri **return** ile döndürmeli; yalnızca print etmek, fonksiyonun başka ifadede kullanılabildiğine kanıt değildir. CI'daki referans yürütmesi öğrenci kodunu çalıştırmaz.

## Uçtan uca öğrenme akışı denetim noktaları

- Değişkenler: `str`→`int` dönüşümü ile f-string biçimlendirme arasındaki ayrım net mi?
- Koşullar: `>=` sınırları ve `if/elif` sırası, görevin başlığı ile tutarlı mı?
- Döngüler: geçersiz negatifler ve geçerli sıfır her yerde aynı anlama mı geliyor?
- Fonksiyonlar: içteki `print` ile dıştaki `return` ayrı çıktı/değer mi; öğrenci bunu kendi cümlesiyle açıklıyor mu?
- Koleksiyonlar: `get` varsayılanı ile indeks/dilim/anahtar okuma örnekleri ayırt ediliyor mu?
- Mobil ve klavye: dört ders aşaması, kapalı/yavaş editör, bağımsız görev ve ipucu açma anlaşılır mı?
- Ders tamamlama yalnızca rehberli tamamlama olarak mı sunuluyor; worker kapalıyken başarı iddia edilmiyor mu?

**Kabul notu:** Bu kontrol listesi, gerçek kullanıcının bütün beş dersi baştan sona kullandığını iddia etmez. Bir pilot yapılmadan gözlenen kullanıcı sorunları veya öğrenme yüzdeleri üretme.
