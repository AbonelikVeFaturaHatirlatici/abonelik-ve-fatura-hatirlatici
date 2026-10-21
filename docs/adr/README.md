# Mimari Karar Kayıtları (ADR)

Her önemli teknik karar burada kısa bir belge olarak tutulur: bağlam, karar, seçilmeyen yollar ve sonuçları.
Karar değişirse eski kayıt silinmez; durumu "Yerine geçildi" yapılır ve yeni bir ADR yazılır.

| No | Karar | Durum |
|---|---|---|
| [ADR-001](ADR-001-moduler-monolit.md) | Modüler monolit | Kabul edildi |
| [ADR-002](ADR-002-hatirlatma-uretimi.md) | Hatırlatma üretimi API içinde, benzersiz kısıtla | Kabul edildi |
| [ADR-003](ADR-003-para-ve-tarih.md) | Para kuruş tamsayı, tarih ve saat kuralları | Kabul edildi |
| [ADR-004](ADR-004-teknoloji-secimi.md) | Python + FastAPI + PostgreSQL, React Native + Expo | Kabul edildi |

Yeni ADR eklerken: sıradaki numarayı kullan, aşağıdaki şablonu izle, bu tabloya satır ekle ve PR'a Architect'i reviewer yap.

## Şablon
```
# ADR-00X: Başlık
Durum: Önerildi | Kabul edildi | Yerine geçildi
Tarih: GG.AA.YYYY
Karar verenler: ...

## Bağlam
## Karar
## Seçilmeyen yollar
## Sonuçlar
```
