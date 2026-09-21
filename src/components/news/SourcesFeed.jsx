import { useEffect, useMemo, useState } from 'react';
import { Newspaper } from 'lucide-react';
import { useApp } from '../../state/store';
import { formatRelative } from '../../utils/time';
import { remoteNewsImage } from '../../utils/covers';

const CATEGORY_ORDER = ['Политика', 'Экономика', 'Технологии', 'Общество', 'Мир', 'Бизнес', 'Наука', 'Здоровье', 'Спорт', 'Культура', 'Происшествия'];

export default function SourcesFeed() {
  const { t, lang, news, newsLoading, newsError, activeTopic, userArticles, openModal, removeArticle } = useApp();
  const [, retick] = useState(0);
  useEffect(() => { const iv = setInterval(() => retick(x => x + 1), 30000); return () => clearInterval(iv); }, []);

  const filtered = useMemo(() => {
    if (!activeTopic || activeTopic === 'Все' || activeTopic === 'Популярное') return news;
    return news.filter(a => a.category === activeTopic);
  }, [news, activeTopic]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach(item => { if (!map.has(item.category)) map.set(item.category, []); map.get(item.category).push(item); });
    return [...map.entries()].sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a[0]); const bi = CATEGORY_ORDER.indexOf(b[0]);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    });
  }, [filtered]);

  const openBackendArticle = (a) => openModal('article', {
    id: a.id, category: a.category, title: a.title, excerpt: a.content,
    author: a.author, source: a.editorial || a.source, url: a.url, publishedAt: a.published_at || a.created_at,
    imageUrl: a.image_url, imageCredit: a.image_credit, views: a.views,
  });

  return (
    <section className="section sources-feed">
      <div className="section-head"><h2><Newspaper size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />{t('Новости по категориям')}</h2></div>
      {newsLoading && news.length === 0 && <div className="empty-note">{t('Загружаем новости из базы данных…')}</div>}
      {newsError && news.length === 0 && <div className="empty-note">{newsError}</div>}

      {groups.map(([category, items]) => (
        <div className="news-category-group" key={category}>
          <div className="category-group-head"><h3>{t(category)}</h3><span>{items.length}</span></div>
          <div className="sources-grid">
            {items.slice(0, 8).map(a => (
              <button className="source-card-main backend-news-card" key={a.id} onClick={() => openBackendArticle(a)}>
                <img className="backend-card-image" src={a.image_url || remoteNewsImage(a)} alt="" loading="lazy" />
                <span className="source-tag">{t(a.category)}</span>
                <h3>{a.title}</h3>
                {a.content && <p>{a.content.replace(/<[^>]+>/g, '').slice(0, 180)}</p>}
                <small>{formatRelative(new Date(a.published_at || a.created_at), lang)}</small>
              </button>
            ))}
          </div>
        </div>
      ))}

      {userArticles.length > 0 && (
        <div className="sources-grid" style={{ marginTop: 18 }}>
          {userArticles.map(a => (
            <div className="source-card" key={a.id}>
              <button className="source-card-main" onClick={() => openModal('article', { id: a.id, category: a.category, title: a.title, excerpt: a.excerpt, author: a.source, publishedAt: a.publishedAt })}>
                <span className="source-tag">{a.category}</span><h3>{t(a.title)}</h3><small>{formatRelative(new Date(a.publishedAt), lang)}</small>
              </button>
              <button className="source-card-remove" onClick={() => removeArticle(a.id)} aria-label={t('Удалить публикацию')}>×</button>
            </div>
          ))}
        </div>
      )}
      {!newsLoading && !newsError && news.length === 0 && userArticles.length === 0 && <div className="empty-note">{t('Новости пока не загружены. Запустите parser.')}</div>}
    </section>
  );
}
