import { useEffect, useRef, useState } from 'react';
import {
  Mail, Lock, User as UserIcon, Send, MessageCircle, Link2, Play, Pause, TrendingUp, TrendingDown, Clock, Eye, Heart
} from 'lucide-react';
import Modal from './Modal';
import { useApp } from '../../state/store';
import {
  placeholderBody, importantEvents, currencies, allSearchable, getViews
} from '../../data/news';
import { getBaseDate, formatRelative } from '../../utils/time';
import { coverMap, avatarMap, fallbackCovers } from '../../utils/covers';
import videoThumb from '../../assets/crops/video.jpg';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashNumber(id, min, max) {
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return min + (h % (max - min));
}

function VkGlyph() {
  return <span aria-hidden="true" style={{ fontSize: 10, fontWeight: 800, letterSpacing: '-.3px' }}>VK</span>;
}

function AuthContent({ initialTab = 'login' }) {
  const { t, login, register, closeModal } = useApp();
  const [tab, setTab] = useState(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (tab === 'register' && name.trim().length < 2) { setError(t('Введите ваше имя')); return; }
    if (!emailRe.test(email)) { setError(t('Введите корректный email')); return; }
    if (password.length < 6) { setError(t('Пароль должен быть не короче 6 символов')); return; }
    setError('');
    if (tab === 'login') await login(email, password); else await register(name.trim(), email, password);
  };

  return (
    <>
      <div className="modal-head">
        <h2 id="auth-title">{tab === 'login' ? t('Вход в аккаунт') : t('Регистрация')}</h2>
        <p>{tab === 'login' ? t('Рады видеть вас снова в «Контуре».') : t('Присоединяйтесь, чтобы сохранять статьи и настраивать ленту.')}</p>
      </div>
      <div className="tab-switch">
        <button className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setError(''); }}>{t('Вход')}</button>
        <button className={tab === 'register' ? 'active' : ''} onClick={() => { setTab('register'); setError(''); }}>{t('Регистрация')}</button>
      </div>
      <form className="modal-body" onSubmit={submit}>
        {tab === 'register' && (
          <div className="form-field">
            <label><UserIcon size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />{t('Имя')}</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={t('Как вас зовут?')} autoComplete="name" />
          </div>
        )}
        <div className="form-field">
          <label><Mail size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />{t('Email')}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        </div>
        <div className="form-field">
          <label><Lock size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />{t('Пароль')}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete={tab === 'login' ? 'current-password' : 'new-password'} />
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="btn-primary">{tab === 'login' ? t('Войти') : t('Создать аккаунт')}</button>
          <button type="button" className="btn-secondary" onClick={closeModal}>{t('Продолжить как гость')}</button>
        </div>
        <div className="modal-foot-note">
          {tab === 'login'
            ? <>{t('Нет аккаунта?')} <button type="button" onClick={() => { setTab('register'); setError(''); }}>{t('Зарегистрироваться')}</button></>
            : <>{t('Уже с нами?')} <button type="button" onClick={() => { setTab('login'); setError(''); }}>{t('Войти')}</button></>}
        </div>
      </form>
    </>
  );
}

function Avatar({ id, name }) {
  const src = avatarMap[id];
  if (src) return <img className="avatar-img" src={src} alt="" />;
  return <span className="avatar-fallback">{(name || 'K').slice(0, 1).toUpperCase()}</span>;
}

