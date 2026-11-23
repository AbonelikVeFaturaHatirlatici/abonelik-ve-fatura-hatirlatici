# Mobil (React Native + Expo, TypeScript, Android)

Abonelik Hatırlatıcı Android mobil uygulaması. Sözleşme: `api/openapi.yaml`.

## Gereksinimler

- Node.js 22+ ve npm
- Android Studio (Android emülatör) veya fiziksel Android cihazda **Expo Go**

## Yerelde Kurulum ve Çalıştırma

```bash
cd mobile
npm install
npx expo start
```

Doğrudan Android emülatörde başlatmak için:

```bash
npm run android
```

> **Not:** Android emülatör içerisinden yerel makinede çalışan backend API'ye (`localhost:8000`) erişmek için API adresi olarak `http://10.0.2.2:8000` kullanılmalıdır. Bu, varsayılan adrestir.

## API İstemcisi (S2-06)

Uygulama backend'e `src/api/httpApi.ts` üzerinden bağlanır. İstek ve yanıt tipleri elle yazılmaz; `api/openapi.yaml` sözleşmesinden üretilir.

| Dosya | Görev |
|---|---|
| `src/api/schema.d.ts` | `npm run generate:api` ile **üretilir**, elle düzenlenmez |
| `src/types/api.ts` | Ekranların kullandığı adlar (`Subscription`, `Reminder` …), üretilen tiplerden türetilir |
| `src/api/httpApi.ts` | Tipli HTTP istemcisi; korumalı uçlara `Authorization: Bearer <token>` ekler |
| `src/data/apiError.ts` | `{code, message}` hata gövdesinin tek ayrıştırıldığı yer (`ApiRequestError`, `ApiNetworkError`) |
| `src/auth/tokenStorage.ts` | JWT'yi `expo-secure-store` ile saklar; çıkışta ve 401'de siler |
| `src/config/env.ts` | API adresi ve mock modu (`EXPO_PUBLIC_*` değişkenleri) |

### Sözleşme değişince

```bash
npm run generate:api        # src/api/schema.d.ts yeniden üretilir
npm run typecheck           # sözleşmeyle uyumsuz kod burada yakalanır
npm run generate:api:check  # CI için: üretilen dosya güncel değilse hata verir
```

`api/openapi.yaml` mobil tarafta değiştirilmez; davranış değişikliği önce sözleşme PR'ı ile yapılır (AGENTS.md §7).

### Ortam değişkenleri

```bash
cp .env.example .env   # .env git'e girmez
```

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | `http://10.0.2.2:8000` | API taban adresi. Fiziksel cihazda bilgisayarın yerel ağ IP'si |
| `EXPO_PUBLIC_USE_MOCK_API` | `false` | `true`: ağ yerine bellek içi mock sunucu (S2-05 verisi) |

`EXPO_PUBLIC_` değerleri uygulama paketine gömülür; gizli bilgi yazılmaz. Değiştirdikten sonra `npx expo start -c` ile önbelleği temizleyerek başlatın.

### Prism mock sunucusuyla doğrulama

Backend olmadan, sözleşmeden üretilen mock sunucuya karşı kayıt + giriş akışı:

```bash
npm run mock:api      # 1. terminal: Prism, api/openapi.yaml, port 8000
npm run test:prism    # 2. terminal: register → 400 → login → Bearer'lı istek → 401 → ağ hatası
```

Uygulamayı da Prism'e bağlamak için Prism açıkken `npm run android` yeterlidir (emülatör `10.0.2.2:8000`'e gider). Prism örnek veri döndürür; kayıtlar saklanmaz.

## Kod Kalitesi ve Tip Kontrolü

CI (`mobile-lint`) üzerinde de çalışan kontrolleri yerelde doğrulamak için:

```bash
cd mobile
npm run lint        # ESLint kontrolü
npm run typecheck   # TypeScript (tsc --noEmit) tip kontrolü
```
