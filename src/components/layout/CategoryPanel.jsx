import { Globe2, Landmark, ChartNoAxesCombined, Cpu, Users, Trophy, Palette, FlaskConical, ArrowRight } from 'lucide-react';
import { useApp } from '../../state/store';
import { formatRelative } from '../../utils/time';

const CAT_ICONS = {
  'Мир': Globe2,
  'Политика': Landmark,
  'Экономика': ChartNoAxesCombined,
  'Технологии': Cpu,
  'Общество': Users,
  'Спорт': Trophy,
  'Культура': Palette,
  'Наука': FlaskConical,
};

export default function CategoryPanel({ category, onClose }) {
  const { t, lang, news, userArticles, openModal } = useApp();
  const Icon = CAT_ICONS[category] || Globe2;

  const live = news
    .filter(item => item.category === category)
    .sort((a, b) => {
      const ad = new Date(a.published_at || a.created_at || 0).getTime();
      const bd = new Date(b.published_at || b.created_at || 0).getTime();
      return bd - ad;
    });

  const userLive = userArticles
    .filter(item => String(item.category || '').toLowerCase() === category.toLowerCase())
    .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());

  const fresh = live[0] || userLive[0] || null;
  const isUser = !live[0] && !!userLive[0];

  const open = () => {
    if (!fresh) return;

    if (isUser) {
      openModal('article', {
        id: fresh.id,
        category: fresh.category,
        title: fresh.title,
        excerpt: fresh.excerpt,
        author: fresh.source,
        publishedAt: fresh.publishedAt,
      });
    } else {
      openModal('article', {
        id: fresh.id,
        category: fresh.category,
        title: fresh.title,
        excerpt: fresh.content || fresh.summary,
        author: fresh.author,
        source: fresh.editorial || fresh.source,
        url: fresh.url,
        publishedAt: fresh.published_at || fresh.created_at,
        imageUrl: fresh.image_url,
        imageCredit: fresh.image_credit,
        views: fresh.views,
      });
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
            {isUser
              ? fresh.source
              : (fresh.editorial || fresh.source || t('Свежее в разделе'))}
            {' · '}
            {isUser
              ? formatRelative(new Date(fresh.publishedAt), lang)
              : formatRelative(new Date(fresh.published_at || fresh.created_at), lang)}
          </span>
          <span className="category-panel-cta">{t('Читать материал')}<ArrowRight size={12} /></span>
        </button>
      ) : (
        <p className="category-panel-empty">{t('Пока нет свежих материалов в этом разделе.')}</p>
      )}
    </div>
  );
}
