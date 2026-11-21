# M9 · Python altın standardı: eğitim öz-incelemesi

**Tarih:** 2026-11-21 · **Kapsam:** PR #51 ile birleşen beş Python Temelleri dersi
**İnceleme türü: öz-inceleme, bağımsız değil.** İçeriği yazan ajan (Claude) aynı
oturumda kendi içeriğini inceledi. AGENTS.md'nin yüksek riskli değişiklikler için
istediği bağımsız eğitim incelemesi **yapılmadı**. Bu belge o incelemenin yerini
tutmaz; bağımsız gözden geçirene bir başlangıç listesi verir.

**Öğrenci verisi yok.** Aşağıdaki hiçbir bulgu öğrenci davranışına dayanmaz.
Öğrenme etkisi iddiası ancak `M9-PILOT-PROTOCOL.md` uygulandıktan sonra yapılabilir.

## 1. Neye bakıldı

| Bileşen | Kaynak | Kontrol |
|---|---|---|
| Zihinsel model, adım adım örnek, sınır durumu | `apps/web/src/data/lesson-walkthroughs.json`, `lesson-depth.json` | Her adımın ara değeri elle yeniden hesaplandı |
| Yeni dördüncü sorular | `questions.json`, `src/server/answer-keys.json` | Doğru seçenek ve her yanlış seçeneğin geri bildirimi okundu |
| Sunucuda değerlendirilen kod görevleri | `practice.json`, `services/code-runner/src/exercises-private.mjs` | Açık ve gizli test durumlarının beklenen değerleri elle hesaplandı |
| Kaynak bağlantıları | `lesson-walkthroughs.json` | Her bağlantının docs.python.org'daki ilgili bölüme gittiği okundu |
| Pilot kartları | `M9-PYTHON-PILOT-CARDS.md`, `apps/web/tests/fixtures/m9-python-pilot-cases.json` | Ders örnekleri ve sorularla yapısal benzerlik karşılaştırıldı |

## 2. Doğruluk

Hesaplanan bütün değerler doğru bulundu ve gerçek Python 3.12 yorumlayıcısında doğrulandı:

- **Değişkenler:** 12.50×3+4.99 = 42.49; `order-total` sorusunun cevabı `32.75` (`18.50 * 2 - 4.25`).
- **Koşullar:** hava kalitesi örneğinde indeks 50 iken `"Dışarıda kısa kal"`, indeks 35 iken `else` dalında `"Temiz hava"`, sıra ters çevrildiğinde indeks 120 için `"Dışarıda kısa kal"`; `shipping-boundary` sorusunda `[20, 11]` bagaj ağırlıkları için toplam `50`.
- **Döngüler:** `range(len(readings))` ile sensör örneği `22` verir, `break` sınır durumu `12` verir; `sensor-skip` sorusunda `[6, -3, 0, 9]` için `3:15`.
- **Fonksiyonlar:** `order_total(120) + order_total(120, 0)` örnek adımları `150` ve `120`; sınır durumu değiştirilebilir varsayılan argümandır; `default-fee` sorusunda `calc_score(15) - calc_score(15, 0, 1)` = `25`.
- **Koleksiyonlar:** kütüphane örneği `['roman', 'tarih']` verir; `low-stock` sorusu antrenman günleri için `['sal', 'çar']`; sınır durumu `None < 3` karşılaştırmasının `TypeError` vermesidir.
- **Gizli testler:** `format-total`, `shipping-fee` ve `low-stock` için bütün açık ve gizli durumların beklenen değerleri doğrudur. Gizli durumlar istemci paketine girmez.

Kod görevlerinin gerçek yalıtılmış yürütmesi `services/code-runner/tests/code-transfer-docker-smoke.mjs` ile CI'da çalışır; yerelde Docker olmadığı için çalıştırılmadı.

## 3. Bulgular

