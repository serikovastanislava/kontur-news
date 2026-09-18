import { importantEvents } from '../../data/news';
import { useApp } from '../../state/store';

export default function ImportantWidget() {
  const { t, openModal } = useApp();
  return (
    <section className="widget important">
      <h3>{t('Важное')}</h3>
      {importantEvents.slice(0, 3).map((ev) => (
        <div className="timeline" key={ev.id}>
          <b>{ev.time}</b>
          <span>{t(ev.text)}</span>
        </div>
      ))}
      <a onClick={() => openModal('events')}>{t('Все важные события →')}</a>
    </section>
  );
}