function ArticleContent({ id, category, title, time, excerpt, author, role, publishedAt }) {
  const { t, lang, toast, openModal, user, favorites, toggleFavorite } = useApp();
  const catT = t(category);
  const titleT = t(title);
  const [l0, l1, l2] = placeholderBody(catT, titleT, lang);
  const lede = excerpt ? t(excerpt) : l0;
  const paragraphs = [l1];
  const words = [lede, ...paragraphs, l2].join(' ').split(/\s+/).filter(Boolean).length;
  const readMins = Math.max(1, Math.round(words / 180));
  const cover = id ? coverMap[id] : null;
  const bylineName = author || 'Редакция «Контур»';
  const isFav = id ? favorites.includes(id) : false;

  // Live view counter: ticks up while the article stays open, like a "reading now" indicator.
  const [views, setViews] = useState(() => getViews(id || title));
  useEffect(() => {
    const iv = setInterval(() => setViews(v => v + Math.ceil(Math.random() * 3)), 4000 + Math.random() * 3000);
    return () => clearInterval(iv);
  }, []);

  // Live relative time: anchored once to a real Date, then re-formatted as real time passes.
  const baseDate = useRef(publishedAt ? new Date(publishedAt) : (time ? getBaseDate(id || title, time) : null));
  const [liveTime, setLiveTime] = useState(() => baseDate.current ? formatRelative(baseDate.current, lang) : '');
  useEffect(() => {
    if (!baseDate.current) return;
    setLiveTime(formatRelative(baseDate.current, lang));
    const iv = setInterval(() => setLiveTime(formatRelative(baseDate.current, lang)), 20000);
    return () => clearInterval(iv);
  }, [lang]);

  const shareUrl = `https://kontur.news/a/${encodeURIComponent(titleT.slice(0, 40).toLowerCase().replace(/\s+/g, '-'))}`;
  const openShare = (url) => window.open(url, '_blank', 'noopener,noreferrer');
  const shareTelegram = () => openShare(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(titleT)}`);
  const shareVk = () => openShare(`https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(titleT)}`);
  const shareWhatsapp = () => openShare(`https://wa.me/?text=${encodeURIComponent(`${titleT} ${shareUrl}`)}`);
  const copyLink = async () => {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(shareUrl).catch(() => {});
    toast(t('Ссылка на публикацию скопирована'), 'success');
  };

  const related = allSearchable().filter(it => it.id !== id && it.title !== title).slice(0, 3).map((it, i) => ({
    ...it,
    img: fallbackCovers[hashNumber(it.id + i, 0, 6)]
  }));

  return (
    <>
      {cover && <div className="reader-cover"><img src={cover} alt="" /></div>}
      <div className="modal-head reader-head">
        <div className="reader-head-top">
          <span className="pill">{catT}</span>
          {user && id && (
            <button className={`fav-toggle${isFav ? ' is-on' : ''}`} onClick={() => toggleFavorite(id)} aria-label={t('Добавить в избранное')}>
              <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />{isFav ? t('В избранном') : t('В избранное')}
            </button>
          )}
        </div>
        <h2 id="article-title">{titleT}</h2>
        <div className="reader-byline">
          <Avatar id={id} name={bylineName} />
          <div>
            <b>{bylineName}</b>
            <div className="reader-meta">
              {liveTime && <span>{liveTime}</span>}
              <span><Clock size={11} />{lang === 'en' ? `${readMins} min read` : `${readMins} мин чтения`}</span>
              <span className="live-views"><Eye size={11} />{views}</span>
              {role && <span>{t(role)}</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-body reader-body">
        <p className="article-lede">{lede}</p>
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        <div className="article-pullquote">{l2}</div>
        <div className="article-tags"><span>{catT}</span><span>Контур</span></div>
        <div className="article-share-row">
          <span>{t('Поделиться')}:</span>
          <button className="share-telegram" onClick={shareTelegram} aria-label="Telegram" title="Telegram"><Send size={14} /></button>
          <button className="share-vk" onClick={shareVk} aria-label="ВКонтакте" title="ВКонтакте"><VkGlyph /></button>
          <button className="share-whatsapp" onClick={shareWhatsapp} aria-label="WhatsApp" title="WhatsApp"><MessageCircle size={14} /></button>
          <button onClick={copyLink} aria-label={t('Копировать ссылку')} title={t('Копировать ссылку')}><Link2 size={14} /></button>
        </div>
        {related.length > 0 && (
          <div className="article-related">
            <h4>{lang === 'en' ? 'Read next' : 'Читайте также'}</h4>
            {related.map(r => (
              <button className="related-item" key={r.id} onClick={() => openModal('article', { id: r.id, category: r.category, title: r.title, time: r.time })}>
                <img src={r.img} alt="" />
                <span>
                  <b>{t(r.title)}</b>
                  <small>{t(r.category)}</small>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function SearchContent() {
  const { t, lang, openModal, userArticles } = useApp();
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const all = [
    ...userArticles.map(a => ({ id: a.id, category: a.category, title: a.title, time: formatRelative(new Date(a.publishedAt), lang), publishedAt: a.publishedAt, author: a.source, excerpt: a.excerpt })),
    ...allSearchable()
  ];
  const results = q.trim().length
    ? all.filter(it => t(it.title).toLowerCase().includes(q.trim().toLowerCase()) || t(it.category).toLowerCase().includes(q.trim().toLowerCase()))
    : all.slice(0, 6);

  return (
    <>
      <div className="modal-head">
        <h2 id="search-title">{t('Поиск по сайту')}</h2>
        <p>{t('Начните вводить — покажем совпадения по заголовкам и рубрикам.')}</p>
      </div>
      <div className="modal-body">
        <div className="search-input-row">
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder={t('Например: санкции, спутник, рубль…')} />
        </div>
        <div className="search-results">
          {results.length === 0 && (
            <div className="search-empty">{lang === 'en' ? `No results for "${q}"` : `Ничего не найдено по запросу «${q}»`}</div>
          )}
          {results.map(r => (
            <button className="search-result" key={r.id} onClick={() => openModal('article', { id: r.id, category: r.category, title: r.title, time: r.time, publishedAt: r.publishedAt, author: r.author, excerpt: r.excerpt })}>
              <b>{t(r.title)}</b>
              <span>{r.author ? r.author : t(r.category)}{r.time ? ` · ${r.publishedAt ? r.time : t(r.time)}` : ''}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Switch({ checked, onChange, disabled }) {
  return (
    <label className={`switch${checked ? ' is-on' : ''}${disabled ? ' is-disabled' : ''}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={e => onChange?.(e.target.checked)} />
      <i />
    </label>
  );
}

function CookieSettingsContent() {
  const { t, cookiePrefs, savePrefsCookies } = useApp();
  const [analytics, setAnalytics] = useState(cookiePrefs?.analytics ?? true);
  const [marketing, setMarketing] = useState(cookiePrefs?.marketing ?? false);
  return (
    <>
      <div className="modal-head">
        <h2 id="cookie-title">{t('Настройки cookie')}</h2>
        <p>{t('Выберите, какие файлы cookie можно использовать сайту «Контур».')}</p>
      </div>
      <div className="modal-body">
        <div className="toggle-row">
          <div><b>{t('Необходимые')}</b><p>{t('Обеспечивают базовую работу сайта. Их нельзя отключить.')}</p></div>
          <Switch checked disabled />
        </div>
        <div className="toggle-row">
          <div><b>{t('Аналитика')}</b><p>{t('Помогают понять, какие материалы читают чаще всего.')}</p></div>
          <Switch checked={analytics} onChange={setAnalytics} />
        </div>
        <div className="toggle-row">
          <div><b>{t('Персонализация и реклама')}</b><p>{t('Используются для подбора рекомендаций и рекламы.')}</p></div>
          <Switch checked={marketing} onChange={setMarketing} />
        </div>
        <div className="form-actions">
          <button className="btn-primary" onClick={() => savePrefsCookies({ analytics, marketing })}>{t('Сохранить настройки')}</button>
        </div>
      </div>
    </>
  );
}

function VideoContent({ title, desc, duration }) {
  const { t, lang } = useApp();
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(4);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setProgress(p => (p >= 100 ? 0 : p + 1.4)), 180);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <>
      <div className="modal-head">
        <h2 id="video-title">{t(title)}</h2>
        <p>{t(desc)}</p>
      </div>
      <div className="modal-body">
        <div className="video-modal-frame">
          <img src={videoThumb} alt="" />
          <div className="video-modal-overlay">
            <button onClick={() => setPlaying(p => !p)} aria-label={playing ? t('Пауза') : t('Смотреть')}>
              {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
            </button>
          </div>
        </div>
        <div className="video-progress"><b style={{ width: `${progress}%` }} /></div>
        <p style={{ marginTop: 10, fontSize: 11, color: 'var(--dim)' }}>
          {(playing ? (lang === 'en' ? 'Playing' : 'Воспроизведение') : (lang === 'en' ? 'Paused' : 'Пауза'))} · {duration}
        </p>
      </div>
    </>
  );
}

function TimelineInfoContent() {
  const { t } = useApp();
  return (
    <>
      <div className="modal-head"><h2 id="events-title">{t('Все важные события')}</h2><p>{t('Хроника дня, вся в одном месте.')}</p></div>
      <div className="modal-body">
        {importantEvents.map(ev => (
          <div className="toggle-row" key={ev.id}>
            <div><b>{ev.time}</b><p>{t(ev.text)}</p></div>
          </div>
        ))}
      </div>
    </>
  );
}

function CurrencyInfoContent() {
  const { t } = useApp();
  return (
    <>
      <div className="modal-head"><h2 id="rates-title">{t('Курсы валют')}</h2><p>{t('Обновлено сегодня в 12:45.')}</p></div>
      <div className="modal-body">
        {currencies.map(c => (
          <div className="currency-row" key={c.code} style={{ gridTemplateColumns: '1fr auto auto' }}>
            <b>{c.code}</b><span>{c.value}</span>
            <em className={c.up ? 'up' : ''}>{c.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {c.delta}</em>
          </div>
        ))}
      </div>
    </>
  );
}

function InfoTextContent({ title, text }) {
  const { t } = useApp();
  return (
    <>
      <div className="modal-head"><h2>{t(title)}</h2></div>
      <div className="modal-body article-modal-body"><p>{t(text)}</p></div>
    </>
  );
}

function SubscribeContent() {
  const { t, toast, closeModal } = useApp();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (!emailRe.test(email)) { setError(t('Введите корректный email')); return; }
    setError('');
    toast(t('Спасибо! Проверьте почту для подтверждения подписки.'), 'success');
    closeModal();
  };
  return (
    <>
      <div className="modal-head"><h2 id="subscribe-title">{t('Будьте в курсе событий')}</h2><p>{t('Важные новости и эксклюзивные материалы — первыми.')}</p></div>
      <form className="modal-body" onSubmit={submit}>
        <div className="form-field">
          <label>{t('Email')}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions"><button type="submit" className="btn-primary">{t('Подписаться')}</button></div>
      </form>
    </>
  );
}

export default function ModalRoot() {
  const { modal, closeModal } = useApp();
  if (!modal) return null;

  const { type, props } = modal;
  const labelMap = {
    auth: 'auth-title', article: 'article-title', search: 'search-title',
    'cookie-settings': 'cookie-title', video: 'video-title', events: 'events-title',
    rates: 'rates-title', subscribe: 'subscribe-title'
  };

  return (
    <Modal onClose={closeModal} size={type === 'article' ? 'reader' : (type === 'search' ? 'wide' : undefined)} labelledBy={labelMap[type]}>
      {type === 'auth' && <AuthContent initialTab={props.tab} />}
      {type === 'article' && <ArticleContent {...props} />}
      {type === 'search' && <SearchContent />}
      {type === 'cookie-settings' && <CookieSettingsContent />}
      {type === 'video' && <VideoContent {...props} />}
      {type === 'events' && <TimelineInfoContent />}
      {type === 'rates' && <CurrencyInfoContent />}
      {type === 'subscribe' && <SubscribeContent />}
      {type === 'info' && <InfoTextContent {...props} />}
    </Modal>
  );
}
