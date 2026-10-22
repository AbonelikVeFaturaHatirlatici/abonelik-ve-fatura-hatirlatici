# Backend (FastAPI)

Sözleşme: `api/openapi.yaml`. Davranış sözleşmeden sapmaz; gerekiyorsa önce sözleşme PR'ı açılır.

## Docker Compose ile Çalıştırma (Önerilen)

Projeyi sıfırdan çalıştırmak için yalnızca **Docker Desktop** yeterlidir.
Proje kök dizininde:

```bash
# .env dosyasını oluştur (git'e girmez, JWT_SECRET yerelde değiştirilebilir)
cp .env.example .env

# Başlat
docker compose up -d --build
```

Doğrulama: `http://localhost:8000/health` -> `{"status": "ok"}` (HTTP 200)

Durdurma:
- `docker compose down` (veritabanı verilerini korur)
- `docker compose down -v` (DİKKAT: veritabanı volume'unu tamamen siler)

## Yerelde Çalıştırma (Python ile)
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # değerleri doldur
uvicorn app.main:app --reload
```

## Test ve Lint
```bash
ruff check .
pytest --cov=app --cov-fail-under=50
```

## Klasörler
- `app/domain/` saf iş kuralları (tarih hesabı, hatırlatma kuralı). Veritabanına ve web'e bağımlı olmaz; sahibi Architect + QA.
- `app/infra/` veritabanı bağlantısı, modeller (`User`, `Subscription`, `Reminder`), ayarlar ve global hata yakalayıcılar.
- `app/main.py` uygulamanın giriş noktası ve lifespan yönetimi.
- `alembic/` veritabanı şema migrasyonları.
- `tests/` birim ve API testleri.
