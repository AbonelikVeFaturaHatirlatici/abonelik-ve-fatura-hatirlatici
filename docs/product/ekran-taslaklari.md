# Ekran Taslakları ve API Eşleşmeleri

Bu belge, abonelik yönetim uygulamasının temel ekran taslaklarını, bileşenlerini ve tetikledikleri API uç noktalarını tanımlar.

---

## 1. Giriş ve Kayıt Ekranı (Auth Screen)

Kullanıcının sisteme kaydolmasını ve mevcut hesabı ile oturum açmasını sağlayan ekrandır.

### Ekran Bileşenleri
* E-posta giriş alanı (`email`)
* Şifre giriş alanı (`password` - gizli metin)
* "Giriş Yap" butonu
* "Kayıt Ol" butonu
* Hata bildirim alanı (geçersiz format, hatalı şifre vb. - API'den dönen `message` alanı gösterilir)

### Tetiklenen API İşlemleri
* **Kayıt Ol:** `POST /auth/register`
  * Gövde: `{"email": "...", "password": "..."}`
  * Başarılı Yanıt: `201 Created`
* **Giriş Yap:** `POST /auth/login`
  * Gövde: `{"email": "...", "password": "..."}`
  * Başarılı Yanıt: `200 OK` (Dönen `accessToken` istemcide saklanır)

---

## 2. Abonelik Listesi Ekranı (Subscription List Screen)

Giriş yapmış kullanıcının aboneliklerini, durumlarını ve hatırlatıcılarını takip ettiği ana ekrandır.

### Ekran Bileşenleri
* Abonelik kartları listesi:
  * Servis Adı (örn. Netflix, Spotify)
  * Tutar ve Para Birimi (sabit TRY)
  * Sonraki Yenileme Tarihi (`nextRenewalDate`)
  * Periyot (Aylık / Yıllık)
  * Durum rozeti (`active` veya `cancelled`)
  * Yaklaşan Hatırlatıcılar rozeti (`reminders`)
* "Yeni Abonelik Ekle" (+) butonu
* Abonelik Kartı Detayı / İşlem Butonu:
  * **"Takipten Çıkar"** butonu (Karar D-03: Arayüzde kafa karışıklığını önlemek adına "İptal Et" yerine kullanılır)

### Takipten Çıkarma Onayı (Kritik UI Kuralı)
* **Onay Penceresi Başlığı:** *"Takipten çıkarılsın mı?"*
* **Uyarı Metni:** *"Servisteki gerçek aboneliğiniz iptal edilmez."*
* Kullanıcı bu uyarıyı onayladığında işlem gerçekleştirilir.

### Tetiklenen API İşlemleri
* **Listeleme:** `GET /subscriptions`
  * Başarılı Yanıt: `200 OK`
* **Tekil Detay:** `GET /subscriptions/{id}`
  * Başarılı Yanıt: `200 OK`
* **Takipten Çıkarma (İptal):** `POST /subscriptions/{id}/cancel`
  * Başarılı Yanıt: `200 OK` (`status: "cancelled"`, `cancelledAt` güncellenir)
* *Not:* Token süresi bittiğinde (`401 Unauthorized`) kullanıcı otomatik olarak Giriş Ekranına yönlendirilir.

---

## 3. Abonelik Ekleme Formu Ekranı (Add Subscription Screen)

Kullanıcının yeni bir abonelik eklediği form ekranıdır.

### Ekran Bileşenleri
* Servis Adı metin kutusu (`serviceName`)
* Tutar giriş alanı (`amountKurus` - TL olarak girilip kuruşa çevrilir)
* Para Birimi göstergesi: Sabit **TRY** etiketi (istek gövdesinde gönderilmez, sözleşme gereği yanıtta döner)
* Periyot seçimi (Aylık / Yıllık - `monthly` / `yearly`)
* Başlangıç Tarihi seçici (`startDate` - YYYY-MM-DD)
* "Kaydet" butonu
* Hata bildirim alanı (400 veya 409 durumlarında sunucudan dönen `message` metni gösterilir)

### Tetiklenen API İşlemleri
* **Abonelik Oluşturma:** `POST /subscriptions`
  * İstek Gövdesi: `{"serviceName": "...", "amountKurus": ..., "period": "...", "startDate": "..."}` *(currency gönderilmez)*
  * Başarılı Yanıt: `201 Created`