import React from 'react';
import Logo from "../common/Logo";

export default function Footer() {
  const footerGroups = [
    ["Разделы", "Мир", "Политика", "Экономика", "Технологии", "Общество", "Спорт"],
    ["О нас", "Редакция", "Реклама", "Карьера", "Контакты", "Этика СМИ"],
    ["Сервисы", "Мобильное приложение", "Рассылка", "RSS", "Виджеты"],
    ["Правовая информация", "Пользовательское соглашение", "Политика конфиденциальности", "Cookie-политика"]
  ];

  return (
    <footer className="footer">
      <div className="footer-brand">
        <Logo />
        <p>Достоверные новости<br />со всего мира</p>
        <div className="socials">◉　◉　◉　◉　◉</div>
      </div>
      {footerGroups.map(([title, ...items]) => (
        <div className="footer-col" key={title}>
          <b>{title}</b>
          {items.map(item => <a key={item}>{item}</a>)}
        </div>
      ))}
      <div className="copyright">
        <span>© 2026 Контур Media</span>
        <span>Все права защищены</span>
      </div>
    </footer>
  );
}