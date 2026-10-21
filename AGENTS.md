# Abonelik Hatırlatıcı: Proje Bağlamı (LLM ve yeni katılanlar için)

Bu dosya, bu repoda çalışan herkesin (ve kullandığı yapay zekâ araçlarının) projeyi aynı şekilde anlaması için yazıldı. İş yapmadan önce baştan sona oku. Çelişki görürsen dosya değil, `api/openapi.yaml` ve ADR'ler (`docs/adr/`) geçerlidir; ardından Architect'e (@ybyaman) sor.

## 1. Proje nedir?
SENG 321 Software Engineering dersi için bir takım projesi: **Abonelik Hatırlatıcı** mobil uygulaması. Kullanıcı aboneliklerini (servis adı, tutar, aylık/yıllık, başlangıç tarihi) takip listesine ekler; sistem her yenilemeden **3 gün ve 1 gün önce** bir hatırlatma üretir.

Dersin amacı mükemmel bir ürün değil, **rolleri doğru uygulamak**: sözleşme, sorumluluk, repo akışı ve izlenebilir belgeler. Küçük ve tutarlı kalmak, büyük ve yarım olmaktan iyidir.

## 2. Kapsam
**İçinde:** e-posta + şifre ile kayıt/giriş (JWT); abonelik ekleme, listeleme, tek getirme, iptal (takip listesinden çıkarma); sonraki yenileme tarihi hesabı; hatırlatma üretimi (3 gün ve 1 gün önce, her biri bir kez, 09:00 Europe/Istanbul); hatırlatmaları salt okunur listeleme.

**Dışında (bilinçli olarak, ekleme önerme):** gerçek push bildirimi (mock kayıt tutulur), ödeme/banka/e-posta okuma, abonelik servisleriyle entegrasyon, iOS, çoklu para birimi, şifre sıfırlama, hatırlatma erteleme (snooze, US-10).

## 3. Kesinleşmiş kurallar (PO ve Architect onaylı)
- Tutar **kuruş cinsinden tamsayı** (`amountKurus`, 22999 = 229,99 TL). Para birimi yalnızca TRY. Sıfır ve negatif tutar reddedilir (400).
- Zaman damgaları UTC. Yenileme günleri saatsiz `date`, Europe/Istanbul takvimine göre.
- **Yenileme tarihi başlangıç tarihinden hesaplanır**, bir öncekinden değil. Ayda o gün yoksa ayın son günü: 31 Ocak → 28 Şubat → 31 Mart. Kod: `backend/app/domain/renewal.py`.
- **İptal** yalnızca takip listesinden çıkarmadır. Ekranda “Servisteki gerçek aboneliğiniz iptal edilmez” uyarısı çıkar. İptalden sonra yeni hatırlatma üretilmez, eskiler listede kalır, aynı servis yeniden eklenebilir.
- **409** yalnızca aynı kullanıcıda, aynı servis adı (harf farkı önemsiz) ve aynı periyotta **aktif** kayıt varken verilir.
- **Hatırlatma:** Yenilemeye 3 günden az kala eklenen abonelikte geçmişe düşen gün üretilmez, kalan gün üretilir. Çift üretim veritabanı benzersiz kısıtıyla engellenir: `(subscription_id, renewal_date, days_before)`.
- Başkasına ait kayıt için 403 değil **404** döner.
- **Tüm hatalar** tek şema: `{ "code": "...", "message": "..." }`. Geçersiz girdi için tek kod **400**.

## 4. Teknoloji
Backend: Python, FastAPI, PostgreSQL, SQLAlchemy, Alembic, pyjwt, argon2, APScheduler. Mobil: React Native + Expo (TypeScript), yalnızca Android. Çalıştırma: Docker Compose (iki konteyner: `api`, `db`). Test: pytest (kapsam en az %50), ruff, Spectral (OpenAPI denetimi). Gerekçeler: `docs/adr/`.

