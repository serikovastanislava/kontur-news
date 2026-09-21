import { Eye } from 'lucide-react';
import { useApp } from '../../state/store';
import { remoteNewsImage } from '../../utils/covers';

export default function PopularGrid() {
  const { t, activeTopic, toggleTopic, openModal, news } = useApp();

  const activeFilter = (activeTopic !== 'Все' && activeTopic !== 'Популярное') ? activeTopic : null;
  const items = [...news]
    .filter(item => !activeFilter || item.category === activeFilter)
    .sort((a, b) => {
      const scoreA = (a.views || 0) * 0.6 + (a.importance_score || 0) * 10;
      const scoreB = (b.views || 0) * 0.6 + (b.importance_score || 0) * 10;
      return scoreB - scoreA;
    })
    .slice(0, 8);

  const resetFilter = () => {
    if (activeTopic !== 'Все') toggleTopic('Все');
  };

  return (
    <section className="section">
      <div className="section-head"><h2>{t('Популярные темы')}</h2><a onClick={resetFilter}>→</a></div>
      <div className="popular-grid">
        {items.map((item) => (
          <article className="news-card clickable" key={item.id} onClick={() => openModal('article', {
            id: item.id, category: item.category, title: item.title, excerpt: item.content,
            author: item.author, source: item.editorial || item.source, url: item.url,
            publishedAt: item.published_at || item.created_at, imageUrl: item.image_url, imageCredit: item.image_credit, views: item.views,
          })}>
            <div className="card-image" style={{ backgroundImage: `url(${item.image_url || remoteNewsImage(item)})` }}>
              <span>{t(item.category)}</span>
            </div>
            <h3>{item.title}</h3>
            <small><Eye size={11} /> {item.views || 0} {t('просмотров')}</small>
          </article>
        ))}
        {items.length === 0 && (
          <div className="empty-note">
            {t('Новости пока не загружены. Запустите parser.')}{' '}
            <a onClick={resetFilter} style={{ color: 'var(--violet-2)' }}>{t('Показать все →')}</a>
          </div>
        )}
      </div>
    </section>
  );
}
