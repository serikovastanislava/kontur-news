import { useEffect, useState } from 'react';
import { Newspaper } from 'lucide-react';
import { useApp } from '../../state/store';
import { formatRelative } from '../../utils/time';

export default function SourcesFeed() {
  const { t, lang, news, newsLoading, newsError, userArticles, openModal, removeArticle } = useApp();
  const [, retick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => retick(x => x + 1), 30000);
    return () => clearInterval(iv);
  }, []);

  const openBackendArticle = (a) => openModal('article', {
    id: a.id,
    category: a.source || 'Новости',
    title: a.title,
    excerpt: a.content,
    author: a.author || a.source,
    publishedAt: a.created_at,
  });

  const openUserArticle = (a) => openModal('article', {
    id: a.id,
    category: a.category,
    title: a.title,
    excerpt: a.excerpt,
    author: a.source,
    publishedAt: a.publishedAt,
  });

  return (
    <section className="section sources-feed">
      <div className="section-head">
        <h2><Newspaper size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />{t('Новости от источников')}</h2>
      </div>

      {newsLoading && news.length === 0 && (
        <div className="empty-note">Загружаем новости из базы данных…</div>
      )}

      {newsError && news.length === 0 && (
        <div className="empty-note">{newsError}</div>
      )}

      {news.length > 0 && (
        <div className="sources-grid">
          {news.slice(0, 12).map(a => (
            <button className="source-card-main source-card backend-news-card" key={`db-${a.id}`} onClick={() => openBackendArticle(a)}>
              <span className="source-tag">{a.source || 'Источник'}</span>
              <h3>{a.title}</h3>
              {a.content && <p>{a.content.replace(/<[^>]+>/g, '').slice(0, 180)}</p>}
              <small>{formatRelative(new Date(a.created_at), lang)}</small>
            </button>
          ))}
        </div>
      )}

      {userArticles.length > 0 && (
        <div className="sources-grid" style={{ marginTop: 18 }}>
          {userArticles.map(a => (
            <div className="source-card" key={a.id}>
              <button className="source-card-main" onClick={() => openUserArticle(a)}>
                <span className="source-tag">{a.source}</span>
                <h3>{t(a.title)}</h3>
                {a.excerpt && <p>{t(a.excerpt)}</p>}
                <small>{t(a.category)} · {formatRelative(new Date(a.publishedAt), lang)}</small>
              </button>
              <button className="source-card-remove" onClick={() => removeArticle(a.id)} aria-label={t('Удалить публикацию')} title={t('Удалить публикацию')}>×</button>
            </div>
          ))}
        </div>
      )}

      {!newsLoading && !newsError && news.length === 0 && userArticles.length === 0 && (
        <div className="empty-note">Новости пока не загружены. Запустите parser.</div>
      )}
    </section>
  );
}
