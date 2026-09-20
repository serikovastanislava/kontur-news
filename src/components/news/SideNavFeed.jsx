import { Eye, Clock, Heart, LogIn } from 'lucide-react';
import { useApp } from '../../state/store';
import { getAllArticles, getViews, approxHoursAgo } from '../../data/news';
import { coverMap, fallbackCovers } from '../../utils/covers';
import { formatRelative } from '../../utils/time';

function hashPick(id, arr) {
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return arr[h % arr.length];
}

export default function SideNavFeed({ mode }) {
  const { t, lang, user, favorites, userArticles, news, openModal } = useApp();

  if (mode === 'Избранное' && !user) {
    return (
      <section className="section sidefeed-gate">
        <LogIn size={22} />
        <p>{t('Войдите, чтобы видеть и добавлять материалы в избранное.')}</p>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 22px' }} onClick={() => openModal('auth', { tab: 'login' })}>
          {t('Вход или регистрация')}
        </button>
      </section>
    );
  }

  const staticItems = getAllArticles();
  const backendItems = news.map(a => ({
    id: a.id,
    category: a.source || 'Новости',
    title: a.title,
    excerpt: a.content,
    time: null,
    author: a.author || a.source,
    publishedAt: a.created_at
  }));
  const userItems = userArticles.map(a => ({
    id: a.id, category: a.category, title: a.title, excerpt: a.excerpt,
    time: null, author: a.source, publishedAt: a.publishedAt
  }));
  let items = [...backendItems, ...userItems, ...staticItems];

  if (mode === 'Популярное') {
    items = items.filter(a => getViews(a.id) > 100);
  } else if (mode === 'Последние') {
    items = items.filter(a => a.publishedAt ? (Date.now() - new Date(a.publishedAt).getTime()) / 3_600_000 <= 2 : approxHoursAgo(a.time) <= 2);
  } else if (mode === 'Избранное') {
    items = items.filter(a => favorites.includes(a.id));
  }

  const openArticle = (a) => openModal('article', {
    id: a.id, category: a.category, title: a.title, excerpt: a.excerpt,
    time: a.time, author: a.author, publishedAt: a.publishedAt
  });

  return (
    <section className="section">
      <div className="section-head"><h2>{t(mode)}</h2></div>
      {items.length === 0 ? (
        <div className="empty-note">
          {mode === 'Избранное' ? t('У вас пока нет избранных материалов.') : t('Пока нет материалов, подходящих под этот фильтр.')}
        </div>
      ) : (
        <div className="popular-grid">
          {items.map(a => (
            <article className="news-card clickable" key={a.id} onClick={() => openArticle(a)}>
              <div className="card-image" style={{ backgroundImage: `url(${coverMap[a.id] || hashPick(a.id, fallbackCovers)})` }}>
                <span>{a.author || t(a.category)}</span>
              </div>
              <h3>{t(a.title)}</h3>
              <small className="sidefeed-meta">
                {mode === 'Популярное' && <span><Eye size={11} />{getViews(a.id)} {t('просмотров')}</span>}
                {mode === 'Последние' && <span><Clock size={11} />{a.publishedAt ? formatRelative(new Date(a.publishedAt), lang) : t(a.time)}</span>}
                {mode === 'Избранное' && <span><Heart size={11} fill="currentColor" />{t(a.category)}</span>}
              </small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
