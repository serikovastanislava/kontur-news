import earth from '../assets/earth.jpg';
import sidePolitics from '../assets/crops/side-politics.jpg';
import sideEconomy from '../assets/crops/side-economy.jpg';
import sideTech from '../assets/crops/side-tech.jpg';
import sideSociety from '../assets/crops/side-society.jpg';
import cardAi from '../assets/crops/card-ai.jpg';
import cardEconomy from '../assets/crops/card-economy.jpg';
import cardCulture from '../assets/crops/card-culture.jpg';
import cardSport from '../assets/crops/card-sport.jpg';
import editorPortrait from '../assets/crops/editor.jpg';

export const coverMap = {
  'hero-main': earth, s1: sidePolitics, s2: sideEconomy, s3: sideTech, s4: sideSociety,
  p1: cardAi, p2: cardEconomy, p3: cardCulture, p4: cardSport
};

export const avatarMap = { 'editor-feature': editorPortrait };
export const fallbackCovers = [cardAi, sideEconomy, cardCulture, sideTech, cardSport, sidePolitics];

export {
  earth, sidePolitics, sideEconomy, sideTech, sideSociety,
  cardAi, cardEconomy, cardCulture, cardSport, editorPortrait
};

function hashText(value) {
  let hash = 2166136261;
  for (const ch of String(value || 'news')) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function remoteNewsImage(item) {
  const title = String(item?.title || 'news').replace(/[^\p{L}\p{N} ]/gu, ' ').trim();
  const category = String(item?.category || 'news');
  const query = `${category} ${title}`.trim().slice(0, 90);
  const lock = hashText(`${item?.id || ''}|${title}|${category}`) % 100000;
  return `https://loremflickr.com/1200/800/${encodeURIComponent(query || 'news') }?lock=${lock}`;
}
