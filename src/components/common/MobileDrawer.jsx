import { useEffect } from 'react';
import { X, Search, User } from 'lucide-react';
import { useApp } from '../../state/store';

const navLinks = ['Главная', 'Мир', 'Политика', 'Экономика', 'Технологии', 'Общество', 'Спорт', 'Культура', 'Наука'];

export default function MobileDrawer({ onClose }) {
  const { t, activeTopNav, setActiveTopNav, openModal, user } = useApp();

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  const go = (link) => {
    setActiveTopNav(link);
    onClose();
  };

  return (
    <>
      <div className="drawer-backdrop" onMouseDown={onClose} />
      <div className="drawer-panel" role="dialog" aria-modal="true">
        <div className="drawer-head">
          <b style={{ fontSize: 13 }}>Меню</b>
          <button className="modal-close" style={{ position: 'static' }} onClick={onClose} aria-label="Закрыть"><X size={17} /></button>
        </div>
        <nav className="drawer-nav">
          {navLinks.map(link => (
            <a key={link} className={activeTopNav === link ? 'active' : ''} onClick={() => go(link)}>{t(link)}</a>
          ))}
        </nav>
        <button className="btn-primary" style={{ marginBottom: 8 }} onClick={() => { onClose(); openModal('search'); }}>
          <Search size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />{t('Поиск')}
        </button>
        {user ? (
          <button className="btn-secondary" onClick={onClose}>{user.name}</button>
        ) : (
          <button className="btn-secondary" onClick={() => { onClose(); openModal('auth', { tab: 'login' }); }}>
            <User size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />{t('Войти')}
          </button>
        )}
      </div>
    </>
  );
}
