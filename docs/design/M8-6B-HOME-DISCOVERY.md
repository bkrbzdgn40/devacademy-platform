# M8.6B · Ana Sayfa ve Kurs Keşfi 2.0

## Ürün hedefi

DevAcademy, önce öğrencinin son gerçek çalışma noktasını ve öğrenme
seçeneklerini sunar. "Haber" alanı canlı içerik yokken sahte başlık
yayımlamaz. Görsel dil, M8.6A krem/zeytin/terracotta ve M8.6A.1
espresso/adaçayı/bakır temalarının tamamını destekler.

## Uygulanan ekranlar

### Ana sayfa

- Öğrenme Stüdyosu değer önerisi ve gerçek kurs/ders/soru sayıları.
- Giriş yapmış öğrenci için **Devam et** bileşeni:
  - Mevcut \`/api/me\` ve \`/api/progress\` üzerinden kimlik doğrulama
    ve kullanıcıya ait ders ilerleme kayıtları okunur.
  - Son görüntülenmiş fakat tamamlanmamış ders önceliklidir.
  - Böyle bir ders yoksa en son tamamlanan kursun sıradaki açık dersi
    önerilir. Her ders bitmişse tekrar oturumuna yönlendirilir.
  - Kurs bazında tamamlanan dersler ve erişilebilir ilerleme çubukları.
  - Oturum yoksa kişisel ilerleme veya tamamlanma iddia edilmez;
    kurs keşfine ve hesap sayfasına bağlanır.
  - Veritabanı yapılandırılmamışsa açık öğrenme içeriği kullanılabilir,
    kişisel kayıt olmadığını gösterir. API hataları da sahte
    ilerleme yerine tekrar deneme sunar.
- Yayımlanmış JavaScript, Java, Python öğrenme yolları, hangi
  kavramları içerdiği ve sonraki araştırma yönü ile sunulur.
- DevAcademy'nin tahmin → satır satır kanıt → yeni bağlamda uygulama
  öğrenme döngüsü sade, abartısız bir dille anlatılır.

### Kurs keşfi

- Gerçek, yayımlanmış 3 kurs ve 15 ders aynı \`courses.json\` /
  \`lessons.json\` kayıtlarından türetilir.
- Kurs veya ders ismi, hedefi ve ders özeti üzerinden istemci tarafında
  arama yapılabilir. Eşleşen ders doğrudan çalışma sayfasına bağlanır.
- Hiçbir eşleşme yoksa net bir boş durum ve temizleme eylemi gösterilir.
- Temel seviye, gerçek ders/soru sayısı ve mevcut içeriğin yaklaşık
  süresi görünür. Kurslar henüz yayımlanmamış özelliklerle şişirilmez.

### Sektör Radarı

Haber verisi ve yayımlanmış tarihleri sunan API bağlantıları **bu PR'de
yoktur**. Bunun yerine üç açık kaynak kategorisi sunulur:
Hacker News (sektör tartışmaları), DEV Community (topluluk makaleleri)
ve GitHub (sürüm takibinde kullanılacak resmî depolar).
Kartlar açıkça *kaynak kartı* olarak etiketlenir, haber taklidi yapmaz.
Dış kaynak bağlantıları \`noopener noreferrer\` ile açılır.

Gelecekteki gerçek feed entegrasyonu; yayın tarihi, kaynak bağlantısı,
tür/etiket, tekrar eden kayıtların ayıklanması, kaynak güvenilirliği ve
ilişkili ders eşlemesi gerektirecektir. Bu ürün yolu ayrıca ele alınır.

## Veri ve güvenlik

- Yeni veritabanı migration'ı veya gizli veri alanı yoktur.
- Öğrenci geçmişi yalnızca kimliği doğrulanmış \`/api/progress\` GET
  yanıtından gelir; tarayıcı deposuna kopyalanmaz, üçüncü tarafa
  gönderilmez.
- Öneri motoru sunucuya başarı kaydı yazmaz; yalnızca görüntülemede
  kullanıcıya ait son aktiviteye ve tamamlanma durumuna dayanır.
- Genel amaçlı kod çalıştırma ve üretim dağıtımı yine kapalıdır.

## Kabul testleri

- Yayımlanmış kurs ve ders kimlikleriyle birebir eşleşme.
- Kurs ve ders araması (büyük/küçük harf, sonuç yok, doğrudan link).
- Yeni kullanıcı/oturum yok/veritabanı yok/servis hatası ve gerçek
  tamamlanma kaydı için bağımsız doğru durumlar.
- Mevcut açık/koyu tema, 320px mobil Chrome ve önceki ders/stüdyo
  regresyon kontrolleri.
- Geliştirilen görünümün gerçek öğrenci öğrenme etkinliğini iyileştirip
  iyileştirmediği daha sonra kullanıcı çalışmasıyla değerlendirilmelidir.
