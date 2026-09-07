import React from 'react';

const sideStories = [
  ["ПОЛИТИКА", "В Кремле прокомментировали новые санкции Запада", "1 час назад", 
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=500&q=80"],
  ["ЭКОНОМИКА", "ЦБ сохранил ключевую ставку на уровне 16%", "3 часа назад",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=500&q=80"],
  ["ТЕХНОЛОГИИ", "В России запущен новый спутник связи", "4 часа назад",
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=500&q=80"],
  ["ОБЩЕСТВО", "В регионах усилят меры безопасности перед праздниками", "5 часов назад",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&q=80"]
];

export default function HeroNews() {
  return (
    <section className="hero-section">
      <article className="hero-card">
        <img 
          src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1400&q=90" 
          alt="Главная новость" 
        />
        <div className="hero-overlay" />
        <div className="hero-copy">
          <span className="pill">ПОЛИТИКА</span>
          <h1>Россия и мир: новые горизонты в условиях меняющегося порядка</h1>
          <p>Эксперты обсудили, как изменится глобальная система в ближайшие годы и какую роль в этом сыграет Россия.</p>
          <small>2 часа назад　◉ 128</small>
        </div>
      </article>

      <div className="hero-side">
        {sideStories.map(([cat, title, time, img]) => (
          <article className="side-story" key={title}>
            <img src={img} alt={title} />
            <div>
              <span>{cat}</span>
              <h3>{title}</h3>
              <small>{time}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}