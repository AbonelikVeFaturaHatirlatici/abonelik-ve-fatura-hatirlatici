# ADR-003: Para kuruş tamsayı, tarih ve saat kuralları

Durum: Kabul edildi
Tarih: 21.10.2026
Karar verenler: Architect (Buğra); para birimi ve yenileme kuralı PO onayıyla

## Bağlam
Tutarlar ve yenileme tarihleri uygulamanın çekirdeği. Kayan nokta sayıları yuvarlama hatası üretir; ayın 31'inde başlayan abonelikler kısa aylarda kayabilir; saat dilimi karışıklığı hatırlatmayı bir gün kaydırabilir.

## Karar
- **Para:** Kuruş cinsinden **tamsayı** (`amount_kurus`), kayan nokta kullanılmaz. Para birimi yalnızca TRY. Sıfır ve negatif tutar reddedilir (400).
- **Zaman damgaları:** UTC saklanır (`created_at`, `cancelled_at`).
- **Yenileme günleri:** Saatsiz `date` olarak tutulur ve Europe/Istanbul takvimine göre yorumlanır.
- **Yenileme hesabı:** Her yenileme **başlangıç tarihinden** hesaplanır, bir önceki yenilemeden değil. Ayda o gün yoksa ayın son günü kullanılır. Örnek: 31 Ocak başlangıçlı aylık abonelik → 28 Şubat → 31 Mart (28 Mart'a kaymaz). Yıllık 29 Şubat → 28 Şubat (artık olmayan yıl) → 29 Şubat (artık yıl).
- Hesap saf bir fonksiyondur: `app/domain/renewal.py` içinde `next_renewal(start, period, after)`.

## Seçilmeyen yollar
- **Ondalık tutar (float):** Yuvarlama hatası.
- **Bir önceki yenilemeden ilerleme:** Kısa aydan sonra gün kalıcı olarak kayar (31 → 28 → 28 → 28).
- **Tüm tarihleri UTC `datetime` tutmak:** Yenileme günü bir tarih kavramıdır; saat eklemek gün kaymasına yol açar.

## Sonuçlar
- Arayüz tutarı kuruştan TL'ye çevirip gösterir (22999 → 229,99 TL).
- Kural testle sabitlenmiştir (`backend/tests/test_renewal.py`: 31 Ocak, artık yıl, yıllık 29 Şubat).
- Başka para birimi eklenirse bu ADR gözden geçirilir.
