# Dosya: backend/app/api/openapi_meta.py
"""Üretilen OpenAPI dokümanının üst bilgileri ve istek örnekleri.

Metinler api/openapi.yaml'dan birebir alınmıştır; sözleşme değişirse burası da güncellenir.
"""
from typing import Any

DESCRIPTION = """\
Abonelik Hatırlatıcı mobil uygulamasının Sprint 1 sözleşmesi (SENG 321).

**Kurallar**
- Tutarlar kuruş cinsinden tamsayıdır (`amountKurus`), para birimi yalnızca TRY.
- Tarihler saatsiz `YYYY-MM-DD` biçimindedir ve Europe/Istanbul takvimine göre yorumlanır. \
Zaman damgaları UTC'dir.
- Her yenileme başlangıç tarihinden hesaplanır; ayda o gün yoksa ayın son günü kullanılır \
(31 Ocak → 28 Şubat → 31 Mart).
- Tüm hatalar tek şemayı kullanır: `{ "code": "...", "message": "..." }`. \
Geçersiz girdi için tek kod 400'dür.
- Başkasına ait kayıt için 403 yerine 404 döner.
- İptal yalnızca takip listesinden çıkarmadır; servisteki gerçek abonelik iptal edilmez.
- Hatırlatmalar sunucu tarafından yenilemeden 3 gün ve 1 gün önce üretilir; \
istemci hatırlatma oluşturamaz.
"""

SERVERS: list[dict[str, str]] = [
    {"url": "http://localhost:8000", "description": "Yerel geliştirme (docker compose)"},
]

TAGS: list[dict[str, str]] = [
    {"name": "auth", "description": "Kayıt ve giriş"},
    {"name": "subscriptions", "description": "Abonelik takip listesi"},
    {"name": "reminders", "description": "Üretilmiş hatırlatmalar (salt okunur)"},
]

# Sözleşmede istek gövdesi örneği yalnızca bu iki uçta tanımlı.
REGISTER_EXAMPLES: dict[str, dict[str, Any]] = {
    "ornek": {
        "summary": "Yeni hesap",
        "value": {"email": "ayse@example.com", "password": "guclu-sifre-123"},
    }
}

SUBSCRIPTION_CREATE_EXAMPLES: dict[str, dict[str, Any]] = {
    "ornek": {
        "summary": "Aylık Netflix aboneliği",
        "value": {
            "serviceName": "Netflix",
            "amountKurus": 22999,
            "period": "monthly",
            "startDate": "2026-01-31",
        },
    }
}