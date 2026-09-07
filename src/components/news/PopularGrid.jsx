import React from 'react';
import { popular } from "../../data/news";

export default function PopularGrid() {
  return (
    <section className="section">
      <div className="section-head">
        <h2>Популярные темы</h2>
        <a>Смотреть все →</a>
      </div>
      <div className="popular-grid">
        {popular.map(item => (
          <article className="news-card" key={item.title}>
            <div className="card-image">
              <img src={item.image} alt={item.title} />
              <span>{item.category}</span>
            </div>
            <h3>{item.title}</h3>
            <small>{item.time}</small>
          </article>
        ))}
      </div>
    </section>
  );
}