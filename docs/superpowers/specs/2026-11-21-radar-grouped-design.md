# Sektör Radarı: konuya göre gruplanmış fihrist

## Amaç
Kullanıcı Radar sayfasını karışık buldu. Her haber kartında yaklaşık 12 öğe var. Aynı ders bloğu ("React ve bileşenler", "Neden öğrenmeye değer?", ders bağlantıları) aynı konudaki her haberde tekrarlanıyor. 13 filtre çipi iki satıra taşıyor. Hedef, sayfanın amacını ("gündemi öğrendiğin kavramlara bağla") ilk bakışta okunur kılmak ve sitenin fihrist diliyle tutarlı olmak.

## Yaklaşımlar
- **A. Tek sütun haber satırları:** En az değişiklik gerektiriyor ama haber–ders bağı geri planda kalıyor.
- **B. Konuya göre gruplama (seçildi):** Ders bilgisi her grupta bir kez görünüyor, tekrar tamamen kalkıyor.
- **C. Öne çıkan haber ve liste:** Haber sırası otomatik olduğu için "öne çıkan" haber rastgele kalıyor.

## Tasarım (B)
- **Gruplama anahtarı:** `item.topic.key`, başlık `radarTopics` etiketi. *(Uygulamada değişti: ilk taslaktaki `learning.label` sürüm ve ipucuna özgü olduğu için 11 haberi 10 gruba bölüyordu. Konu anahtarı aynı veride 6 grup verdi. Ders bloğu grubun en yeni haberinden gelir. Bir haberin birincil dersi bu bloktan farklıysa, o ders bağlantısı haberin açılır öğesinde gösterilir.)* Grup sırası, grubun en yeni haberine göre belirlenir; grup içinde haberler en yeniden eskiye sıralanır. Grupların numarası 01, 02… biçiminde iri Fraunces ile yazılır, terracotta tondadır (ders yolu fihristiyle aynı).
- **Grup başlığı (bir kez):** Numara, ders adı (`label`), kapsam (`coverage`), birincil ve varsa ikincil ders bağlantısı ile türü. Altında grubun ilk haberinin `why` metni tek paragraf olarak yer alır; "Neden öğrenmeye değer?" ara başlığı kalkar.
- **Haber satırı:** Başlık bağlantısı (↗), künye satırı ("DEV Community · Topluluk yazısı · 21 Kas 02:07") ve varsa HN tartışma bağlantısı. Haberin kendisine özel `context` ve `question` metinleri tek bir açılır öğede durur: "Bu derse neden bağlandı?". Bayat kayıt uyarısı satırda kalır.
- **Filtreler:** Kaynaklar altı çizili düz metin sekmelere döner. Konular tek satırda yatay kaydırılır. İkisi de link olmayı ve `aria-current` kullanmayı sürdürür, dokunma hedefi 44 px kalır.
- **Kaynak durumu:** Üç sütunlu blok tek satırlık künyeye iner, örneğin "Hacker News · Güncellendi · 02:10". Ayrıntılar (tür, uyarı, site bağlantısı) tek bir açılır öğede durur. Bayat veya erişilemeyen kaynak varsa uyarı açık durur.
- "İlgili olabilir" bölümü, boş durum mesajları, yöntem notu ve üstteki giriş bölümü değişmez.

## Kısıtlar
- Veri katmanına (`radar-feed.mjs`, `radar-learning.mjs`) dokunulmaz. Gruplama sayfada yapılır.
- `radar-feed.test.mjs` içindeki metin sözleşmeleri korunur ("haberlerin doğruluğunu…", "Son başarılı kontrol", `role="status"`, `rel="noopener noreferrer"`).
- Yeni bağımlılık eklenmez. 320 px'te taşma olmaz, koyu temada kontrast ≥ 4.5:1 kalır, `prefers-reduced-motion` desteklenir.

## Uygulayıcıya kalanlar
Sınıf adları, boşluklar ve kırılım noktaları.
