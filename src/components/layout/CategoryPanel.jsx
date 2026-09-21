import { useMemo } from 'react';
import { Globe2, Landmark, ChartNoAxesCombined, Cpu, Users, Trophy, Palette, FlaskConical, ArrowRight, Clock3 } from 'lucide-react';
import { useApp } from '../../state/store';
import { formatRelative } from '../../utils/time';
import { remoteNewsImage } from '../../utils/covers';

const CAT_ICONS = {
  'Мир': Globe2, 'Политика': Landmark, 'Экономика': ChartNoAxesCombined, 'Технологии': Cpu,
  'Общество': Users, 'Спорт': Trophy, 'Культура': Palette, 'Наука': FlaskConical
};

export default function CategoryPanel({ category, onClose }) {
  const { t, lang, news, openModal } = useApp();
  const Icon = CAT_ICONS[category] || Globe2;

  const items = useMemo(() => news
    .filter(item => String(item.category || '').toLowerCase() === category.toLowerCase())
    .sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))
    .slice(0, 4), [news, category]);

  const open = (item) => {
    openModal('article', {
      id: item.id,
      category: item.category,
      title: item.title,
      excerpt: item.content,
      author: item.author,
      source: item.editorial || item.source,
      url: item.url,
      publishedAt: item.published_at || item.created_at,
      imageUrl: item.image_url,
      imageCredit: item.image_credit,
      views: item.views,
    });
    onClose();
  };

  return (
    <div className="category-panel">
      <div className="category-panel-head">
        <span className="category-panel-icon"><Icon size={16} /></span>
        <b>{t(category)}</b>
        <span className="live-dot" title={t('Свежее в разделе')} />
      </div>

      {items.length ? (
        <div className="category-panel-list">
          {items.map(item => (
            <button className="category-panel-item" key={item.id} onClick={() => open(item)}>
              <img src={item.image_url || remoteNewsImage(item)} alt="" />
              <span className="category-panel-item-copy">
                <strong>{item.short_title || item.title}</strong>
                <small><Clock3 size={10} />{formatRelative(new Date(item.published_at || item.created_at), lang)} · {item.source || t('Редакция')}</small>
              </span>
            </button>
          ))}
          <span className="category-panel-cta">{t('Свежие материалы')} <ArrowRight size={12} /></span>
        </div>
      ) : (
        <p className="category-panel-empty">{t('Пока нет свежих материалов в этом разделе.')}</p>
      )}
    </div>
  );
}
