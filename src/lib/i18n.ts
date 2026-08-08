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
  | "profile.logout";

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
  },
};
