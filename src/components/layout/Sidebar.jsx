import { Home, Star, Flame, Clock3, Mail } from 'lucide-react';
import { useApp } from '../../state/store';

const sideNav = [[Home, 'Главная'], [Star, 'Избранное'], [Flame, 'Популярное'], [Clock3, 'Последние']];

export default function Sidebar() {
  const { t, activeSideNav, setActiveSideNav, openModal } = useApp();

  const onSideNav = (name) => {
    setActiveSideNav(name);
  };

  return (
    <aside className="sidebar">
      <div className="side-menu">
        {sideNav.map(([Icon, name]) => (
          <a key={name} className={activeSideNav === name ? 'selected' : ''} onClick={() => onSideNav(name)}>
            <Icon size={15} />{t(name)}
          </a>
        ))}
      </div>
      <div className="side-subscribe">
        <div className="sub-icon"><Mail size={15} /></div>
        <b>{t('Будьте в курсе событий')}</b>
        <p>{t('Важные новости и эксклюзивные материалы первыми.')}</p>
        <button onClick={() => openModal('subscribe')}>{t('Подписаться')} <span>→</span></button>
      </div>
    </aside>
  );
}
