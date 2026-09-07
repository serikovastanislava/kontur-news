import { mustRead } from "../../data/news";

export default function MustRead() {
  return (
    <section className="section">
      <div className="section-head"><h2>Не пропустите</h2><div className="arrows">‹　›</div></div>
      <div className="must-grid">
        {mustRead.map(([cat, title, time], i) => (
          <article className="must-card" key={title}>
            <img src={[
              "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=900&q=80",
              "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=900&q=80",
              "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=80",
              "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80"
            ][i]} alt="" />
            <div><span>{cat}</span><h3>{title}</h3><small>{time}</small></div>
          </article>
        ))}
      </div>
    </section>
  );
}