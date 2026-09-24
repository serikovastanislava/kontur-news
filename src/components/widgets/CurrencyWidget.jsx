import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { API } from '../../api';
import { useApp } from '../../state/store';

export default function CurrencyWidget() {
  const { t, openModal } = useApp();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const response = await fetch(API.currency, { cache: 'no-store' });
        if (!response.ok) throw new Error();
        const json = await response.json();
        if (alive) { setData(json); setError(false); }
      } catch { if (alive) setError(true); }
    };
    load();
    const timer = setInterval(load, 10 * 60 * 1000);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  const names = { USD: 'USD', EUR: 'EUR', CNY: 'CNY', GBP: 'GBP', JPY: 'JPY' };
  return (
    <section className="widget currency">
      <h3>{t('Курс валют')}</h3>
      <small>{data?.date ? `ЦБ РФ · ${data.date}` : error ? t('Данные временно недоступны') : t('Обновление…')}</small>
      {(data?.rates || []).slice(0, 3).map(c => (
        <div className="currency-row" key={c.code}>
          <b>{names[c.code] || c.code}</b>
          <span>{Number(c.value).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ₽</span>
          <em><TrendingUp size={12} /> RUB</em>
        </div>
      ))}
      {!data && !error && <div className="empty-note">{t('Получаем актуальные курсы…')}</div>}
      <a onClick={() => openModal('rates', { currency: data })}>{t('Все курсы →')}</a>
    </section>
  );
}
