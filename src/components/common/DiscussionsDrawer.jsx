import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock3, Send, X } from 'lucide-react';
import { API, apiFetch, jsonOrError } from '../../api';
import { useApp } from '../../state/store';
import { formatRelative } from '../../utils/time';

function BootstrapChatIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M2.678 0a2.68 2.68 0 0 0-2.68 2.68v6.64A2.68 2.68 0 0 0 2.678 12H4v3.5a.5.5 0 0 0 .8.4L8.5 13H13.32A2.68 2.68 0 0 0 16 10.32V2.68A2.68 2.68 0 0 0 13.32 0H2.678Zm0 1H13.32A1.68 1.68 0 0 1 15 2.68v7.64A1.68 1.68 0 0 1 13.32 12H8.34l-3.34 2.5V12H2.678A1.68 1.68 0 0 1 1 10.32V2.68A1.68 1.68 0 0 1 2.678 1Z"/>
      <path d="M4 5.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
    </svg>
  );
}

export { BootstrapChatIcon };

export default function DiscussionsDrawer({ open, onClose }) {
  const { t, lang, user, openModal, toast } = useApp();
  const [news, setNews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadNews = async () => {
    try {
      const response = await fetch(`${API.discussions}?limit=20`, { cache: 'no-store' });
      const data = await jsonOrError(response);
      setNews(Array.isArray(data) ? data : []);
    } catch (err) {
      toast(err.message || 'Не удалось загрузить обсуждения', 'error');
    }
  };

  const loadMessages = async (newsId) => {
    setMessagesLoading(true);
    try {
      const response = await fetch(API.discussion(newsId), { cache: 'no-store' });
      const data = await jsonOrError(response);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      toast(err.message || 'Не удалось загрузить сообщения', 'error');
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return undefined;
    setLoading(true);
    loadNews().finally(() => setLoading(false));
    const timer = setInterval(loadNews, 30_000);
    return () => clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (!open || !selected) return undefined;
    loadMessages(selected.id);
    const timer = setInterval(() => loadMessages(selected.id), 5_000);
    return () => clearInterval(timer);
  }, [open, selected?.id]);

  const submit = async (event) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || !selected || sending) return;
    if (!user) {
      openModal('auth', { tab: 'login' });
      return;
    }
    setSending(true);
    try {
      const response = await apiFetch(API.discussion(selected.id), {
        method: 'POST',
        body: JSON.stringify({ body: text }),
      });
      const message = await jsonOrError(response);
      setMessages(current => [...current, message]);
      setBody('');
      setNews(current => current.map(item => item.id === selected.id
        ? { ...item, discussion_count: (item.discussion_count || 0) + 1 }
        : item));
    } catch (err) {
      if (err.message.includes('401') || err.message.toLowerCase().includes('войд')) {
        openModal('auth', { tab: 'login' });
      } else {
        toast(err.message || 'Не удалось отправить сообщение', 'error');
      }
    } finally {
      setSending(false);
    }
  };

  const selectedTitle = useMemo(() => selected?.title || '', [selected]);
  if (!open) return null;

  return (
    <>
      <div className="discussion-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} />
      <aside className={`discussion-drawer${selected ? ' is-chat' : ''}`} aria-label={t('Обсуждения')}>
        <div className="discussion-head">
          {selected ? (
            <button className="discussion-back" onClick={() => setSelected(null)} aria-label="Назад"><ArrowLeft size={17} /></button>
          ) : <span className="discussion-head-icon"><BootstrapChatIcon size={19} /></span>}
          <div>
            <strong>{selected ? t('Обсуждение новости') : t('Обсуждения')}</strong>
            <small>{selected ? selectedTitle : t('Текущие новости')}</small>
          </div>
          <button className="discussion-close" onClick={onClose} aria-label="Закрыть"><X size={18} /></button>
        </div>

        {!selected ? (
          <div className="discussion-news-list">
            {loading && <div className="discussion-empty">{t('Загрузка…')}</div>}
            {!loading && news.length === 0 && <div className="discussion-empty">{t('Новости пока не загружены.')}</div>}
            {news.map(item => (
              <button className="discussion-news-item" key={item.id} onClick={() => setSelected(item)}>
                <span className="discussion-news-category">{t(item.category)}</span>
                <b>{item.title}</b>
                <span className="discussion-news-meta">
                  <Clock3 size={11} />
                  {formatRelative(new Date(item.published_at || item.created_at), lang)}
                  <span className="discussion-count">{item.discussion_count || 0} 💬</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="discussion-chat">
            <div className="discussion-chat-title">{selectedTitle}</div>
            <div className="discussion-messages">
              {messagesLoading && messages.length === 0 && <div className="discussion-empty">{t('Загрузка сообщений…')}</div>}
              {!messagesLoading && messages.length === 0 && <div className="discussion-empty">{t('Пока нет сообщений. Начните обсуждение.')}</div>}
              {messages.map(message => (
                <div className="discussion-message" key={message.id}>
                  <div className="discussion-message-top"><b>{message.user?.name || 'Пользователь'}</b><time>{formatRelative(new Date(message.created_at), lang)}</time></div>
                  <p>{message.body}</p>
                </div>
              ))}
            </div>
            <form className="discussion-compose" onSubmit={submit}>
              <textarea
                value={body}
                onChange={event => setBody(event.target.value)}
                maxLength={2000}
                disabled={!user || sending}
                placeholder={user ? t('Напишите сообщение…') : t('Войдите, чтобы участвовать в обсуждении')}
              />
              <button type="submit" disabled={!user || !body.trim() || sending} aria-label={t('Отправить')} title={t('Отправить')}><Send size={15} /></button>
            </form>
            {!user && <button className="discussion-login" onClick={() => openModal('auth', { tab: 'login' })}>{t('Войти или зарегистрироваться')}</button>}
          </div>
        )}
      </aside>
    </>
  );
}
