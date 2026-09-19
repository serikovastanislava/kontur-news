import earth from '../../assets/earth.jpg';
import { heroMain, sideStories } from '../../data/news';
import { useApp } from '../../state/store';

export default function HeroNews() {
  const { t, openModal } = useApp();
  return (
    <section className="hero-section">
      <article className="hero-card" onClick={() => openModal('article', { id: heroMain.id, category: heroMain.category, title: heroMain.title, time: heroMain.time, excerpt: heroMain.excerpt })}>
        <img src={earth} alt="Земля ночью" />
        <div className="hero-tint" />
        <div className="hero-copy">
          <span className="pill">{t(heroMain.category)}</span>
          <h1>{t(heroMain.title)}</h1>
          <p>{t(heroMain.excerpt)}</p>
          <small>{t(heroMain.time)} <span>◉</span> {heroMain.views}</small>
        </div>
      </article>
      <div className="hero-side">
        {sideStories.map((s) => (
          <article className="side-story" key={s.id} onClick={() => openModal('article', { id: s.id, category: s.category, title: s.title, time: s.time })}>
            <div className={`story-thumb ${s.kind}`} />
            <div className="side-story-body">
              <span>{t(s.category)}</span>
              <h3>{t(s.title)}</h3>
              <small>{t(s.time)}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
