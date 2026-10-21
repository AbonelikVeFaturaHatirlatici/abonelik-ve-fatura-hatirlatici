# Backend (FastAPI)

Sözleşme: `api/openapi.yaml`. Davranış sözleşmeden sapmaz; gerekiyorsa önce sözleşme PR'ı açılır.

## Yerelde çalıştırma
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # değerleri doldur
uvicorn app.main:app --reload
```
Kontrol: http://localhost:8000/health

## Test ve lint
```bash
ruff check .
pytest --cov=app --cov-fail-under=50
```

## Klasörler
- `app/domain/` saf iş kuralları (tarih hesabı, hatırlatma kuralı). Veritabanına ve web'e bağımlı olmaz; sahibi Architect + QA.
- `app/main.py` uygulamanın giriş noktası.
- `tests/` testler.
