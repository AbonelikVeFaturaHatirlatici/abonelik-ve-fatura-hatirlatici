# Katkı kuralları

## Akış
1. Her iş için bir **issue** açılır (user story veya bug şablonu).
2. `main`'den branch açılır: `feature/US-12-abonelik-ekle`, `fix/US-15-ay-sonu`, `chore/ci-kurulumu`.
3. Küçük, odaklı commit'ler atılır. Mesaj: `US-12: abonelik ekleme endpoint'i`.
4. **Pull request** açılır, şablon doldurulur, issue `Closes #12` ile bağlanır.
5. En az **1 takım arkadaşının onayı** alınmadan birleştirilemez. Yazar kendi PR'ını onaylayamaz.
6. Yeni commit gelirse eski onaylar düşer, yeniden onay gerekir.
7. Birleştirme sonrası branch silinir.

## Kurallar
- `main`'e doğrudan push yoktur. Force push ve branch silme kapalıdır.
- Tarih hesabı, durum geçişleri ve `openapi/` değişiklikleri Lead Architect incelemesinden geçer.
- OpenAPI sözleşmesi koddan önce güncellenir (API-first).
- Test kapsamı %50'nin altına düşmemelidir.
