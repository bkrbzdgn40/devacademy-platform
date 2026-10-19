# M10 · Sektör Radarı: gerçek kaynak sözleşmesi ve işletim sınırları

**Ürün alanı:** `/radar`; ana sayfada Sektör Radarı bağlantısı, Keşfet menüsünde Radar girişi.

## Kaynaklar ve doğrulanabilir metadata

| Kaynak | Sabit salt-okunur uç | İçerik etiketi | Yayın zamanı |
| --- | --- | --- | --- |
| Hacker News | `https://hacker-news.firebaseio.com/v0/topstories.json` ve ilk 24 ID için `item/{id}.json` | Topluluk tartışması | `item.time` (Unix saniye) |
| DEV Community | `https://dev.to/api/articles/latest?per_page=100` | Topluluk yazısı | `published_at` |
| GitHub Releases | `https://api.github.com/repos/{nodejs/node,microsoft/TypeScript,facebook/react,astral-sh/ruff,spring-projects/spring-boot}/releases?per_page=4` | Resmî depo sürümü | `published_at` |

Bu API'ler kamuya açık salt-okunur endpointlerdir, kullanıcı hesabı veya DB istemez. Sabit kaynaklar dışına geçilemez. Örneğin GitHub sürümleri sadece bu depoların **kendi** yayın kayıtlarıdır; haberin doğruluğu veya sürümün güvenli olduğu iddiası değildir.

Temel kaynaklar:
- [Hacker News resmî API](https://github.com/HackerNews/API)
- [DEV / Forem v1 API dökümantasyonu](https://developers.forem.com/api/v1)
- [GitHub Releases REST API](https://docs.github.com/en/rest/releases/releases)
- [GitHub REST rate limitleri](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)

**Limit ve nezaket:** GitHub'ın kimlik doğrulamasız genel REST limiti normalde kaynak IP başına saatte 60 istektir; Radar, 15 dakika yenileme aralığıyla 5 sabit depoyu sorgular. Bu sunucu önbelleği süreç içidir; çoklu dağıtımda ortak IP bütçesi yeniden planlanmalıdır. DEV için belgelenmiş `User-Agent` header'ı gönderilir. Bir kaynaktan tek seferde sınırlı sayıda kayıt okunur, kaynak sitelerin tam makaleleri indirilmez.

## Veri bütünlüğü ve kişiselleştirme

1. Başlık, yayın tarihi ve HTTPS kaynak URL'si gereklidir; uygun olmayan kayıt dışlanır. HN URL'si yoksa yalnızca kaynak üzerindeki gerçek tartışma bağlantısı kullanılır.
2. Topluluk başlıkları en çok 35 gün; sürümler en çok 120 gün önceden yayımlanmış olabilir. Geleceğe 5 dakikadan fazla kaymış tarihler reddedilir. Bu eşikler editoryal güncellik penceresidir, kaynağın tazeliğiyle karıştırılmaz.
3. `utm_*`, `fbclid`, `gclid` gibi takip parametreleri kaldırılır; kanonik bağlantı normalize edilerek aynı içerik iki kez listelenmez. Çakışmada DEV özgün yazısı HN paylaşımına tercih edilir.
4. Konu eşleştirmesi başlık/etiketlerde bulunan sınırlı, testli kelime desenleriyle yapılır. TypeScript, React ve SQL gibi henüz tam dersi olmayan konularda katalog; JavaScript, Java ve Python'da var olan ders bağlantıları verilir. "Neden ilgili?" metni önceden editoryal olarak yazılmış **ders köprüsüdür**; yazının otomatik özeti veya doğruluk onayı değildir.
5. Haber gövdeleri, HTML, model istemleri, kullanıcı kodu ve özel erişim belirteçleri işlenmez/çalıştırılmaz. Başlıklar React ile düz metin olarak gösterilir. Kaynak girdi hiçbir zaman uygulama talimatı kabul edilmez.
6. API yanıtı doğrudan tarayıcıda çekilmez. Server Component okur, istemci yalnızca içerik ve güvenli `https:` dış bağlantılar görür. Kullanıcıya ait kişisel ilerleme veya kimlik verisi Radar API'lerine gönderilmez.

## Veri eskimesi, hata ve dağıtım

- Her kaynağın son başarılı kontrolü ayrıdır; bu tarih **yayın zamanı değildir**.
- 15 dakika boyunca başarılı metadata önbellekte kalır. Tek kaynak hatası diğer kaynakların sonuçlarını engellemez.
- Erişim kesildiğinde eski başarı en çok 6 saat boyunca **Son başarılı kayıt** olarak işaretlenir. Bundan sonra **Şu an erişilemiyor** ve boş liste gösterilir. İlk sorgu başarısızsa hiçbir sahte örnek yayımlanmaz.
- Kaynaklardan birindeki alt kayıtlar okunamazsa **Kısmen güncellendi** uyarısı görünür.
- Ön belleğin süreç içi olması çoklu sunucular arası senkronizasyon garantisi vermez ve yeniden başlatıldığında eski veriyi saklamaz.
- Ek DB tablosu, cron, özel anahtar veya kod çalıştırma izni eklenmez. PostgreSQL'deki kullanıcı ilerlemesi bu işten bağımsızdır.

## M10 kabul ve gözlem

- `node --test apps/web/tests/radar-feed.test.mjs`: API şekilleri, sahte haber üretmeme, yayın zamanı, güvenli URL, ders eşleşmesi, cache/stale davranışı.
- `corepack pnpm check`, Java/Python runtime fixture regresyonları, production HTTP smoke ve headless Chrome responsive/tema testleri GitHub CI'da koşar.
- Yerel kontrol: `corepack pnpm dev`, `http://localhost:3000/radar` sayfasını aç. Birkaç farklı kaynağın gerçek linkine gir, başlık ile yayın zamanının sağlayıcıyla tutarlı olduğunu kontrol et. Filtreleri ve 320px görünümü değerlendir.
- API erişiminin kesilebileceği ağlarda uydurma başlık yerine açık durum mesajı görünmesi **başarı davranışı**dır.
- Canlı veri miktarı, herhangi bir anda dış hizmetlerin durumuna ve konu eşleşmesine bağlıdır. CI'daki deterministik fixture testleri, gerçek dünyadaki her haberin editoryal doğruluğunun kanıtı değildir.

**M9 notu:** Öğrenme deneyiminin gönüllü öğrenci pilotu henüz tamamlanmadı. M10 kaynak entegrasyonunun bitmesi M9'un pilot sonuçlarını üretmez veya yerine geçmez.
