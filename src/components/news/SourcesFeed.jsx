import { useEffect, useState } from 'react';
import { Newspaper } from 'lucide-react';
import { useApp } from '../../state/store';
import { formatRelative } from '../../utils/time';

export default function SourcesFeed() {
  const { t, lang, userArticles, openModal, removeArticle } = useApp();
  const [, retick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => retick(x => x + 1), 30000);
    return () => clearInterval(iv);
  }, []);

  const openArticle = (a) => openModal('article', {
    id: a.id, category: a.category, title: a.title, excerpt: a.excerpt,
    author: a.source, publishedAt: a.publishedAt
  });

  return (
    <section className="section sources-feed">
      <div className="section-head">
        <h2><Newspaper size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />{t('Новости от источников')}</h2>
      </div>
      {userArticles.length === 0 ? (
        <div className="empty-note">{t('Здесь будут появляться материалы, автоматически собранные из разных источников.')}</div>
      ) : (
        <div className="sources-grid">
          {userArticles.map(a => (
            <div className="source-card" key={a.id}>
              <button className="source-card-main" onClick={() => openArticle(a)}>
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
    </section>
  );
}
