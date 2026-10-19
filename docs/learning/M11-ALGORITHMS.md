# M11 · Veri Yapıları ve Algoritmalar: içerik ve teknik kabul

**Kapsam:** Mevcut JavaScript Temelleri kursuna dokunmadan ayrı bir `/kurslar/veri-yapilari-algoritmalar` öğrenme yolu. Öğrenci pilotu **yapılmadı**; burada teknik doğrulama ve gözden geçirilmiş ders içeriği söz konusudur.

## Dört adımlık müfredat

| Ders | Öğrenme kararı | Gerçek kullanım | Kritik yanlış varsayım |
| --- | --- | --- | --- |
| Arama maliyeti | O(n) ile O(log n)'yi ayırma | Büyüyen ürün envanterleri | Big O kesin saniye veya sırasız veride ikili arama garantisidir |
| Stack ve queue | LIFO / FIFO | Geri alma ve destek kuyruğu | pop ve shift eşdeğerdir; Array.shift her zaman O(1)'dir |
| Map ve Set | Tekil kullanıcı ile toplam olayı ayırma | Trafik/ürün sıklığı | Beş olay her zaman beş farklı kullanıcıdır |
| İkili arama | Sıralı veri ve sınır koşulları | Sıralanmış ürün kimliği araması | Sırasız dizide -1 her zaman öğe yok demektir |

**Uygulama dili:** JavaScript. Kursu bitirmek için sekiz sunucu tarafından değerlendirilen bilgi sorusunun tamamı doğru cevaplanmalıdır. Yanlış seçenekler ayrı yanlış varsayım açıklamaları taşır.

### Bağımsız çalışmaya yönelik örnek görevler

1. Envanterde en son öğeyi arayan doğrusal aramanın kaç adımda bittiğini kendi örneğinle hesapla; 32 öğelik sıralı bir listenin kaç kez yarıya bölündüğünü karşılaştır.
2. Bir geri alma geçmişi ve destek talebi sırası oluştur; aynı üç olayın hangi sırada çıkarıldığını açıkla. Kuyruk büyüdüğünde `shift()` maliyetini tartış.
3. `[2,2,5,7,5]` ile tekil ID, toplam olay ve kimlik başına olay sayısını ayrı ayrı hesapla.
4. 5 elemanlı sıralı listede ikili arama uygula; boş liste, aranan değerin ilk/son indeks olması, bulunamayan değer ve sırasız girdi durumlarını karşılaştır.

Bu görevler **rehberli örnek ve ders içi çalışma yönergeleridir**. Görevlerin tarayıcı editöründe çözülmüş olması sunucuda kod değerlendirmesi, çalıştırma veya bağımsız yeterlilik kanıtı üretmez.

## Teknik kalite sınırı

- `apps/web/tests/algorithms-curriculum.test.mjs` Node.js 24 üzerinde dört yayımlanmış örnek kodu ve sekiz özel cevap anahtarını gerçek yürütme sonucu ile karşılaştırır; sınır senaryolarını ayrıca test eder.
- Yeni dersler `lesson.algorithms.*` ve `alg.*` kimliklerini kullanır. Mevcut 19 dersin ve 46 sorunun kimliği korunur, öğrenci kaydı migration gerektirmez.
- JavaScript editörü **çalıştırma kapalı** modundadır: `run:false`, `codeAssessment:false`. Worker yalnızca önceden izin verilen localhost sandbox görevlerinde etkinleşebilir, yeni kurs için böyle bir görev eklenmedi.
- İkili arama önkoşulu sıralı girdidir, aksi durumda -1 doğru bir yokluk kanıtı değildir. Asimptotik sınıflandırma, sabit süre garantisi değildir.
- Mevcut 15 JS/Java/Python dersi için üç düzeyli Applied Learning Studio korunur. Yeni 4 ders için hazır bir Applied Studio bulunmadığından bu deneyimi varmış gibi sunmuyoruz.
- Yeni güzergâhın gerçek tarayıcı testi ve ders kayıtları, CI kapsamındaki arayüz/HTTP kontrollerinden geçirilir.

## Bir sonraki paket

M11'in daha sonraki genişlemesi için TypeScript ve küçük proje laboratuvarları adaydır. Pilotun ön/son/gecikmeli bağımsız görev ölçümleri ve gerçek kullanıcı analizi yapılmadığı sürece öğrenme etkisi ölçülmüş gösterilemez. Veri toplama, rıza ve sınırları M9/M11 pilot belgeleri üzerinden planlanmalıdır.
