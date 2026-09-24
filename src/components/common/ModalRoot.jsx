import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Mail, Lock, User as UserIcon, Send, MessageCircle, Link2, Play, Pause, TrendingUp, TrendingDown, Clock, Eye, Heart
} from 'lucide-react';
import Modal from './Modal';
import { useApp } from '../../state/store';
import {
  placeholderBody, importantEvents, currencies, allSearchable, getViews
} from '../../data/news';
import { getBaseDate, formatRelative } from '../../utils/time';
import { avatarMap, fallbackNewsImage } from '../../utils/covers';
import { API } from '../../api';

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
    if (password.length < 8) { setError(t('Пароль должен быть не короче 8 символов')); return; }
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

function ArticleContent({ id, category, title, time, excerpt, author, role, publishedAt, imageUrl, imageCredit, source, url, views: initialViews, weeklyViews: initialWeeklyViews }) {
  const { t, lang, toast, openModal, user, favorites, toggleFavorite, news } = useApp();
  const [translated, setTranslated] = useState(null);
  const [translating, setTranslating] = useState(false);
  const catT = t(category);
  const originalBody = excerpt ? String(excerpt).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  const titleT = translated?.title || t(title);
  const rawExcerpt = translated?.body || originalBody;
  const paragraphs = rawExcerpt.split(/\n\s*\n|(?<=[.!?])\s+(?=[А-ЯA-ZЁ])/).filter(Boolean);
  const lede = paragraphs[0] || titleT;
  const words = rawExcerpt.split(/\s+/).filter(Boolean).length;
  const readMins = Math.max(1, Math.round(words / 180));
  const coverItem = { id, title, category, image_url: '' };
  const bylineName = author || 'Редакция «Контур»';
  const [serverViews, setServerViews] = useState(initialViews || getViews(id || title));
  const [weeklyViews, setWeeklyViews] = useState(initialWeeklyViews || 0);
  useEffect(() => {
    if (!Number.isFinite(Number(id))) return;
    fetch(API.view(id), { method: 'POST' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) { setServerViews(data.views); setViews(data.views); setWeeklyViews(data.weekly_views); } })
      .catch(() => {});
  }, [id]);
  const isFav = id ? favorites.includes(id) : false;

  // Live view counter: ticks up while the article stays open, like a "reading now" indicator.
  const [views, setViews] = useState(() => serverViews);
  useEffect(() => {
    const iv = setInterval(() => setViews(v => v + Math.ceil(Math.random() * 2)), 10000);
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

  const translateArticle = async () => {
    if (lang !== 'en' || translated || translating) return;
    setTranslating(true);
    try {
      const response = await fetch(API.base + '/news/translate/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: String(title || ''), body: originalBody }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail || 'translation failed');
      setTranslated({
        title: String(data.title || title),
        body: String(data.body || originalBody),
      });
    } catch {
      toast(lang === 'en' ? 'Translation is temporarily unavailable' : 'Перевод временно недоступен', 'error');
    } finally { setTranslating(false); }
  };

  useEffect(() => {
    if (lang !== 'en' || translated || translating || !title) return;
    translateArticle();
  }, [lang, title, originalBody, translated, translating]);

  const related = [...(news || [])]
    .filter(it => String(it.id) !== String(id) && it.title !== title)
    .sort((a, b) => new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0))
    .slice(0, 3)
    .map(it => ({ ...it, img: fallbackNewsImage(it) }));

  return (
    <>
      <div className={`reader-cover${coverItem.image_url ? '' : ' is-placeholder'}` }>
        <img
          src={coverItem.image_url || fallbackNewsImage(coverItem)}
          alt=""
          onError={(e) => {
            const fallback = fallbackNewsImage(coverItem);
            e.currentTarget.classList.add('is-fallback');
            if (e.currentTarget.src !== new URL(fallback, window.location.href).href) e.currentTarget.src = fallback;
          }}
          decoding="async"
        />
        {imageCredit && coverItem.image_url && <small className="image-credit">{imageCredit}</small>}
      </div>
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
        {lang === 'en' && !translated && (
          <button className="translate-article-btn" onClick={translateArticle} disabled={translating}>
            {translating ? 'Translating…' : 'Translate article'}
          </button>
        )}
        <div className="reader-byline">
          <Avatar id={id} name={bylineName} />
          <div>
            <b>{bylineName}</b>
            {source && <div className="reader-source">{t('Редакция')}: {source}</div>}
            <div className="reader-meta">
              {liveTime && <span>{liveTime}</span>}
              <span><Clock size={11} />{lang === 'en' ? `${readMins} min read` : `${readMins} мин чтения`}</span>
              <span className="live-views"><Eye size={11} />{views}</span>
              {weeklyViews > 0 && <span>{weeklyViews} за 7 дней</span>}
              {role && <span>{t(role)}</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-body reader-body">
        <p className="article-lede">{lede}</p>
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        {url && <div className="article-source-link"><a href={url} target="_blank" rel="noreferrer">{t('Читать оригинал')} →</a></div>}
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
              <button className="related-item" key={r.id} onClick={() => openModal('article', {
                id: r.id, category: r.category, title: r.title, excerpt: r.content,
                author: r.author, source: r.editorial || r.source, url: r.url,
                publishedAt: r.published_at || r.created_at, imageUrl: r.image_url, imageCredit: r.image_credit, views: r.views
              })}>
                <img src={r.img} alt="" />
                <span>
                  <b>{t(displayNewsTitle(r.title, r.source))}</b>
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

function displayNewsTitle(title, source = '') {
  const value = String(title || '').trim();
  if (!String(source || '').toLowerCase().includes('панорама')) return value;
  const colon = value.indexOf(':');
  return colon > 0 ? value.slice(0, colon).trim() : value;
}

function normalizeSearchText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g, 'е')
    .replace(/[^\\p{L}\\p{N}]+/gu, ' ')
    .replace(/\\s+/g, ' ')
    .trim();
}

function dedupeSearchItems(items) {
  const stop = new Set(['и','в','во','на','по','из','к','с','со','для','что','как','о','об','от','до','за','при','а','но','или','это','у','не','же','год','года','году','новый','новые']);
  const roots = (value) => normalizeSearchText(value).split(' ')
    .filter(w => w.length > 3 && !stop.has(w))
    .map(w => w
      .replace(/(ами|ями|ого|ему|ому|ими|ыми|ами|ов|ев|ей|ам|ям|ах|ях|ом|ем|ой|ый|ий|ая|яя|ое|ее|ые|ие|а|я|ы|и|о|е|у|ю)$/u, '')
      .replace(/центробанк/u, 'цб'));
  const unique = [];
  for (const item of items) {
    const exact = normalizeSearchText(item.title);
    if (!exact) continue;
    let duplicate = false;
    for (const kept of unique) {
      const a = new Set(roots(exact));
      const b = new Set(roots(kept.title));
      const common = [...a].filter(x => b.has(x)).length;
      const ratio = common / Math.max(1, Math.min(a.size, b.size));
      if (exact === normalizeSearchText(kept.title) || (Math.min(a.size, b.size) >= 4 && ratio >= 0.82)) {
        duplicate = true;
        break;
      }
    }
    if (!duplicate) unique.push(item);
  }
  return unique;
}

function SearchContent() {
  const { t, lang, openModal, userArticles, news, important, featured } = useApp();
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const all = useMemo(() => dedupeSearchItems([
    ...userArticles.map(a => ({ id: a.id, category: a.category, title: a.title, time: formatRelative(new Date(a.publishedAt), lang), publishedAt: a.publishedAt, author: a.source, excerpt: a.excerpt })),
    ...(news || []).map(a => ({
      id: a.id, category: a.category, title: a.title, time: a.published_at || a.created_at ? formatRelative(new Date(a.published_at || a.created_at), lang) : '',
      publishedAt: a.published_at || a.created_at, author: a.author || a.source, excerpt: a.content, source: a.editorial || a.source, url: a.url,
      imageUrl: a.image_url, imageCredit: a.image_credit, views: a.views
    })),
    ...(important || []).map(a => ({
      id: a.id, category: a.category, title: a.title, time: a.published_at || a.created_at ? formatRelative(new Date(a.published_at || a.created_at), lang) : '',
      publishedAt: a.published_at || a.created_at, author: a.author || a.source, excerpt: a.summary || a.content, source: a.editorial || a.source,
      imageUrl: a.image_url, imageCredit: a.image_credit, views: a.views
    })),
    ...(featured ? [{
      id: featured.id, category: featured.category, title: featured.title, time: featured.published_at || featured.created_at ? formatRelative(new Date(featured.published_at || featured.created_at), lang) : '',
      publishedAt: featured.published_at || featured.created_at, author: featured.author || featured.source, excerpt: featured.content || featured.summary,
      source: featured.editorial || featured.source, url: featured.url, imageUrl: featured.image_url, imageCredit: featured.image_credit, views: featured.views
    }] : []),
    ...allSearchable()
  ]), [userArticles, news, important, featured, lang]);

  const results = q.trim().length
    ? all.filter(it => {
        const query = normalizeSearchText(q);
        const haystack = normalizeSearchText([it.title, it.category, it.excerpt, it.author, it.source].filter(Boolean).join(' '));
        return query.split(' ').filter(Boolean).every(word => haystack.includes(word));
      })
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
            <button className="search-result" key={r.id} onClick={() => openModal('article', { id: r.id, category: r.category, title: r.title, time: r.time, publishedAt: r.publishedAt, author: r.author, excerpt: r.excerpt, source: r.source, url: r.url, imageUrl: r.imageUrl, imageCredit: r.imageCredit, views: r.views })}>
              <b>{t(displayNewsTitle(r.title, r.source))}</b>
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

function VideoContent({ title, desc, duration, videoUrl, videoType, videoCredit }) {
  const { t } = useApp();
  const [error, setError] = useState(false);

  const isEmbed = videoType === 'youtube' || videoType === 'vimeo' || videoType === 'iframe';
  return (
    <>
      <div className="modal-head">
        <h2 id="video-title">{t(title)}</h2>
        {desc && <p>{t(desc)}</p>}
      </div>
      <div className="modal-body">
        {videoUrl && !error ? (
          <div className="video-modal-frame real-player-frame">
            {isEmbed ? (
              <iframe
                src={videoUrl}
                title={t(title)}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <video
                src={videoUrl}
                controls
                playsInline
                preload="metadata"
                onError={() => setError(true)}
              />
            )}
          </div>
        ) : (
          <div className="video-modal-frame video-error-state">
            <p>{t('Видео временно недоступно.')}</p>
          </div>
        )}
        {videoCredit && <small className="video-credit">{videoCredit}</small>}
        {duration && <p style={{ marginTop: 10, fontSize: 11, color: 'var(--dim)' }}>{duration}</p>}
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

function CurrencyInfoContent({ currency }) {
  const { t } = useApp();
  const liveRates = currency?.rates || [];
  return (
    <>
      <div className="modal-head"><h2 id="rates-title">{t('Курсы валют')}</h2><p>{currency?.date ? `ЦБ РФ · ${currency.date}` : t('Обновлено сегодня.')}</p></div>
      <div className="modal-body">
        {(liveRates.length ? liveRates : currencies).map(c => (
          <div className="currency-row" key={c.code} style={{ gridTemplateColumns: '1fr auto auto' }}>
            <b>{c.code}</b><span>{typeof c.value === 'number' ? c.value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : c.value}</span>
            <em className={c.up ? 'up' : ''}>{c.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {c.delta || 'RUB'}</em>
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
      {type === 'rates' && <CurrencyInfoContent {...props} />}
      {type === 'subscribe' && <SubscribeContent />}
      {type === 'info' && <InfoTextContent {...props} />}
    </Modal>
  );
}
