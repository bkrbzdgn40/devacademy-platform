# Ders yolları: kart yerine dergi fihristi

## Amaç ve neden
Yuvarlak köşeli, çerçeveli kartlar ("ui-card" + hap etiketler + alt çizgili CTA) siteyi yapay zekâ üretimi gibi gösteriyor. Ders yollarını, sitenin serif (Fraunces) ve toprak tonu kimliğini öne çıkaran bir "dergi fihristi" düzenine taşıyoruz.

## Kapsam
- **Var:** `LearningPathCard` ve onu kullanan iki yer: ana sayfa (`.home-path-grid`, compact) ve kurslar sayfası (`course-explorer`, tam).
- **Yok (sonraki adım):** pano, Radar, ders listesi gibi diğer `ui-card` kullanımları. Bu iş başarılı olursa aynı dil oralara da taşınır.
- **Başarısızlık sayılır:** erişilebilirlik kaybı (odak, kontrast, tıklama alanı), 320 px'te taşma, view-transition başlık morph'unun bozulması, testleri silerek geçirmek.

## Yaklaşımlar
- **A: Dergi fihristi (seçilen).** Kutu yok, satırlar ince çizgilerle ayrılıyor, büyük sıra numarası ve serif başlık var. En az kodla en büyük fark.
- B: Metro hattı. İmza öğe olarak güzel ama pahalı. Kurs detayı için ileride değerlendirilecek.
- C: Kütüphane fiş kartı. Yine dikdörtgen bir kart ve kostüm riski taşıyor. Elendi.

## Tasarım
- Liste semantiği: `.path-grid` → `<ol class="path-index">`, her yol bir `<li>` içinde `<article>`. Sıra numarası `01, 02…` CSS sayacıyla, `aria-hidden` olarak üretiliyor.
- Satır düzeni (masaüstü): `[numara | başlık + payoff | künye + ok]` grid'i. Arka plan, çerçeve, border-radius ve gölge yok. Satırlar arasında yalnızca 1 px çizgi var, listenin üstünde de bir çizgi.
- Numara: Fraunces, iri ve ince (≈ 3–4 rem). Rengi tona göre değişiyor (`path-terra` → terracotta, `path-sand` → tan, varsayılan → action). Bu, eski renkli üst çizginin yerini alıyor.
- Künye: kod fontu, küçük ve `·` ile ayrılmış düz metin (hap etiketler kalkıyor), örneğin `7 ders · 14 soru · ~157 dk`.
- "İlk ders: …" bilgisi künyenin altında küçük bir satır olarak kalıyor.
- Tam görünüm (kurslar sayfası): "Bu yolda neleri kavrayacaksın?" maddeleri başlığın altında iki sütunlu, sade bir liste olarak duruyor. Arama eşleşmeleri arka plan kutusu olmadan sol çizgili bir not olarak gösteriliyor.
- Etkileşim: satırın tamamı hover/focus-within durumunda numarayı tam renge boyuyor, başlığın alt çizgisi uzuyor ve ok 4 px kayıyor. `translateY` ve gölge kalkıyor. `prefers-reduced-motion` durumunda yalnızca renk değişiyor.
- Mobil (≤ 680 px): numara başlığın üstüne küçülüyor (≈ 1.6 rem), künye alta iniyor. 320 px'te taşma yok.
- `.path-card` sınıf adı kalıyor (smoke testler ve view-transition için), `ui-card` bu bileşenden kaldırılıyor. `design-system.test.mjs` içindeki `ui-card path-` beklentisi yeni sözleşmeye (`path-index` / `path-card`) güncelleniyor.

## Uygulayıcıya kalanlar
Kesin boşluk ve tipografi değerleri, açık/koyu tema renk eşlemesi (mevcut token'larla), eski `.path-grid` `:has(nth-child(5))` kurallarının temizlenmesi.
