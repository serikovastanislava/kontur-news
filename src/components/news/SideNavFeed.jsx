import { Eye, Clock, Heart, LogIn } from 'lucide-react';
import { useApp } from '../../state/store';
import { formatRelative } from '../../utils/time';
import NewsImage from './NewsImage';


export default function SideNavFeed({ mode }) {
  const { t, lang, user, favorites, userArticles, news, openModal } = useApp();
  if (mode === 'Избранное' && !user) return <section className="section sidefeed-gate"><LogIn size={22} /><p>{t('Войдите, чтобы видеть и добавлять материалы в избранное.')}</p><button className="btn-primary" onClick={() => openModal('auth', { tab: 'login' })}>{t('Вход или регистрация')}</button></section>;

  let items = news;
  if (mode === 'Избранное') items = news.filter(a => favorites.includes(a.id));
  if (mode === 'Последние') items = [...news].sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
  if (mode === 'Популярное') items = [...news].sort((a, b) => (b.views || 0) - (a.views || 0));

  const openArticle = (a) => openModal('article', { id: a.id, category: a.category, title: a.title, excerpt: a.content, author: a.author, source: a.editorial || a.source, url: a.url, publishedAt: a.published_at || a.created_at, imageUrl: a.image_url, imageCredit: a.image_credit, views: a.views });
  return (
    <section className="section">
      <div className="section-head"><h2>{t(mode)}</h2></div>
      {items.length === 0 ? <div className="empty-note">{t(mode === 'Избранное' ? 'У вас пока нет избранных материалов.' : 'Пока нет материалов, подходящих под этот фильтр.')}</div> : (
        <div className="popular-grid">
          {items.map(a => (
            <article className="news-card clickable" key={a.id} onClick={() => openArticle(a)}>
              <div className="card-image"><NewsImage item={a} alt="" /><span>{t(a.category)}</span></div>
              <h3>{a.title}</h3>
              <small className="sidefeed-meta">
                {mode === 'Популярное' && <span><Eye size={11} />{a.views || 0} {t('просмотров')}</span>}
                
                {mode === 'Последние' && <span><Clock size={11} />{formatRelative(new Date(a.published_at || a.created_at), lang)}</span>}
                {mode === 'Избранное' && <span><Heart size={11} fill="currentColor" />{a.category}</span>}
              </small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
