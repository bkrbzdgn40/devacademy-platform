# M8.6A.1 · Koyu Tema: Espresso / Zeytin / Bakır

## Neden bu üç renk?

M8.6A'daki açık krem–zeytin–terracotta kimliği korunur. Koyu karşılığı:

- **Espresso** \`#1B1A16\`: ana sayfa, odaklanılmış çalışma alanı;
  **yüzey** \`#292720\` ve ikincil yüzey \`#343127\`.
- **Adaçayı zeytini** \`#BACC96\`: okunabilir birincil CTA, link,
  aktif ders/ilerleme ve başarı vurguları.
- **Bakır terracotta** \`#E6A180\`: editorial vurgu ve alternatif bilgi.
  Metin mürekkebi \`#F5EFE5\` ve ikincil metin \`#CEC4B4\`.
- Okunması gereken kod \`#15120F\` yüzeyinde \`#F1E9DB\`
  açık mono metinle gösterilir. Bunlar ikinci bir tema değildir,
  espresso temasının daha koyu kod çalışma alanıdır.

Örnek kontrast oranları: normal metin/espresso yaklaşık **15.2:1**,
alt metin/espresso **10.1:1**, birincil buton koyu metin/zeytin
**9.4:1**, terracotta/kart **7.0:1**, kod metni/kod yüzeyi
**15.5:1**. CI bu temel renklerin kontrastını test eder.

## Tema değiştirme sözleşmesi

Üst menüde erişilebilir \`Görünüm teması\` seçicisi:
**Sistem (varsayılan)** / **Açık** / **Koyu**.

- Kullanıcı açık ya da koyu seçtiğinde \`localStorage\` anahtarı
  \`devacademy-theme\` içine yalnızca bu değer kaydedilir.
- Sistem seçeneğinde anahtar kaldırılır ve \`prefers-color-scheme\`
  izlenir. İşletim sistemi renk şeması açık bir seçim yapılmadığı
  sürece canlı olarak uygulanır.
- Sayfa ilk çizilmeden önce yürütülen küçük \`beforeInteractive\`
  bootstrap, kayıtlı seçimi veya OS tercihini HTML köküne uygular;
  ana JS paketinin yüklenmesi beklenmez.
- Depolama engellenirse tema yine aynı sayfa oturumunda seçilebilir.
  Kayıt/hesap verilerine yazılmaz, çerez veya sunucu isteği kullanılmaz.
- Başlangıç kodu yalnızca sabit bir tercih değerini okur. Ders içeriği,
  öğrencinin gönderdiği kod veya sorgu parametresi yürütülmez.

## Bileşenler ve sınırlar

Tüm M8.6A semantik CSS tokenları tema bazında çözümlenir; marka
navigasyonu, kurs kartları, ilerleme, quiz, kontroller, Öğrenme
Stüdyosu, kavram açıklamaları ve transfer panelleri aynı temayı alır.
Geniş kapsamlı eski CSS'de açık temadan kalabilecek sert kodlanmış
rengeleri engellemek için dark-only seçici düzeltmeleri kullanılır.

CodeMirror, \`theme\` prop'unu etkin moda göre ayarlar. Syntax
renkleri CSS \`filter:invert\` ile ters çevrilmez. Yeni bağımlılık,
font indirme, migration veya yürütme hizmeti eklenmez.

## Test kapıları

1. Açık mod testleri ve önceden doğrulanan kontrast eşikleri korunur.
2. Koyu modun altı çekirdek metin/zemin çifti için ≥4.5:1 birim testi.
3. Gerçek 320px Chrome: seçiciye tıklama, koyu görünümün render
   renkleri, sonraki ders sayfasına geçişte tercihin korunması ve
   Öğrenme Stüdyosu'nun koyu kod yüzeyi.
4. Sistem moduna geçiş, manuel tercihin silinmesi, işletim sistemi
   renk değişimini canlı takip ve açık seçimin OS koyu moduna üstünlüğü.
5. TS, lint, test, production build, veri kaydı ve önceki içerik
   doğrulamalarının regresyon kontrolleri.

Bu PR yalnızca tema kapsamındadır. M8.6B ana sayfa/kurs keşfi
yenilemesi ayrı iş paketi olarak kalır.
