# M9 · Python Pilot Görev Kartları (Öğrenciye Verilecek Metin)

**Durum:** Hazırlık, henüz gerçek öğrenciyle uygulanmadı. Bu dosya cevap anahtarı içermez. Öğrenciye yalnızca atanmış **tek formu** göster; A/B/C biçimlerini aynı oturumda bir arada paylaşma.

Ön testte ders açıklaması veya ipucu açılmadan cevap ver. Son testte eğitim bittiğinde, gecikmeli testte en az 24 saat sonra yine **yardımsız** cevap ver. Her görev için standart çıktıyı **satır sırasıyla** yaz ve nedenini bir veya iki cümlede açıkla. Çalıştırma, editör, arama ve yardım kullanma; anlamadığın yerde tahmin edebilir veya “bilmiyorum” diyebilirsin. Test sırasında ipucu verilirse görev bağımsız olarak puanlanamaz; gözlem notu alınır.

## Ondalıklı metin, float ve iki basamaklı biçim

### Form A · Koşu antrenmanı
Tur uzunluğu formdan metin olarak geliyor. Isınma eklendikten sonra ekrana tam olarak ne yazılır?

```python
lap_km_text = "2.40"
laps = 3
warmup_km = 0.5
print(f"{float(lap_km_text) * laps + warmup_km:.2f}")
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form B · Günlük su takibi
Bardak hacmi metin olarak kaydedilmiş. Ek su eklendikten sonra ekranda hangi değer görünür?

```python
glass_l_text = "1.25"
glasses = 4
extra_l = 0.3
print(f"{float(glass_l_text) * glasses + extra_l:.2f}")
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form C · Kumaş kesimi
Parça uzunluğu metin olarak ölçülmüş. Yedek pay eklendikten sonra ekrana ne yazılır?

```python
piece_m_text = "0.75"
pieces = 6
spare_m = 1.2
print(f"{float(piece_m_text) * pieces + spare_m:.2f}")
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

## Kademeli koşul sırası ve sınır değeri

### Form A · Su deposu göstergesi
Depo seviyesi tam olarak bir eşik değerinde. Zincirde hangi dal çalışır ve ne yazılır?

```python
level = 20
if level >= 50:
    print("Yeşil")
elif level >= 20:
    print("Sarı")
else:
    print("Kırmızı")
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form B · Sınav notu kademesi
Not, en üst kademenin sınırına tam eşit. Zincirde ilk doğru koşulu bul ve çıktıyı yaz.

```python
score = 85
if score >= 85:
    print("Pekiyi")
elif score >= 70:
    print("İyi")
else:
    print("Geçti")
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form C · Rüzgâr uyarısı
Rüzgâr hızı orta kademenin sınırının hemen altında. Hangi uyarı yazılır?

```python
speed = 39
if speed >= 62:
    print("Fırtına")
elif speed >= 40:
    print("Kuvvetli")
else:
    print("Hafif")
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

## continue ile geçersiz kaydı atlayıp sayma

### Form A · Kütüphane ziyaretleri
Negatif kayıtlar hatalı girilmiş, sıfır geçerli bir gündür. Kaç geçerli gün sayılır?

```python
visits = [3, -1, 0, 5, -2]
valid_days = 0
for visit in visits:
    if visit < 0:
        continue
    valid_days += 1
print(valid_days)
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form B · Kuş gözlem defteri
Negatif sayımlar okunamayan sayfalardır, sıfır gerçek bir gözlemdir. Kaç kayıt geçerli?

```python
sightings = [-1, 0, 7, -4]
valid = 0
for seen in sightings:
    if seen < 0:
        continue
    valid += 1
print(valid)
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form C · Adım sayar günlüğü
Cihazın yazdığı negatif değerler arızadır, sıfır adım geçerlidir. Geçerli gün sayısı kaçtır?

```python
steps = [6, 0, 0, -5, 2]
days = 0
for step in steps:
    if step < 0:
        continue
    days += 1
print(days)
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

## print ve return ile çağıran değer ayrımı

### Form A · Teslimat fiyatı
Ekrana yazdırma ile fonksiyonun döndürdüğü değeri ayır. Sırayla hangi satırlar yazılır?

```python
def price(amount):
    print(amount + 2)
    return amount + 5

result = price(4)
print(result)
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form B · Sadakat puanı
Fonksiyon içeride yazdırıyor ve farklı bir değer döndürüyor. İki çıktıyı sırayla açıkla.

```python
def points(base):
    print(base * 2)
    return base + 3

value = points(5)
print(value)
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form C · Adım sayacı
İçeride yazılan ve çağırana verilen değer farklı. Sırayla çıkan iki satır nedir?

```python
def steps(count):
    print(count - 1)
    return count * 3

answer = steps(6)
print(answer)
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

## Sözlükte get varsayılanı ile liste kurma

### Form A · Okul kulüpleri
Sorulan kulüplerin üye sayıları sırayla bir listeye yazılıyor. Kayıtsız kulüp de soruluyor. Çıktı nedir?

```python
members = {"satranç": 12, "robotik": 8}
asked = ["robotik", "drama", "satranç"]
print([members.get(club, 0) for club in asked])
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form B · Bitki sulama planı
Her bitki için haftalık sulama sayısı listeleniyor. Plan dışı bir bitki de var. Ekrana ne yazılır?

```python
waterings = {"fesleğen": 2, "nane": 3}
plants = ["nane", "kaktüs"]
print([waterings.get(plant, 0) for plant in plants])
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form C · Haftalık ders saatleri
Programdaki derslerin saatleri sırayla toplanıyor; aynı eksik ders iki kez geçiyor. Çıktı nedir?

```python
hours = {"matematik": 5, "müzik": 1}
week = ["müzik", "resim", "resim"]
print([hours.get(lesson, 0) for lesson in week])
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

## Ek görev · Fonksiyonunu sıfırdan yaz (isteğe bağlı)

Bu bölüm, yukarıdaki çıktı tahminlerinden **ayrı** incelenir. Araçla güvenilir şekilde doğrulanmayan öğrenci kodu “başarılı test edildi” şeklinde kaydedilmez. Görevde sadece atanmış form kullanılır.

### Form A · Teslimat ücretini döndür
add_delivery(subtotal, delivery) fonksiyonunu yaz; iki sayıyı toplayıp print yerine return ile döndür. Fonksiyon, başka bir hesapta kullanılabilmeli. Örnek: add_delivery(18,4) + 1 ifadesi 23 vermeli.

Başlangıç:

```python
def add_delivery(subtotal, delivery):
    pass
```

**Çözümün:** __________  
**Neden print değil return kullandın?:** __________

### Form B · Ek ücreti döndür
add_fee(cost, fee) fonksiyonunu yaz; iki sayıyı toplayıp return ile döndür. Örnek: add_fee(25,5) + 2 ifadesi 32 vermeli.

Başlangıç:

```python
def add_fee(cost, fee):
    pass
```

**Çözümün:** __________  
**Neden print değil return kullandın?:** __________

### Form C · Ek süreyi döndür
add_minutes(used, extra) fonksiyonunu yaz; iki sayıyı toplayıp return ile döndür. Örnek: add_minutes(10,7) + 3 ifadesi 20 vermeli.

Başlangıç:

```python
def add_minutes(used, extra):
    pass
```

**Çözümün:** __________  
**Neden print değil return kullandın?:** __________
