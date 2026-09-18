import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { topics } from '../data/news';
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';

const AppCtx = createContext(null);

// Flat RU -> EN dictionary. Anything rendered through t() falls back to the
// original Russian string when no entry exists, so partial coverage never breaks the UI.
const dict = {
  // chrome / nav
  'Главная': 'Home', 'Мир': 'World', 'Политика': 'Politics', 'Экономика': 'Economy',
  'Технологии': 'Technology', 'Общество': 'Society', 'Спорт': 'Sport', 'Культура': 'Culture',
  'Наука': 'Science', 'Здоровье': 'Health',
  'Избранное': 'Saved', 'Популярное': 'Trending', 'Последние': 'Latest',
  'КАТЕГОРИИ': 'CATEGORIES',
  'Быстрый доступ': 'Quick access', 'Настроить →': 'Customize →',
  'Популярные темы': 'Popular topics', 'Мнение редакции': "Editor's take",
  'Главное': 'Top stories', 'Мультимедиа': 'Multimedia',
  'Будьте в курсе событий': 'Stay in the loop',
  'Важные новости и эксклюзивные материалы первыми.': 'Important news and exclusive material, first.',
  'Подписаться': 'Subscribe', 'Подписаться →': 'Subscribe →',
  'Важное': 'Important', 'Все важные события →': 'All important events →',
  'Лента новостей / Live': 'News feed / Live',
  'Актуальные события': 'Live updates', 'в реальном времени': 'in real time',
  'Курс валют': 'Exchange rate', 'Все курсы →': 'All rates →', 'Рассылка': 'Newsletter',
  'Главные новости недели': "This week's top news", 'на вашу почту.': 'to your inbox.',
  'События без': 'Events without', 'лишнего шума': 'the noise',
  'Введите ваш email': 'Enter your email', 'Введите email': 'Enter email',
  'Войти': 'Log in', 'Вход или регистрация': 'Log in or sign up', 'Регистрация': 'Sign up', 'Выйти': 'Log out',
  'Будьте на шаг впереди': 'Stay one step ahead',
  'Подпишитесь на нашу рассылку и получайте только важные новости.': 'Subscribe to get only the important news.',
  'НОВОСТИ': 'NEWS', 'МНЕНИЯ': 'OPINIONS', 'ГЛАВНОЕ': 'HIGHLIGHTS',
  'Поиск': 'Search',

  // quick-topics + category chips
  'Все': 'All', 'Война в Украине': 'War in Ukraine', 'Климат': 'Climate', 'Бизнес': 'Business',

  // popular grid
  'Новый прорыв в сфере искусственного интеллекта': 'A new breakthrough in artificial intelligence',
  'Курс рубля: что ждать в ближайшее время': 'The ruble exchange rate: what to expect soon',
  'Главные выставки 2025 года в России': 'The must-see exhibitions of 2025 in Russia',
  'Российские спортсмены готовятся к Олимпиаде': 'Russian athletes prepare for the Olympics',

  // hero
  'ПОЛИТИКА': 'POLITICS', 'ЭКОНОМИКА': 'ECONOMY', 'ТЕХНОЛОГИИ': 'TECHNOLOGY', 'ОБЩЕСТВО': 'SOCIETY',
  'Россия и мир: новые горизонты в условиях меняющегося порядка': 'Russia and the world: new horizons in a changing order',
  'Эксперты обсудили, как изменится глобальная политика в ближайшие годы и какую роль в этом сыграет Россия.':
    'Experts discussed how global politics will shift in the coming years, and what role Russia will play in it.',

  // side stories
  'В Кремле прокомментировали новые санкции Запада': 'The Kremlin commented on the West\'s new sanctions',
  'ЦБ сохранил ключевую ставку на уровне 16%': 'The central bank held its key rate at 16%',
  'В России запущен новый спутник связи': 'Russia launched a new communications satellite',
  'В регионах усилят меры безопасности перед праздниками': 'Regions to tighten security ahead of the holidays',

  // editorials / opinion
  'Мнение': 'Opinion',
  'Почему важно инвестировать в образование': 'Why investing in education matters',
  'Как технологии меняют журналистику': 'How technology is changing journalism',
  'Энергетический переход: вызовы и решения': 'The energy transition: challenges and solutions',
  'Сегодня мир находится на переломном этапе. Важно не только следить за событиями, но и понимать их суть.':
    'The world is at a turning point today. It matters not just to follow events, but to understand what they mean.',
  'Главный редактор': 'Editor-in-chief',

  // rankings ("Главное")
  'Россия укрепляет сотрудничество с дружественными странами': 'Russia strengthens cooperation with friendly nations',
  'Что будет с ценами на нефть в 2025 году?': 'What will happen to oil prices in 2025?',
  'Как защитить персональные данные в цифровую эпоху': 'How to protect personal data in the digital age',
  'Новые технологии изменят рынок труда': 'New technology will reshape the labor market',

  // video
  'Новый этап: запуск спутника связи': 'A new stage: communications satellite launch',
  'Как это повлияет на развитие технологий и жизнь людей.': 'How this will affect technology and everyday life.',

  // important events timeline
  'ЦБ сохранил ключевую ставку': 'Central bank holds its key rate',
  'Новые санкции против ряда компаний': 'New sanctions against several companies',
  'Открытие выставки современного искусства': 'A contemporary art exhibition opens',
  'Опубликован новый прогноз по инфляции': 'A new inflation forecast published',
  'Подписано соглашение о сотрудничестве': 'A cooperation agreement signed',

  // relative timestamps
  '1 час назад': '1 hour ago', '2 часа назад': '2 hours ago', '3 часа назад': '3 hours ago',
  '4 часа назад': '4 hours ago', '5 часов назад': '5 hours ago', '6 часов назад': '6 hours ago',
  '8 часов назад': '8 hours ago', '9 часов назад': '9 hours ago',

  // modals / forms
  'Вход в аккаунт': 'Sign in', 'Рады видеть вас снова в «Контуре».': 'Good to see you again on Kontur.',
  'Присоединяйтесь, чтобы сохранять статьи и настраивать ленту.': 'Join to save stories and customize your feed.',
  'Вход': 'Sign in', 'Email': 'Email', 'Пароль': 'Password', 'Имя': 'Name',
  'Как вас зовут?': 'What should we call you?',
  'Создать аккаунт': 'Create account', 'Продолжить как гость': 'Continue as guest',
  'Нет аккаунта?': "Don't have an account?", 'Зарегистрироваться': 'Sign up',
  'Уже с нами?': 'Already with us?',
  'Введите корректный email': 'Enter a valid email', 'Введите ваше имя': 'Enter your name',
  'Пароль должен быть не короче 4 символов': 'Password must be at least 4 characters',
  'Поделиться': 'Share', 'Ссылка на публикацию скопирована': 'Article link copied',
  'Поиск по сайту': 'Site search', 'Начните вводить — покажем совпадения по заголовкам и рубрикам.':
    'Start typing — we\'ll match headlines and sections.',
  'Например: санкции, спутник, рубль…': 'Try: sanctions, satellite, ruble…',
  'Ничего не найдено по запросу': 'No results for',
  'Настройки cookie': 'Cookie settings',
  'Выберите, какие файлы cookie можно использовать сайту «Контур».': 'Choose which cookies the Kontur site may use.',
  'Необходимые': 'Necessary', 'Обеспечивают базовую работу сайта. Их нельзя отключить.': 'Keep the site running. These can\'t be turned off.',
  'Аналитика': 'Analytics', 'Помогают понять, какие материалы читают чаще всего.': 'Help us see which stories get read the most.',
  'Персонализация и реклама': 'Personalization & ads', 'Используются для подбора рекомендаций и рекламы.': 'Used to tailor recommendations and ads.',
  'Сохранить настройки': 'Save settings',
  'Все важные события': 'All important events', 'Хроника дня, вся в одном месте.': 'The day\'s timeline, all in one place.',
  'Курсы валют': 'Exchange rates', 'Обновлено сегодня в 12:45.': 'Updated today at 12:45.',
  'Будьте в курсе событий →': 'Stay in the loop',
  'Важные новости и эксклюзивные материалы — первыми.': 'Important news and exclusive material — first.',
  'Мы используем cookie': 'We use cookies',
  'Это помогает сайту работать быстрее и показывать более релевантные материалы. Подробнее — в разделе «Cookie-политика».':
    'This helps the site run faster and show more relevant material. See the Cookie Policy for details.',
  'Настроить': 'Customize', 'Только необходимые': 'Necessary only', 'Принять все': 'Accept all',
  'Меню': 'Menu',

  // footer
  'Разделы': 'Sections', 'О нас': 'About', 'Редакция': 'Editorial team', 'Реклама': 'Advertising',
  'Карьера': 'Careers', 'Контакты': 'Contacts', 'Этика СМИ': 'Media ethics',
  'Сервисы': 'Services', 'Мобильное приложение': 'Mobile app', 'RSS': 'RSS', 'Виджеты': 'Widgets',
  'Правовая информация': 'Legal', 'Пользовательское соглашение': 'Terms of use',
  'Политика конфиденциальности': 'Privacy policy', 'Cookie-политика': 'Cookie policy',
  'Достоверные новости': 'Reliable news', 'со всего мира': 'from around the world',
  '© 2026 Контур Media': '© 2026 Kontur Media', 'Все права защищены': 'All rights reserved',
  'в разработке': 'is coming soon',
  'Это демонстрационный сайт «Контур». В реальном проекте здесь будет полный текст политики конфиденциальности.':
    'This is a demo Kontur site. A real project would show the full privacy policy text here.',
  'Это демонстрационный сайт «Контур». В реальном проекте здесь будет полный текст пользовательского соглашения.':
    'This is a demo Kontur site. A real project would show the full terms of use text here.',

  // multi-source publishing
  'Новости от источников': 'News from sources',
  'Здесь будут появляться материалы, автоматически собранные из разных источников.':
    'Stories collected automatically from different sources will appear here.',
  'Удалить публикацию': 'Remove submission',
  'Читатель': 'Reader', 'Копировать ссылку': 'Copy link',

  // header category dropdown
  'Свежее в разделе': 'Fresh in this section',
  'Читать материал': 'Read the story',
  'Пока нет свежих материалов в этом разделе.': 'No fresh material in this section yet.'
};

