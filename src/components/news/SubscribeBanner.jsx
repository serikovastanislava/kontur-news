import { Mail, Send } from 'lucide-react';
export default function SubscribeBanner() {
  return <section className="subscribe-banner"><div className="subscribe-icon"><Mail size={22}/></div><div><h2>Будьте на шаг впереди</h2><p>Подпишитесь на нашу рассылку и получайте только важные новости.</p></div><div className="subscribe-form"><input placeholder="Введите ваш email"/><button>Подписаться <Send size={13}/></button></div><div className="banner-grid"/></section>;
}
