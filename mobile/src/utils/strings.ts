/**
 * Metin kataloğu: docs/product/08-user-flows-and-prototype-spec.md bölüm 6 (D-19: tüm metinler Türkçe).
 * Ekranlarda metin doğrudan yazılmaz; hepsi buradan alınır.
 */
export const strings = {
  app: {
    title: 'Abonelik Hatırlatıcı',
  },
  auth: {
    tabLogin: 'Giriş Yap',
    tabRegister: 'Kayıt Ol',
    email: 'E-posta',
    emailPlaceholder: 'ayse@example.com',
    password: 'Şifre',
    passwordHelper: 'En az 8 karakter',
    showPassword: 'Şifreyi göster',
    hidePassword: 'Şifreyi gizle',
    errEmail: 'Geçerli bir e-posta adresi girin.',
    errPassword: 'Şifre en az 8 karakter olmalıdır.',
    sessionExpired: 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.',
    goToLogin: 'Giriş Yap',
  },
  common: {
    networkError: 'Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.',
    retry: 'Tekrar Dene',
    loading: 'Yükleniyor',
    back: 'Geri',
    menu: 'Menü',
  },
  menu: {
    logout: 'Çıkış Yap',
  },
  nav: {
    subscriptions: 'Abonelikler',
    reminders: 'Hatırlatmalar',
  },
  list: {
    title: 'Aboneliklerim',
    empty: 'Henüz abonelik eklemediniz.',
    emptyAction: 'İlk Aboneliğini Ekle',
    add: 'Abonelik Ekle',
    error: 'Abonelikler yüklenemedi.',
  },
  card: {
    nextRenewal: (date: string, daysLeft: string) => `Sonraki yenileme: ${date} · ${daysLeft}`,
    tomorrow: 'yarın',
    daysLeft: (n: number) => `${n} gün kaldı`,
    lastReminder: (line: string) => `Son hatırlatma: ${line}`,
    noReminder: 'Henüz hatırlatma yok',
    removedBadge: 'Takipten çıkarıldı',
    perMonth: '/ ay',
    perYear: '/ yıl',
  },
  detail: {
    title: 'Abonelik Detayı',
    amount: 'Tutar',
    period: 'Periyot',
    firstPayment: 'İlk ödeme',
    nextRenewal: 'Sonraki yenileme',
    status: 'Durum',
    reminders: 'Hatırlatmalar',
    noReminders: 'Henüz hatırlatma yok.',
  },
  period: {
    monthly: 'Aylık',
    yearly: 'Yıllık',
  },
  status: {
    active: 'Aktif',
    cancelled: 'Takipten çıkarıldı',
  },
  reminder: {
    line: (n: number, date: string) => `${n} gün kala · ${date}`,
    sentMock: 'Hatırlatıldı',
    created: 'Bekliyor',
  },
  remove: {
    button: 'Takipten Çıkar',
    // UIR-03: başlık ve uyarı cümlesi şartnamedeki metinle birebir aynı olmalıdır.
    dialogTitle: 'Takipten çıkarılsın mı?',
    warning: 'Servisteki gerçek aboneliğiniz iptal edilmez.',
    cancel: 'Vazgeç',
    done: 'Takipten çıkarıldı.',
  },
  add: {
    title: 'Abonelik Ekle',
    serviceName: 'Servis adı',
    serviceNamePlaceholder: 'Örn. Netflix',
    amount: 'Tutar (₺)',
    amountPlaceholder: '0,00',
    amountHint: 'Örn. 229,99',
    currency: 'TRY',
    period: 'Periyot',
    startDate: 'İlk ödeme tarihi',
    startDatePlaceholder: 'GG.AA.YYYY',
    startDateHint: 'İlk ödemenin yapıldığı gün (geçmiş bir tarih olabilir)',
    save: 'Kaydet',
    done: 'Abonelik eklendi.',
    errName: 'Servis adı gerekli.',
    errNameLength: 'Servis adı en fazla 100 karakter olabilir.',
    errAmount: 'Geçerli bir tutar girin (örn. 229,99).',
    errAmountZero: 'Tutar sıfırdan büyük olmalıdır.',
    errAmountDecimals: 'Tutarda en fazla iki ondalık basamak olabilir.',
    errDate: 'Tarih seçin.',
    // Katalogda yok: elle yazılan tarih biçimi bozuk olduğunda (takvim seçicisi S2-06'da).
    errDateFormat: 'Tarihi GG.AA.YYYY biçiminde girin.',
    errDateRange: 'Tarih 01.01.2000 ile bugünden itibaren 366 gün sonrası arasında olmalıdır.',
  },
  reminders: {
    title: 'Hatırlatmalar',
    empty: 'Henüz hatırlatma yok.',
    error: 'Hatırlatmalar yüklenemedi.',
    renewal: (date: string) => `Yenileme: ${date}`,
    unknownSubscription: 'Abonelik',
  },
  notFound: 'Abonelik bulunamadı.',
  /** Sunucu sözleşmedeki `{code, message}` gövdesini döndürmediğinde kullanılır. */
  apiErrors: {
    unauthorized: 'Geçerli bir oturum gerekli.',
    notFound: 'İstenen kayıt bulunamadı.',
    server: 'Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
    generic: 'İstek işlenemedi. Lütfen tekrar deneyin.',
  },
} as const;

/**
 * Sunucu hata gövdeleri (SRS bölüm 3.8). Mock sunucu bunları döndürür;
 * gerçek API'de `message` alanı sunucudan gelir ve olduğu gibi gösterilir.
 */
export const serverErrors = {
  unauthorized: { code: 'UNAUTHORIZED', message: 'Geçerli bir oturum gerekli.' },
  invalidCredentials: { code: 'INVALID_CREDENTIALS', message: 'E-posta veya şifre hatalı.' },
  notFound: { code: 'NOT_FOUND', message: 'Abonelik bulunamadı.' },
  emailAlreadyRegistered: {
    code: 'EMAIL_ALREADY_REGISTERED',
    message: 'Bu e-posta ile kayıtlı bir hesap var.',
  },
  subscriptionAlreadyActive: {
    code: 'SUBSCRIPTION_ALREADY_ACTIVE',
    message: 'Bu servis ve periyot için aktif bir abonelik zaten var.',
  },
  alreadyCancelled: { code: 'ALREADY_CANCELLED', message: 'Bu abonelik zaten iptal edilmiş.' },
  validation: (message: string) => ({ code: 'VALIDATION_ERROR', message }),
} as const;
