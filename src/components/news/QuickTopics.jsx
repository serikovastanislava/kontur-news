import { Grid2X2, Flame, Shield, CloudSun, Microscope, BriefcaseBusiness, Heart, Palette } from 'lucide-react';
import { topics } from '../../data/news';
import { useApp } from '../../state/store';

const icons = [Grid2X2, Flame, Shield, CloudSun, Microscope, BriefcaseBusiness, Heart, Palette];

export default function QuickTopics() {
  const { t, activeTopic, toggleTopic, toast } = useApp();

  const onPick = (topic) => {
    toggleTopic(topic);
  };

  return (
    <section className="topics section">
      <div className="section-head">
        <h2>{t('Быстрый доступ')}</h2>
        <a onClick={() => toast('Настройка быстрого доступа скоро появится', 'info')}>{t('Настроить →')}</a>
      </div>
      <div className="topic-row">
        {topics.map((topic, i) => {
          const Icon = icons[i % icons.length];
          return (
            <button className={activeTopic === topic ? 'topic active' : 'topic'} key={topic} onClick={() => onPick(topic)}>
              <Icon size={16} />
              <span>{t(topic)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