| # | Önem | Bulgu | Durum |
|---|---|---|---|
| R1 | Kritik | Döngü pilot kartları (negatifleri `continue` ile atlayıp toplama), yeni sensör örneği ve `python.loops.sensor-skip` sorusuyla yapısal olarak aynıydı. Son test transferi değil, ders örneğini hatırlamayı ölçerdi. | **Giderildi.** Kartlar toplama yerine geçerli kayıt sayma olarak yeniden yazıldı. |
| R2 | Yüksek | Sözlük pilot kartları (`get(eksik, 0) + d[anahtar]`) dersteki transfer göreviyle neredeyse aynıydı. | **Giderildi.** Kartlar `get` varsayılanı ile sırayı koruyan liste kurma olarak yeniden yazıldı. |
| R3 | Yüksek | Yeni ders hedefleri kartlarda ölçülmüyordu: değişkenlerde `float` ve `:.2f`, koşullarda kademe sırası ve sınır değeri. | **Giderildi.** Değişken kartları `float` + `:.2f`; koşul kartları değeri tam sınırda veya sınırın hemen altında olan kademeli zincir. |
| R4 | Orta | Yeni dördüncü sorular adım adım örneklerle neredeyse aynı yapıdadır. Yakın transferi ölçer; uzak transferi yalnızca kod görevleri ölçer. | **Giderildi.** Beş dersin dördüncü soruları farklı bağlam ve soru biçimine taşındı (bilet+kupon çıkarma, döngülü bagaj ücreti, geçerli sayaç+toplam `3:15`, iki çağrı farkı, haftalık antrenman günleri). |
| R5 | Düşük | Koşullar örneği `else` dalını hiç çalıştırmıyor. | **Giderildi.** Koşullar adım adım örneğine `index = 35` ile `else` dalını çalıştıran adım eklendi. |
| R6 | Düşük | Döngüler hedefi `range` diyor, adım adım örnek `range` kullanmıyor. | **Giderildi.** Döngüler adım adım örneği `for i in range(len(readings)):` kullanacak şekilde güncellendi; böylece hedef ile örnek doğrudan hizalandı ve `range` üst sınır hariç kuralı somut indekslerle gösterildi. |
| R7 | Düşük | Beş ders bağlamından dördü ticaret (sipariş, kargo, stok). Bağlam çeşitliliği düşük. | **Giderildi.** Koşullar hava kalitesine, koleksiyonlar okul kütüphanesi kitap kopyalarına taşındı; yalnızca değişkenler ve fonksiyonlar (5 dersten 2'si) ticaret bağlamında bırakıldı. |

## 4. Pilot kartlarında ne değişti

Fonksiyonlar (print/return, birincil ölçüt) ve isteğe bağlı fonksiyon yazma görevi
değişmedi. Diğer dört konu, derslerdeki örneklerle aynı yapıda olmayacak şekilde
yeniden yazıldı:

| Konu | Önce | Şimdi |
|---|---|---|
| Değişkenler | `int(metin) * n - d` | `float(metin) * n + d`, `:.2f` ile yazdırma |
| Koşullar | `elif X and Y` | Doğru sıralı kademeli zincir, değer sınırda veya hemen altında |
| Döngüler | Negatifleri atlayıp toplama | Negatifleri atlayıp geçerli kayıt sayma; sıfır geçerli |
| Sözlük | `get(eksik, 0) + d[anahtar]` | `[d.get(x, 0) for x in liste]`; sıra ve tekrar korunur |

Her konuda üç formun beklenen çıktısı farklıdır. 18 referans programın tamamı
`apps/web/tests/m9-python-pilot-runtime.mjs` ile gerçek Python'da çalıştırılıp
beklenen çıktıyla karşılaştırıldı. Formlar hâlâ güçlük bakımından eşitlenmedi.

## 5. Bağımsız gözden geçirene açık sorular

1. R4 sonrası: Yeniden yazılan dördüncü sorular (özellikle döngülü bagaj koşulu ve `valid_count:total` çıktılı sensör sorusu) yeni başlayan öğrencide tek bir beceriyi mi yoksa aşırı bileşik yükü mü ölçüyor?
2. Yeni pilot kartları ders hedefleriyle aynı beceriyi mi ölçüyor, yoksa yeni bir
   beceri (ör. sayma, liste kurma) mi ekliyor?
3. Sınır durumları (değiştirilebilir varsayılan, `None < 3`) başlangıç seviyesi için
   doğru seçim mi?
