# ADR-002: Hatırlatma üretimi API içinde günlük iş, çift gönderim benzersiz kısıtla önlenir

Durum: Kabul edildi
Tarih: 21.10.2026
Karar verenler: Architect (Buğra); iş kuralları PO onayıyla

## Bağlam
Her aboneliğin yenilemesinden **3 gün ve 1 gün önce** birer hatırlatma üretilmeli, her biri **yalnızca bir kez**. Bildirim gerçek telefona gitmez; mock kaydı tutulur. İş kurallarını PO belirledi:
- Yenilemeye 3 günden az kala eklenen abonelikte geçmişe düşen hatırlatma üretilmez, kalan gün için üretilir.
- İptal edilen abonelik için yeni hatırlatma üretilmez; mevcutlar listede kalır.

## Karar
1. Hatırlatmalar **API sürecinin içinde, günde bir kez 09:00'da (Europe/Istanbul)** çalışan zamanlanmış iş (APScheduler) ile üretilir. Ayrı worker veya kuyruk yok.
2. İş her aktif abonelik için önce `R = next_renewal(start_date, period, bugün)` hesaplar. `next_renewal`, bugünden **kesinlikle sonraki** ilk yenileme gününü verir; bu yüzden yenileme günü geldiğinde `R` bir sonraki döneme kayar ve o gün için hatırlatma üretilmez. Her `d` değeri (3, 1) için `remind_on = R − d` hesaplanır. Kayıt **yalnızca** şu iki koşul birlikte doğruysa eklenir:
   - `remind_on ≤ bugün` (vadesi gelmiş; kaçırılan günler telafi edilir),
   - `remind_on ≥` aboneliğin eklendiği gün (abonelik eklenmeden önceki bir eşik için hatırlatma üretilmez).

   İş **iki aşamalıdır** ve her aşama tekrar çalıştırılabilir (idempotent):
   - **Üretim:** Yukarıdaki koşulları sağlayan kayıtlar `created` durumuyla eklenir (`ON CONFLICT DO NOTHING`); var olan kayıt atlanır.
   - **Gönderim:** Durumu `created`, `remind_on ≤ bugün` ve `renewal_date > bugün` olan hatırlatmalar `NotificationPort` üzerinden gönderilir. Her hatırlatma kendi işleminde `FOR UPDATE SKIP LOCKED` ile kilitlenir. Mock uygulaması kayıt tutar, durum `sent_mock` olur. Gönderim hata verirse işlem geri alınır, kayıt `created` kalır ve sonraki çalışmada yeniden denenir.
   - İptal edilmiş aboneliğin daha önce üretilmiş hatırlatmaları listede kalır ama gönderilmez.
3. **Çift üretim veritabanında, çift gönderim kilitle engellenir:** `reminders` tablosunda `(subscription_id, renewal_date, days_before)` benzersizdir. İş iki kez çalışsa veya iki API kopyası olsa bile ikinci kayıt eklenmez; `ON CONFLICT DO NOTHING` bunu sessizce atlar. Gönderim aşamasında `FOR UPDATE SKIP LOCKED`, aynı hatırlatmanın iki süreç tarafından gönderilmesini önler.
4. İş mantığı `bugün` tarihini parametre alan saf bir fonksiyondur; testte zamanlayıcı gerekmez.

## Seçilmeyen yollar
- **Ayrı worker + kuyruk (Celery/Redis):** İki ek servis, ders projesi için fazla.
- **İşletim sistemi cron'u:** Docker ortamında ve testte yönetmesi zor, uygulama kurallarına erişemez.
- **Uygulama durum alanıyla çift gönderim kontrolü:** Yarış durumlarında (iki çalışma aynı anda) güvenilmez; veritabanı kısıtı kesindir.

## Sonuçlar
- Sunucu 09:00'da kapalıysa iş, vadesi gelmiş olanları sonraki çalışmada üretir (kaçırılan gün telafi edilir); yenileme günü geçtiyse üretmez.
- Mock bildirim yerine gerçek push eklenirse yalnızca `NotificationPort` adaptörü değişir.
- Abonelik, bir hatırlatma gününde saat 09:00'dan **sonra** eklenirse o günün hatırlatması üretilmez (iş ertesi gün `R` bir sonraki döneme kaymış olarak çalışır). Sprint 1'de kabul edilen sınırlamadır; ileride abonelik oluşturulurken işin çağrılmasıyla giderilebilir.
- Benzersiz kısıt çakışması beklenen bir durumdur, hata değildir; iş bunu loglamadan atlar.
- Gönderim hatası bir hatırlatmayı kaybettirmez: kayıt `created` kalır ve sonraki çalışmada yeniden denenir. Yenileme günü geçmişse (`renewal_date ≤ bugün`) artık gönderilmez.

## Revizyon notu
- 21.11.2026: Karar 2 ve 3, Sprint 2'de uygulanan iki aşamalı tasarıma (üretim + gönderim) göre güncellendi (`backend/app/services/reminder_job.py`, #65). İlk metin kayıt ve gönderimi tek işlemde tanımlıyordu; kural ve sonuçlar (3 ve 1 gün, tek kez, 09:00) değişmedi.