import { ExternalLink, Radio } from 'lucide-react';

const RUSSIA1_URL = 'https://smotrim.ru/channel/1';

export default function Russia1Player() {
  return (
    <section className="widget russia1-player">
      <div className="russia1-player-head">
        <div>
          <span className="russia1-live"><i /> LIVE</span>
          <h3><Radio size={14} /> Россия 1</h3>
        </div>
        <a href={RUSSIA1_URL} target="_blank" rel="noreferrer" title="Открыть на Смотрим">
          <ExternalLink size={13} />
        </a>
      </div>
      <div className="russia1-frame-wrap">
        <iframe
          src={RUSSIA1_URL}
          title="Россия 1 — прямой эфир"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <small className="russia1-note">Прямой эфир и новости телеканала «Россия 1» через видеоплатформу «Смотрим».</small>
    </section>
  );
}
