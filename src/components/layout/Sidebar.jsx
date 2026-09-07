import React from 'react';
import { Home, Star, Flame, Clock3, Globe2, Landmark, 
  ChartNoAxesCombined, Cpu, Users, Trophy, Palette, 
  FlaskConical, HeartPulse, CloudSun, Mail } from "lucide-react";

const categories = [
  [Globe2, "Мир"], [Landmark, "Политика"], [ChartNoAxesCombined, "Экономика"],
  [Cpu, "Технологии"], [Users, "Общество"], [Trophy, "Спорт"],
  [Palette, "Культура"], [FlaskConical, "Наука"], [HeartPulse, "Здоровье"], 
  [CloudSun, "Климат"]
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="side-menu">
        <a className="selected"><Home size={15} />Главная</a>
        <a><Star size={15} />Избранное</a>
        <a><Flame size={15} />Популярное</a>
        <a><Clock3 size={15} />Последние</a>
      </div>

      <div className="side-label">КАТЕГОРИИ</div>

      <div className="category-list">
        {categories.map(([Icon, name]) => (
          <a key={name}><Icon size={15} />{name}</a>
        ))}
      </div>

      <div className="side-subscribe">
        <Mail size={18} />
        <b>Будьте в курсе<br />событий</b>
        <p>Важные новости и эксклюзивные материалы первыми.</p>
        <button>Подписаться <span>→</span></button>
      </div>
    </aside>
  );
}