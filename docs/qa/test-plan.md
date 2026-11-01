# QA Test Planı

| Alan | Değer |
|---|---|
| Proje | Abonelik ve Fatura Hatırlatıcı Mobil Uygulaması |
| Sorumlu rol | Quality Assurance ve Test Automation Engineer |
| Durum | Taslak - PO ve Architect incelemesi bekliyor |
| Kapsam | Sprint 1 hazırlığı ve sonraki sprintler için test yaklaşımı |

## 1. Amaç ve mevcut durum

Bu plan, test senaryolarını backlog ile izlemek ve uygulama hazır olduğunda testleri yürütmek için kullanılır. Sprint 1 puanlanan teslimleri ayrı bir otomatik test paketi istemiyor. Bu aşamadaki QA çalışması kabul kriterlerini ve API sözleşmesini test edilebilirlik açısından incelemektir.

Bu belge bir test planıdır, test sonucu raporu değildir. Senaryoların çalıştırılma durumu ve kanıtları ilgili PR veya CI raporunda kaydedilmelidir. API yanıtları ve iş kuralları onaylı OpenAPI sözleşmesi ile PO kararlarına göre kesinleştirilmelidir.

Atanan US-03, US-05, US-06 ve US-08 için senaryo → beklenen HTTP sonucu → planlanan otomatik test eşlemesi [QA Test Senaryoları](test-cases.md#atanan-storyler-icin-izlenebilirlik) belgesinde yer alır. Eşleme görev ekranındaki gereksinimlere dayanır; planlanan testler henüz kodlanmış testler değildir.

`origin/develop` `8aba13f` sürümünde OpenAPI 3.0.3 sözleşmesi, health/altyapı kodu, yenileme hesabı ve saf hatırlatma hesabı bulunur. Bu sürümde 25 mevcut birim/altyapı testi vardır; bunlar auth, abonelik veya hatırlatma HTTP endpoint'lerini sınamaz. API uygulaması henüz yalnızca `/health` endpoint'ini içerdiğinden bu plandaki API senaryoları çalıştırılamaz. Son sürümün kapsamı CI raporundan kaydedilmelidir.

`origin/develop` `8aba13f` içindeki `backend/tests/test_renewal.py` ve `backend/tests/test_reminders.py` tarih ve saf hatırlatma hesabı testlerini içerir. Bu testler API endpoint'lerini kapsamaz. Ayrıntılı kapsam eşlemesi ve görülen boşluk [QA Test Senaryoları](test-cases.md) belgesinde yer alıyor.

## 2. Test kapsamı

İlk sürüm için test edilecek temel davranışlar:

- E-posta/şifre ile kayıt ve giriş; korumalı işlemlerde JWT doğrulaması.
- Abonelik ekleme, listeleme, görüntüleme ve iptal etme.
- Aylık ve yıllık yenileme tarihi hesabı; ay sonu ve artık yıl davranışı.
- Aynı kullanıcıda aynı servis ve periyot için aktif abonelik çakışmasının engellenmesi.
- Yenilemeden üç gün ve bir gün önce hatırlatma üretilmesi; her eşikte tekillik, geç eklemede yalnızca kalan eşikler ve iptalden sonra yeni hatırlatma üretmeme.
- Kullanıcılar arası veri izolasyonu ve API hata davranışları.

İlk sürüm kapsamı dışında kalan gerçek push/cihaz kaydı, haftalık periyot, ödeme/banka bağlantısı, harcama grafikleri ve US-10 erteleme/snooze bu planın fonksiyonel kapsamına dahil değildir.

## 3. Test yaklaşımı

| Seviye | Amaç | Örnekler | Zamanlama |
|---|---|---|---|
| Birim | Saf alan kurallarını ve uç durumları hızlı doğrulamak | Yenileme hesabı, abonelik doğrulaması, durum geçişi, hatırlatma tekilliği | İlgili kod PR'larında ve CI'da |
| API | HTTP sözleşmesini, doğrulamayı, yetkilendirmeyi ve hata yanıtlarını doğrulamak | Kayıt/giriş, abonelik CRUD işlemleri, `400/401/404/409` davranışları | API işlemleri geliştirildikçe |
| Entegrasyon | API, veritabanı ve mock bildirim sınırlarının birlikte çalışmasını doğrulamak | Kalıcı kayıt, benzersiz kısıt, hatırlatma üretimi | MVP entegrasyonunda |
| Uçtan uca | Ana kullanıcı yolculuğunu çalışan ürün üzerinden doğrulamak | Kayıt/giriş, abonelik ekleme, hatırlatma kaydını görme | Final teslim ve demo öncesi |

Birim kapsamı ders gereksinimi olan en az **%50** seviyesinde tutulmalıdır. Ekip, kapsam ölçümünün hangi modülleri kapsadığını ve hariç tutulan kodu raporda açıkça belirtmelidir. QA testleri ve raporu sahiplenir; başarısız üretim kodunu ilgili implementasyon sahibi düzeltir.

## 4. Senaryolar ve izlenebilirlik

Ayrıntılı ön koşullar, veri örnekleri, adımlar ve beklenen sonuçlar [QA Test Senaryoları](test-cases.md) belgesindedir. Senaryolar teknik belge v4, `api/openapi.yaml`, ADR kararları ve US-01–US-10 issue'larına dayanır. Architect/PO kararları senaryolara işlenmiştir.

Testler çalıştırıldığında her senaryonun durumu (PASS/FAIL/BLOCKED), uygulanan build/commit ve kanıt ilgili PR/CI raporunda kaydedilmelidir.

### Kabul testi kimlikleri ve senaryo eşlemesi

Ürün gereksinimleri ve backlog'daki AT-01–AT-30 kimlikleri, ayrıntılı QA senaryolarına şu şekilde bağlanır:

| Kabul testi | QA senaryosu |
|---|---|
| AT-01 | QA-AUTH-01 |
| AT-02 | QA-AUTH-02, QA-AUTH-03, QA-AUTH-11, QA-AUTH-12 |
| AT-03 | QA-AUTH-04 |
| AT-04 | QA-AUTH-05 |
| AT-05 | QA-AUTH-06 |
| AT-06 | QA-AUTH-10 |
| AT-07 | QA-AUTH-07 |
| AT-08 | QA-SUB-01, QA-SUB-02 |
| AT-09 | QA-SUB-03–09, QA-SUB-23 |
| AT-10 | QA-AUTH-08, QA-SUB-16 |
| AT-11 | QA-SUB-14, QA-SUB-15, QA-REM-12 |
| AT-12 | QA-SUB-10, QA-SUB-11 |
| AT-13 | QA-SUB-12 (farklı periyot) |
| AT-14 | QA-SUB-12 (farklı kullanıcı) |
| AT-15 | QA-SUB-13 |
| AT-16 | QA-SUB-17 |
| AT-17 | QA-SUB-18 |
| AT-18 | QA-DATE-01 |
| AT-19 | QA-DATE-02 |
| AT-20 | QA-DATE-05, QA-DATE-06 |
| AT-21 | QA-DATE-01, QA-DATE-03, QA-DATE-04 |
| AT-22 | QA-REM-01 |
| AT-23 | QA-REM-16 |
| AT-24 | QA-REM-04, QA-REM-05 |
| AT-25 | QA-REM-17 |
| AT-26 | QA-REM-08 |
| AT-27 | QA-REM-07 |
| AT-28 | QA-REM-12 |
| AT-29 | Senaryo eklenmedi; test edilebilir kabul ölçütü netleştirilmeli |
| AT-30 | QA-REM-19 |

## 5. Teste hazır olma ve kabul koşulları

Bir story test geliştirmeye hazır sayılmadan önce:

- Kullanıcı, amaç, gerekli alanlar ve gözlenebilir sonuç açık olmalı.
- Olumlu akışın yanında geçersiz girdi ve ilgili hata/çakışma davranışı belirtilmeli.
- API etkisi ve beklenen HTTP yanıtları onaylı `api/openapi.yaml` ile tutarlı olmalı.
- Tarih, saat dilimi, para ve kullanıcı sahipliği kuralları karara bağlanmış olmalı.
- Test verisi ve çalıştırma yöntemi belirlenebilir olmalı.

Bir story QA açısından tamamlanmış sayılmadan önce:

- İlgili otomatik testler geçmeli; kapsam eşiği %50'nin altına düşmemeli.
- Davranış OpenAPI sözleşmesi ve kabul kriterleriyle tutarlı olmalı.
- PR'da çalıştırma kanıtı ve ilişkili issue bağlantısı bulunmalı.
- Bulunan hatalar düzeltilmiş veya PO tarafından önceliklendirilmiş açık issue olarak kaydedilmiş olmalı.

## 6. Bug ve test kanıtı kaydı

Her hata için issue'da en az şunlar bulunmalı: başlık, etkilenen story/API işlemi, ortam ve build/commit, yeniden üretme adımları, beklenen sonuç, gerçek sonuç, önem/öncelik ve log/rapor/ekran görüntüsü bağlantısı. QA düzeltmeyi aynı senaryoyla yeniden çalıştırıp sonucu issue ve PR'a bağlar.

Test çalıştırma kaydı şablonu:

```text
Story / issue:
Build veya commit:
Ortam:
Test ID'leri:
Sonuç: PASS / FAIL / BLOCKED / NOT RUN
Çalıştırma komutu veya yöntem:
Kanıt (CI raporu, log, ekran görüntüsü):
İlgili hata issue'ları:
```

## 7. Karara bağlanan kurallar

- Uygulama abonelik satın almaz, ödeme yapmaz ve servis sağlayıcısından yenilenme bilgisi almaz. `active` kayıt, kullanıcının izlemeye devam ettiği tekrarlayan abonelik anlamına gelir. `nextRenewalDate`, `startDate` ve `period` üzerinden istek sırasında hesaplanır; günlük iş abonelik tarihini ilerletmez.
- E-posta kayıt ve giriş sırasında küçük harfe çevrilir; büyük/küçük harf farkı aynı hesabı ifade eder. Servis adı baş/son boşluklardan kırpılır ve karşılaştırma büyük/küçük harfe duyarsızdır.
- `startDate` yenileme günü sayılmaz; ilk yenileme başlangıç tarihinden bir periyot sonradır. Gelecek `startDate` kabul edilir.
- İptal fiziksel silme değildir. Kayıt `cancelled` durumuyla listede kalır ve liste `createdAt` azalan sıradadır.
- Her aktif yenileme döngüsü için 3 gün ve 1 gün önce ayrı hatırlatmalar oluşturulur. Hatırlatma tekilliği `(subscription_id, renewal_date, days_before)` ile sağlanır. Üretilen hatırlatmanın durumu `sent_mock` olur.
- Abonelik var olduğu halde iş/eşik çalıştırması kaçırılmışsa, yenileme günü geçmediği sürece sonraki işte eşik telafi edilir. Abonelik eşik tarihinden sonra eklenmişse geçmiş eşik üretilmez; yenileme günü geçtiyse o döngü için hatırlatma üretilmez.
- Hatırlatma kaydı ve mock gönderim tek işlemde yapılır. Gönderim hata verirse işlem geri alınır, kayıt oluşmaz ve sonraki çalışmada yeniden denenir.
- Geçersiz girdi `400`; JWT ömrü 24 saat ve yenileme akışı yoktur. `next_renewal` geçersiz periyot için `ValueError` fırlatır.
- Kapsam raporunda ölçülecek modüller ve hariç tutma gerekçeleri CI raporunda açıklanmalıdır.

