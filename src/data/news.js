export const topics = ['Все', 'Популярное', 'Война в Украине', 'Климат', 'Технологии', 'Бизнес', 'Здоровье', 'Наука', 'Культура'];

export const popular = [
  { id: 'p1', category: 'Технологии', title: 'Новый прорыв в сфере искусственного интеллекта', time: '5 часов назад' },
  { id: 'p2', category: 'Экономика', title: 'Курс рубля: что ждать в ближайшее время', time: '6 часов назад' },
  { id: 'p3', category: 'Культура', title: 'Главные выставки 2025 года в России', time: '8 часов назад' },
  { id: 'p4', category: 'Спорт', title: 'Российские спортсмены готовятся к Олимпиаде', time: '9 часов назад' }
];

export const heroMain = {
  id: 'hero-main',
  category: 'ПОЛИТИКА',
  title: 'Россия и мир: новые горизонты в условиях меняющегося порядка',
  excerpt: 'Эксперты обсудили, как изменится глобальная политика в ближайшие годы и какую роль в этом сыграет Россия.',
  time: '2 часа назад',
  views: 128
};

export const sideStories = [
  { id: 's1', category: 'ПОЛИТИКА', title: 'В Кремле прокомментировали новые санкции Запада', time: '1 час назад', kind: 'politics' },
  { id: 's2', category: 'ЭКОНОМИКА', title: 'ЦБ сохранил ключевую ставку на уровне 16%', time: '3 часа назад', kind: 'economy' },
  { id: 's3', category: 'ТЕХНОЛОГИИ', title: 'В России запущен новый спутник связи', time: '4 часа назад', kind: 'tech' },
  { id: 's4', category: 'ОБЩЕСТВО', title: 'В регионах усилят меры безопасности перед праздниками', time: '5 часов назад', kind: 'society' }
];

export const editorials = [
  { id: 'e1', title: 'Почему важно инвестировать в образование', category: 'Мнение' },
  { id: 'e2', title: 'Как технологии меняют журналистику', category: 'Мнение' },
  { id: 'e3', title: 'Энергетический переход: вызовы и решения', category: 'Мнение' }
];

export const editorFeature = {
  id: 'editor-feature',
  quote: 'Сегодня мир находится на переломном этапе. Важно не только следить за событиями, но и понимать их суть.',
  name: 'Анна Родионова',
  role: 'Главный редактор'
};

export const rankings = [
  { id: 'r1', title: 'ЦБ сохранил ключевую ставку на уровне 16%', time: '2 часа назад' },
  { id: 'r2', title: 'Россия укрепляет сотрудничество с дружественными странами', time: '3 часа назад' },
  { id: 'r3', title: 'Что будет с ценами на нефть в 2025 году?', time: '4 часа назад' },
  { id: 'r4', title: 'Как защитить персональные данные в цифровую эпоху', time: '5 часов назад' },
  { id: 'r5', title: 'Новые технологии изменят рынок труда', time: '6 часов назад' }
];

export const videoFeature = {
  id: 'video-1',
  title: 'Новый этап: запуск спутника связи',
  desc: 'Как это повлияет на развитие технологий и жизнь людей.',
  duration: '04:32'
};

export const importantEvents = [
  { id: 'i1', time: '12:30', text: 'ЦБ сохранил ключевую ставку' },
  { id: 'i2', time: '11:45', text: 'Новые санкции против ряда компаний' },
  { id: 'i3', time: '10:20', text: 'Открытие выставки современного искусства' },
  { id: 'i4', time: '09:05', text: 'Опубликован новый прогноз по инфляции' },
  { id: 'i5', time: '08:40', text: 'Подписано соглашение о сотрудничестве' }
];

export const currencies = [
  { code: 'USD', value: '90,45', delta: '−0,23', up: false },
  { code: 'EUR', value: '98,12', delta: '−0,37', up: false },
  { code: 'CNY', value: '12,52', delta: '+0,08', up: true },
  { code: 'GBP', value: '114,70', delta: '−0,18', up: false },
  { code: 'JPY', value: '0,61', delta: '+0,02', up: true }
];

// Generic, deliberately neutral placeholder copy used to fill out the article-preview modal —
// this is a mock news portal, so no real claims are made, only a couple of scene-setting lines.
export function placeholderBody(category, title, lang = 'ru') {
  if (lang === 'en') {
    return [
      `A story in the "${category}" section — "${title}".`,
      'Details are being confirmed as more information comes in from the newsroom.',
      'This is a demo publication for the "Kontur" site mockup and is not a real news story.'
    ];
  }
  return [
    `Материал в разделе «${category}» — «${title}».`,
    'Подробности события уточняются по мере поступления новой информации от редакции.',
    'Это демонстрационная публикация макета сайта «Контур» и не является реальной новостью.'
  ];
}

export const allSearchable = () => ([
  { id: heroMain.id, category: heroMain.category, title: heroMain.title, time: heroMain.time },
  ...sideStories.map(s => ({ id: s.id, category: s.category, title: s.title, time: s.time })),
  ...popular.map(p => ({ id: p.id, category: p.category, title: p.title, time: p.time })),
  ...rankings.map(r => ({ id: r.id, category: 'Главное', title: r.title, time: r.time })),
  ...editorials.map(e => ({ id: e.id, category: e.category, title: e.title, time: '' })),
  { id: videoFeature.id, category: 'Мультимедиа', title: videoFeature.title, time: videoFeature.duration }
]);

// Roughly how many hours ago a "N часов/минут назад" string points to — smaller is fresher.
function approxHoursAgo(str) {
  const m = String(str).match(/(\d+)\s*(час|часа|часов|минута|минуты|минут)/i);
  if (!m) return 999;
  const n = parseInt(m[1], 10);
  return m[2].toLowerCase().startsWith('час') ? n : n / 60;
}

// Finds the freshest static article matching a top-nav category name (e.g. "Политика"),
// used to preview "what's new" when a category is opened in the header.
export function getFreshestForCategory(navCategory) {
  const norm = String(navCategory).toLowerCase();
  const candidates = [];
  if (heroMain.category.toLowerCase() === norm) candidates.push({ id: heroMain.id, category: heroMain.category, title: heroMain.title, excerpt: heroMain.excerpt, time: heroMain.time });
  sideStories.forEach(s => { if (s.category.toLowerCase() === norm) candidates.push({ id: s.id, category: s.category, title: s.title, time: s.time }); });
  popular.forEach(p => { if (p.category.toLowerCase() === norm) candidates.push({ id: p.id, category: p.category, title: p.title, time: p.time }); });
  if (!candidates.length) return null;
  candidates.sort((a, b) => approxHoursAgo(a.time) - approxHoursAgo(b.time));
  return candidates[0];
}
