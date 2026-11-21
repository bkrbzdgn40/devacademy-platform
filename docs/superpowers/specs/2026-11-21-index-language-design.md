# Fihrist dili: tüm sitede kutu kart yerine çizgi ve tipografi

## Amaç
Ders yolu fihristi (`2026-11-21-path-index-design.md`) kabul gördü. Kullanıcı aynı düzenin diğer kartlara da uygulanmasını istedi. Hedef, yuvarlak köşeli, çerçeveli ve gölgeli `ui-card` kutularını siteden kaldırıp yerlerine ince çizgi, serif başlık ve kod fontu künye koymak.

## Kurallar (uygulayıcı kararı)
- **R1 – Listeler, çizgili satır olur.** Ders listesi, ana sayfadaki keşif satırları, Radar kaynak listesi, katalog ve panodaki kurs listesi. Satırlar 1 px çizgiyle ayrılır, listenin üstünde güçlü bir çizgi bulunur. Ders numarası iri Fraunces ile yazılır, terracotta %45 tonundadır ve hover/odakta tam renge döner.
- **R2 – Eş öğeli ızgaralar, gazete sütunu ya da künye satırı olur.** Radar kaynak durumu dikey çizgili sütunlara ayrılır. Radar makalelerinin üstünde 2 px mürekkep çizgisi bulunur. Pano istatistikleri 4 sütunlu bir künye satırı olur (≤680 px'te 2 sütun). Keşif bilgileri dikey çizgiyle ayrılır.
- **R3 – Tekil paneller, kenar notu olur.** Arka plan, çerçeve, köşe yuvarlaması ve gölge kalkar, yerine yalnızca 2 px üst çizgi gelir. Çizgi mürekkep rengindedir. `journey-card` ve `learning-next-action` aksiyon rengini, tehlikeli bölüm ise kritik rengi kullanır.

## Kapsam dışı
Quiz kartı, kod ve stüdyo yüzeyleri, keşif arama formu, butonlar ve Radar filtre çipleri bu değişikliğin dışında. `ui-primitives` içindeki `ui-card` primitive'i de korunuyor; sayfalar artık onu kullanmıyor.

## Sözleşmeler
- Sınıf adları korunuyor (smoke testler ve stiller bunlara bağlı); yalnızca `ui-card` çıkarılıyor.
- `responsive-smoke.mjs` artık yüzey rengini `.radar-source-list.ui-card` yerine geçici bir `ui-card` öğesinden okuyor. Beklenen renkler değişmedi.
- `prefers-reduced-motion` durumunda kayma animasyonu olmuyor.
