export const topics = ['Все', 'Популярное', 'Война в Украине', 'Климат', 'Технологии', 'Бизнес', 'Здоровье', 'Наука', 'Культура'];

export const currencies = [
  { code: 'USD', value: '90,45', delta: '−0,23', up: false },
  { code: 'EUR', value: '98,12', delta: '−0,37', up: false },
  { code: 'CNY', value: '12,52', delta: '+0,08', up: true },
  { code: 'GBP', value: '114,70', delta: '−0,18', up: false },
  { code: 'JPY', value: '0,61', delta: '+0,02', up: true }
];

// Stable pseudo-random view count per article id — the same number the article
// reader shows (before it starts live-ticking), so the "Популярное" (>100 views)
// filter is consistent with what people actually see when they open a story.
function hashInRange(id, min, max) {
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return min + (h % (max - min));
}
export function getViews(id) {
  return hashInRange(id, 20, 260);
}