const CONSENT_COOKIE = 'kontur_consent';
const NECESSARY_COOKIE = 'kontur_necessary';
const ANALYTICS_COOKIE = 'kontur_analytics';
const MARKETING_COOKIE = 'kontur_marketing';
const LANG_KEY = 'kontur-lang';
const USER_KEY = 'kontur-user';
const ARTICLES_KEY = 'kontur-user-articles';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem(LANG_KEY) || 'ru');
  const [user, setUser] = useState(() => readJSON(USER_KEY, null));
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);
  const [activeTopNav, setActiveTopNav] = useState('Главная');
  const [activeSideNav, setActiveSideNav] = useState('Главная');
  const [activeTopic, setActiveTopic] = useState(topics[0]);
  const [isLive, setIsLive] = useState(false);
  const [cookiePrefs, setCookiePrefs] = useState(() => {
    const raw = getCookie(CONSENT_COOKIE);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  });
  const [userArticles, setUserArticles] = useState(() => readJSON(ARTICLES_KEY, []));

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  const toast = useCallback((msg, kind = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800);
  }, []);

  const dismissToast = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);

  const openModal = useCallback((type, props = {}) => setModal({ type, props }), []);
  const closeModal = useCallback(() => setModal(null), []);

  const setLang = useCallback((next) => {
    setLangState(next);
    toast(next === 'en' ? 'Language switched to English' : 'Язык переключён на русский', 'info');
  }, [toast]);

  const t = useCallback((ru) => (lang === 'en' && dict[ru]) ? dict[ru] : ru, [lang]);

  const login = useCallback((email) => {
    const name = email.split('@')[0] || 'Читатель';
    const u = { email, name };
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    toast(`Добро пожаловать, ${name}!`, 'success');
    closeModal();
  }, [toast, closeModal]);

  const register = useCallback((name, email) => {
    const u = { email, name };
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    toast(`Регистрация завершена. Добро пожаловать, ${name}!`, 'success');
    closeModal();
  }, [toast, closeModal]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    toast('Вы вышли из аккаунта', 'info');
  }, [toast]);

  // Writes the real cookies a genuine consent banner would control: a necessary
  // cookie always gets set once a choice is made, while analytics/marketing
  // cookies are only set when accepted — and actively removed when declined.
  const applyCookiePrefs = useCallback((prefs) => {
    setCookie(CONSENT_COOKIE, JSON.stringify(prefs), 180);
    setCookie(NECESSARY_COOKIE, '1', 180);
    if (prefs.analytics) setCookie(ANALYTICS_COOKIE, '1', 180); else deleteCookie(ANALYTICS_COOKIE);
    if (prefs.marketing) setCookie(MARKETING_COOKIE, '1', 180); else deleteCookie(MARKETING_COOKIE);
    setCookiePrefs(prefs);
  }, []);

  const acceptAllCookies = useCallback(() => {
    applyCookiePrefs({ necessary: true, analytics: true, marketing: true });
    toast('Настройки cookie сохранены', 'success');
  }, [toast, applyCookiePrefs]);

  const acceptNecessaryCookies = useCallback(() => {
    applyCookiePrefs({ necessary: true, analytics: false, marketing: false });
    toast('Сохранены только необходимые cookie', 'info');
  }, [toast, applyCookiePrefs]);

  const savePrefsCookies = useCallback((prefs) => {
    applyCookiePrefs({ necessary: true, ...prefs });
    toast('Настройки cookie сохранены', 'success');
    closeModal();
  }, [toast, closeModal, applyCookiePrefs]);

  const toggleTopic = useCallback((topic) => setActiveTopic(topic), []);

  const publishArticle = useCallback(({ title, category, source, excerpt }) => {
    const article = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      category,
      source: source.trim(),
      excerpt: (excerpt || '').trim(),
      publishedAt: Date.now()
    };
    setUserArticles(list => {
      const next = [article, ...list].slice(0, 40);
      localStorage.setItem(ARTICLES_KEY, JSON.stringify(next));
      return next;
    });
    toast(`«${article.title}» — материал от «${article.source}» опубликован`, 'success');
    closeModal();
  }, [toast, closeModal]);

  const removeArticle = useCallback((id) => {
    setUserArticles(list => {
      const next = list.filter(a => a.id !== id);
      localStorage.setItem(ARTICLES_KEY, JSON.stringify(next));
      return next;
    });
    toast('Публикация удалена', 'info');
  }, [toast]);

  const value = useMemo(() => ({
    lang, setLang, t,
    user, login, register, logout,
    toasts, toast, dismissToast,
    modal, openModal, closeModal,
    activeTopNav, setActiveTopNav,
    activeSideNav, setActiveSideNav,
    activeTopic, toggleTopic,
    isLive, setIsLive,
    cookiePrefs, acceptAllCookies, acceptNecessaryCookies, savePrefsCookies,
    userArticles, publishArticle, removeArticle
  }), [lang, setLang, t, user, login, register, logout, toasts, toast, dismissToast,
      modal, openModal, closeModal, activeTopNav, activeSideNav,
      activeTopic, toggleTopic, isLive, cookiePrefs, acceptAllCookies, acceptNecessaryCookies, savePrefsCookies,
      userArticles, publishArticle, removeArticle]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
