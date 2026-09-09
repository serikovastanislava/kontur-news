import earth from '../../assets/earth.jpg';

const sideStories = [
  ['ПОЛИТИКА', 'В Кремле прокомментировали новые санкции Запада', '1 час назад', 'politics'],
  ['ЭКОНОМИКА', 'ЦБ сохранил ключевую ставку на уровне 16%', '3 часа назад', 'economy'],
  ['ТЕХНОЛОГИИ', 'В России запущен новый спутник связи', '4 часа назад', 'tech'],
  ['ОБЩЕСТВО', 'В регионах усилят меры безопасности перед праздниками', '5 часов назад', 'society'],
];

export default function HeroNews() {
  return (
    <section className="hero-section">
      <article className="hero-card">
        <img src={earth} alt="Земля ночью" />
        <div className="hero-tint" />
        <div className="hero-copy">
          <span className="pill">ПОЛИТИКА</span>
          <h1>Россия и мир: новые горизонты в условиях меняющегося порядка</h1>
          <p>Эксперты обсудили, как изменится глобальная политика в ближайшие годы и какую роль в этом сыграет Россия.</p>
          <small>2 часа назад <span>◉</span> 128</small>
        </div>
      </article>
      <div className="hero-side">
        {sideStories.map(([cat, title, time, kind]) => (
          <article className="side-story" key={title}>
            <div className={`story-thumb ${kind}`} />
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
