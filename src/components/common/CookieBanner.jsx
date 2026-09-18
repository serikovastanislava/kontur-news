import { Cookie } from 'lucide-react';
import { useApp } from '../../state/store';

export default function CookieBanner() {
  const { cookiePrefs, acceptAllCookies, acceptNecessaryCookies, openModal } = useApp();
  if (cookiePrefs) return null;
  return (
    <div className="cookie-banner" role="dialog" aria-label="Настройки cookie">
      <p>
        <b><Cookie size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} />Мы используем cookie</b>
        Это помогает сайту работать быстрее и показывать более релевантные материалы. Подробнее — в разделе «Cookie-политика».
      </p>
      <div className="cookie-actions">
        <button className="cookie-settings-btn" onClick={() => openModal('cookie-settings')}>Настроить</button>
        <button className="cookie-necessary" onClick={acceptNecessaryCookies}>Только необходимые</button>
        <button className="cookie-accept" onClick={acceptAllCookies}>Принять все</button>
      </div>
    </div>
  );
}
