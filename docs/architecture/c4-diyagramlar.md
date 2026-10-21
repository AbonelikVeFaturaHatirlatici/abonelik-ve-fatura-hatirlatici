# C4 Diyagramları: Abonelik Hatırlatıcı

GitHub bu sayfadaki Mermaid diyagramlarını otomatik çizer. Her ok üzerindeki yazı, o bağlantıda ne taşındığını söyler.

## Seviye 1: Sistem bağlamı (sistem sınırı)

Kim sistemi kullanır ve sistem kimlerle konuşur?

```mermaid
flowchart LR
    kullanici["<b>Kullanıcı</b><br/>Aboneliklerini takip eden kişi"]

    subgraph sinir["Sistem sınırı: Abonelik Hatırlatıcı"]
        sistem["<b>Abonelik Hatırlatıcı</b><br/>Abonelikleri tutar, yenileme<br/>öncesi hatırlatma üretir"]
    end

    servisler["<b>Abonelik servisleri</b><br/>(Netflix, Spotify vb.)<br/>Entegrasyon YOK"]
    push["<b>Push bildirim servisi</b><br/>İlk sürümde YOK<br/>(mock kayıt tutulur)"]

    kullanici -->|"abonelik ekler, listeler,<br/>takipten çıkarır; hatırlatmaları görür"| sistem
    sistem -.->|"gerçek bildirim gönderilmez"| push
    sistem -.->|"gerçek aboneliğe dokunmaz"| servisler
```

**Sistem sınırı içinde:** Mobil uygulama, backend API ve veritabanı.

**Sistem sınırı dışında (bilinçli olarak):**
- Abonelik servisleri: Uygulama yalnızca kullanıcının girdiği bilgiyi tutar. Takipten çıkarmak servisteki gerçek aboneliği iptal etmez.
- Gerçek push bildirimi: İlk sürümde mock kayıt tutulur (`NotificationPort` arayüzü, `MockNotifier` uygulaması).
- Ödeme, banka, e-posta okuma, çoklu para birimi, iOS.

## Seviye 2: Konteynerler

Sistem hangi çalışan parçalardan oluşur ve bunlar nasıl konuşur?

```mermaid
flowchart TB
    kullanici["<b>Kullanıcı</b>"]

    subgraph sistem["Abonelik Hatırlatıcı"]
        mobil["<b>Mobil uygulama</b><br/>React Native + Expo (TypeScript)<br/>Android"]

        subgraph apiKutu["<b>Backend API</b>  (FastAPI, tek süreç)"]
            http["API katmanı<br/>kayıt, giriş, abonelik, hatırlatma uçları"]
            domain["Domain modülü<br/>next_renewal, hatırlatma kuralı<br/>(saf fonksiyonlar)"]
            zamanlayici["Günlük iş (APScheduler)<br/>her gün 09:00 Europe/Istanbul"]
            bildirim["NotificationPort<br/>MockNotifier"]
        end

        db[("<b>PostgreSQL</b><br/>users, subscriptions, reminders")]
    end

    kullanici -->|"dokunur"| mobil
    mobil -->|"HTTPS, JSON, JWT<br/>(sözleşme: api/openapi.yaml)"| http
    http --> domain
    http -->|"SQL"| db
    zamanlayici --> domain
    zamanlayici -->|"hatırlatma ekler<br/>(benzersiz kısıt çift kaydı engeller)"| db
    zamanlayici --> bildirim
```

| Parça | Sorumluluk | Karar kaydı |
|---|---|---|
| Mobil uygulama | Ekranlar (giriş, abonelik listesi, ekleme), API çağrıları | ADR-004 |
| API katmanı | İstek doğrulama, kimlik doğrulama (JWT), yanıtlar | ADR-001, ADR-004 |
| Domain modülü | Yenileme tarihi ve hatırlatma kuralları; web ve veritabanından bağımsız | ADR-003 |
| Günlük iş | 3 gün ve 1 gün önceki hatırlatmaları üretir | ADR-002 |
| NotificationPort | Bildirim arayüzü; ilk sürümde mock kayıt | ADR-002 |
| PostgreSQL | Kalıcı veri; benzersiz kısıtlar kuralları veritabanında da korur | ADR-002, ADR-003 |

Çalışma biçimi: Docker Compose ile iki konteyner ayağa kalkar: `api` (API + günlük iş) ve `db` (PostgreSQL). Mobil uygulama cihazda çalışır.
