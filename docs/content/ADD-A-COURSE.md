# DevAcademy Course Engine v1: yeni dil / kurs ekleme

Bu aşamada **tek kurs bileşeni**, çoklu dil derslerini okur. Derslerin ve soruların herkese açık metinleri Git'te; doğru yanıtlar yalnızca sunucuda tutulur. İçerik eklemek için Next.js sayfası veya veritabanı şeması değiştirmeyin.

## Yeni kurs yayımlama adımları

1. `apps/web/src/data/catalog.json` içindeki `language.<slug>` kimliğinin varlığını doğrula; yoksa katalog girdisi ekle.
2. `apps/web/src/data/courses.json` dosyasına benzersiz `course.<language>.<level>` ID, URL slug, Türkçe başlık, dil ID'si, `editorLanguage`, özellik bayrakları ve sıralı `lessonIds` ekle. Metin editörü için `editorLanguage: "plain"` kullanılabilir. JS sözdizimi için `"javascript"`, Java düz metin için `"java"`.
3. `apps/web/src/data/lessons.json` içerisine benzersiz, kararlı `lesson.<language>.*` kimlikli dersler ve ön koşulları ekle. `questionIds` yalnızca o dersin sorularına referans vermeli. Aynı kurs içerisinde slug benzersiz olmalı. Ön koşullar aynı kurs içinde daha önceki derslere işaret etmeli.
4. `apps/web/src/data/questions.json` içerisine açık soru metni, kod ve seçenekleri ekle. **Doğru seçenek ID'sini, açıklamasını veya gizli testleri bu dosyaya yazma.**
5. Çoktan seçmeli soruların doğru seçenek ve açıklamalarını yalnızca `apps/web/src/server/grade.ts` sunucu modülündeki `answerKeys` içine ekle.
6. `corepack pnpm check` ile içerik şeması, referanslar ve kod testi dâhil kontrolleri çalıştır. Java örnekleri için ayrıca GitHub CI, Temurin Java 21 ile `javac` ve `java` doğrulaması yapar. Eğitim içeriğini teknik/editorial gözden geçir, sonra PR aç.

## Otomatik gelen özellikler

- `/kurslar`: Tüm kurslar.
- `/kurslar/<course-slug>`: Ders listesi.
- `/kurslar/<course-slug>/<lesson-slug>`: Ortak ders, CodeMirror, quiz ve bitirme ekranı.
- Dil bağımsız `/api/assess` sunucu cevap kontrolü.
- Aynı `/api/progress` üzerinden kullanıcıya ait ders ve deneme kayıtları; hesap panelinde kurslara göre gruplanma.
- `/kutuphane/diller` kataloğunda varsa kurs bağlantısı.

## Önemli güvenlik ve kapsam sınırları

**Katalog, editör, kod çalıştırma ve otomatik kod testi birbirinden ayrıdır.** `capabilities.run` ve `codeAssessment` şu anda **false** olmak zorundadır. `java` veya `plain` modunda CodeMirror düz metin sunar; Java syntax highlighting ayrıca kurulmadı. Java kodu *derlenmez* veya kullanıcı adına çalıştırılmaz. Java'nın depodaki önceden incelenmiş örnekleri **yalnız CI ortamında** derlenip çalıştırılır; bu, Java kullanıcısı kodunu çalıştırmak anlamına gelmez.

Mevcut `/dersler` ve `/dersler/<slug>` JavaScript bağlantıları çalışmaya devam eder; kalıcı `lesson.javascript.*` ve `js.*` ID'leri değişmedi. Yeni kurslar için DB migration gerekmez. Course Engine v1 içerik-yönetimi bir Git/PR iş akışıdır; görsel içerik düzenleme aracı ve çok dilli derleyici değildir.

`courses.json`, `lessons.json` ve `questions.json` herkese açık **içerik verisidir**. Buraya kullanıcı kodu, gizli cevaplar, anahtarlar veya üretim konfigürasyonları koyma.
