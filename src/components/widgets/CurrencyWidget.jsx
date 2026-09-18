import { TrendingUp, TrendingDown } from 'lucide-react';
import { currencies } from '../../data/news';
import { useApp } from '../../state/store';

export default function CurrencyWidget() {
  const { t, openModal } = useApp();
  return (
    <section className="widget currency">
      <h3>{t('Курс валют')}</h3>
      <small>24 янв., 12:45</small>
      {currencies.slice(0, 3).map((c) => (
        <div className="currency-row" key={c.code}>
          <b>{c.code}</b>
          <span>{c.value}</span>
          <em className={c.up ? 'up' : ''}>{c.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {c.delta}</em>
        </div>
      ))}
      <a onClick={() => openModal('rates')}>{t('Все курсы →')}</a>
    </section>
  );
}
