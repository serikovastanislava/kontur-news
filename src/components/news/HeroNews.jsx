import NewsImage from './NewsImage';
import { heroMain, sideStories } from '../../data/news';
import { useApp } from '../../state/store';


export default function HeroNews() {
  const { t, openModal, featured, news } = useApp();
  const hero = (featured && String(featured.title || '').trim().split(/\s+/).length <= 6)
    ? featured
    : (news.find(item => String(item.title || '').trim().split(/\s+/).length <= 6) || news[0] || null);
  const side = news.filter(item => item.id !== hero?.id).slice(0, 4);

  if (!hero) {
    return (
      <section className="hero-section">
        <article className="hero-card"><NewsImage item={{ id: 'loading', category: 'Политика' }} alt="" /><div className="hero-tint" /><div className="hero-copy"><span className="pill">Контур</span><h1>{t('Загрузка новостей…')}</h1></div></article>
      </section>
    );
  }

  const open = (item) => openModal('article', {
    id: item.id,
    category: item.category,
    title: item.title,
    excerpt: item.content,
    publishedAt: item.published_at || item.created_at,
    source: item.editorial || item.source, url: item.url,
    author: item.author,
    imageUrl: item.image_url, imageCredit: item.image_credit,
    views: item.views,
    weeklyViews: item.weekly_views,
  });

  return (
    <section className="hero-section">
      <article className="hero-card" onClick={() => open(hero)}>
        <NewsImage item={hero} alt="" />
        <div className="hero-tint" />
        <div className="hero-copy">
          <h1>{hero.title}</h1>
        </div>
      </article>
      <div className="hero-side">
        {(side.length ? side : sideStories).map((item) => (
          <article className="side-story" key={item.id} onClick={() => open(item)}>
            <div className={`story-thumb ${item.kind || 'society'}`}><NewsImage item={item} alt="" /></div>
            <div className="side-story-body">
              <span>{t(item.category || 'Новости')}</span>
              <h3>{item.title}</h3>
              <small>{item.published_at ? new Date(item.published_at).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : t(item.time || '')}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