## 5. Klasör yapısı
```
api/openapi.yaml        API sözleşmesi (tek doğru kaynak)
backend/app/            FastAPI uygulaması
backend/app/domain/     saf iş kuralları (web ve veritabanından bağımsız)
backend/tests/          pytest testleri
mobile/                 React Native uygulaması (Sprint 2)
docs/adr/               mimari karar kayıtları
docs/architecture/      teknik mimari ve C4 diyagramları
docs/process/           roller, RACI, destek rehberi, çalışma kuralları
docs/product/           PO belgeleri
.github/                CI, PR ve issue şablonları, CODEOWNERS
```
Bazı klasörler ilgili PR birleşene kadar görünmeyebilir; `git log` ve açık PR'lara bak.

## 6. Roller ve kime sorulur
| Rol | Kişi (GitHub) | Konu |
|---|---|---|
| Product Owner | zsude (@zsudedeveli) | kapsam, öncelik, kabul kriteri, iş kuralı |
| Scrum Master | Nesibe Sakar | süreç, engeller, takvim, teslim kanıtı |
| Lead Architect | Buğra (@ybyaman) | mimari, API sözleşmesi, repo kuralları |
| QA | Nadir Efe (@JeniusD1) | test planı, hata doğrulama, kapsam |
| DevOps | Ahmet (@AhmeTalhAkyol) | CI/CD, Docker, ortam |
| Implementation | Faldozn (@Faldozn) | backend ve mobil kodu |

Ayrıntı: `docs/process/Destek_ve_Eskalasyon_Rehberi.pdf`, `docs/process/Roller_ve_RACI_Matrisi.pdf`.

## 7. Çalışma kuralları
- **Sözleşme önce:** Davranış `api/openapi.yaml` ile uyuşmalı. Davranış değişecekse önce sözleşme PR'ı açılır (Architect ve PO görür), sonra kod.
- **Branch ve PR:** `develop`'tan branch aç (`feat/...`, `docs/...`, `chore/...`), PR'ı **`develop`'a** gönder. `main` ve `develop`'a doğrudan push yok. Her PR en az 1 onay ister; yazar kendi PR'ını onaylayamaz. Sprint teslimi: `develop` → `main` PR'ı ve `sprint-N` tag'i.
- **Küçük PR:** Bir PR bir iş. PR açıklamasında ilgili issue: `Closes #N`.
- **İş kaynağı:** Yapılacaklar GitHub issue'larında (US-xx hikâyeler, T-xx rol görevleri). Kabul kriterleri issue'dadır; iş onların testle geçmesiyle biter.
- **Commit mesajı:** `tür: kısa açıklama` (`feat:`, `fix:`, `docs:`, `chore:`, `test:`).

## 8. Yerelde çalıştırma
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # değerleri doldur; .env git'e girmez
uvicorn app.main:app --reload   # http://localhost:8000/health
ruff check . && pytest --cov=app --cov-fail-under=50
```

## 9. Yapay zekâ araçları için kurallar
- Değişiklik yapmadan önce bu dosyayı, `api/openapi.yaml`'ı ve ilgili issue'yu oku.
- **Sözleşmeyi sessizce değiştirme.** Gerekiyorsa değişikliği öner ve sözleşme PR'ı gerektiğini belirt.
- **Kapsam dışına çıkma.** Bölüm 2'deki “dışında” maddelerini ekleme; yeni özellik önerisini issue olarak yaz.
- Bilmediğin bir kuralı **uydurma**; ilgili rolü (bölüm 6) sor.
- Şifre, token, anahtar veya gerçek kişisel veri yazma; `.env` dosyalarını commit'leme.
- Küçük, gözden geçirilebilir değişiklikler yap; kodu açıkla. İnsan, üretilen kodu anlayıp denemeden kabul etmemeli.
- `main`/`develop`'a doğrudan push önerme; kuralları (ruleset) atlatmaya çalışma.
