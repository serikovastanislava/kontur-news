import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { catMedia } from '../../data/media';

function formatTitle(title) {
  return String(title || '').trim().replace(/\s+/g, ' ');
}

export default function CatMultiplayer() {
  const [index, setIndex] = useState(0);
  const videoRef = useRef(null);
  const item = useMemo(() => catMedia[index % catMedia.length], [index]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.load();
    }
  }, [item.id]);

  const next = () => setIndex((value) => (value + 1) % catMedia.length);
  const prev = () => setIndex((value) => (value - 1 + catMedia.length) % catMedia.length);

  return (
    <div className="cat-multiplayer">
      <div className="cat-player-window">
        <video
          ref={videoRef}
          className="cat-player-video"
          src={item.url}
          preload="metadata"
          controls
          playsInline
          poster={item.poster || undefined}
          aria-label={formatTitle(item.title)}
        />
        <button className="cat-play-overlay" type="button" onClick={() => videoRef.current?.play()} aria-label="Воспроизвести">
          <Play size={18} fill="currentColor" />
        </button>
      </div>
      <div className="cat-player-caption">
        <div className="cat-player-title-row">
          <h3 title={formatTitle(item.title)}>{formatTitle(item.title)}</h3>
          <div className="cat-player-nav" aria-label="Переключить видео">
            <button type="button" onClick={prev} aria-label="Предыдущее видео"><ChevronLeft size={15} /></button>
            <span>{index + 1}/{catMedia.length}</span>
            <button type="button" onClick={next} aria-label="Следующее видео"><ChevronRight size={15} /></button>
          </div>
        </div>
        <small>{item.source}</small>
      </div>
    </div>
  );
}
