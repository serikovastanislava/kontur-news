import { Sparkles } from 'lucide-react';
import { useApp } from '../../state/store';
import { formatRelative } from '../../utils/time';

function cleanBriefText(value) {
  const clean = String(value || '')
    .replace(/\s*[-—–]?\s*Читайте(?:те)?\s+(?:на|подробнее\s+на)\s+сайте[^.!?]*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const match = clean.match(/^[\s\S]*?[.!?](?:\s|$)/);
  return (match ? match[0].trim() : clean).replace(/[ \t]+/g, ' ').trim();
}

export default function ImportantWidget() {
  const { t, lang, important, openModal } = useApp();
  return (
    <section className="widget important">
      <h3><Sparkles size={14} style={{ verticalAlign: '-2px', marginRight: 5 }} />{t('Коротко')}</h3>
      {important.slice(0, 3).map(ev => (
        <button className="timeline" key={ev.id} onClick={() => openModal('article', { id: ev.id, category: ev.category, title: ev.title, excerpt: ev.content, author: ev.author, source: ev.editorial || ev.source, publishedAt: ev.published_at || ev.created_at, imageUrl: ev.image_url, imageCredit: ev.image_credit, views: ev.views })}>
          <b>{formatRelative(new Date(ev.published_at || ev.created_at), lang)}</b><span>{ev.title}</span>
        </button>
      ))}
      <a onClick={() => openModal('info', { title: 'Коротко', text: 'Блок обновляется автоматически. Здесь показывается краткая суть свежих заметных событий, без повторения полного заголовка.' })}>{t('Все важные события →')}</a>
    </section>
  );
}
