import { Megaphone } from 'lucide-react';
import { useApp } from '../../state/store';

export default function AdBanner() {
  const { t } = useApp();
  return (
    <section className="widget ad-banner" aria-label={t('Реклама')}>
      <div className="ad-banner-icon"><Megaphone size={18} /></div>
      <div>
        <strong>{t('Здесь могла бы быть ваша реклама')}</strong>
        <span>{t('Свободное рекламное место')}</span>
      </div>
    </section>
  );
}
