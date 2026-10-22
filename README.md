# Abonelik Hatırlatıcı

SENG 321 Software Engineering dersi projesi: Abonelik Hatırlatıcı mobil uygulaması ve API sunucusu.

---

## Sıfırdan Kurulum ve Çalıştırma (Docker Compose)

### 1. Önkoşullar
Sistemi çalıştırmak için yalnızca **Docker Desktop** (Compose dahil) kurulu olması yeterlidir. Bilgisayarınıza Python, PostgreSQL veya başka bir araç kurmanız gerekmez.

### 2. Ortam Değişkenleri (.env)
Projeyi klonladıktan sonra backend için örnek ortam dosyasını kopyalayın:

```bash
# Linux / macOS
cp backend/.env.example backend/.env

# Windows (PowerShell)
Copy-Item backend/.env.example backend/.env
```

> **Not:** `backend/.env` dosyası gizli bilgileri barındırabileceği için `.gitignore` tarafından korunur ve asla git'e commit edilmez. Yerel geliştirme için dosya içindeki `JWT_SECRET` değerini dilediğiniz rastgele bir anahtarla değiştirebilirsiniz.

### 3. Servisleri Başlatma
Proje kök dizininde şu komutu çalıştırarak API (`api`) ve PostgreSQL (`db`) servislerini derleyip arka planda ayağa kaldırın:

```bash
docker compose up -d --build
```

Konteynerlerin durumunu kontrol etmek için:
```bash
docker compose ps
```

Canlı logları takip etmek için:
```bash
docker compose logs -f api
```

### 4. Kurulumun Doğrulanması
Kurulumun başarıyla çalıştığını doğrulamak için tarayıcınızdan veya terminalden sağlık kontrolü adresine gidin:

- **Adres:** http://localhost:8000/health
- **Beklenen Yanıt (HTTP 200):**
  ```json
  {"status": "ok"}
  ```
Bu yanıtı görüyorsanız API ve PostgreSQL başarıyla çalışıyor demektir.

### 5. Servisleri Durdurma (Önemli)
- **Verileri koruyarak durdurma:**
  ```bash
  docker compose down
  ```
  Bu komut konteynerleri durdurur ve siler ancak veritabanındaki verileriniz (`postgres_data` named volume) **korunur**.

- **Verileri tamamen silerek durdurma (DİKKAT):**
  ```bash
  docker compose down -v
  ```
  > **DİKKAT:** `-v` parametresi veritabanı volume'unu (`postgres_data`) da tamamen siler ve tüm verileriniz kaybolur. Sıfırdan temiz bir veritabanı başlatmak istemiyorsanız bu komutu kullanmayın.

---

## Yerel Geliştirme (Docker Olmadan - Opsiyonel)

Eğer Docker yerine yerel ortamınızdaki Python ile çalıştırmak isterseniz:

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## Test ve Kalite Kontrolleri

```bash
cd backend
ruff check .
pytest --cov=app --cov-fail-under=50
```
