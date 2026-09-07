import ImportantWidget from './widgets/ImportantWidget';
import LiveWidget from './widgets/LiveWidget';
import CurrencyWidget from './widgets/CurrencyWidget';
import NewsletterWidget from './widgets/NewsletterWidget';
import Logo from './common/Logo';

export default function RightRail() {
  return (
    <aside className="right-rail">
      <ImportantWidget />
      <LiveWidget />
      <CurrencyWidget />
      <NewsletterWidget />
      <div className="rail-brand">
        <Logo />
        <small>События без<br />лишнего шума</small>
      </div>
    </aside>
  );
}