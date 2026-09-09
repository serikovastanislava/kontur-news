import { popular } from '../../data/news';

const kinds = ['ai', 'economy', 'culture', 'sport'];
export default function PopularGrid() {
  return (
    <section className="section">
      <div className="section-head"><h2>Популярные темы</h2><a>→</a></div>
      <div className="popular-grid">
        {popular.map((item, i) => (
          <article className="news-card" key={item.title}>
            <div className={`card-image ${kinds[i]}`}><span>{item.category}</span></div>
            <h3>{item.title}</h3>
            <small>{item.time}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
