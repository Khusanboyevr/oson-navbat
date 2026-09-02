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
  | "profile.push"
  | "profile.pushDescription"
  | "profile.pushError"
  | "profile.pushComingSoon"
  | "profile.support"
  | "profile.logout"
  | "notifications.title"
  | "notifications.empty"
  | "notifications.markAllRead"
  | "auth.clientTitle"
  | "auth.googleOnly"
  | "auth.google"
  | "auth.successTitle"
  | "auth.continue"
  | "auth.barberCta"
  | "auth.barberHint";

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
    "profile.push": "Push xabarnomalar",
    "profile.pushDescription": "Ilova yopiq bo'lsa ham qurilmangizga bildirishnoma keladi.",
    "profile.pushError": "Brauzer sozlamalaridan ruxsat bering.",
    "profile.pushComingSoon": "Push xabarnomalar tez orada ishga tushadi.",
    "profile.support": "Yordam markazi",
    "profile.logout": "Tizimdan chiqish",
    "notifications.title": "Xabarnomalar",
    "notifications.empty": "Hozircha xabarnoma yo'q",
    "notifications.markAllRead": "Barchasini o'qilgan deb belgilash",
    "auth.clientTitle": "Xush kelibsiz!",
    "auth.googleOnly": "Google hisobingiz orqali bir bosishda kiring - SMS yoki telefon raqam kerak emas.",
    "auth.google": "Google orqali kirish",
    "auth.successTitle": "Muvaffaqiyatli kirdingiz!",
    "auth.continue": "Davom etish",
    "auth.barberCta": "Usta bo'lib ro'yxatdan o'tish",
    "auth.barberHint": "Sartarosh yoki go'zallik ustasimisiz? Alohida ariza to'ldiring.",
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
    "profile.push": "Push-уведомления",
    "profile.pushDescription": "Уведомления приходят на устройство, даже если приложение закрыто.",
    "profile.pushError": "Разрешите уведомления в настройках браузера.",
    "profile.pushComingSoon": "Push-уведомления скоро заработают.",
    "profile.support": "Центр поддержки",
    "profile.logout": "Выйти из системы",
    "notifications.title": "Уведомления",
    "notifications.empty": "Пока нет уведомлений",
    "notifications.markAllRead": "Отметить все как прочитанные",
    "auth.clientTitle": "Добро пожаловать!",
    "auth.googleOnly": "Войдите одним нажатием через аккаунт Google - без SMS и номера телефона.",
    "auth.google": "Войти через Google",
    "auth.successTitle": "Вы успешно вошли!",
    "auth.continue": "Продолжить",
    "auth.barberCta": "Зарегистрироваться как мастер",
    "auth.barberHint": "Вы мастер или бьюти-специалист? Заполните отдельную заявку.",
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
    "profile.push": "Push notifications",
    "profile.pushDescription": "Get notified on your device even when the app is closed.",
    "profile.pushError": "Allow notifications in your browser settings.",
    "profile.pushComingSoon": "Push notifications are coming soon.",
    "profile.support": "Support Center",
    "profile.logout": "Log out",
    "notifications.title": "Notifications",
    "notifications.empty": "No notifications yet",
    "notifications.markAllRead": "Mark all as read",
    "auth.clientTitle": "Welcome!",
    "auth.googleOnly": "Sign in with your Google account in one tap - no SMS, no phone number.",
    "auth.google": "Continue with Google",
    "auth.successTitle": "You're signed in!",
    "auth.continue": "Continue",
    "auth.barberCta": "Register as a barber",
    "auth.barberHint": "Are you a barber or beauty professional? Fill in the separate application.",
  },
};
