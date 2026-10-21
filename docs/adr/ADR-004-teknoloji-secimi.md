# ADR-004: Python + FastAPI + PostgreSQL (backend), React Native + Expo (mobil)

Durum: Kabul edildi
Tarih: 21.10.2026
Karar verenler: Architect (Buğra); Implementation onayladı

## Bağlam
Ders yönergesi bir teknoloji dayatmıyor; kararı ekip veriyor. Sözleşme önce yazılıyor (`api/openapi.yaml`), kodlayan tek kişi var, mobil yalnızca Android ve ders kapsamında küçük tutuluyor.

## Karar
- **Backend:** Python, **FastAPI**, **PostgreSQL**; veri erişimi SQLAlchemy, şema değişiklikleri Alembic.
- **Kimlik doğrulama:** JWT (24 saat), şifre özeti **argon2**. Gizli anahtar `JWT_SECRET` ortam değişkeni; `.env` repoya girmez, repoda `.env.example` vardır.
- **Zamanlayıcı:** APScheduler (bkz. ADR-002).
- **Mobil:** **React Native + Expo**, TypeScript, yalnızca Android.
- **Test ve kalite:** pytest (kapsam en az %50), ruff, Spectral (sözleşme denetimi). Hepsi GitHub Actions'ta çalışır.
- **Çalıştırma:** Docker Compose (api + db).

## Seçilmeyen yollar
- **Java Spring Boot:** Daha ağır kurulum ve daha çok şablon kod; ekip hızı için fazla.
- **Node.js (Express):** Mümkündü; Python'un test ve tarih araçları ile ekibin aşinalığı öne çıktı.
- **Flutter / yerel Android:** Ek dil öğrenme maliyeti.
- **SQLite:** Üretime yakın davranış (benzersiz kısmi indeks, eşzamanlılık) için PostgreSQL tercih edildi.

## Sonuçlar
- FastAPI otomatik OpenAPI üretir, ama **sözleşme önce gelir**: yazılan kod `api/openapi.yaml` ile uyuşmalı; sapma önce sözleşme PR'ıyla düzeltilir. Otomatik üretilen dosya bizim dosyanın yerine geçmez.
- Teknoloji değişirse bu ADR yerine yenisi yazılır, CI'daki `backend-test` adımı ve repo yapısı güncellenir.
