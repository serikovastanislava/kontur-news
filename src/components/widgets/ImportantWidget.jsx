import { Sparkles } from 'lucide-react';
import { useApp } from '../../state/store';
import { formatRelative } from '../../utils/time';

function shortenHeadline(title, max = 96) {
  const text = String(title || '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1).replace(/\s+\S*$/, '').replace(/[,:;—–-]+$/, '').trim();
  return `${cut || text.slice(0, max).trim()}…`;
}

export default function ImportantWidget() {
  const { t, lang, important, openModal } = useApp();
  return (
    <section className="widget important">
      <h3><Sparkles size={14} style={{ verticalAlign: '-2px', marginRight: 5 }} />{t('Коротко')}</h3>
      {important.slice(0, 4).map(ev => (
        <button className="timeline" key={ev.id} onClick={() => openModal('article', {
          id: ev.id, category: ev.category, title: ev.title, excerpt: ev.content,
          author: ev.author, source: ev.editorial || ev.source,
          publishedAt: ev.published_at || ev.created_at, imageUrl: ev.image_url,
          imageCredit: ev.image_credit, views: ev.views
        })}>
          <b>{formatRelative(new Date(ev.published_at || ev.created_at), lang)}</b>
          <span>{shortenHeadline(ev.title)}</span>
        </button>
      ))}
      <a onClick={() => openModal('info', {
        title: 'Коротко',
        text: 'Здесь собраны свежие события в короткой форме: только сокращённые заголовки без повторения полного текста статьи.'
      })}>{t('Все важные события →')}</a>
    </section>
  );
}
