import ImportantWidget from './widgets/ImportantWidget';
import LiveWidget from './widgets/LiveWidget';
import CurrencyWidget from './widgets/CurrencyWidget';
import NewsletterWidget from './widgets/NewsletterWidget';
import Logo from './common/Logo';
import { useApp } from '../state/store';

export default function RightRail() {
  const { t } = useApp();
  return (
    <aside className="right-rail">
      <ImportantWidget />
      <LiveWidget />
      <CurrencyWidget />
      <NewsletterWidget />
      <div className="rail-brand">
        <Logo />
        <small>{t('События без')}<br />{t('лишнего шума')}</small>
      </div>
    </aside>
  );
}