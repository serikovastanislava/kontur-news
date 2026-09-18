// Parses a Russian relative-time string ("2 часа назад") once into a real Date,
// anchored to the moment it was first seen — so re-formatting it later (as real
// time passes) produces a genuinely live-updating "N minutes/hours ago" label.

function ruPlural(n, [one, few, many]) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function parseToDate(str) {
  const m = String(str).match(/(\d+)\s*(час|часа|часов|минута|минуты|минут)/i);
  if (!m) return new Date();
  const n = parseInt(m[1], 10);
  const ms = m[2].toLowerCase().startsWith('час') ? n * 3_600_000 : n * 60_000;
  return new Date(Date.now() - ms);
}

const baseDates = new Map();

export function getBaseDate(key, fallbackStr) {
  if (!key) return parseToDate(fallbackStr);
  if (!baseDates.has(key)) baseDates.set(key, parseToDate(fallbackStr));
  return baseDates.get(key);
}

export function formatRelative(date, lang = 'ru') {
  const mins = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (lang === 'en') {
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
    const days = Math.round(hrs / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} ${ruPlural(mins, ['минуту', 'минуты', 'минут'])} назад`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} ${ruPlural(hrs, ['час', 'часа', 'часов'])} назад`;
  const days = Math.round(hrs / 24);
  return `${days} ${ruPlural(days, ['день', 'дня', 'дней'])} назад`;
}
