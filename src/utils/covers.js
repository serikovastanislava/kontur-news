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
