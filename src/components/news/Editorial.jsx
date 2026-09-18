import { Quote, ArrowRight, Play } from 'lucide-react';
import { editorials, editorFeature, rankings, videoFeature } from '../../data/news';
import { useApp } from '../../state/store';

export default function Editorial() {
  const { t, openModal } = useApp();

  return (
    <section className="editorial section">
      <div className="editor-box">
        <h2>{t('Мнение редакции')}</h2>
        <button
          className="editor-feature"
          onClick={() => openModal('article', { id: editorFeature.id, category: 'Мнение', title: editorFeature.quote, author: editorFeature.name, role: editorFeature.role })}
        >
          <div className="editor-portrait" />
          <div>
            <Quote size={16} />
            <h3>{t(editorFeature.quote)}</h3>
            <p>{editorFeature.name}<br /><small>{t(editorFeature.role)}</small></p>
          </div>
        </button>
        {editorials.map(x => (
          <button className="mini-link" key={x.id} onClick={() => openModal('article', { id: x.id, category: x.category, title: x.title })}>
            {t(x.title)}<ArrowRight size={12} />
          </button>
        ))}
      </div>
      <div className="rank-box">
        <h2>{t('Главное')}</h2>
        {rankings.map((r, i) => (
          <button className="rank" key={r.id} onClick={() => openModal('article', { id: r.id, category: 'Главное', title: r.title, time: r.time })}>
            <b>0{i + 1}</b>
            <span>{t(r.title)}<small>{t(r.time)}</small></span>
          </button>
        ))}
      </div>
      <div className="media-box">
        <h2>{t('Мультимедиа')}</h2>
        <button className="video-card" onClick={() => openModal('video', videoFeature)}>
          <div className="video-art" />
          <span className="play"><Play size={15} fill="currentColor" /></span>
          <em>{videoFeature.duration}</em>
        </button>
        <h3>{t(videoFeature.title)}</h3>
        <small>{t(videoFeature.desc)}</small>
      </div>
    </section>
  );
}
