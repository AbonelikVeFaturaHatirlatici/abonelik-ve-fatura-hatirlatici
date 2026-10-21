# Katkı kuralları

## Branch'ler

| Branch | Amaç |
|---|---|
| `main` | Sprint teslimleri. Her teslim bir **tag** alır (`sprint-1`, `sprint-2`...). |
| `develop` | Tamamlanan işlerin birleştiği entegrasyon branch'i. |
| `feature/US-xx-kisa-ad` | Tek story, hata veya teknik görev. `develop`'tan açılır, `develop`'a döner. |

Branch adı türleri: `feature/US-12-abonelik-ekle`, `fix/US-15-ay-sonu`, `chore/ci-kurulumu`. `release` ve `hotfix` branch'leri açılmaz.

## Günlük akış

1. İş için bir **issue** aç (user story veya hata şablonu).
2. `develop`'tan branch aç:
```bash
   git checkout develop && git pull
   git checkout -b feature/US-12-abonelik-ekle
```
3. Küçük commit'ler at. Mesaj: `US-12: abonelik ekleme endpoint'i`.
4. Pull request aç. **Hedef her zaman `develop`**: `gh pr create --base develop`. Şablonu doldur, issue'yu `Closes #12` ile bağla.
5. En az **1 takım arkadaşının onayı** gerekir. Yazar kendi PR'ını onaylayamaz. Yeni commit gelirse eski onay düşer.
6. Birleştirdikten sonra branch'i sil.

## Sprint teslimi

1. Sprint sonunda `develop` → `main` PR'ı açılır (1 onay).
2. Birleştikten sonra `main`'e tag atılır: `git tag sprint-1 && git push origin sprint-1`.
3. Scrum Master teslim kanıtlarını toplar: takım, repo, tag, rol sahipleri, issue ve PR bağlantıları, belge linkleri.

## Kurallar

- `main` ve `develop`'a doğrudan push yoktur. Force push ve branch silme kapalıdır.
- Tarih hesabı, durum geçişleri ve `api/openapi.yaml` değişiklikleri Lead Architect incelemesinden geçer.
- OpenAPI sözleşmesi koddan önce güncellenir (API-first).
- Test kapsamı %50'nin altına düşmemelidir.
