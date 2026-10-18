# M8.6C · Ders Çalışma Alanı 2.0

## Öğretici hedef

15 dersin tamamında daha anlaşılır çalışma düzeni: masaüstünde sol ders
haritası, sağda aşama çalışma alanı; mobilde açılabilir ders haritası
ve yatay kaydırılabilen kompakt aşama şeridi. Açık/koyu zeytin ve toprak
tema sistemleri korunur.

## Neler değişti?

- Gerçek yayımlanmış derslere bağlanan ders haritası, dersin konumu
  ve önceki/sonraki ders bağlantıları. Konum, tamamlanma sayılmaz.
- Masaüstü ders haritası sticky ve kendi içinde kaydırılabilir;
  mobilde 320px genişliğe sığan açılır ders listesi.
- Aşama sayısı ve ismi, ilerleme çizgisi ve tek aktif çalışma paneli.
  Aşama çizgisi not/başarı veya mastery sonucu değildir.
- Daha önce gezilmiş sorular DOM'da kalır, sayfa içindeki yanıtlar
  korunur. Editör daha önce açılmamışsa lazy mount edilmeye devam eder.
- Footer'dan aşama değiştirilince ders başına kaydırma ve yeni
  aşamanın başlığına odaklama. Klavyede ok/Home/End ve Enter/Space.
- Öğrenme Stüdyosu görünür kalır. Temel örnek kodu ve kavramsal
  karşı örnekler ayrı açılabilir panellere taşınır; içerik silinmez.
- Kod satırları sayfanın yatay kaymasını tetiklemeden kendi içinde
  kaydırılabilir.
- Kod editörü, quiz, transfer laboratuvarı, tamamlama doğrulaması,
  hesap, DB ve sertifika iddiaları aynen korunur.

## Testler

Yayımlanmış 15 ders kimliği ve linkleri, bileşenlerin yerinde olması,
yatay mobil kaydırma, açılır materyaller, aktif panel ve odak dönüşü,
320px/masaüstü Chrome ile gerçek UI kontrolleri. Diğer test, derleme,
TypeScript, sözdizimi dil runtime ve tema kontrolleri geçmeden merge yok.

Yeni paket, DB migration, çalışma servisi veya canlı deployment yoktur.

Sonraki aşama M8.6D: öğrenme panosu ve kanıta dayalı ilerleme.
