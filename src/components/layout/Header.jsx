import { useEffect, useRef, useState } from 'react';
import { Search, ChevronDown, Menu, LogOut } from 'lucide-react';
import { BootstrapChatIcon } from '../common/DiscussionsDrawer';
import Logo from '../common/Logo';
import MobileDrawer from '../common/MobileDrawer';
import CategoryPanel from './CategoryPanel';
import { useApp } from '../../state/store';

const navLinks = ['Мир', 'Политика', 'Экономика', 'Технологии', 'Общество', 'Спорт', 'Культура', 'Наука'];

export default function Header({ onOpenDiscussions }) {
  const { t, lang, setLang, openModal, user, logout, activeTopNav, setActiveTopNav } = useApp();
  const [langOpen, setLangOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const langRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    if (!langOpen) return;
    const onDoc = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [langOpen]);

  useEffect(() => {
    if (!openCategory) return;
    const onDoc = (e) => { if (headerRef.current && !headerRef.current.contains(e.target)) setOpenCategory(null); };
    const onKey = (e) => { if (e.key === 'Escape') setOpenCategory(null); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [openCategory]);

  const onNavClick = (link) => {
    setActiveTopNav(link);
    setOpenCategory(c => c === link ? null : link);
  };

  return (
    <header className="header" ref={headerRef}>
      <div className="header-logo-col"><Logo compact /></div>
      <nav className="top-nav">
        {navLinks.map(link => (
          <div className="nav-item" key={link}>
            <a className={activeTopNav === link ? 'active' : ''} onClick={() => onNavClick(link)}>{t(link)}</a>
            {openCategory === link && <CategoryPanel category={link} onClose={() => setOpenCategory(null)} />}
          </div>
        ))}
      </nav>
      <div className="header-actions">
        <button aria-label="Поиск" title={t('Поиск')} onClick={() => openModal('search')}><Search size={16} /></button>
        <button aria-label={t('Обсуждения')} title={t('Обсуждения')} className="discussion-header-button" onClick={onOpenDiscussions}><BootstrapChatIcon size={17} /></button>
        <div className="lang-wrap" ref={langRef}>
          <button className="lang" aria-label="Язык" onClick={() => setLangOpen(o => !o)}>
            {lang.toUpperCase()}<ChevronDown size={11} />
          </button>
          {langOpen && (
            <div className="dropdown-menu">
              <button className={lang === 'ru' ? 'active' : ''} onClick={() => { setLang('ru'); setLangOpen(false); }}>Русский</button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => { setLang('en'); setLangOpen(false); }}>English</button>
            </div>
          )}
        </div>
        {user ? (
          <div className="user-chip">
            <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
            {user.name}
            <button aria-label="Выйти" title={t('Выйти')} onClick={logout}><LogOut size={13} /></button>
          </div>
        ) : (
          <button className="btn-login" onClick={() => openModal('auth', { tab: 'login' })}>{t('Вход или регистрация')}</button>
        )}
      </div>
      <button className="mobile-menu" aria-label="Меню" onClick={() => setDrawerOpen(true)}><Menu size={19} /></button>
      {drawerOpen && <MobileDrawer onClose={() => setDrawerOpen(false)} />}
    </header>
  );
}
