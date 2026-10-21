# ADR-001: Modüler monolit

Durum: Kabul edildi
Tarih: 21.10.2026
Karar verenler: Architect (Buğra); Implementation ve Scrum Master bilgilendirildi

## Bağlam
Abonelik Hatırlatıcı küçük bir ekip ve kısıtlı süreyle yapılan bir ders projesi. Sistemin üç sorumluluğu var: kullanıcı ve abonelik yönetimi, hatırlatma üretimi, mobil istemciye API. Ekipte tek bir kişi backend yazıyor.

## Karar
Backend **tek bir uygulama (API) ve tek bir veritabanı** olarak kurulur. İçi modüllere ayrılır:
- `app/domain/`: saf iş kuralları (tarih hesabı, hatırlatma kuralı); web ve veritabanına bağımlı değil
- API katmanı: istek ve yanıt, kimlik doğrulama
- veri katmanı: veritabanı erişimi

Docker Compose ile iki konteyner çalışır: `api` ve `db`.

## Seçilmeyen yollar
- **Mikroservisler:** Ekip büyüklüğü ve süre için gereksiz. Ağ, dağıtım ve izleme maliyeti getirir, savunması zor.
- **Sunucusuz (serverless) işlevler:** Zamanlanmış iş ve veritabanı bağlantısı yönetimi ek karmaşıklık katar.

## Sonuçlar
- Tek dağıtım, tek hata ayıklama noktası; yerelde `docker compose up` yeterli.
- Modül sınırları korunmazsa kod karışabilir; bu yüzden `domain/` dışarıya bağımlı olmaz ve ayrı test edilir.
- İleride ayrılması gerekirse modül sınırları bunu kolaylaştırır.
