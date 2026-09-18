import { Globe2, Landmark, ChartNoAxesCombined, Cpu, Users, Trophy, Palette, FlaskConical, ArrowRight } from 'lucide-react';
import { useApp } from '../../state/store';
import { getFreshestForCategory } from '../../data/news';
import { formatRelative, getBaseDate } from '../../utils/time';

const CAT_ICONS = {
  'Мир': Globe2, 'Политика': Landmark, 'Экономика': ChartNoAxesCombined, 'Технологии': Cpu,
  'Общество': Users, 'Спорт': Trophy, 'Культура': Palette, 'Наука': FlaskConical
};

export default function CategoryPanel({ category, onClose }) {
  const { t, lang, userArticles, openModal } = useApp();
  const Icon = CAT_ICONS[category] || Globe2;

  const staticItem = getFreshestForCategory(category);
  const userItem = userArticles.find(a => a.category.toLowerCase() === category.toLowerCase());

  let fresh = staticItem;
  let isUser = false;
  if (userItem && (!staticItem || userItem.publishedAt > getBaseDate(staticItem.id, staticItem.time).getTime())) {
    fresh = userItem;
    isUser = true;
  }

  const open = () => {
    if (!fresh) return;
    if (isUser) {
      openModal('article', { id: fresh.id, category: fresh.category, title: fresh.title, excerpt: fresh.excerpt, author: fresh.source, publishedAt: fresh.publishedAt });
    } else {
      openModal('article', { id: fresh.id, category: fresh.category, title: fresh.title, excerpt: fresh.excerpt, time: fresh.time });
    }
    onClose();
  };

  return (
    <div className="category-panel">
      <div className="category-panel-head">
        <span className="category-panel-icon"><Icon size={16} /></span>
        <b>{t(category)}</b>
        <span className="live-dot" title={t('Свежее в разделе')} />
      </div>
      {fresh ? (
        <button className="category-panel-fresh" onClick={open}>
          <span className="category-panel-quote">«{t(fresh.title)}»</span>
          <span className="category-panel-meta">
            {isUser ? fresh.source : t('Свежее в разделе')} · {isUser ? formatRelative(new Date(fresh.publishedAt), lang) : t(fresh.time)}
          </span>
          <span className="category-panel-cta">{t('Читать материал')}<ArrowRight size={12} /></span>
        </button>
      ) : (
        <p className="category-panel-empty">{t('Пока нет свежих материалов в этом разделе.')}</p>
      )}
    </div>
  );
}
