import { Send, Youtube, MessageCircle, Rss as RssIcon, Mail as MailIcon } from 'lucide-react';
import Logo from '../common/Logo';
import { useApp } from '../../state/store';

const footerGroups = [
  ['Разделы', 'Мир', 'Политика', 'Экономика', 'Технологии', 'Общество', 'Спорт'],
  ['О нас', 'Редакция', 'Реклама', 'Карьера', 'Контакты', 'Этика СМИ'],
  ['Сервисы', 'Мобильное приложение', 'Рассылка', 'RSS', 'Виджеты'],
  ['Правовая информация', 'Пользовательское соглашение', 'Политика конфиденциальности', 'Cookie-политика']
];

const socials = [
  { Icon: Send, label: 'Telegram' },
  { Icon: Youtube, label: 'YouTube' },
  { Icon: MessageCircle, label: 'ВКонтакте' },
  { Icon: RssIcon, label: 'RSS' },
  { Icon: MailIcon, label: 'Email' }
];

export default function Footer() {
  const { toast, openModal } = useApp();

  const onItemClick = (item) => {
    if (item === 'Cookie-политика') { openModal('cookie-settings'); return; }
    if (item === 'Рассылка') { openModal('subscribe'); return; }
    if (item === 'Политика конфиденциальности') {
      openModal('info', { title: 'Политика конфиденциальности', text: 'Это демонстрационный сайт «Контур». В реальном проекте здесь будет полный текст политики конфиденциальности.' });
      return;
    }
    if (item === 'Пользовательское соглашение') {
      openModal('info', { title: 'Пользовательское соглашение', text: 'Это демонстрационный сайт «Контур». В реальном проекте здесь будет полный текст пользовательского соглашения.' });
      return;
    }
    toast(`Раздел «${item}» в разработке`, 'info');
  };

  return (
    <footer className="footer">
      <div className="footer-brand">
        <Logo />
        <p>Достоверные новости<br />со всего мира</p>
        <div className="socials">
          {socials.map(({ Icon, label }) => (
            <button key={label} aria-label={label} title={label} onClick={() => toast(`Мы в «${label}»: канал скоро будет подключён`, 'info')}>
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>
      {footerGroups.map(([title, ...items]) => (
        <div className="footer-col" key={title}>
          <b>{title}</b>
          {items.map(item => <a key={item} onClick={() => onItemClick(item)}>{item}</a>)}
        </div>
      ))}
      <div className="copyright">
        <span>© 2026 Контур Media</span>
        <span>Все права защищены</span>
      </div>
    </footer>
  );
}
