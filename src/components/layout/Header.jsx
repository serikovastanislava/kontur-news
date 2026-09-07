import React from 'react';
import { Search, Moon, ChevronDown, Menu } from "lucide-react";
import Logo from "../common/Logo";

const navLinks = ["Главная", "Мир", "Политика", "Экономика", "Технологии", "Общество", "Спорт", "Культура", "Наука"];

export default function Header() {
  return (
    <header className="header">
      <Logo compact />
      <nav className="top-nav">
        {navLinks.map((link, i) => (
          <a key={link} className={i === 0 ? "active" : ""}>{link}</a>
        ))}
      </nav>
      <div className="header-actions">
        <button aria-label="Поиск"><Search size={17} /></button>
        <button aria-label="Тёмная тема"><Moon size={16} /></button>
        <button className="lang">RU <ChevronDown size={12} /></button>
      </div>
      <button className="mobile-menu" aria-label="Меню"><Menu size={20} /></button>
    </header>
  );
}