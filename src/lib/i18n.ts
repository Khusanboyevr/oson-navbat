export type Language = "uz" | "ru" | "en";

export const LANGUAGE_LABELS: Record<Language, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
  en: "English",
};

export const LANGUAGES: Language[] = ["uz", "ru", "en"];

export type TranslationKey =
  | "nav.home"
  | "nav.bookings"
  | "nav.favorites"
  | "nav.login"
  | "hero.titleMain"
  | "hero.titleAccent"
  | "hero.subtitle"
  | "hero.searchPlaceholder"
  | "hero.searchButton"
  | "profile.settings"
  | "profile.language"
  | "profile.notifications"
  | "profile.sms"
  | "profile.telegram"
  | "profile.support"
  | "profile.logout"
  | "auth.clientTitle"
  | "auth.clientSubtitle"
  | "auth.google"
  | "auth.phone"
  | "auth.phonePlaceholder"
  | "auth.getCode"
  | "auth.sending"
  | "auth.enterCode"
  | "auth.codeSentTo"
  | "auth.verify"
  | "auth.checking"
  | "auth.back"
  | "auth.successTitle"
  | "auth.successSubtitleClient"
  | "auth.successSubtitleBarber"
  | "auth.continue"
  | "auth.barberCta"
  | "auth.barberTitle"
  | "auth.barberSubtitle"
  | "auth.clientCta";

export const TRANSLATIONS: Record<Language, Record<TranslationKey, string>> = {
  uz: {
    "nav.home": "Asosiy",
    "nav.bookings": "Bronlarim",
    "nav.favorites": "Sevimlilar",
    "nav.login": "Profilga kirish",
    "hero.titleMain": "Navbat kutishni",
    "hero.titleAccent": "unuting!",
    "hero.subtitle": "O'zingizga yoqqan usta yoki salonni toping va bir necha soniyada joy band qiling.",
    "hero.searchPlaceholder": "Usta yoki salon nomini qidiring...",
    "hero.searchButton": "Qidirish",
    "profile.settings": "Sozlamalar",
    "profile.language": "Tilni o'zgartirish",
    "profile.notifications": "Xabarnomalar",
    "profile.sms": "SMS orqali",
    "profile.telegram": "Telegram orqali",
    "profile.support": "Yordam markazi",
    "profile.logout": "Tizimdan chiqish",
    "auth.clientTitle": "Xush kelibsiz!",
    "auth.clientSubtitle": "Davom etish uchun tizimga kiring",
    "auth.google": "Google orqali kirish",
    "auth.phone": "Telefon raqam orqali",
    "auth.phonePlaceholder": "+998 90 123 45 67",
    "auth.getCode": "Kodni olish",
    "auth.sending": "Yuborilmoqda...",
    "auth.enterCode": "SMS kodni kiriting",
    "auth.codeSentTo": "Raqamingizga 4 xonali kod yuborildi.",
    "auth.verify": "Tasdiqlash",
    "auth.checking": "Tekshirilmoqda...",
    "auth.back": "Orqaga",
    "auth.successTitle": "Muvaffaqiyatli kirdingiz!",
    "auth.successSubtitleClient": "Endi ustalarni topib, bron qilishingiz mumkin.",
    "auth.successSubtitleBarber": "Endi bugungi jadvalingizni boshqarishingiz mumkin.",
    "auth.continue": "Davom etish",
    "auth.barberCta": "Sartaroshmisiz? Bizga qo'shiling",
    "auth.barberTitle": "Usta sifatida kirish",
    "auth.barberSubtitle": "Mijozlaringizni onlayn qabul qilishni boshlang",
    "auth.clientCta": "Mijoz sifatida kirish",
  },
  ru: {
    "nav.home": "Главная",
    "nav.bookings": "Мои брони",
    "nav.favorites": "Избранное",
    "nav.login": "Войти в профиль",
    "hero.titleMain": "Забудьте об",
    "hero.titleAccent": "ожидании очереди!",
    "hero.subtitle": "Найдите понравившегося мастера или салон и забронируйте место за несколько секунд.",
    "hero.searchPlaceholder": "Найдите мастера или салон...",
    "hero.searchButton": "Искать",
    "profile.settings": "Настройки",
    "profile.language": "Изменить язык",
    "profile.notifications": "Уведомления",
    "profile.sms": "По SMS",
    "profile.telegram": "Через Telegram",
    "profile.support": "Центр поддержки",
    "profile.logout": "Выйти из системы",
    "auth.clientTitle": "Добро пожаловать!",
    "auth.clientSubtitle": "Войдите, чтобы продолжить",
    "auth.google": "Войти через Google",
    "auth.phone": "По номеру телефона",
    "auth.phonePlaceholder": "+998 90 123 45 67",
    "auth.getCode": "Получить код",
    "auth.sending": "Отправка...",
    "auth.enterCode": "Введите SMS-код",
    "auth.codeSentTo": "На ваш номер отправлен 4-значный код.",
    "auth.verify": "Подтвердить",
    "auth.checking": "Проверка...",
    "auth.back": "Назад",
    "auth.successTitle": "Вы успешно вошли!",
    "auth.successSubtitleClient": "Теперь вы можете найти мастера и забронировать место.",
    "auth.successSubtitleBarber": "Теперь вы можете управлять своим расписанием.",
    "auth.continue": "Продолжить",
    "auth.barberCta": "Вы мастер? Присоединяйтесь к нам",
    "auth.barberTitle": "Вход для мастеров",
    "auth.barberSubtitle": "Начните принимать клиентов онлайн",
    "auth.clientCta": "Войти как клиент",
  },
  en: {
    "nav.home": "Home",
    "nav.bookings": "My Bookings",
    "nav.favorites": "Favorites",
    "nav.login": "Sign In",
    "hero.titleMain": "Forget about",
    "hero.titleAccent": "waiting in line!",
    "hero.subtitle": "Find a barber or salon you love and book a slot in seconds.",
    "hero.searchPlaceholder": "Search for a barber or salon...",
    "hero.searchButton": "Search",
    "profile.settings": "Settings",
    "profile.language": "Change language",
    "profile.notifications": "Notifications",
    "profile.sms": "Via SMS",
    "profile.telegram": "Via Telegram",
    "profile.support": "Support Center",
    "profile.logout": "Log out",
    "auth.clientTitle": "Welcome!",
    "auth.clientSubtitle": "Sign in to continue",
    "auth.google": "Continue with Google",
    "auth.phone": "Continue with phone",
    "auth.phonePlaceholder": "+998 90 123 45 67",
    "auth.getCode": "Get code",
    "auth.sending": "Sending...",
    "auth.enterCode": "Enter the SMS code",
    "auth.codeSentTo": "A 4-digit code was sent to your number.",
    "auth.verify": "Verify",
    "auth.checking": "Checking...",
    "auth.back": "Back",
    "auth.successTitle": "You're signed in!",
    "auth.successSubtitleClient": "You can now find a barber and book a slot.",
    "auth.successSubtitleBarber": "You can now manage your daily schedule.",
    "auth.continue": "Continue",
    "auth.barberCta": "Are you a barber? Join us",
    "auth.barberTitle": "Sign in as a barber",
    "auth.barberSubtitle": "Start accepting clients online",
    "auth.clientCta": "Sign in as a client",
  },
};
