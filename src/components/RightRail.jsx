import LiveWidget from './widgets/LiveWidget';
import CurrencyWidget from './widgets/CurrencyWidget';
import AdBanner from './widgets/AdBanner';
import Logo from './common/Logo';
import { useApp } from '../state/store';

export default function RightRail() {
  const { t } = useApp();
  return (
    <aside className="right-rail">
      <AdBanner />
      <LiveWidget />
      <CurrencyWidget />
      <div className="rail-brand">
        <Logo />
        <small>{t('События без')}<br />{t('лишнего шума')}</small>
      </div>
    </aside>
  );
}
