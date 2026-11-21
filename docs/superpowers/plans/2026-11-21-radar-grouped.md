# Sektör Radarı gruplama uygulama planı

> Uygulama: kullanıcı "başla" dedi; bu oturumda native olarak uygulanıyor (önceki fihrist planlarıyla aynı yöntem).

**Hedef:** Radar haberlerini `topic.key` değerine göre (ilk taslakta `learning.label` vardı; neredeyse hiç birleştirmediği için değişti) numaralı gruplara ayırmak, filtreleri ve kaynak durumunu sadeleştirmek.
**Spec:** `docs/superpowers/specs/2026-11-21-radar-grouped-design.md`
**Dal:** `feat/path-index` (PR #48'e ek commit; örtüşen ikinci PR açılmayacak)

## Genel kısıtlar
- `radar-feed.mjs` ve `radar-learning.mjs` değişmeyecek. Yeni bağımlılık eklenmeyecek, yalnızca mevcut token'lar kullanılacak.
- `radar-feed.test.mjs` metin sözleşmeleri korunacak.
- Dokunma hedefi ≥ 44 px olacak, 320 px'te yatay taşma olmayacak, `prefers-reduced-motion` desteklenecek.

## İnceleme odağı
1. Tek bir habere sahip grup da numara ve ders başlığıyla doğru görünmeli.
2. Filtre tek gruba indiğinde numara 01 olmalı. Grup numarası katalog sırası değil, sayfadaki sıradır.
3. Bayat (`stale`) kaynak uyarısı açılır öğenin içine gizlenmemeli.
4. Yatay kaydırılan konu filtresinde klavye odağı görünür kalmalı ve seçili çip ekrana kaydırılabilmeli.
5. Koyu temada grup numarası ve künye metni okunur kalmalı.

### Görev 1: Sözleşme testi (`tests/design-system.test.mjs`)
`radar/page.tsx` içinde şunlar aranacak:
- `className="radar-group-index"` (`<ol>`)
- `className="radar-group-no" aria-hidden="true"`
- `<summary>Bu derse neden bağlandı?</summary>`
- `className="radar-health-strip"`

Şunların olmadığı doğrulanacak: `radar-article-grid`, `Neden öğrenmeye değer?`.
CSS'te `.radar-topic-filters{` için `overflow-x:auto` beklenecek.

### Görev 2: Sayfa (`src/app/radar/page.tsx`)
- `groupByTopic(items)` fonksiyonu `{key, label, learning, items}[]` döndürecek; `label` değeri `radarTopics` içinden gelecek. Gruplar `Map` ile ilk görülme sırasıyla oluşacak; akış zaten yeniden eskiye sıralı olduğu için grup sırası en yeni habere göre çıkacak.
- Grup: `li.radar-group` içinde sırasıyla `radar-group-no`, `radar-group-head` (h3 başlık, kapsam ve bağlantılar), `why` paragrafı ve `ul.radar-group-items` yer alacak.
- Haber satırı: `li.radar-article` içinde h4 başlık bağlantısı, künye satırı, gerekiyorsa bayat kayıt satırı, `details.radar-reading-prompt` (context + question) ve HN tartışma bağlantısı bulunacak.
- Kaynak durumu: `ul.radar-health-strip` (ad, durum, kısa saat) ve `details.radar-health-details` içinde mevcut kart ızgarası olacak.

### Görev 3: CSS (`globals.css`, M8.7 katmanının sonuna "Radar grupları")
- Grup ızgarası `.path-card` ritmini izleyecek: `5.25rem 1fr` sütunlar, numarada Fraunces 300 ve terracotta %45 ton, hover/odakta tam renk.
- Kaynak filtresi altı çizili düz metin sekme olacak.
- Konu filtresi `flex-wrap:nowrap; overflow-x:auto` ile tek satırda kayacak.
- `.radar-article-grid` ile ilgili eski kurallar silinecek.

### Görev 4: Doğrulama
`node --test tests/*.test.mjs`, lint ve typecheck çalıştırılacak. Tarayıcıda `/radar` sayfası 1280 ve 320 px'te, koyu temada ve filtreli olarak kontrol edilecek. Ardından commit atılacak ve PR #48 güncellenecek.
