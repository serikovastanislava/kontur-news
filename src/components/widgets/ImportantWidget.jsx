import React from 'react';

const importantItems = [
  ["12:30", "ЦБ сохранил ключевую ставку"],
  ["11:45", "Новые санкции против ряда компаний"],
  ["10:20", "Открытие выставки современного искусства"]
];

export default function ImportantWidget() {
  return (
    <section className="widget important">
      <h3>Важное</h3>
      {importantItems.map(([time, text]) => (
        <div className="timeline" key={time}>
          <b>{time}</b>
          <span>{text}</span>
        </div>
      ))}
      <a>Все важные события →</a>
    </section>
  );
}