import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { useApp } from '../../state/store';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SubscribeBanner() {
  const { t, toast } = useApp();
  const [email, setEmail] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!emailRe.test(email)) { toast('Введите корректный email', 'error'); return; }
    toast('Спасибо! Проверьте почту для подтверждения подписки.', 'success');
    setEmail('');
  };

  return (
    <section className="subscribe-banner">
      <div className="subscribe-icon"><Mail size={22} /></div>
      <div><h2>{t('Будьте на шаг впереди')}</h2><p>{t('Подпишитесь на нашу рассылку и получайте только важные новости.')}</p></div>
      <form className="subscribe-form" onSubmit={submit}>
        <input placeholder={t('Введите ваш email')} value={email} onChange={e => setEmail(e.target.value)} />
        <button type="submit">{t('Подписаться')} <Send size={13} /></button>
      </form>
      <div className="banner-grid" />
    </section>
  );
}
