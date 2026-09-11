import Logo from './common/Logo';

export default function BrandHero() {
  return (
    <section className="brand-hero">
      <div className="brand-identity">
        <Logo />
        <div className="brand-slogan">НОВОСТИ <span>•</span> МНЕНИЯ <span>•</span> ГЛАВНОЕ</div>
      </div>
      <div className="brand-description">
        <strong>Контур —</strong>
        это взгляд на мир<br />через призму<br />главного.
      </div>
    </section>
  );
}
