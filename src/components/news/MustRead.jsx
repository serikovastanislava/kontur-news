import { useApp } from '../../state/store';
import NewsImage from './NewsImage';

export default function MustRead() {
  const { news, openModal, t } = useApp();
  const items = [...news]
    .sort((a, b) => new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0))
    .slice(0, 4);

  return (
    <section className="section">
      <div className="section-head"><h2>{t('Не пропустите')}</h2></div>
      <div className="must-grid">
        {items.map(item => (
          <article
            className="must-card clickable"
            key={item.id}
            onClick={() => openModal('article', {
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
            })}
          >
            <NewsImage item={item} alt="" loading="lazy" />
            <div><span>{t(item.category)}</span><h3>{item.title}</h3></div>
          </article>
        ))}
      </div>
      {items.length === 0 && <div className="empty-note">{t('Свежие материалы появятся здесь после обновления ленты.')}</div>}
    </section>
  );
}
