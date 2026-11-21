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

Hesaplanan bütün değerler doğru bulundu:

- **Değişkenler:** 12.50×3+4.99 = 42.49; `order-total` sorusunun cevabı 20.00.
- **Koşullar:** tam 200 sınırında ücret 30; 499.99 için ücret 30.
- **Döngüler:** sensör örneği 22 verir, `break` sınır durumu 12 verir;
  `sensor-skip` sorusunda `[5, -2, 0, 8, -1]` için 13.
- **Fonksiyonlar:** `order_total(120) + order_total(80, 0)` = 230; sınır durumu
  değiştirilebilir varsayılan argümandır.
- **Koleksiyonlar:** örnek `['elma', 'kiraz']` verir; soru `['defter', 'silgi']`;
  sınır durumu `None < 5` karşılaştırmasının `TypeError` vermesidir.
- **Gizli testler:** `format-total`, `shipping-fee` ve `low-stock` için bütün açık
  ve gizli durumların beklenen değerleri doğrudur. Gizli durumlar istemci
  paketine girmez.

Bu kontroller elle yapıldı. Kod görevlerinin gerçek yalıtılmış yürütmesi
`services/code-runner/tests/code-transfer-docker-smoke.mjs` ile CI'da çalışır;
yerelde Docker olmadığı için çalıştırılmadı.

## 3. Bulgular

| # | Önem | Bulgu | Durum |
|---|---|---|---|
| R1 | Kritik | Döngü pilot kartları (negatifleri `continue` ile atlayıp toplama), yeni sensör örneği ve `python.loops.sensor-skip` sorusuyla yapısal olarak aynıydı. Son test transferi değil, ders örneğini hatırlamayı ölçerdi. | **Giderildi.** Kartlar toplama yerine geçerli kayıt sayma olarak yeniden yazıldı. |
| R2 | Yüksek | Sözlük pilot kartları (`get(eksik, 0) + d[anahtar]`) dersteki transfer göreviyle neredeyse aynıydı. | **Giderildi.** Kartlar `get` varsayılanı ile sırayı koruyan liste kurma olarak yeniden yazıldı. |
| R3 | Yüksek | Yeni ders hedefleri kartlarda ölçülmüyordu: değişkenlerde `float` ve `:.2f`, koşullarda kademe sırası ve sınır değeri. | **Giderildi.** Değişken kartları `float` + `:.2f`; koşul kartları değeri tam sınırda veya sınırın hemen altında olan kademeli zincir. |
| R4 | Orta | Yeni dördüncü sorular adım adım örneklerle neredeyse aynı yapıdadır. Yakın transferi ölçer; uzak transferi yalnızca kod görevleri ölçer. | Açık. Bağımsız gözden geçiren karar vermeli. |
| R5 | Düşük | Koşullar örneği `else` dalını hiç çalıştırmıyor. | Açık. |
| R6 | Düşük | Döngüler hedefi `range` diyor, adım adım örnek `range` kullanmıyor. | Açık. `range` mevcut ısınma sorusunda ve transfer görevinde sınanıyor. |
| R7 | Düşük | Beş ders bağlamından dördü ticaret (sipariş, kargo, stok). Bağlam çeşitliliği düşük. | Ders içinde açık. Pilot kartları artık ticaret dışı bağlamlar kullanıyor (spor, su, kulüp, hava). |

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

1. R4: Dördüncü sorular örneğe bu kadar yakın kalmalı mı, yoksa bağlamı değiştirilmiş
   bir yakın transfer sorusuna mı dönüşmeli?
2. Yeni pilot kartları ders hedefleriyle aynı beceriyi mi ölçüyor, yoksa yeni bir
   beceri (ör. sayma, liste kurma) mi ekliyor?
3. Sınır durumları (değiştirilebilir varsayılan, `None < 5`) başlangıç seviyesi için
   doğru seçim mi?
