import { popular } from '../../data/news';
import { useApp } from '../../state/store';

const kinds = ['ai', 'economy', 'culture', 'sport'];

export default function PopularGrid() {
  const { t, lang, activeTopic, toggleTopic, openModal } = useApp();

  const activeFilter = (activeTopic !== 'Все' && activeTopic !== 'Популярное') ? activeTopic : null;
  const items = activeFilter ? popular.filter(p => p.category === activeFilter) : popular;

  const resetFilter = () => {
    if (activeTopic !== 'Все') toggleTopic('Все');
  };

  return (
    <section className="section">
      <div className="section-head"><h2>{t('Популярные темы')}</h2><a onClick={resetFilter}>→</a></div>
      <div className="popular-grid">
        {items.map((item) => {
          const i = popular.indexOf(item);
          return (
            <article className="news-card clickable" key={item.id} onClick={() => openModal('article', { id: item.id, category: item.category, title: item.title, time: item.time })}>
              <div className={`card-image ${kinds[i % kinds.length]}`}><span>{t(item.category)}</span></div>
              <h3>{t(item.title)}</h3>
              <small>{t(item.time)}</small>
            </article>
          );
        })}
        {items.length === 0 && (
          <div className="empty-note">
            {lang === 'en' ? `No stories yet in "${t(activeFilter)}".` : `Пока нет материалов по теме «${activeFilter}».`}{' '}
            <a onClick={resetFilter} style={{ color: 'var(--violet-2)' }}>{t('Показать все →')}</a>
          </div>
        )}
      </div>
    </section>
  );
}
