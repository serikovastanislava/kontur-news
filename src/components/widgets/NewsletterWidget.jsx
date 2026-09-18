import { useState } from 'react';
import { useApp } from '../../state/store';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterWidget() {
  const { t, toast } = useApp();
  const [email, setEmail] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!emailRe.test(email)) { toast('Введите корректный email', 'error'); return; }
    toast('Вы подписаны на рассылку', 'success');
    setEmail('');
  };

  return (
    <section className="widget newsletter">
      <h3>{t('Рассылка')}</h3>
      <p>{t('Главные новости недели')}<br />{t('на вашу почту.')}</p>
      <form onSubmit={submit}>
        <input placeholder={t('Введите email')} value={email} onChange={e => setEmail(e.target.value)} />
        <button type="submit" aria-label="Подписаться">→</button>
      </form>
    </section>
  );
}
