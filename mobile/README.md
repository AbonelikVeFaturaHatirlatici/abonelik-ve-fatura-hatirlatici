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

> **Not:** Android emülatör içerisinden yerel makinede çalışan backend API'ye (`localhost:8000`) erişmek için API adresi olarak `http://10.0.2.2:8000` kullanılmalıdır.

## Kod Kalitesi ve Tip Kontrolü

CI (`mobile-lint`) üzerinde de çalışan kontrolleri yerelde doğrulamak için:

```bash
cd mobile
npm run lint        # ESLint kontrolü
npm run typecheck   # TypeScript (tsc --noEmit) tip kontrolü
```
