import React from 'react';

const currencies = [
  ["USD", "90,45", "−0,23"],
  ["EUR", "98,12", "−0,37"],
  ["CNY", "12,52", "+0,08"]
];

export default function CurrencyWidget() {
  return (
    <section className="widget currency">
      <h3>Курс валют</h3>
      <small>24 мая, 12:45</small>
      {currencies.map(([a, b, c]) => (
        <div className="currency-row" key={a}>
          <b>{a}</b>
          <span>{b}</span>
          <em className={c.startsWith("+") ? "up" : ""}>{c}</em>
        </div>
      ))}
      <a>Все курсы →</a>
    </section>
  );
}