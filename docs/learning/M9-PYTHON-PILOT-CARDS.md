# M9 · Python Pilot Görev Kartları (Öğrenciye Verilecek Metin)

**Durum:** Hazırlık, henüz gerçek öğrenciyle uygulanmadı. Bu dosya cevap anahtarı içermez. Öğrenciye yalnızca atanmış **tek formu** göster; A/B/C biçimlerini aynı oturumda bir arada paylaşma.

Ön testte ders açıklaması veya ipucu açılmadan cevap ver. Son testte eğitim bittiğinde, gecikmeli testte en az 24 saat sonra yine **yardımsız** cevap ver. Her görev için standart çıktıyı **satır sırasıyla** yaz ve nedenini bir veya iki cümlede açıkla. Çalıştırma, editör, arama ve yardım kullanma; anlamadığın yerde tahmin edebilir veya “bilmiyorum” diyebilirsin. Test sırasında ipucu verilirse görev bağımsız olarak puanlanamaz; gözlem notu alınır.

## Değişkenler ve tür dönüşümü

### Form A · Kantin fişi
Fiyat bir metin olarak alınmıştır. İndirim düşüldükten sonra ekrana ne yazılır?

```python
price_text = "18"
quantity = 3
discount = 4
print(int(price_text) * quantity - discount)
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form B · Bisiklet kiralama
Saatlik ücret metin olarak geliyor. Kupon düşüldükten sonraki çıktıyı hesapla.

```python
hourly_text = "16"
hours = 4
coupon = 3
print(int(hourly_text) * hours - coupon)
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form C · Bilet satışı
Bilet fiyatı metin olarak geliyor. Kampanya indirimi sonrası çıktıyı bul.

```python
ticket_text = "21"
count = 2
promotion = 5
print(int(ticket_text) * count - promotion)
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

## Sıralı koşul ve and

### Form A · Kargo önceliği
Sıcaklık 25 değil. İkinci koşul değerlendirilince ne yazılır?

```python
temperature = 20
express = True
if temperature >= 25:
    print("Sıcak")
elif express and temperature >= 18:
    print("Öncelikli")
else:
    print("Normal")
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form B · Üyelik indirimi
Alışveriş 150 altında. Üyelik kuralını izleyip çıktıyı bul.

```python
subtotal = 110
member = True
if subtotal >= 150:
    print("Ücretsiz")
elif member and subtotal >= 100:
    print("İndirimli")
else:
    print("Standart")
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form C · Pil yönetimi
Pil yüzde 60 altında. Tasarruf koşuluna göre çıktı nedir?

```python
battery = 35
saver = True
if battery >= 60:
    print("Normal")
elif saver and battery >= 30:
    print("Tasarruf")
else:
    print("Uyarı")
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

## Döngüde continue ve negatifleri atlama

### Form A · Kafe satışları
Negatif kayıtlar iadedir, sıfır geçerlidir. Sonuç kaçtır?

```python
sales = [5, -1, 0, 9]
total = 0
for value in sales:
    if value < 0:
        continue
    total += value
print(total)
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form B · Depo tarayıcısı
Negatif kayıt hatadır, sıfır geçerlidir. Toplamı tahmin et.

```python
units = [3, -4, 6, 0]
total = 0
for unit in units:
    if unit < 0:
        continue
    total += unit
print(total)
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form C · Sıcaklık günlüğü
Negatif kayıtlar geçersiz. Yazdırılan toplamı bul.

```python
readings = [0, 8, -2, 7]
sum_valid = 0
for reading in readings:
    if reading < 0:
        continue
    sum_valid += reading
print(sum_valid)
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

## Sözlük get varsayılanı ve anahtar okuma

### Form A · Kırtasiye sayımı
Listede olmayan ürüne get ile sıfır varsayılıyor. Ekrana ne yazılır?

```python
stock = {"kalem": 2, "defter": 5}
print(stock.get("silgi", 0) + stock["kalem"])
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form B · Mutfak stoğu
Eksik ürün ve mevcut ürünün değerleri toplanıyor. Sonuç nedir?

```python
inventory = {"çay": 4, "süt": 1}
print(inventory.get("pirinç", 0) + inventory["süt"])
```

**Çıktı (satır sırasıyla):** __________  
**Neden:** __________

### Form C · Etkinlik biletleri
Olmayan türün varsayılanını, mevcut biletle topla.

```python
tickets = {"yetişkin": 3, "çocuk": 7}
print(tickets.get("öğrenci", 0) + tickets["çocuk"])
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

