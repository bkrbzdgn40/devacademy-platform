# Ders yolu fihristi uygulama planı

> Uygulama: kullanıcı "başla" dedi, bu oturumda doğrudan (native) uygulanıyor.

**Hedef:** `LearningPathCard` bileşenini kutu karttan numaralı "dergi fihristi" satırına çevirmek.
**Spec:** `docs/superpowers/specs/2026-11-21-path-index-design.md`
**Dal:** `feat/path-index` (origin/main'den)

## Genel kısıtlar
- Yeni bağımlılık eklenmeyecek. Yalnızca mevcut token'lar kullanılacak (`--ui-*`, `--color-terracotta-700`, `--color-tan`, `--font-display`, `--font-code`).
- `.path-card`, `.path-cta`, `.path-matches`, `.home-path-grid` sınıf adları korunacak, çünkü smoke testler bunlara bağlı.
- View-transition adı (`course-title-<slug>`) değişmeyecek.

## İnceleme odağı
1. 320 px'te arama sonucu satırı taşmamalı (smoke testte var).
2. Filtrelenmiş aramada numara, kursun gerçek sırasını göstermeli; 1'den yeniden saymamalı.
3. Koyu temada numara ve metin kontrastı ≥ 4.5:1 olmalı (büyük numara için ≥ 3:1).
4. Klavyeyle odaklanıldığında satır vurgusu hover ile aynı olmalı (`:focus-within`).
5. `prefers-reduced-motion` durumunda kayma animasyonu olmamalı.

### Görev 1: Sözleşme testleri
- `tests/design-system.test.mjs`: `ui-card path-` beklentisi yerine `path-card path-` + `path-index-no` beklentisi, `ui-card` yokluğu ve `page.tsx` / `course-explorer.tsx` içinde `<ol className="path-index` kontrolü gelecek.
- `tests/responsive-smoke.mjs:489`: arka plan yerine koyu temada `.home-path-grid .path-card h3` renginin açık renk olduğu doğrulanacak.

### Görev 2: Bileşen
- `LearningPathCard({path,index,compact})`: `index:number` (0 tabanlı, kursun `learningPaths` içindeki sırası) alacak. `ui-card` kaldırılacak, `<span className="path-index-no" aria-hidden="true">{01}</span>` eklenecek. İçerik `path-index-body` (başlık, payoff, konular, eşleşmeler) ve `path-index-meta` (künye, ilk ders, CTA) olarak ikiye ayrılacak.
- `page.tsx` ve `course-explorer.tsx`: `<ol className="path-index …">` + `<li>`. Explorer'da `index=learningPaths.indexOf(path)` kullanılacak.
- Not: spec'teki CSS sayacı yerine prop seçildi (İnceleme odağı #2).

### Görev 3: CSS
- `.path-index` / `.path-card` satır grid'i yazılacak, eski `.path-grid` / `.path-card` kart kuralları (788–818, 882–899, 1387–1399, 1806–1808) temizlenecek.

### Görev 4: Doğrulama
- `npm test` (web), lint/typecheck, tarayıcıda 1280 / 320 / koyu tema ekran görüntüsü. Ardından commit.
