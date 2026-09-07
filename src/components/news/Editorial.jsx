import React from 'react';
import { Quote, ArrowRight, Play } from "lucide-react";

const editorials = [
  "Почему важно инвестировать в образование",
  "Как технологии меняют журналистику",
  "Энергетический переход: вызовы и решения"
];

const rankings = [
  "ЦБ сохранил ключевую ставку на уровне 16%",
  "Россия укрепляет сотрудничество с дружественными странами",
  "Что будет с ценами на нефть в 2025 году",
  "Как защитить персональные данные в цифровую эпоху",
  "Новые технологии изменят рынок труда"
];

export default function Editorial() {
  return (
    <section className="editorial section">
      <div className="editor-box">
        <h2>Мнение редакции</h2>
        <div className="editor-feature">
          <img 
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80" 
            alt="Редактор" 
          />
          <div>
            <Quote size={18} />
            <h3>Сегодня мир находится на переломном этапе. Важно не только следить за событиями, но и понимать их суть.</h3>
            <p>Анна Родионова<br /><small>Главный редактор</small></p>
          </div>
        </div>
        {editorials.map(x => (
          <div className="mini-link" key={x}>
            {x} <ArrowRight size={13} />
          </div>
        ))}
      </div>

      <div className="rank-box">
        <h2>Главное</h2>
        {rankings.map((x, i) => (
          <div className="rank" key={x}>
            <b>0{i + 1}</b>
            <span>{x}<small>{i + 2} часа назад</small></span>
          </div>
        ))}
      </div>

      <div className="media-box">
        <h2>Мультимедиа</h2>
        <div className="video-card">
          <img 
            src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80" 
            alt="Видео" 
          />
          <span className="play"><Play size={17} fill="currentColor" /></span>
          <em>04:32</em>
        </div>
        <h3>Новый этап: запуск спутника связи</h3>
        <small>Как это повлияет на развитие технологий и жизнь людей.</small>
      </div>
    </section>
  );
}