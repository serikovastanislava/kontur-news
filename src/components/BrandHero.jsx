import Logo from './common/Logo';
import { useApp } from '../state/store';

export default function BrandHero() {
  const { t } = useApp();
  return (
    <section className="brand-hero">
      <div className="brand-identity">
        <Logo>
          <div className="brand-slogan">{t('НОВОСТИ')} <span>•</span> {t('МНЕНИЯ')} <span>•</span> {t('ГЛАВНОЕ')}</div>
        </Logo>
      </div>
      <div className="brand-quote">
        <p>
          <strong>Контур —</strong>
          это взгляд на мир через призму главного.
        </p>
      </div>
    </section>
  );
}
