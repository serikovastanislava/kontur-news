import { Radio, Play, Pause } from 'lucide-react';
import { useApp } from '../../state/store';

export default function LiveWidget() {
  const { t, isLive, setIsLive, toast } = useApp();

  const toggle = () => {
    setIsLive(v => {
      toast(v ? 'Прямой эфир остановлен' : 'Прямой эфир начат', 'info');
      return !v;
    });
  };

  return (
    <button className={`widget live-widget${isLive ? ' is-live' : ''}`} onClick={toggle}>
      <div className="live-title">
        <span className="dot" />
        <Radio size={17} />
        <b>{t('Лента новостей / Live')}</b>
      </div>
      <p>{t('Актуальные события')}<br />{t('в реальном времени')}</p>
      <span className="play-btn" role="presentation">{isLive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}</span>
      <div className="live-ring" />
    </button>
  );
}
